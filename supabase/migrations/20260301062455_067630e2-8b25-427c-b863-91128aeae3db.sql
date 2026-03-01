
-- Create storage bucket for clothing images
INSERT INTO storage.buckets (id, name, public) VALUES ('clothing-images', 'clothing-images', true);

-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload clothing images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'clothing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access
CREATE POLICY "Clothing images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'clothing-images');

-- Allow users to update their own images
CREATE POLICY "Users can update their own clothing images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'clothing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own clothing images"
ON storage.objects FOR DELETE
USING (bucket_id = 'clothing-images' AND auth.uid()::text = (storage.foldername(name))[1]);
