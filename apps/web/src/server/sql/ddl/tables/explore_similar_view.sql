drop view if exists similar_comparison_sets;
-- View for similar comparison sets based on items and categories
CREATE OR REPLACE VIEW similar_comparison_sets AS
WITH set_item_overlap AS (
    SELECT 
        cs1.id as source_set_id,
        cs2.id as similar_set_id,
        COUNT(DISTINCT csi2.item_id) as common_items,
        COUNT(DISTINCT csi1.item_id) as total_items
    FROM comparison_sets cs1
    JOIN comparison_set_items csi1 ON cs1.id = csi1.set_id
    JOIN comparison_set_items csi2 ON csi1.item_id = csi2.item_id AND csi1.set_id != csi2.set_id
    JOIN comparison_sets cs2 ON csi2.set_id = cs2.id
    WHERE cs1.id != cs2.id
    GROUP BY cs1.id, cs2.id
),
set_category_overlap AS (
    SELECT 
        cs1.id as source_set_id,
        cs2.id as similar_set_id,
        COUNT(DISTINCT i1.category_id) as total_categories,
        COUNT(DISTINCT CASE WHEN i1.category_id = i2.category_id THEN i1.category_id END) as common_categories
    FROM comparison_sets cs1
    JOIN comparison_set_items csi1 ON cs1.id = csi1.set_id
    JOIN items i1 ON csi1.item_id = i1.id
    JOIN comparison_set_items csi2 ON csi2.set_id != cs1.id
    JOIN items i2 ON csi2.item_id = i2.id
    JOIN comparison_sets cs2 ON csi2.set_id = cs2.id
    WHERE cs1.id != cs2.id
    GROUP BY cs1.id, cs2.id
)
SELECT 
    s.source_set_id,
    s.similar_set_id,
    (s.common_items::float / NULLIF(s.total_items, 0)) * 0.7 + 
    (COALESCE(sc.common_categories::float / NULLIF(sc.total_categories, 0), 0)) * 0.3 as similarity_score
FROM set_item_overlap s
LEFT JOIN set_category_overlap sc ON s.source_set_id = sc.source_set_id AND s.similar_set_id = sc.similar_set_id;

-- Function to fetch sets sorted by similarity
CREATE OR REPLACE FUNCTION fetch_similar_sets(
    p_source_set_id INTEGER,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    set_id INTEGER,
    name VARCHAR,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    total_votes BIGINT,
    total_comments BIGINT,
    similarity_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    WITH set_metrics AS (
        SELECT 
            cs.id as set_id,
            COUNT(DISTINCT v.id) as total_votes,
            COUNT(DISTINCT c.id) as total_comments
        FROM comparison_sets cs
        LEFT JOIN votes v ON cs.id = v.set_id
        LEFT JOIN comparison_set_comments c ON cs.id = c.set_id
        WHERE cs.is_published = true
        GROUP BY cs.id
    )
    SELECT 
        cs.id as set_id,
        cs.name,
        cs.user_id,
        cs.created_at,
        COALESCE(sm.total_votes, 0) as total_votes,
        COALESCE(sm.total_comments, 0) as total_comments,
        COALESCE(scs.similarity_score, 0) as similarity_score
    FROM comparison_sets cs
    LEFT JOIN similar_comparison_sets scs ON scs.similar_set_id = cs.id and scs.source_set_id = p_source_set_id
    LEFT JOIN set_metrics sm ON cs.id = sm.set_id
    WHERE cs.is_published = true
    ORDER BY scs.similarity_score DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
