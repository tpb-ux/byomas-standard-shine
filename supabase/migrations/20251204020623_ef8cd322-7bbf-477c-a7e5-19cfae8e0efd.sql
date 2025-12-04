-- Criar bucket para imagens de artigos
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política de leitura pública
CREATE POLICY "Public read access for article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

-- Política de upload (service role via edge functions)
CREATE POLICY "Service role can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'article-images');

-- Política de delete para admins
CREATE POLICY "Service role can delete article images"
ON storage.objects FOR DELETE
USING (bucket_id = 'article-images');