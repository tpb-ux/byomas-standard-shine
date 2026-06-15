ALTER TABLE public.authors
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS credentials text,
  ADD COLUMN IF NOT EXISTS expertise text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS years_experience integer,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS twitter_url text,
  ADD COLUMN IF NOT EXISTS email_public text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS seo_meta_title text,
  ADD COLUMN IF NOT EXISTS seo_meta_description text,
  ADD COLUMN IF NOT EXISTS published_articles_count integer NOT NULL DEFAULT 0;

UPDATE public.authors
SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'))
WHERE slug IS NULL OR slug = '';

ALTER TABLE public.authors ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS authors_slug_key ON public.authors(slug);

DROP POLICY IF EXISTS "Admins can update authors" ON public.authors;
CREATE POLICY "Admins can update authors"
  ON public.authors FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert authors" ON public.authors;
CREATE POLICY "Admins can insert authors"
  ON public.authors FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));