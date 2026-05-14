CREATE TABLE comparison_aspect_reactions (
  id            SERIAL PRIMARY KEY,
  aspect_id     INTEGER NOT NULL REFERENCES comparison_set_aspects(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL DEFAULT 'like',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(aspect_id, user_id)
);

CREATE INDEX idx_aspect_reactions_aspect ON comparison_aspect_reactions (aspect_id);
