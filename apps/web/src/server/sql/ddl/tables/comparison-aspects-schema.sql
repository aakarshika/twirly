DROP TABLE IF EXISTS comparison_set_aspects; 
CREATE TABLE comparison_set_aspects (
    id SERIAL PRIMARY KEY,
    set_id INTEGER REFERENCES comparison_sets(id) ON DELETE CASCADE,
    metric_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(set_id, metric_name)
);


CREATE INDEX idx_comparison_set_aspects_set_id ON comparison_set_aspects(set_id);

ALTER TABLE comparison_set_aspects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comparison set metrics
CREATE POLICY "Anyone can view comparison set metrics"
  ON comparison_set_aspects FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create metrics for their own sets"
  ON comparison_set_aspects FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT user_id 
      FROM comparison_sets 
      WHERE id = set_id
    )
  );

CREATE POLICY "Authenticated users can update metrics for their own sets"
  ON comparison_set_aspects FOR UPDATE
  USING (
    auth.uid() = (
      SELECT user_id 
      FROM comparison_sets 
      WHERE id = set_id
    )
  );

CREATE POLICY "Authenticated users can delete metrics for their own sets"
  ON comparison_set_aspects FOR DELETE
  USING (
    auth.uid() = (
      SELECT user_id 
      FROM comparison_sets 
      WHERE id = set_id
    )
  );
