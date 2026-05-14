-- Temporary table for batching user activities
CREATE TABLE user_activity_batch (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (
        activity_type IN (
            'aspect_set_view',
            'comparison_set_view'
        )
    ),
    entity_type VARCHAR(50) NOT NULL CHECK (
        entity_type IN (
            'comparison_set',
            'aspect_set'
        )
    ),
    entity_id INTEGER NOT NULL,
    view_count INTEGER DEFAULT 1,
    first_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_user_activity_batch_user_id ON user_activity_batch(user_id);
CREATE INDEX idx_user_activity_batch_activity_type ON user_activity_batch(activity_type);
CREATE INDEX idx_user_activity_batch_entity_type ON user_activity_batch(entity_type);
CREATE INDEX idx_user_activity_batch_last_viewed_at ON user_activity_batch(last_viewed_at);

-- Function to increment view count or insert new batch entry
CREATE OR REPLACE FUNCTION increment_activity_batch(
    p_user_id UUID,
    p_activity_type VARCHAR(50),
    p_entity_type VARCHAR(50),
    p_entity_id INTEGER
) RETURNS void AS $$
BEGIN
    INSERT INTO user_activity_batch (
        user_id,
        activity_type,
        entity_type,
        entity_id
    )
    VALUES (
        p_user_id,
        p_activity_type,
        p_entity_type,
        p_entity_id
    )
    ON CONFLICT (user_id, activity_type, entity_type, entity_id)
    DO UPDATE SET
        view_count = user_activity_batch.view_count + 1,
        last_viewed_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to flush batched activities to main activity log
CREATE OR REPLACE FUNCTION flush_activity_batch(
    p_batch_age_minutes INTEGER DEFAULT 5,
    p_max_batch_size INTEGER DEFAULT 100
) RETURNS INTEGER AS $$
DECLARE
    v_flushed_count INTEGER;
BEGIN
    -- Insert batched activities into main log
    WITH batch_to_flush AS (
        DELETE FROM user_activity_batch
        WHERE last_viewed_at < (CURRENT_TIMESTAMP - (p_batch_age_minutes || ' minutes')::INTERVAL)
        OR view_count >= p_max_batch_size
        RETURNING *
    )
    INSERT INTO user_activity_log (
        user_id,
        activity_type,
        entity_type,
        entity_id,
        karma_points,
        metadata
    )
    SELECT 
        user_id,
        activity_type,
        entity_type,
        entity_id,
        -- Calculate karma points based on view count (example: 1 point per 10 views)
        (view_count / 10)::INTEGER,
        jsonb_build_object(
            'view_count', view_count,
            'first_viewed_at', first_viewed_at,
            'last_viewed_at', last_viewed_at
        )
    FROM batch_to_flush;

    GET DIAGNOSTICS v_flushed_count = ROW_COUNT;
    RETURN v_flushed_count;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint to prevent duplicate entries
ALTER TABLE user_activity_batch
ADD CONSTRAINT unique_activity_batch UNIQUE (user_id, activity_type, entity_type, entity_id);

-- Add comments
COMMENT ON TABLE user_activity_batch IS 'Temporary table for batching high-frequency user activities like views';
COMMENT ON FUNCTION increment_activity_batch IS 'Increments view count or creates new batch entry for user activity';
COMMENT ON FUNCTION flush_activity_batch IS 'Flushes batched activities to main activity log based on age and size thresholds'; 