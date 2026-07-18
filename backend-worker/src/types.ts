export type MemberCardStatus = "active" | "disabled" | "expired" | "revoked";
export type RiskKeyType = "ip" | "card" | "device";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface MemberCardRow {
  id: string;
  code_hash: string;
  label: string | null;
  plan: string;
  status: MemberCardStatus;
  max_devices: number;
  max_active_sessions: number;
  session_absolute_ttl: number;
  session_idle_ttl: number;
  expires_at: number | null;
  token_version: number;
  successful_logins: number;
  created_at: number;
  activated_at: number | null;
  last_used_at: number | null;
}

export interface CardDeviceRow {
  id: string;
  card_id: string;
  device_hash: string;
  user_agent_hash: string | null;
  first_ip_hash: string | null;
  last_ip_hash: string | null;
  first_country: string | null;
  last_country: string | null;
  created_at: number;
  last_seen_at: number;
}

export interface MemberSessionRow {
  id: string;
  card_id: string;
  device_hash: string;
  token_hash: string;
  plan: string;
  ip_hash: string | null;
  country: string | null;
  user_agent_hash: string | null;
  token_version: number;
  created_at: number;
  last_seen_at: number;
  expires_at: number;
  idle_expires_at: number;
  revoked_at: number | null;
}

export interface MemberProductRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string;
  description: string;
  status: string;
  plan_required: string;
  preview_asset_key: string | null;
  download_asset_key: string | null;
  version: string | null;
  updated_at: number | null;
  sort_order: number;
  featured: number;
  active: number;
  created_at: number;
}

export interface LoginAttemptRow {
  key_hash: string;
  key_type: RiskKeyType;
  window_start: number;
  failures: number;
  blocked_until: number | null;
  updated_at: number;
}

export interface MemberTokenClaims {
  sub: string;
  cardId: string;
  sessionId: string;
  deviceReference: string;
  plan: string;
  iat: number;
  exp: number;
  idleExp: number;
  tokenVersion: number;
  jti: string;
}

export interface AuthenticatedMember {
  cardId: string;
  sessionId: string;
  plan: string;
  expiresAt: number;
  idleExpiresAt: number;
  tokenVersion: number;
}

export interface RiskKey {
  hash: string;
  type: RiskKeyType;
  limit: number;
}
