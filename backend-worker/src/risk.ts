import { sha256Hex } from "./crypto";
import type { LoginAttemptRow, RiskKey, RiskKeyType, RiskLevel } from "./types";

const FAILURE_WINDOW_SECONDS = 10 * 60;
const BLOCK_SECONDS = 30 * 60;

export async function createRiskKey(type: RiskKeyType, protectedHash: string, limit: number): Promise<RiskKey> {
  return {
    type,
    limit,
    hash: await sha256Hex(`${type}:${protectedHash}`)
  };
}

export async function hasBlockedRiskKey(db: D1Database, keys: RiskKey[], now: number): Promise<boolean> {
  for (const key of keys) {
    const row = await db.prepare(
      "SELECT blocked_until FROM login_attempts WHERE key_hash = ?1 AND key_type = ?2"
    ).bind(key.hash, key.type).first<{ blocked_until: number | null }>();
    if (row?.blocked_until && row.blocked_until > now) return true;
  }
  return false;
}

export async function recordLoginFailures(db: D1Database, keys: RiskKey[], now: number): Promise<void> {
  const statements: D1PreparedStatement[] = [];

  for (const key of keys) {
    const existing = await db.prepare(
      `SELECT key_hash, key_type, window_start, failures, blocked_until, updated_at
       FROM login_attempts WHERE key_hash = ?1 AND key_type = ?2`
    ).bind(key.hash, key.type).first<LoginAttemptRow>();

    const inCurrentWindow = Boolean(existing && existing.window_start > now - FAILURE_WINDOW_SECONDS);
    const failures = inCurrentWindow ? existing!.failures + 1 : 1;
    const windowStart = inCurrentWindow ? existing!.window_start : now;
    const previousBlock = existing?.blocked_until && existing.blocked_until > now ? existing.blocked_until : null;
    const blockedUntil = failures >= key.limit ? Math.max(previousBlock || 0, now + BLOCK_SECONDS) : previousBlock;

    statements.push(
      db.prepare(
        `INSERT INTO login_attempts (
           key_hash, key_type, window_start, failures, blocked_until, updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(key_hash) DO UPDATE SET
           key_type = excluded.key_type,
           window_start = excluded.window_start,
           failures = excluded.failures,
           blocked_until = excluded.blocked_until,
           updated_at = excluded.updated_at`
      ).bind(key.hash, key.type, windowStart, failures, blockedUntil, now)
    );
  }

  if (statements.length) await db.batch(statements);
}

export async function clearLoginFailures(db: D1Database, keys: RiskKey[]): Promise<void> {
  if (!keys.length) return;
  await db.batch(keys.map((key) => db.prepare(
    "DELETE FROM login_attempts WHERE key_hash = ?1 AND key_type = ?2"
  ).bind(key.hash, key.type)));
}

export async function recordSecurityEvent(
  db: D1Database,
  input: {
    cardId?: string | null;
    deviceHash?: string | null;
    ipHash?: string | null;
    eventType: string;
    riskLevel: RiskLevel;
    metadata?: Record<string, string | number | boolean | null>;
    now: number;
  }
): Promise<void> {
  const metadataJson = input.metadata ? JSON.stringify(input.metadata).slice(0, 2000) : null;
  await db.prepare(
    `INSERT INTO security_events (
       id, card_id, device_hash, ip_hash, event_type, risk_level, metadata_json, created_at
     ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
  ).bind(
    crypto.randomUUID(),
    input.cardId || null,
    input.deviceHash || null,
    input.ipHash || null,
    input.eventType,
    input.riskLevel,
    metadataJson,
    input.now
  ).run();
}
