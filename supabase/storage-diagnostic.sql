-- Storage Diagnostic Script
-- Run this to check if your storage bucket is set up correctly

-- 1. Check if the bucket exists
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets 
WHERE id = 'vision-board';

-- 2. Check if policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname IN (
    'Users can upload own images',
    'Public read access',
    'Users can delete own images'
  );

-- 3. List all buckets (to see what exists)
SELECT id, name, public FROM storage.buckets ORDER BY name;

-- 4. Check storage.objects table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'storage' 
  AND table_name = 'objects'
ORDER BY ordinal_position;
