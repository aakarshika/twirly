CREATE TABLE feedback (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL DEFAULT '',
  type        VARCHAR(50) NOT NULL DEFAULT 'bug',
  priority    VARCHAR(20) NOT NULL DEFAULT 'medium',
  message     TEXT NOT NULL,
  image_url   TEXT,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending',
  page_route  TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_status ON feedback (status);
