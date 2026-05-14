-- View to calculate viral scores for comparison sets
CREATE OR REPLACE VIEW viral_sets AS
WITH set_metrics AS (
  SELECT 
    cs.id,
    cs.name,
    cs.created_at,
    COUNT(DISTINCT v.id) as total_votes,
    COUNT(DISTINCT cscr.id) as total_likes,
    COUNT(DISTINCT csc.id) as total_comments,
    EXTRACT(EPOCH FROM (NOW() - cs.created_at)) / 3600 as hours_old
  FROM comparison_sets cs
  LEFT JOIN votes v ON v.set_id = cs.id
  LEFT JOIN comparison_set_comment_reactions cscr ON cscr.set_id = cs.id
  LEFT JOIN comparison_set_comments csc ON csc.set_id = cs.id
  GROUP BY cs.id, cs.name, cs.created_at
)
SELECT 
  sm.*,
  -- Viral score calculation:
  -- (votes * 0.5 + likes * 0.3 + comments * 0.2) / (hours_old + 2)^1.5
  -- This gives more weight to recent content and considers engagement
  (sm.total_votes * 0.5 + sm.total_likes * 0.3 + sm.total_comments * 0.2) / 
  POWER(sm.hours_old + 2, 1.5) as viral_score
FROM set_metrics sm; 