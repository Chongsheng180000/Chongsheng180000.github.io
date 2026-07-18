import {
  cleanupExpiredSessions,
  countActiveSessions,
  countCardDevices,
  createCardDevice,
  findCardDevice,
  findMemberCardByHash,
  removeCardDevice,
  touchCardDevice
} from "../database";
import {
  hmacSha256Hex,
  memberDeviceIdIsValid,
  normalizeMemberCardCode,
  randomizedFailureDelay,
  randomBase64Url,
  sha256Hex
} from "../crypto";
import { getMemberSecrets, type Env } from "../env";
import { createRiskKey, clearLoginFailures, hasBlockedRiskKey, recordLoginFailures, recordSecurityEvent } from "../risk";
import { json, memberFailure } from "../response";
import { signMemberToken } from "../token";
import type { RiskKey } from "../types";

const MAX_BODY_BYTES = 16_384;

interface VerifyCardInput {
  code: string;
  deviceId: string;
  turnstileToken: string;
}

interface TurnstileResponse {
  success?: boolean;
  hostname?: string;
}

function countryFrom(request: Request): string | null {
  const country = request.headers.get("CF-IPCountry") || "";
  return /^[A-Z]{2}$/u.test(country) ? country : null;
}

async function parseInput(request: Request): Promise<VerifyCardInput | null> {
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) return null;
  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) return null;
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return null;

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.code !== "string" || typeof record.deviceId !== "string") return null;
  if (record.turnstileToken !== undefined && typeof record.turnstileToken !== "string") return null;

  const input = {
    code: record.code.trim(),
    deviceId: record.deviceId.trim(),
    turnstileToken: typeof record.turnstileToken === "string" ? record.turnstileToken.trim() : ""
  };
  if (input.code.length < 1 || input.code.length > 200 || input.turnstileToken.length > 2048) return null;
  return input;
}

async function verifyOptionalTurnstile(token: string, ipAddress: string, secret?: string): Promise<boolean> {
  if (!token) return true;
  if (!secret) return false;
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
    return result.success === true && result.hostname === "chongsheng180000.github.io";
  } catch {
    return false;
  }
}

async function fail(
  env: Env,
  origin: string,
  status: number,
  riskKeys: RiskKey[] = [],
  protectedContext?: { cardId?: string | null; deviceHash?: string; ipHash?: string }
): Promise<Response> {
  const now = Math.floor(Date.now() / 1000);
  if (env.DB && riskKeys.length) {
    try {
      await recordLoginFailures(env.DB, riskKeys, now);
      await recordSecurityEvent(env.DB, {
        cardId: protectedContext?.cardId,
        deviceHash: protectedContext?.deviceHash,
        ipHash: protectedContext?.ipHash,
        eventType: "member_login_failed",
        riskLevel: "medium",
        now
      });
    } catch {
      // A database error must not change the public failure shape.
    }
  }
  await randomizedFailureDelay();
  return memberFailure(status, origin);
}

export async function handleVerifyCard(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get("Origin") || "";
  const secrets = getMemberSecrets(env);
  if (!env.DB || !secrets) return fail(env, origin, 503);

  const ipAddress = request.headers.get("CF-Connecting-IP") || "unknown";
  const ipHash = await hmacSha256Hex(ipAddress, secrets.ipPepper);
  const ipRiskKey = await createRiskKey("ip", ipHash, 5);

  let input: VerifyCardInput | null;
  try {
    input = await parseInput(request);
  } catch {
    return fail(env, origin, 401, [ipRiskKey], { ipHash });
  }
  if (!input) return fail(env, origin, 401, [ipRiskKey], { ipHash });

  const normalizedCode = normalizeMemberCardCode(input.code);
  const cardRiskValue = normalizedCode || `invalid:${input.code.toUpperCase().replace(/[\s-]+/gu, "")}`;
  const deviceHash = await hmacSha256Hex(input.deviceId || "invalid", secrets.devicePepper);
  const codeHash = await hmacSha256Hex(cardRiskValue, secrets.cardPepper);
  const userAgentHash = await hmacSha256Hex(request.headers.get("User-Agent") || "unknown", secrets.devicePepper);
  const riskKeys = await Promise.all([
    Promise.resolve(ipRiskKey),
    createRiskKey("card", codeHash, 3),
    createRiskKey("device", deviceHash, 5)
  ]);
  const protectedContext: { cardId?: string | null; deviceHash: string; ipHash: string } = {
    deviceHash,
    ipHash
  };
  const now = Math.floor(Date.now() / 1000);

  try {
    if (await hasBlockedRiskKey(env.DB, riskKeys, now)) {
      return fail(env, origin, 401, riskKeys, protectedContext);
    }
    if (!normalizedCode || !memberDeviceIdIsValid(input.deviceId)) {
      return fail(env, origin, 401, riskKeys, protectedContext);
    }
    if (!await verifyOptionalTurnstile(input.turnstileToken, ipAddress, env.TURNSTILE_SECRET)) {
      return fail(env, origin, 401, riskKeys, protectedContext);
    }

    const card = await findMemberCardByHash(env.DB, codeHash);
    if (
      !card || card.status !== "active"
      || (card.expires_at !== null && card.expires_at <= now)
    ) return fail(env, origin, 401, riskKeys, protectedContext);

    protectedContext.cardId = card.id;
    let device = await findCardDevice(env.DB, card.id, deviceHash);
    let createdDeviceId: string | null = null;
    if (!device) {
      if (await countCardDevices(env.DB, card.id) >= card.max_devices) {
        return fail(env, origin, 401, riskKeys, protectedContext);
      }
      createdDeviceId = crypto.randomUUID();
      const created = await createCardDevice(env.DB, {
        id: createdDeviceId,
        cardId: card.id,
        deviceHash,
        userAgentHash,
        ipHash,
        country: countryFrom(request),
        now,
        maxDevices: card.max_devices
      });
      if (!created) {
        device = await findCardDevice(env.DB, card.id, deviceHash);
        if (!device) return fail(env, origin, 401, riskKeys, protectedContext);
        createdDeviceId = null;
      }
    } else {
      await touchCardDevice(
        env.DB,
        card.id,
        deviceHash,
        ipHash,
        countryFrom(request),
        userAgentHash,
        now
      );
    }

    await cleanupExpiredSessions(env.DB, card.id, now);
    if (await countActiveSessions(env.DB, card.id, now) >= card.max_active_sessions) {
      if (createdDeviceId) await removeCardDevice(env.DB, createdDeviceId);
      return fail(env, origin, 401, riskKeys, protectedContext);
    }

    const sessionId = crypto.randomUUID();
    const absoluteExpiresAt = Math.min(
      now + card.session_absolute_ttl,
      card.expires_at || Number.MAX_SAFE_INTEGER
    );
    const idleExpiresAt = Math.min(absoluteExpiresAt, now + card.session_idle_ttl);
    const claims = {
      sub: card.id,
      cardId: card.id,
      sessionId,
      deviceReference: deviceHash.slice(0, 32),
      plan: card.plan,
      iat: now,
      exp: absoluteExpiresAt,
      idleExp: idleExpiresAt,
      tokenVersion: card.token_version,
      jti: randomBase64Url(16)
    };
    const token = await signMemberToken(claims, secrets.sessionSecret);
    const tokenHash = await sha256Hex(token);

    try {
      const batchResult = await env.DB.batch([
        env.DB.prepare(
          `INSERT INTO member_sessions (
             id, card_id, device_hash, token_hash, plan, ip_hash, country,
             user_agent_hash, token_version, created_at, last_seen_at,
             expires_at, idle_expires_at, revoked_at
           )
           SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?10, ?11, ?12, NULL
           WHERE (
             SELECT COUNT(*) FROM member_sessions
             WHERE card_id = ?2 AND revoked_at IS NULL
               AND expires_at > ?10 AND idle_expires_at > ?10
           ) < ?13`
        ).bind(
          sessionId,
          card.id,
          deviceHash,
          tokenHash,
          card.plan,
          ipHash,
          countryFrom(request),
          userAgentHash,
          card.token_version,
          now,
          absoluteExpiresAt,
          idleExpiresAt,
          card.max_active_sessions
        ),
        env.DB.prepare(
          `UPDATE member_cards
           SET activated_at = COALESCE(activated_at, ?2), last_used_at = ?2,
               successful_logins = successful_logins + 1
           WHERE id = ?1
             AND EXISTS (SELECT 1 FROM member_sessions WHERE id = ?3)`
        ).bind(card.id, now, sessionId)
      ]);
      if (batchResult[0].meta.changes !== 1) {
        if (createdDeviceId) await removeCardDevice(env.DB, createdDeviceId);
        return fail(env, origin, 401, riskKeys, protectedContext);
      }
    } catch (error) {
      if (createdDeviceId) await removeCardDevice(env.DB, createdDeviceId);
      throw error;
    }

    await clearLoginFailures(env.DB, riskKeys);
    await recordSecurityEvent(env.DB, {
      cardId: card.id,
      deviceHash,
      ipHash,
      eventType: "member_login_succeeded",
      riskLevel: "low",
      now
    });

    return json({
      ok: true,
      token,
      plan: card.plan,
      expiresAt: absoluteExpiresAt,
      idleExpiresAt
    }, 200, origin);
  } catch {
    return fail(env, origin, 401, riskKeys, protectedContext);
  }
}
