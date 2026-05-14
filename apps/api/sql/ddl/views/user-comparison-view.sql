-- Create a view for comparison sets with user information
CREATE OR REPLACE VIEW comparison_sets_with_users AS
SELECT 
    cs.id,
    cs.name,
    cs.category_id,
    cs.created_at,
    cs.user_id,
    c.name as category_name,
    up.username,
    up.display_name,
    up.profile_image_url
FROM comparison_sets cs
LEFT JOIN categories c ON cs.category_id = c.id
LEFT JOIN user_preferences up ON cs.user_id = up.user_id;

-- Add RLS policies for the view
ALTER VIEW comparison_sets_with_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comparison sets with users"
    ON comparison_sets_with_users
    FOR SELECT
    USING (true); 