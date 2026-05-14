-- User Activity Log table
-- Tracks user activities for karma points calculation
-- Primary key: id
-- Foreign key: user_id references auth.users(id)


-- Create a view for karma points
DROP VIEW IF EXISTS karma_points;

DROP TABLE IF EXISTS user_activity_log;


CREATE TABLE user_activity_log (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL ,
    -- Reference to the specific entity this activity is related to
    entity_type VARCHAR(50) NOT NULL ,
    entity_id INTEGER NOT NULL,
    -- Points earned for this activity
    karma_points INTEGER NOT NULL,
    -- Page/route where the activity occurred
    page_name VARCHAR(255) NOT NULL,
    -- Additional metadata about the activity
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_activity_type ON user_activity_log(activity_type);
CREATE INDEX idx_user_activity_log_entity_type ON user_activity_log(entity_type);
CREATE INDEX idx_user_activity_log_created_at ON user_activity_log(created_at);
CREATE INDEX idx_user_activity_log_page_name ON user_activity_log(page_name);

-- Add comment to table
COMMENT ON TABLE user_activity_log IS 'Tracks user activities for karma points calculation';

-- Add comments to columns
COMMENT ON COLUMN user_activity_log.activity_type IS 'Type of activity performed by the user';
COMMENT ON COLUMN user_activity_log.entity_type IS 'Type of entity the activity is related to';
COMMENT ON COLUMN user_activity_log.entity_id IS 'ID of the entity the activity is related to';
COMMENT ON COLUMN user_activity_log.karma_points IS 'Points earned for this activity';
COMMENT ON COLUMN user_activity_log.page_name IS 'Page/route where the activity occurred';
COMMENT ON COLUMN user_activity_log.metadata IS 'Additional JSON metadata about the activity';

-- Enable Row Level Security
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE VIEW karma_points AS
SELECT 
    user_id,
    SUM(karma_points) as total_karma_points
FROM user_activity_log
GROUP BY user_id;


-- Add comment to view
COMMENT ON VIEW karma_points IS 'View showing total karma points for each user';

-- -- Create policies
-- -- Drop the old restrictive policy
-- DROP POLICY IF EXISTS "No direct access to user_activity_log" ON user_activity_log;

-- Allow authenticated users to insert their own activity logs
CREATE POLICY "Users can insert their own activity logs" 
ON user_activity_log 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own activity logs
CREATE POLICY "Users can read their own activity logs" 
ON user_activity_log 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Allow service role to manage all activity logs
CREATE POLICY "Service role can manage all activity logs" 
ON user_activity_log 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);
