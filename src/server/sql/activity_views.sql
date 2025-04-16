-- Drop existing views if they exist
DROP VIEW IF EXISTS user_weekly_activity;
DROP VIEW IF EXISTS user_recent_activities;
DROP VIEW IF EXISTS user_activity_trends;
DROP VIEW IF EXISTS product_weekly_activity;
DROP VIEW IF EXISTS product_recent_activities;
DROP VIEW IF EXISTS product_activity_trends;
DROP VIEW IF EXISTS comparison_set_metrics;

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

-- Create view for weekly product activity
CREATE OR REPLACE VIEW product_weekly_activity AS
WITH RECURSIVE dates AS (
  SELECT CURRENT_DATE - 6 AS date
  UNION ALL
  SELECT date + 1
  FROM dates
  WHERE date <= CURRENT_DATE
),
product_activities AS (
  SELECT 
    csi.item_id,
    v.created_at::date AS activity_date,
    'vote' AS activity_type,
    v.user_id,
    NULL AS description
  FROM votes v
  JOIN comparison_set_items csi ON v.set_id = csi.set_id AND v.item_id = csi.item_id
  UNION ALL
  SELECT 
    item_id,
    created_at::date AS activity_date,
    'review' AS activity_type,
    user_id,
    text AS description
  FROM reviews
  UNION ALL
  SELECT 
    csi.item_id,
    cs.created_at::date AS activity_date,
    'comparison' AS activity_type,
    cs.user_id,
    NULL AS description
  FROM comparison_sets cs
  JOIN comparison_set_items csi ON cs.id = csi.set_id
)
SELECT 
  d.date,
  TO_CHAR(d.date, 'Dy') AS day_name,
  pa.item_id,
  i.name AS item_name,
  COALESCE(COUNT(pa.activity_date), 0) AS activity_count,
  COALESCE(COUNT(CASE WHEN pa.activity_type = 'vote' THEN 1 END), 0) AS votes_count,
  COALESCE(COUNT(CASE WHEN pa.activity_type = 'review' THEN 1 END), 0) AS reviews_count,
  COALESCE(COUNT(CASE WHEN pa.activity_type = 'comparison' THEN 1 END), 0) AS comparisons_count
FROM dates d
LEFT JOIN product_activities pa ON d.date = pa.activity_date
LEFT JOIN items i ON pa.item_id = i.id
GROUP BY d.date, pa.item_id, i.name
ORDER BY d.date;

-- Create view for recent product activities
CREATE OR REPLACE VIEW product_recent_activities AS
WITH product_activities AS (
  SELECT 
    csi.item_id,
    v.created_at,
    'vote' AS activity_type,
    v.user_id,
    NULL AS description,
    NULL AS title
  FROM votes v
  JOIN comparison_set_items csi ON v.set_id = csi.set_id AND v.item_id = csi.item_id
  UNION ALL
  SELECT 
    item_id,
    created_at,
    'review' AS activity_type,
    user_id,
    text AS description,
    NULL AS title
  FROM reviews
  UNION ALL
  SELECT 
    csi.item_id,
    cs.created_at,
    'comparison' AS activity_type,
    cs.user_id,
    NULL AS description,
    cs.name AS title
  FROM comparison_sets cs
  JOIN comparison_set_items csi ON cs.id = csi.set_id
)
SELECT 
  pa.item_id,
  i.name AS item_name,
  pa.created_at,
  pa.activity_type,
  pa.user_id,
  u.email AS user_email,
  COALESCE(pa.title, pa.description) AS description,
  EXTRACT(EPOCH FROM (NOW() - pa.created_at)) / 3600 AS hours_ago
FROM product_activities pa
LEFT JOIN items i ON pa.item_id = i.id
LEFT JOIN auth.users u ON pa.user_id = u.id
ORDER BY pa.created_at DESC
LIMIT 10;

-- Create view for product activity trends
CREATE OR REPLACE VIEW product_activity_trends AS
WITH weekly_stats AS (
  SELECT 
    item_id,
    COUNT(*) AS weekly_activity,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) AS current_week_activity,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '14 days' AND created_at < CURRENT_DATE - INTERVAL '7 days' THEN 1 END) AS previous_week_activity
  FROM (
    SELECT csi.item_id, v.created_at 
    FROM votes v
    JOIN comparison_set_items csi ON v.set_id = csi.set_id AND v.item_id = csi.item_id
    UNION ALL
    SELECT item_id, created_at FROM reviews
    UNION ALL
    SELECT csi.item_id, cs.created_at
    FROM comparison_sets cs
    JOIN comparison_set_items csi ON cs.id = csi.set_id
  ) all_activities
  WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
  GROUP BY item_id
)
SELECT 
  i.id AS item_id,
  i.name AS item_name,
  COALESCE(ws.weekly_activity, 0) AS weekly_activity,
  COALESCE(ws.current_week_activity, 0) AS current_week_activity,
  COALESCE(ws.previous_week_activity, 0) AS previous_week_activity,
  CASE 
    WHEN COALESCE(ws.previous_week_activity, 0) = 0 THEN 0
    ELSE ((COALESCE(ws.current_week_activity, 0)::float / COALESCE(ws.previous_week_activity, 1)::float - 1) * 100)::integer
  END AS weekly_change_percentage
FROM items i
LEFT JOIN weekly_stats ws ON i.id = ws.item_id;

-- Create view for comparison set metrics
CREATE OR REPLACE VIEW comparison_set_metrics AS
WITH comparison_items AS (
  SELECT 
    cs.id AS set_id,
    cs.name AS set_name,
    csi.item_id,
    i.name AS item_name
  FROM comparison_sets cs
  JOIN comparison_set_items csi ON cs.id = csi.set_id
  JOIN items i ON csi.item_id = i.id
),
item_metrics AS (
  SELECT 
    ci.set_id,
    ci.set_name,
    ci.item_id,
    ci.item_name,
    rm.metric_name,
    ROUND(AVG(rm.value), 2) AS avg_rating,
    COUNT(DISTINCT r.id) AS total_reviews
  FROM comparison_items ci
  LEFT JOIN reviews r ON ci.item_id = r.item_id
  LEFT JOIN review_metrics rm ON r.id = rm.review_id
  GROUP BY ci.set_id, ci.set_name, ci.item_id, ci.item_name, rm.metric_name
),
aggregated_metrics AS (
  SELECT 
    set_id,
    set_name,
    item_id,
    item_name,
    jsonb_object_agg(
      metric_name,
      jsonb_build_object(
        'avg_rating', avg_rating,
        'total_reviews', total_reviews
      )
    ) AS metrics
  FROM item_metrics
  GROUP BY set_id, set_name, item_id, item_name
),
final_aggregation AS (
  SELECT 
    set_id,
    set_name,
    jsonb_agg(
      jsonb_build_object(
        'id', item_id,
        'name', item_name,
        'average_metrics', COALESCE(metrics, '{}'::jsonb)
      )
    ) AS items,
    array_agg(item_id) AS item_ids
  FROM aggregated_metrics
  GROUP BY set_id, set_name
)
SELECT 
  set_id,
  set_name,
  items,
  item_ids
FROM final_aggregation;

-- -- Create index on the view for better performance
-- CREATE INDEX IF NOT EXISTS idx_user_weekly_activity_user_id ON user_weekly_activity(user_id);
-- CREATE INDEX IF NOT EXISTS idx_user_weekly_activity_date ON user_weekly_activity(date); 