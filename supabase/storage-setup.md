# Supabase Storage Setup Guide

## Creating the Vision Board Storage Bucket

1. **Navigate to Storage**
   - Go to your Supabase project dashboard
   - Click on "Storage" in the left sidebar

2. **Create New Bucket**
   - Click "New bucket"
   - Name: `vision-board`
   - Set to **Public** (toggle the "Public bucket" option)
   - Click "Create bucket"

3. **Configure Bucket Settings (Optional)**
   - File size limit: Set as needed (default is usually fine)
   - Allowed MIME types: Leave empty or specify image types (image/*)

## Storage Policies (Recommended)

For better security, you can add Row Level Security policies to the storage bucket:

1. Go to Storage > Policies
2. Select the `vision-board` bucket
3. Add the following policies:

### Policy 1: Allow authenticated users to upload
```sql
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vision-board' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 2: Allow public read access
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vision-board');
```

### Policy 3: Allow users to delete own images
```sql
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vision-board' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## Testing

After setup, you should be able to:
- Upload images from the Vision Board page
- View uploaded images
- Delete your own images

If you encounter issues:
- Check that the bucket is set to Public
- Verify the bucket name matches exactly: `vision-board`
- Check browser console for error messages
- Verify your Supabase project URL and keys are correct
