CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 50),
  email TEXT NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  message TEXT NOT NULL CHECK (length(message) BETWEEN 10 AND 2000),
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON contact_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created_at
  ON contact_messages(status, created_at DESC);

CREATE TABLE IF NOT EXISTS contact_rate_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash TEXT NOT NULL CHECK (length(ip_hash) = 64),
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_rate_events_ip_time
  ON contact_rate_events(ip_hash, created_at DESC);
