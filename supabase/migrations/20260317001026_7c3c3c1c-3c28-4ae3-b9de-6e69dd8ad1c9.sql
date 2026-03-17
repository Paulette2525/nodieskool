
-- Create community-assets storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-assets', 'community-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to community-assets
CREATE POLICY "Authenticated users can upload community assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'community-assets');

-- Allow public read access to community-assets
CREATE POLICY "Public read access for community assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'community-assets');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Users can update own community assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'community-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Users can delete own community assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'community-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
