CREATE TABLE IF NOT EXISTS user_notification_settings (
  id                    SERIAL PRIMARY KEY,
  user_id               TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  email_notifications   BOOLEAN NOT NULL DEFAULT TRUE,
  push_notifications    BOOLEAN NOT NULL DEFAULT TRUE,
  comment_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  marketing_emails      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);
