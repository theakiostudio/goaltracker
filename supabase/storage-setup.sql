-- Vision Board Storage Setup
-- Run this in your Supabase SQL Editor to automatically set up the storage bucket and policies

-- Step 1: Create the storage bucket (if it doesn't exist)
-- Note: Setting allowed_mime_types to NULL allows all image types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('vision-board', 'vision-board', true, 10485760, NULL)
ON CONFLICT (id) DO UPDATE 
SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = NULL;

-- Step 2: Drop existing policies if they exist (to make this script idempotent)
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Step 3: Create storage policies

-- Policy 1: Allow authenticated users to upload their own images
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vision-board' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow public read access to all images
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vision-board');

-- Policy 3: Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vision-board' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Verify the setup
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'vision-board';
