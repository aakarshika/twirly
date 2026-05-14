-- User views table
-- Tracks which comparison sets a user has viewed
CREATE TABLE user_views (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    set_id INTEGER REFERENCES comparison_sets(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, set_id)
); 