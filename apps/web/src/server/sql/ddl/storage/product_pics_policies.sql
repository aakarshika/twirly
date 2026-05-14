-- Storage Policies for product-pics bucket
-- This file contains the storage policies for the product-pics bucket

-- Enable RLS on the storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to upload product pictures
CREATE POLICY "Users can upload product pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-pics' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create a policy to allow users to view product pictures
CREATE POLICY "Anyone can view product pictures"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'product-pics'
);

-- Create a policy to allow users to update their own product pictures
CREATE POLICY "Users can update their own product pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-pics' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'product-pics' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create a policy to allow users to delete their own product pictures
CREATE POLICY "Users can delete their own product pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-pics' AND
  auth.uid()::text = (storage.foldername(name))[1]
); 