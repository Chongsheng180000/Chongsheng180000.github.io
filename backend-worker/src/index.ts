import { hasAllowedOrigin, memberPreflight } from "./cors";
import type { Env as MemberEnv } from "./env";
import { handleHealth, handleRoot } from "./routes/health";
import { handleMemberLogout } from "./routes/logout";
import { handleMemberProductDetails } from "./routes/productDetails";
import { handleMemberProducts } from "./routes/products";
import { handleMemberSession } from "./routes/session";
import { handleVerifyCard } from "./routes/verifyCard";
import { json as memberJson } from "./response";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff"
} as const;

const ALLOWED_ORIGIN = "https://chongsheng180000.github.io";
const WORKER_ORIGIN = "https://chongsheng-backend.chongsheng20000.workers.dev";
const MAX_BODY_BYTES = 16_384;
const IP_RATE_WINDOW_SECONDS = 10 * 60;
const IP_RATE_MAX_SUBMISSIONS = 3;
const EMAIL_SHORT_WINDOW_SECONDS = 30 * 60;
const EMAIL_DAILY_WINDOW_SECONDS = 24 * 60 * 60;
const EMAIL_SHORT_WINDOW_MAX = 1;
const EMAIL_DAILY_WINDOW_MAX = 3;
const VERIFICATION_TTL_SECONDS = 30 * 60;
const UNVERIFIED_RETENTION_SECONDS = 24 * 60 * 60;
const MESSAGE_RETENTION_SECONDS = 180 * 24 * 60 * 60;
const SAFE_ERROR = { ok: false, error: "Request rejected" } as const;

interface Env extends MemberEnv {
  CONTACT_HASH_SECRET: string;
  TURNSTILE_SECRET: string;
  MAILER_URL: string;
  MAILER_SHARED_SECRET: string;
}

interface ContactInput {
  name: string;
  email: string;
  message: string;
  turnstileToken: string;
}

interface TurnstileResponse {
  success?: boolean;
  hostname?: string;
  action?: string;
}

function json(payload: unknown, status = 200, origin?: string): Response {
  const headers = new Headers(JSON_HEADERS);

  if (origin === ALLOWED_ORIGIN) {
    headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    headers.set("Vary", "Origin");
  }

  return new Response(JSON.stringify(payload), { status, headers });
}

function redirectToContact(result: "success" | "expired"): Response {
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Location": `${ALLOWED_ORIGIN}/contact.html?verified=${result}#contact-message`
  });
  return new Response(null, { status: 303, headers });
}

function countCharacters(value: string): number {
  return Array.from(value).length;
}

function isValidEmail(value: string): boolean {
  if (value.length > 254) return false;
  return /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/u.test(value);
}

async function parseContactInput(request: Request): Promise<ContactInput | null> {
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return null;
  }

  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) return null;

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) return null;

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return null;
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;

  const record = payload as Record<string, unknown>;
  if (
    typeof record.name !== "string"
    || typeof record.email !== "string"
    || typeof record.message !== "string"
    || typeof record.turnstileToken !== "string"
  ) {
    return null;
  }

  const input = {
    name: record.name.trim(),
    email: record.email.trim(),
    message: record.message.trim(),
    turnstileToken: record.turnstileToken.trim()
  };

  const nameLength = countCharacters(input.name);
  const messageLength = countCharacters(input.message);
  if (
    nameLength < 1
    || nameLength > 50
    || messageLength < 10
    || messageLength > 2000
    || !isValidEmail(input.email)
    || input.turnstileToken.length > 2048
  ) {
    return null;
  }

  return input;
}

async function hmacHex(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function createVerificationToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

async function verifyTurnstile(token: string, ipAddress: string, secret: string): Promise<boolean> {
  const body = new FormData();
  body.set("secret", secret);
  body.set("response", token);
  body.set("remoteip", ipAddress);
  body.set("idempotency_key", crypto.randomUUID());

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body
    });
    if (!response.ok) return false;
    const result = await response.json<TurnstileResponse>();
    return result.success === true
      && result.hostname === "chongsheng180000.github.io"
      && result.action === "contact";
  } catch {
    return false;
  }
}

async function reserveIpRateLimitSlot(db: D1Database, ipHash: string, now: number): Promise<boolean> {
  const result = await db.prepare(
    `INSERT INTO contact_rate_events (ip_hash, created_at)
     SELECT ?1, ?2
     WHERE (
       SELECT COUNT(*) FROM contact_rate_events
       WHERE ip_hash = ?1 AND created_at >= ?3
     ) < ?4`
  ).bind(ipHash, now, now - IP_RATE_WINDOW_SECONDS, IP_RATE_MAX_SUBMISSIONS).run();

  return result.meta.changes === 1;
}

async function reserveEmailRateLimitSlot(
  db: D1Database,
  eventId: string,
  emailHash: string,
  now: number
): Promise<boolean> {
  const result = await db.prepare(
    `INSERT INTO contact_email_rate_events (id, email_hash, created_at)
     SELECT ?1, ?2, ?3
     WHERE (
       SELECT COUNT(*) FROM contact_email_rate_events
       WHERE email_hash = ?2 AND created_at >= ?4
     ) < ?5
     AND (
       SELECT COUNT(*) FROM contact_email_rate_events
       WHERE email_hash = ?2 AND created_at >= ?6
     ) < ?7`
  ).bind(
    eventId,
    emailHash,
    now,
    now - EMAIL_SHORT_WINDOW_SECONDS,
    EMAIL_SHORT_WINDOW_MAX,
    now - EMAIL_DAILY_WINDOW_SECONDS,
    EMAIL_DAILY_WINDOW_MAX
  ).run();

  return result.meta.changes === 1;
}

async function sendVerificationEmail(
  env: Env,
  recipient: string,
  name: string,
  verificationUrl: string
): Promise<boolean> {
  try {
    const response = await fetch(env.MAILER_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        secret: env.MAILER_SHARED_SECRET,
        to: recipient,
        name,
        verificationUrl,
        expiresMinutes: VERIFICATION_TTL_SECONDS / 60
      })
    });
    if (!response.ok) return false;
    const result = await response.json<{ ok?: boolean }>();
    return result.ok === true;
  } catch {
    return false;
  }
}

async function cleanupFailedDelivery(db: D1Database, messageId: string): Promise<void> {
  await db.batch([
    db.prepare("DELETE FROM contact_messages WHERE id = ?1 AND status = 'pending_verification'").bind(messageId),
    db.prepare("DELETE FROM contact_email_rate_events WHERE id = ?1").bind(messageId)
  ]);
}

async function handleContact(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const origin = request.headers.get("Origin") || "";
  if (origin !== ALLOWED_ORIGIN) return json(SAFE_ERROR, 403);

  if (
    !env.CONTACT_DB
    || !env.CONTACT_HASH_SECRET
    || !env.TURNSTILE_SECRET
    || !env.MAILER_URL
    || !env.MAILER_SHARED_SECRET
  ) {
    return json(SAFE_ERROR, 503, origin);
  }

  let input: ContactInput | null;
  try {
    input = await parseContactInput(request);
  } catch {
    return json(SAFE_ERROR, 400, origin);
  }
  if (!input) return json(SAFE_ERROR, 400, origin);

  const ipAddress = request.headers.get("CF-Connecting-IP");
  if (!ipAddress) return json(SAFE_ERROR, 400, origin);

  if (
    input.turnstileToken
    && !await verifyTurnstile(input.turnstileToken, ipAddress, env.TURNSTILE_SECRET)
  ) {
    return json(SAFE_ERROR, 403, origin);
  }

  const now = Math.floor(Date.now() / 1000);
  const messageId = crypto.randomUUID();
  let deliveryStateCreated = false;
  const contactDb = env.CONTACT_DB;

  try {
    const ipHash = await hmacHex(`ip:${ipAddress}`, env.CONTACT_HASH_SECRET);
    if (!await reserveIpRateLimitSlot(contactDb, ipHash, now)) {
      return json(SAFE_ERROR, 429, origin);
    }

    const normalizedEmail = input.email.toLocaleLowerCase("en-US");
    const emailHash = await hmacHex(`email:${normalizedEmail}`, env.CONTACT_HASH_SECRET);
    if (!await reserveEmailRateLimitSlot(contactDb, messageId, emailHash, now)) {
      return json(SAFE_ERROR, 429, origin);
    }
    deliveryStateCreated = true;

    const token = createVerificationToken();
    const tokenHash = await sha256Hex(token);
    const expiresAt = now + VERIFICATION_TTL_SECONDS;

    await contactDb.prepare(
      `INSERT INTO contact_messages (
         id, name, email, message, created_at, status,
         verification_token_hash, verification_expires_at, verified_at
       ) VALUES (?1, ?2, ?3, ?4, ?5, 'pending_verification', ?6, ?7, NULL)`
    ).bind(messageId, input.name, input.email, input.message, now, tokenHash, expiresAt).run();

    const verificationUrl = `${WORKER_ORIGIN}/api/contact/verify?token=${encodeURIComponent(token)}`;
    if (!await sendVerificationEmail(env, input.email, input.name, verificationUrl)) {
      await cleanupFailedDelivery(contactDb, messageId);
      return json(SAFE_ERROR, 503, origin);
    }

    ctx.waitUntil(
      contactDb.batch([
        contactDb.prepare("DELETE FROM contact_rate_events WHERE created_at < ?1")
          .bind(now - IP_RATE_WINDOW_SECONDS),
        contactDb.prepare("DELETE FROM contact_email_rate_events WHERE created_at < ?1")
          .bind(now - EMAIL_DAILY_WINDOW_SECONDS),
        contactDb.prepare(
          "DELETE FROM contact_messages WHERE status = 'pending_verification' AND verification_expires_at < ?1"
        ).bind(now - UNVERIFIED_RETENTION_SECONDS),
        contactDb.prepare("DELETE FROM contact_messages WHERE status != 'pending_verification' AND created_at < ?1")
          .bind(now - MESSAGE_RETENTION_SECONDS)
      ]).then(() => undefined).catch(() => undefined)
    );

    return json({ ok: true, status: "verification_required" }, 202, origin);
  } catch {
    if (deliveryStateCreated) {
      try {
        await cleanupFailedDelivery(contactDb, messageId);
      } catch {
        // The scheduled retention cleanup remains a final fallback.
      }
    }
    return json(SAFE_ERROR, 500, origin);
  }
}

async function handleVerification(request: Request, env: Env): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!env.CONTACT_DB || !/^[A-Za-z0-9_-]{43}$/u.test(token)) return redirectToContact("expired");

  try {
    const now = Math.floor(Date.now() / 1000);
    const tokenHash = await sha256Hex(token);
    const result = await env.CONTACT_DB.prepare(
      `UPDATE contact_messages
       SET status = 'new', verified_at = ?1, verification_token_hash = NULL, verification_expires_at = NULL
       WHERE verification_token_hash = ?2
         AND status = 'pending_verification'
         AND verification_expires_at >= ?1`
    ).bind(now, tokenHash).run();

    return redirectToContact(result.meta.changes === 1 ? "success" : "expired");
  } catch {
    return redirectToContact("expired");
  }
}

function corsPreflight(request: Request): Response {
  const origin = request.headers.get("Origin") || "";
  if (origin !== ALLOWED_ORIGIN) return json(SAFE_ERROR, 403);

  const headers = new Headers(JSON_HEADERS);
  headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "600");
  headers.set("Vary", "Origin");
  return new Response(null, { status: 204, headers });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return handleRoot();
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return handleHealth();
    }

    if (url.pathname.startsWith("/api/member/")) {
      if (request.method === "OPTIONS") return memberPreflight(request);
      if (!hasAllowedOrigin(request)) return memberJson(SAFE_ERROR, 403);

      if (url.pathname === "/api/member/verify-card" && request.method === "POST") {
        return handleVerifyCard(request, env);
      }
      if (url.pathname === "/api/member/session" && request.method === "GET") {
        return handleMemberSession(request, env);
      }
      if (url.pathname === "/api/member/products" && request.method === "GET") {
        return handleMemberProducts(request, env);
      }
      if (url.pathname === "/api/member/logout" && request.method === "POST") {
        return handleMemberLogout(request, env);
      }

      const productMatch = url.pathname.match(/^\/api\/member\/products\/([^/]+)$/u);
      if (productMatch && request.method === "GET") {
        return handleMemberProductDetails(request, env, decodeURIComponent(productMatch[1]));
      }

      return memberJson({ ok: false, error: "Not Found" }, 404, ALLOWED_ORIGIN);
    }

    if (url.pathname === "/api/contact" && request.method === "OPTIONS") {
      return corsPreflight(request);
    }

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContact(request, env, ctx);
    }

    if (url.pathname === "/api/contact/verify" && request.method === "GET") {
      return handleVerification(request, env);
    }

    if (url.pathname === "/api/contact") {
      const response = json(SAFE_ERROR, 405, request.headers.get("Origin") || undefined);
      response.headers.set("Allow", "POST, OPTIONS");
      return response;
    }

    return json({ ok: false, error: "Not Found" }, 404);
  }
} satisfies ExportedHandler<Env>;
