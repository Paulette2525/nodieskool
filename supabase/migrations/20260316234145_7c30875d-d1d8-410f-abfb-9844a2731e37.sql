
-- Create course-thumbnails bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true);

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload course thumbnails"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-thumbnails');

-- Allow public read access
CREATE POLICY "Public can view course thumbnails"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'course-thumbnails');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update course thumbnails"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'course-thumbnails');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete course thumbnails"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'course-thumbnails');
