-- View to calculate controversial scores for comparison sets
CREATE OR REPLACE VIEW controversial_sets AS
WITH set_metrics AS (
  SELECT 
    cs.id,
    cs.name,
    cs.created_at,
    COUNT(DISTINCT v.id) as total_votes,
    COUNT(DISTINCT cscr.id) as total_likes,
    COUNT(DISTINCT csc.id) as total_comments,
    -- Calculate comment engagement ratio (comments per vote)
    CASE 
      WHEN COUNT(DISTINCT v.id) = 0 THEN 0
      ELSE COUNT(DISTINCT csc.id)::float / COUNT(DISTINCT v.id)
    END as comment_engagement_ratio,
    -- Calculate like engagement ratio (likes per vote)
    CASE 
      WHEN COUNT(DISTINCT v.id) = 0 THEN 0
      ELSE COUNT(DISTINCT cscr.id)::float / COUNT(DISTINCT v.id)
    END as like_engagement_ratio,
    EXTRACT(EPOCH FROM (NOW() - cs.created_at)) / 3600 as hours_old
  FROM comparison_sets cs
  LEFT JOIN votes v ON v.set_id = cs.id
  LEFT JOIN comparison_set_comment_reactions cscr ON cscr.set_id = cs.id
  LEFT JOIN comparison_set_comments csc ON csc.set_id = cs.id
  GROUP BY cs.id, cs.name, cs.created_at
)
SELECT 
  sm.*,
  -- Controversial score calculation:
  -- Emphasizes high comment and like engagement relative to votes
  -- (comments * 0.4 + likes * 0.4 + votes * 0.2) * (comment_engagement_ratio + like_engagement_ratio) / (hours_old + 2)^1.2
  -- This gives more weight to sets that generate discussion and reactions
  (sm.total_comments * 0.4 + sm.total_likes * 0.4 + sm.total_votes * 0.2) * 
  (sm.comment_engagement_ratio + sm.like_engagement_ratio) / 
  POWER(sm.hours_old + 2, 1.2) as controversial_score
FROM set_metrics sm; 