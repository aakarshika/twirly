-- Drop everything first
DROP TABLE IF EXISTS feedback CASCADE;

-- Create feedback table
CREATE TABLE feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('suggestion', 'bug', 'other')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    message TEXT NOT NULL,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on status for faster filtering
CREATE INDEX idx_feedback_status ON feedback(status);

-- Create index on created_at for faster sorting
CREATE INDEX idx_feedback_created_at ON feedback(created_at);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow public to insert feedback" ON feedback;
DROP POLICY IF EXISTS "Allow admin emails to view feedback" ON feedback;
DROP POLICY IF EXISTS "Allow admin emails to update feedback status" ON feedback;
DROP POLICY IF EXISTS "Allow admin emails to delete feedback" ON feedback;

-- Create new policies
-- Allow anyone to insert feedback (including unauthenticated users)
CREATE POLICY "Allow public to insert feedback"
    ON feedback FOR INSERT
    TO public
    WITH CHECK (true);

-- Allow only specific admin emails to view feedback
CREATE POLICY "Allow admin emails to view feedback"
    ON feedback FOR SELECT
    TO authenticated
    USING (
        auth.jwt() ->> 'email' IN (
            'aakarshika93@gmail.com',
            'great.shivam19@gmail.com'
        )
    );

-- Allow only specific admin emails to update feedback status
CREATE POLICY "Allow admin emails to update feedback status"
    ON feedback FOR UPDATE
    TO authenticated
    USING (
        auth.jwt() ->> 'email' IN (
            'aakarshika93@gmail.com',
            'great.shivam19@gmail.com'
        )
    )
    WITH CHECK (true);

-- Allow only specific admin emails to delete feedback
CREATE POLICY "Allow admin emails to delete feedback"
    ON feedback FOR DELETE
    TO authenticated
    USING (
        auth.jwt() ->> 'email' IN (
            'aakarshika93@gmail.com',
            'great.shivam19@gmail.com'
        )
    );

-- Grant necessary permissions
GRANT ALL ON feedback TO authenticated;
GRANT ALL ON feedback TO anon;
GRANT ALL ON feedback TO service_role;

-- Allow public uploads for all image formats
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'feedback-images' AND
  auth.role() = 'anon' AND
  (
    name LIKE '%.jpg' OR
    name LIKE '%.jpeg' OR
    name LIKE '%.png' OR
    name LIKE '%.gif' OR
    name LIKE '%.webp' OR
    name LIKE '%.heic' OR
    name LIKE '%.heif' OR
    name LIKE '%.bmp' OR
    name LIKE '%.tiff' OR
    name LIKE '%.svg'
  )
);

-- Allow public downloads
CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'feedback-images'
); 