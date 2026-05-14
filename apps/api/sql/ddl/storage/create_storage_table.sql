-- Drop everything first
DROP TABLE IF EXISTS storage CASCADE;

-- Create storage table
CREATE TABLE storage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bucket_id TEXT NOT NULL,
    name TEXT NOT NULL,
    owner UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(bucket_id, name)
);

-- Create indexes for better performance
CREATE INDEX idx_storage_bucket_id ON storage(bucket_id);
CREATE INDEX idx_storage_owner ON storage(owner);
CREATE INDEX idx_storage_created_at ON storage(created_at);

-- Enable RLS
ALTER TABLE storage ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow public to view storage" ON storage;
DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage;
DROP POLICY IF EXISTS "Allow owners to update their files" ON storage;
DROP POLICY IF EXISTS "Allow owners to delete their files" ON storage;

-- Create policies
-- Allow public to view storage
CREATE POLICY "Allow public to view storage"
    ON storage FOR SELECT
    TO public
    USING (true);

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload"
    ON storage FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = owner
    );

-- Allow owners to update their files
CREATE POLICY "Allow owners to update their files"
    ON storage FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = owner
    )
    WITH CHECK (
        auth.uid() = owner
    );

-- Allow owners to delete their files
CREATE POLICY "Allow owners to delete their files"
    ON storage FOR DELETE
    TO authenticated
    USING (
        auth.uid() = owner
    );

-- Grant necessary permissions
GRANT ALL ON storage TO authenticated;
GRANT ALL ON storage TO anon;
GRANT ALL ON storage TO service_role;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_storage_updated_at
    BEFORE UPDATE ON storage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 