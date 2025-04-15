-- Drop existing views if they exist
DROP VIEW IF EXISTS user_weekly_activity;
DROP VIEW IF EXISTS user_recent_activities;
DROP VIEW IF EXISTS user_activity_trends;

-- Create view for weekly user activity
CREATE OR REPLACE VIEW user_weekly_activity AS
WITH RECURSIVE dates AS (
  SELECT CURRENT_DATE - 6 AS date
  UNION ALL
  SELECT date + 1
  FROM dates
  WHERE date <= CURRENT_DATE
),
user_activities AS (
  SELECT 
    user_id,
    created_at::date AS activity_date,
    'vote' AS activity_type,
    NULL AS item_id,
    NULL AS description
  FROM votes
  UNION ALL
  SELECT 
    user_id,
    created_at::date AS activity_date,
    'review' AS activity_type,
    item_id,
    text AS description
  FROM reviews
  UNION ALL
  SELECT 
    user_id,
    created_at::date AS activity_date,
    'comparison' AS activity_type,
    id AS item_id,
    name AS description
  FROM comparison_sets
)
SELECT 
  d.date,
  TO_CHAR(d.date, 'Dy') AS day_name,
  ua.user_id,
  u.email,
  COALESCE(COUNT(ua.activity_date), 0) AS activity_count,
  COALESCE(COUNT(CASE WHEN ua.activity_type = 'vote' THEN 1 END), 0) AS votes_count,
  COALESCE(COUNT(CASE WHEN ua.activity_type = 'review' THEN 1 END), 0) AS reviews_count,
  COALESCE(COUNT(CASE WHEN ua.activity_type = 'comparison' THEN 1 END), 0) AS comparisons_count
FROM dates d
LEFT JOIN user_activities ua ON d.date = ua.activity_date
LEFT JOIN auth.users u ON ua.user_id = u.id
GROUP BY d.date, ua.user_id, u.email
ORDER BY d.date;

-- Create view for recent activities
CREATE OR REPLACE VIEW user_recent_activities AS
WITH user_activities AS (
  SELECT 
    user_id,
    created_at,
    'vote' AS activity_type,
    NULL AS item_id,
    NULL AS description,
    NULL AS title
  FROM votes
  UNION ALL
  SELECT 
    user_id,
    created_at,
    'review' AS activity_type,
    item_id,
    text AS description,
    NULL AS title
  FROM reviews
  UNION ALL
  SELECT 
    user_id,
    created_at,
    'comparison' AS activity_type,
    id AS item_id,
    NULL AS description,
    name AS title
  FROM comparison_sets
)
SELECT 
  ua.user_id,
  u.email,
  ua.created_at,
  ua.activity_type,
  ua.item_id,
  COALESCE(ua.title, ua.description) AS description,
  EXTRACT(EPOCH FROM (NOW() - ua.created_at)) / 3600 AS hours_ago
FROM user_activities ua
LEFT JOIN auth.users u ON ua.user_id = u.id
ORDER BY ua.created_at DESC
LIMIT 10;

-- Create view for activity trends
CREATE OR REPLACE VIEW user_activity_trends AS
WITH weekly_stats AS (
  SELECT 
    user_id,
    COUNT(*) AS weekly_activity,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) AS current_week_activity,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '14 days' AND created_at < CURRENT_DATE - INTERVAL '7 days' THEN 1 END) AS previous_week_activity
  FROM (
    SELECT user_id, created_at FROM votes
    UNION ALL
    SELECT user_id, created_at FROM reviews
    UNION ALL
    SELECT user_id, created_at FROM comparison_sets
  ) all_activities
  WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
  GROUP BY user_id
)
SELECT 
  u.id AS user_id,
  u.email,
  COALESCE(ws.weekly_activity, 0) AS weekly_activity,
  COALESCE(ws.current_week_activity, 0) AS current_week_activity,
  COALESCE(ws.previous_week_activity, 0) AS previous_week_activity,
  CASE 
    WHEN COALESCE(ws.previous_week_activity, 0) = 0 THEN 0
    ELSE ((COALESCE(ws.current_week_activity, 0)::float / COALESCE(ws.previous_week_activity, 1)::float - 1) * 100)::integer
  END AS weekly_change_percentage
FROM auth.users u
LEFT JOIN weekly_stats ws ON u.id = ws.user_id;

-- -- Create index on the view for better performance
-- CREATE INDEX IF NOT EXISTS idx_user_weekly_activity_user_id ON user_weekly_activity(user_id);
-- CREATE INDEX IF NOT EXISTS idx_user_weekly_activity_date ON user_weekly_activity(date); 