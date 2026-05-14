CREATE TABLE IF NOT EXISTS comparison_set_aspects (
  id          SERIAL PRIMARY KEY,
  set_id      INTEGER NOT NULL REFERENCES comparison_sets(id) ON DELETE CASCADE,
  metric_name VARCHAR(255) NOT NULL,
  description TEXT,
  weight      INTEGER NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
