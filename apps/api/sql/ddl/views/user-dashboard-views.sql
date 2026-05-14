
-- Drop the existing view if it exists
DROP VIEW IF EXISTS product_performance_metrics;
DROP VIEW IF EXISTS user_activity_summary;

-- User activity summary view
-- Provides a comprehensive summary of user engagement
-- Includes:
--   - Total votes cast
--   - Total comments written
--   - Total products created
--   - Total comparisons created
--   - Total likes received on comments
CREATE VIEW user_activity_summary AS
SELECT
    u.id AS user_id,
    u.email,
    COALESCE(v.vote_count, 0) AS total_votes,
    COALESCE(c.comment_count, 0) AS total_reviews,
    COALESCE(p.product_count, 0) AS total_products,
    COALESCE(cs.comparison_count, 0) AS total_comparisons,
    COALESCE(rl.likes_received, 0) AS total_likes_received
FROM
    auth.users u
LEFT JOIN (
    SELECT
        user_id,
        COUNT(*) AS vote_count
    FROM
        votes
    GROUP BY
        user_id
) v ON u.id = v.user_id
LEFT JOIN (
    SELECT
        user_id,
        COUNT(*) AS comment_count
    FROM
        comparison_set_comments
    GROUP BY
        user_id
) c ON u.id = c.user_id
LEFT JOIN (
    SELECT
        user_id,
        COUNT(*) AS product_count
    FROM
        items
    GROUP BY
        user_id
) p ON u.id = p.user_id
LEFT JOIN (
    SELECT
        user_id,
        COUNT(*) AS comparison_count
    FROM
        comparison_sets
    GROUP BY
        user_id
) cs ON u.id = cs.user_id
LEFT JOIN (
    SELECT
        c.user_id,
        COUNT(cr.id) AS likes_received
    FROM
        comparison_set_comments c
    JOIN
        comparison_set_comment_reactions cr ON c.id = cr.comment_id
    WHERE
        cr.reaction_type = 'like'
    GROUP BY
        c.user_id
) rl ON u.id = rl.user_id; 