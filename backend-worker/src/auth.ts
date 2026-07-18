import { constantTimeEqual, hmacSha256Hex, memberDeviceIdIsValid, sha256Hex } from "./crypto";
import { getMemberSecrets, type Env } from "./env";
import { verifyMemberToken } from "./token";
import type { AuthenticatedMember, MemberTokenClaims } from "./types";

interface SessionAuthRow {
  session_id: string;
  card_id: string;
  device_hash: string;
  token_hash: string;
  session_plan: string;
  session_token_version: number;
  session_expires_at: number;
  session_idle_expires_at: number;
  revoked_at: number | null;
  card_status: string;
  card_expires_at: number | null;
  card_token_version: number;
  session_idle_ttl: number;
}

function bearerToken(request: Request): string | null {
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+([^\s]+)$/iu);
  return match ? match[1] : null;
}

function normalizedCountry(request: Request): string | null {
  const value = request.headers.get("CF-IPCountry") || "";
  return /^[A-Z]{2}$/u.test(value) ? value : null;
}

async function tokenAndDevice(
  request: Request,
  env: Env,
  now: number
): Promise<{ token: string; claims: MemberTokenClaims; tokenHash: string; deviceHash: string } | null> {
  const secrets = getMemberSecrets(env);
  const token = bearerToken(request);
  const deviceId = request.headers.get("X-Device-ID")?.trim() || "";
  if (!secrets || !token || !memberDeviceIdIsValid(deviceId)) return null;

  const claims = await verifyMemberToken(token, secrets.sessionSecret, now);
  if (!claims) return null;

  const deviceHash = await hmacSha256Hex(deviceId, secrets.devicePepper);
  if (!constantTimeEqual(claims.deviceReference, deviceHash.slice(0, 32))) return null;

  return {
    token,
    claims,
    tokenHash: await sha256Hex(token),
    deviceHash
  };
}

export async function authenticateMember(
  request: Request,
  env: Env,
  now = Math.floor(Date.now() / 1000)
): Promise<AuthenticatedMember | null> {
  const verified = await tokenAndDevice(request, env, now);
  const secrets = getMemberSecrets(env);
  if (!verified || !secrets) return null;

  const row = await env.DB.prepare(
    `SELECT
       s.id AS session_id,
       s.card_id,
       s.device_hash,
       s.token_hash,
       s.plan AS session_plan,
       s.token_version AS session_token_version,
       s.expires_at AS session_expires_at,
       s.idle_expires_at AS session_idle_expires_at,
       s.revoked_at,
       c.status AS card_status,
       c.expires_at AS card_expires_at,
       c.token_version AS card_token_version,
       c.session_idle_ttl
     FROM member_sessions s
     JOIN member_cards c ON c.id = s.card_id
     WHERE s.id = ?1 AND s.card_id = ?2 AND s.token_hash = ?3`
  ).bind(
    verified.claims.sessionId,
    verified.claims.cardId,
    verified.tokenHash
  ).first<SessionAuthRow>();

  if (
    !row
    || row.revoked_at !== null
    || row.card_status !== "active"
    || (row.card_expires_at !== null && row.card_expires_at <= now)
    || row.session_expires_at <= now
    || row.session_idle_expires_at <= now
    || row.device_hash !== verified.deviceHash
    || row.session_token_version !== verified.claims.tokenVersion
    || row.card_token_version !== verified.claims.tokenVersion
    || row.session_plan !== verified.claims.plan
  ) {
    return null;
  }

  const ipAddress = request.headers.get("CF-Connecting-IP") || "unknown";
  const ipHash = await hmacSha256Hex(ipAddress, secrets.ipPepper);
  const userAgentHash = await hmacSha256Hex(request.headers.get("User-Agent") || "unknown", secrets.devicePepper);
  const idleExpiresAt = Math.min(row.session_expires_at, now + row.session_idle_ttl);

  await env.DB.batch([
    env.DB.prepare(
      `UPDATE member_sessions
       SET last_seen_at = ?2, idle_expires_at = ?3, ip_hash = ?4,
           country = ?5, user_agent_hash = ?6
       WHERE id = ?1 AND revoked_at IS NULL`
    ).bind(row.session_id, now, idleExpiresAt, ipHash, normalizedCountry(request), userAgentHash),
    env.DB.prepare(
      `UPDATE card_devices
       SET last_seen_at = ?3, last_ip_hash = ?4, last_country = ?5, user_agent_hash = ?6
       WHERE card_id = ?1 AND device_hash = ?2`
    ).bind(row.card_id, row.device_hash, now, ipHash, normalizedCountry(request), userAgentHash)
  ]);

  return {
    cardId: row.card_id,
    sessionId: row.session_id,
    plan: row.session_plan,
    expiresAt: row.session_expires_at,
    idleExpiresAt,
    tokenVersion: row.card_token_version
  };
}

export async function revokeMemberSession(
  request: Request,
  env: Env,
  now = Math.floor(Date.now() / 1000)
): Promise<boolean> {
  const verified = await tokenAndDevice(request, env, now);
  if (!verified) return false;

  await env.DB.prepare(
    `UPDATE member_sessions
     SET revoked_at = COALESCE(revoked_at, ?5), last_seen_at = ?5
     WHERE id = ?1 AND card_id = ?2 AND device_hash = ?3 AND token_hash = ?4`
  ).bind(
    verified.claims.sessionId,
    verified.claims.cardId,
    verified.deviceHash,
    verified.tokenHash,
    now
  ).run();
  return true;
}
