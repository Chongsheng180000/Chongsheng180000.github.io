const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff"
} as const;

const ALLOWED_ORIGIN = "https://chongsheng180000.github.io";
const MAX_BODY_BYTES = 16_384;
const RATE_LIMIT_WINDOW_SECONDS = 10 * 60;
const RATE_LIMIT_MAX_SUBMISSIONS = 3;
const MESSAGE_RETENTION_SECONDS = 180 * 24 * 60 * 60;
const SAFE_ERROR = { ok: false, error: "Request rejected" } as const;

interface Env {
  DB: D1Database;
  IP_HASH_SECRET: string;
}

interface ContactInput {
  name: string;
  email: string;
  message: string;
}

function json(payload: unknown, status = 200, origin?: string): Response {
  const headers = new Headers(JSON_HEADERS);

  if (origin === ALLOWED_ORIGIN) {
    headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    headers.set("Vary", "Origin");
  }

  return new Response(JSON.stringify(payload), {
    status,
    headers
  });
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
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return null;
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return null;
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const record = payload as Record<string, unknown>;
  if (typeof record.name !== "string" || typeof record.email !== "string" || typeof record.message !== "string") {
    return null;
  }

  const input = {
    name: record.name.trim(),
    email: record.email.trim(),
    message: record.message.trim()
  };

  const nameLength = countCharacters(input.name);
  const messageLength = countCharacters(input.message);
  if (nameLength < 1 || nameLength > 50 || messageLength < 10 || messageLength > 2000 || !isValidEmail(input.email)) {
    return null;
  }

  return input;
}

async function hashIpAddress(ipAddress: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(ipAddress));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function reserveRateLimitSlot(db: D1Database, ipHash: string, now: number): Promise<boolean> {
  const result = await db.prepare(
    `INSERT INTO contact_rate_events (ip_hash, created_at)
     SELECT ?1, ?2
     WHERE (
       SELECT COUNT(*)
       FROM contact_rate_events
       WHERE ip_hash = ?1 AND created_at >= ?3
     ) < ?4`
  ).bind(ipHash, now, now - RATE_LIMIT_WINDOW_SECONDS, RATE_LIMIT_MAX_SUBMISSIONS).run();

  return result.meta.changes === 1;
}

async function handleContact(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const origin = request.headers.get("Origin") || "";
  if (origin !== ALLOWED_ORIGIN) {
    return json(SAFE_ERROR, 403);
  }

  if (!env.DB || !env.IP_HASH_SECRET) {
    return json(SAFE_ERROR, 503, origin);
  }

  let input: ContactInput | null;
  try {
    input = await parseContactInput(request);
  } catch {
    return json(SAFE_ERROR, 400, origin);
  }

  if (!input) {
    return json(SAFE_ERROR, 400, origin);
  }

  const ipAddress = request.headers.get("CF-Connecting-IP");
  if (!ipAddress) {
    return json(SAFE_ERROR, 400, origin);
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const ipHash = await hashIpAddress(ipAddress, env.IP_HASH_SECRET);
    const allowed = await reserveRateLimitSlot(env.DB, ipHash, now);

    if (!allowed) {
      return json(SAFE_ERROR, 429, origin);
    }

    await env.DB.prepare(
      `INSERT INTO contact_messages (id, name, email, message, created_at, status)
       VALUES (?1, ?2, ?3, ?4, ?5, 'new')`
    ).bind(crypto.randomUUID(), input.name, input.email, input.message, now).run();

    ctx.waitUntil(
      env.DB.batch([
        env.DB.prepare("DELETE FROM contact_rate_events WHERE created_at < ?1").bind(now - RATE_LIMIT_WINDOW_SECONDS),
        env.DB.prepare("DELETE FROM contact_messages WHERE created_at < ?1").bind(now - MESSAGE_RETENTION_SECONDS)
      ]).then(() => undefined).catch(() => undefined)
    );

    return json({ ok: true, status: "received" }, 201, origin);
  } catch {
    return json(SAFE_ERROR, 500, origin);
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return json({
        ok: true,
        service: "chongsheng-backend"
      });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json({
        ok: true,
        status: "healthy"
      });
    }

    if (url.pathname === "/api/contact" && request.method === "OPTIONS") {
      const origin = request.headers.get("Origin") || "";
      if (origin !== ALLOWED_ORIGIN) {
        return json(SAFE_ERROR, 403);
      }

      const headers = new Headers(JSON_HEADERS);
      headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
      headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type");
      headers.set("Access-Control-Max-Age", "600");
      headers.set("Vary", "Origin");
      return new Response(null, { status: 204, headers });
    }

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContact(request, env, ctx);
    }

    if (url.pathname === "/api/contact") {
      const response = json(SAFE_ERROR, 405, request.headers.get("Origin") || undefined);
      response.headers.set("Allow", "POST, OPTIONS");
      return response;
    }

    return json(
      {
        ok: false,
        error: "Not Found"
      },
      404
    );
  }
} satisfies ExportedHandler<Env>;
