PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS member_cards (
  id TEXT PRIMARY KEY,
  code_hash TEXT UNIQUE NOT NULL,
  label TEXT,
  plan TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'disabled', 'expired', 'revoked')),
  max_devices INTEGER NOT NULL DEFAULT 2 CHECK (max_devices > 0),
  max_active_sessions INTEGER NOT NULL DEFAULT 2 CHECK (max_active_sessions > 0),
  session_absolute_ttl INTEGER NOT NULL DEFAULT 43200 CHECK (session_absolute_ttl > 0),
  session_idle_ttl INTEGER NOT NULL DEFAULT 7200 CHECK (session_idle_ttl > 0),
  expires_at INTEGER,
  token_version INTEGER NOT NULL DEFAULT 1 CHECK (token_version > 0),
  successful_logins INTEGER NOT NULL DEFAULT 0 CHECK (successful_logins >= 0),
  created_at INTEGER NOT NULL,
  activated_at INTEGER,
  last_used_at INTEGER
);

CREATE TABLE IF NOT EXISTS card_devices (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  device_hash TEXT NOT NULL,
  user_agent_hash TEXT,
  first_ip_hash TEXT,
  last_ip_hash TEXT,
  first_country TEXT,
  last_country TEXT,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  UNIQUE (card_id, device_hash),
  FOREIGN KEY (card_id) REFERENCES member_cards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_card_devices_card_id ON card_devices(card_id);

CREATE TABLE IF NOT EXISTS member_sessions (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  device_hash TEXT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL,
  ip_hash TEXT,
  country TEXT,
  user_agent_hash TEXT,
  token_version INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  idle_expires_at INTEGER NOT NULL,
  revoked_at INTEGER,
  FOREIGN KEY (card_id) REFERENCES member_cards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_sessions_card_id ON member_sessions(card_id);
CREATE INDEX IF NOT EXISTS idx_member_sessions_device_hash ON member_sessions(device_hash);
CREATE UNIQUE INDEX IF NOT EXISTS idx_member_sessions_token_hash ON member_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_member_sessions_expires_at ON member_sessions(expires_at);

CREATE TABLE IF NOT EXISTS member_products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  plan_required TEXT NOT NULL DEFAULT 'member',
  preview_asset_key TEXT,
  download_asset_key TEXT,
  version TEXT,
  updated_at INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS login_attempts (
  key_hash TEXT PRIMARY KEY,
  key_type TEXT NOT NULL CHECK (key_type IN ('ip', 'card', 'device')),
  window_start INTEGER NOT NULL,
  failures INTEGER NOT NULL DEFAULT 0 CHECK (failures >= 0),
  blocked_until INTEGER,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS security_events (
  id TEXT PRIMARY KEY,
  card_id TEXT,
  device_hash TEXT,
  ip_hash TEXT,
  event_type TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  metadata_json TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (card_id) REFERENCES member_cards(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_security_events_card_id ON security_events(card_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);

INSERT OR IGNORE INTO member_products (
  id, slug, title, subtitle, category, description, status, plan_required,
  preview_asset_key, download_asset_key, version, updated_at, sort_order,
  featured, active, created_at
) VALUES
  ('demo-premium-wallpapers', 'premium-wallpapers', 'Premium Wallpapers',
   'Curated display set', 'resource-pack',
   'A demonstration listing for a future member wallpaper collection.',
   'preview', 'member', NULL, NULL, 'demo', 1784304000, 10, 1, 1, 1784304000),
  ('demo-advanced-templates', 'advanced-templates', 'Advanced Templates',
   'Reusable static foundations', 'template',
   'A demonstration listing for maintainable static-site templates.',
   'preview', 'member', NULL, NULL, 'demo', 1784304000, 20, 1, 1, 1784304000),
  ('demo-private-scripts', 'private-scripts', 'Private Scripts',
   'Efficiency and personal automation', 'script',
   'A demonstration listing for lawful personal automation scripts.',
   'preview', 'member', NULL, NULL, 'demo', 1784304000, 30, 0, 1, 1784304000),
  ('demo-resource-packs', 'resource-packs', 'Resource Packs',
   'Organized reusable materials', 'resource-pack',
   'A demonstration listing for future member resource bundles.',
   'preview', 'member', NULL, NULL, 'demo', 1784304000, 40, 0, 1, 1784304000);
