-- User Dashboard Schema
-- This file contains schema modifications and views for the user dashboard
-- It adds user ownership to items and creates performance metrics views

-- Add user_id column to items table if it doesn't exist
-- This allows tracking which user created each item
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'items' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE items ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Performance indexes for product-related queries
-- These indexes improve query performance for dashboard operations
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at);

-- Drop the existing view if it exists
DROP VIEW IF EXISTS product_performance_metrics;
DROP VIEW IF EXISTS user_activity_summary;

-- Product performance metrics view
-- Provides comprehensive performance data for products
-- Includes:
--   - Basic product information
--   - User ownership
--   - Category details
--   - Engagement metrics (views, comparisons, reviews)
--   - Voting and review statistics
CREATE VIEW product_performance_metrics AS
SELECT 
    i.id AS product_id,
    i.name AS product_name,
    i.user_id,
    u.email AS user_email,
    i.created_at,
    c.name AS category_name,
    COUNT(DISTINCT v.id) AS total_votes,
    COUNT(DISTINCT r.id) AS total_reviews,
    COUNT(DISTINCT cs.id) AS total_comparisons
FROM 
    items i
LEFT JOIN auth.users u ON i.user_id = u.id
LEFT JOIN categories c ON i.category_id = c.id
LEFT JOIN votes v ON i.id = v.item_id
LEFT JOIN reviews r ON i.id = r.item_id
LEFT JOIN comparison_set_items csi ON i.id = csi.item_id
LEFT JOIN comparison_sets cs ON csi.set_id = cs.id
GROUP BY 
    i.id, i.name, i.user_id, u.email, i.created_at, im.views, im.comparisons, 
    im.reviews, im.rating, c.name;

-- User activity summary view
-- Provides a comprehensive summary of user engagement
-- Includes:
--   - Total votes cast
--   - Total reviews written
--   - Total products created
--   - Total comparisons created
--   - Total likes received on reviews
CREATE VIEW user_activity_summary AS
SELECT
    u.id AS user_id,
    u.email,
    COALESCE(v.vote_count, 0) AS total_votes,
    COALESCE(r.review_count, 0) AS total_reviews,
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
        COUNT(*) AS review_count
    FROM
        reviews
    GROUP BY
        user_id
) r ON u.id = r.user_id
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
        r.user_id,
        COUNT(rl.id) AS likes_received
    FROM
        reviews r
    JOIN
        review_likes rl ON r.id = rl.review_id
    GROUP BY
        r.user_id
) rl ON u.id = rl.user_id; 