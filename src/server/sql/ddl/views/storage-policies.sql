-- Storage Policies for profile-pics bucket
-- This file contains the storage policies for the profile-pics bucket

-- First, create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pics', 'profile-pics', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;

-- Create a policy to allow public access to the profile-pics bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pics');

-- Create a policy to allow authenticated users to upload to the profile-pics bucket
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pics' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create a policy to allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pics' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create a policy to allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pics' AND
  (storage.foldername(name))[1] = auth.uid()::text
); 