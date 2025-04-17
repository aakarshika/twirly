-- Storage Policies for profile-pics bucket
-- This file contains the storage policies for the profile-pics bucket

-- Enable RLS on the storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pics' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create a policy to allow users to view profile pictures
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'profile-pics'
);

-- Create a policy to allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pics' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'profile-pics' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create a policy to allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pics' AND
  auth.uid()::text = (storage.foldername(name))[1]
);