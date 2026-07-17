DROP INDEX IF EXISTS idx_contact_messages_created_at;
DROP INDEX IF EXISTS idx_contact_messages_status_created_at;

ALTER TABLE contact_messages RENAME TO contact_messages_before_verification;

CREATE TABLE contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 50),
  email TEXT NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  message TEXT NOT NULL CHECK (length(message) BETWEEN 10 AND 2000),
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_verification'
    CHECK (status IN ('pending_verification', 'new', 'read', 'archived')),
  verification_token_hash TEXT UNIQUE,
  verification_expires_at INTEGER,
  verified_at INTEGER,
  CHECK (
    (status = 'pending_verification' AND verification_token_hash IS NOT NULL AND verification_expires_at IS NOT NULL)
    OR status != 'pending_verification'
  )
);

INSERT INTO contact_messages (
  id,
  name,
  email,
  message,
  created_at,
  status,
  verification_token_hash,
  verification_expires_at,
  verified_at
)
SELECT
  id,
  name,
  email,
  message,
  created_at,
  status,
  NULL,
  NULL,
  created_at
FROM contact_messages_before_verification;

DROP TABLE contact_messages_before_verification;

CREATE INDEX idx_contact_messages_created_at
  ON contact_messages(created_at DESC);

CREATE INDEX idx_contact_messages_status_created_at
  ON contact_messages(status, created_at DESC);

CREATE TABLE contact_email_rate_events (
  id TEXT PRIMARY KEY,
  email_hash TEXT NOT NULL CHECK (length(email_hash) = 64),
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_contact_email_rate_events_hash_time
  ON contact_email_rate_events(email_hash, created_at DESC);
