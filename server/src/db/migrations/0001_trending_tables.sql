-- Sprint 5: Trending / Home Feed tables
-- user_id columns use TEXT to match Better Auth's "user" table (id TEXT)

CREATE TABLE IF NOT EXISTS categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS items (
  id                 SERIAL PRIMARY KEY,
  name               VARCHAR(255) NOT NULL,
  description        TEXT,
  image_url          TEXT,
  item_color_string  VARCHAR(50),
  category_id        INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comparison_sets (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  user_id      TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  start_date   TIMESTAMPTZ,
  end_date     TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comparison_set_items (
  id         SERIAL PRIMARY KEY,
  set_id     INTEGER NOT NULL REFERENCES comparison_sets(id) ON DELETE CASCADE,
  item_id    INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (set_id, item_id)
);

CREATE TABLE IF NOT EXISTS votes (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  item_id    INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  set_id     INTEGER NOT NULL REFERENCES comparison_sets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, set_id)
);

CREATE TABLE IF NOT EXISTS comparison_set_comments (
  id         SERIAL PRIMARY KEY,
  set_id     INTEGER NOT NULL REFERENCES comparison_sets(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  parent_id  INTEGER REFERENCES comparison_set_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id           TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  display_name      VARCHAR(255),
  username          VARCHAR(100) UNIQUE,
  profile_image_url TEXT,
  bio               TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_category_preferences (
  user_id     TEXT    NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, category_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cs_user_id       ON comparison_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_cs_published      ON comparison_sets(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cs_category_id    ON comparison_sets(category_id);
CREATE INDEX IF NOT EXISTS idx_csi_set_id        ON comparison_set_items(set_id);
CREATE INDEX IF NOT EXISTS idx_votes_set_id      ON votes(set_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_set    ON votes(user_id, set_id);
CREATE INDEX IF NOT EXISTS idx_comments_set_id   ON comparison_set_comments(set_id);
CREATE INDEX IF NOT EXISTS idx_up_username       ON user_preferences(username);
CREATE INDEX IF NOT EXISTS idx_ucp_user_id       ON user_category_preferences(user_id);
