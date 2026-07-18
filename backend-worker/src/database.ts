import type { CardDeviceRow, MemberCardRow, MemberProductRow } from "./types";

export async function findMemberCardByHash(db: D1Database, codeHash: string): Promise<MemberCardRow | null> {
  return db.prepare(
    `SELECT id, code_hash, label, plan, status, max_devices, max_active_sessions,
            session_absolute_ttl, session_idle_ttl, expires_at, token_version,
            successful_logins, created_at, activated_at, last_used_at
     FROM member_cards
     WHERE code_hash = ?1`
  ).bind(codeHash).first<MemberCardRow>();
}

export async function findCardDevice(
  db: D1Database,
  cardId: string,
  deviceHash: string
): Promise<CardDeviceRow | null> {
  return db.prepare(
    `SELECT id, card_id, device_hash, user_agent_hash, first_ip_hash, last_ip_hash,
            first_country, last_country, created_at, last_seen_at
     FROM card_devices
     WHERE card_id = ?1 AND device_hash = ?2`
  ).bind(cardId, deviceHash).first<CardDeviceRow>();
}

export async function countCardDevices(db: D1Database, cardId: string): Promise<number> {
  const row = await db.prepare(
    "SELECT COUNT(*) AS count FROM card_devices WHERE card_id = ?1"
  ).bind(cardId).first<{ count: number }>();
  return Number(row?.count || 0);
}

export async function createCardDevice(
  db: D1Database,
  input: {
    id: string;
    cardId: string;
    deviceHash: string;
    userAgentHash: string;
    ipHash: string;
    country: string | null;
    now: number;
    maxDevices: number;
  }
): Promise<boolean> {
  const result = await db.prepare(
    `INSERT OR IGNORE INTO card_devices (
       id, card_id, device_hash, user_agent_hash, first_ip_hash, last_ip_hash,
       first_country, last_country, created_at, last_seen_at
     )
     SELECT ?1, ?2, ?3, ?4, ?5, ?5, ?6, ?6, ?7, ?7
     WHERE (
       SELECT COUNT(*) FROM card_devices WHERE card_id = ?2
     ) < ?8`
  ).bind(
    input.id,
    input.cardId,
    input.deviceHash,
    input.userAgentHash,
    input.ipHash,
    input.country,
    input.now,
    input.maxDevices
  ).run();
  return result.meta.changes === 1;
}

export async function touchCardDevice(
  db: D1Database,
  cardId: string,
  deviceHash: string,
  ipHash: string,
  country: string | null,
  userAgentHash: string,
  now: number
): Promise<void> {
  await db.prepare(
    `UPDATE card_devices
     SET last_ip_hash = ?3,
         last_country = ?4,
         user_agent_hash = ?5,
         last_seen_at = ?6
     WHERE card_id = ?1 AND device_hash = ?2`
  ).bind(cardId, deviceHash, ipHash, country, userAgentHash, now).run();
}

export async function cleanupExpiredSessions(db: D1Database, cardId: string, now: number): Promise<void> {
  await db.prepare(
    `DELETE FROM member_sessions
     WHERE card_id = ?1
       AND (expires_at <= ?2 OR idle_expires_at <= ?2)`
  ).bind(cardId, now).run();
}

export async function countActiveSessions(db: D1Database, cardId: string, now: number): Promise<number> {
  const row = await db.prepare(
    `SELECT COUNT(*) AS count
     FROM member_sessions
     WHERE card_id = ?1
       AND revoked_at IS NULL
       AND expires_at > ?2
       AND idle_expires_at > ?2`
  ).bind(cardId, now).first<{ count: number }>();
  return Number(row?.count || 0);
}

export async function removeCardDevice(db: D1Database, deviceId: string): Promise<void> {
  await db.prepare("DELETE FROM card_devices WHERE id = ?1").bind(deviceId).run();
}

export async function listActiveMemberProducts(db: D1Database): Promise<MemberProductRow[]> {
  const result = await db.prepare(
    `SELECT id, slug, title, subtitle, category, description, status, plan_required,
            preview_asset_key, download_asset_key, version, updated_at, sort_order,
            featured, active, created_at
     FROM member_products
     WHERE active = 1
     ORDER BY featured DESC, sort_order ASC, created_at DESC`
  ).all<MemberProductRow>();
  return result.results || [];
}

export async function findActiveMemberProduct(db: D1Database, slug: string): Promise<MemberProductRow | null> {
  return db.prepare(
    `SELECT id, slug, title, subtitle, category, description, status, plan_required,
            preview_asset_key, download_asset_key, version, updated_at, sort_order,
            featured, active, created_at
     FROM member_products
     WHERE slug = ?1 AND active = 1`
  ).bind(slug).first<MemberProductRow>();
}

export function planCanAccess(currentPlan: string, requiredPlan: string): boolean {
  if (requiredPlan === "member") return true;
  return currentPlan === requiredPlan;
}

export function publicProduct(product: MemberProductRow): Record<string, unknown> {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    subtitle: product.subtitle,
    category: product.category,
    description: product.description,
    status: product.status,
    planRequired: product.plan_required,
    version: product.version,
    updatedAt: product.updated_at,
    sortOrder: product.sort_order,
    featured: product.featured === 1,
    createdAt: product.created_at
  };
}
