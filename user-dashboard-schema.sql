-- First add the user_id column to items table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'items' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE items ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for product-related queries
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at);

-- Drop the existing view if it exists
DROP VIEW IF EXISTS product_performance_metrics;

-- Create the view for product performance metrics
CREATE VIEW product_performance_metrics AS
SELECT 
    i.id AS product_id,
    i.name AS product_name,
    i.user_id,
    i.created_at,
    im.views,
    im.comparisons,
    im.reviews,
    im.rating,
    c.name AS category_name,
    comp.name AS company_name,
    COUNT(DISTINCT v.id) AS total_votes,
    COUNT(DISTINCT r.id) AS total_reviews,
    COUNT(DISTINCT cs.id) AS total_comparisons
FROM 
    items i
LEFT JOIN item_metrics im ON i.id = im.item_id
LEFT JOIN categories c ON i.category_id = c.id
LEFT JOIN companies comp ON i.company_id = comp.id
LEFT JOIN votes v ON i.id = v.item_id
LEFT JOIN reviews r ON i.id = r.item_id
LEFT JOIN comparison_set_items csi ON i.id = csi.item_id
LEFT JOIN comparison_sets cs ON csi.set_id = cs.id
GROUP BY 
    i.id, i.name, i.user_id, i.created_at, im.views, im.comparisons, 
    im.reviews, im.rating, c.name, comp.name; 