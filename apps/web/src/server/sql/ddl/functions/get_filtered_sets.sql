DROP FUNCTION IF EXISTS get_filtered_sets;
CREATE OR REPLACE FUNCTION get_filtered_sets(
  _user_id UUID,
  _filter_type TEXT, -- 'user_home_feed_91819', 'trending', 'single_category', 'group', 'controversial'
  _category_id INTEGER DEFAULT NULL,
  _category_ids INTEGER[] DEFAULT NULL,
  _limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id INTEGER,
  set_id INTEGER,
  set_name VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE,
  category_id INTEGER,
  category_name VARCHAR,
  viral_score FLOAT,
  controversial_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_categories AS (
    SELECT ucp.category_id 
    FROM user_category_preferences ucp
    WHERE ucp.user_id = _user_id
  ),
  filtered_sets AS (
    SELECT 
      cs.set_id as id,
      cs.set_id,
      cs.set_name,
      cs.created_at,
      cs.category_id,
      cs.category_name,
      cs.viral_score::float as viral_score,
      COALESCE(cos.controversial_score, 0)::float as controversial_score
    FROM categorized_sets cs
    LEFT JOIN controversial_sets cos ON cos.id = cs.set_id
    LEFT JOIN user_views uv ON uv.set_id = cs.set_id AND uv.user_id = _user_id
    LEFT JOIN votes v ON v.set_id = cs.set_id AND v.user_id = _user_id
    WHERE 
      uv.set_id IS NULL AND v.set_id is null-- Only get sets the user hasn't viewed
      AND CASE _filter_type
        WHEN 'user_home_feed_91819' THEN
          -- Home feed: viral sets from user's categories or super viral sets
          (cs.category_id IN (SELECT ucp.category_id FROM user_categories ucp) OR cs.viral_score > 0.1)
        WHEN 'trending' THEN
          -- Trending: all highly viral sets
          cs.viral_score > 0.0
        WHEN 'single_category' THEN
          -- Single category: viral sets from specific category
          cs.category_id = _category_id
        WHEN 'multiple_categories' THEN
          -- Group: viral sets from selected categories
          -- _category_ids is in format [1,2,3]
          cs.category_id = ANY(_category_ids)
        WHEN 'controversial' THEN
          -- Controversial: sets with high engagement ratios
          cos.controversial_score > 0.7
      END
  )
  SELECT *
  FROM filtered_sets fs
  ORDER BY 
    CASE _filter_type
      WHEN 'controversial' THEN fs.controversial_score
      ELSE fs.viral_score
    END DESC,
    fs.created_at DESC
  LIMIT _limit;
END;
$$ LANGUAGE plpgsql; 