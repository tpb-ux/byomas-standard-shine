CREATE TABLE public.editorial_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('approved','rejected','published','unpublished','edited','reverted_to_draft')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.editorial_actions TO authenticated;
GRANT ALL ON public.editorial_actions TO service_role;

ALTER TABLE public.editorial_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and editors can view editorial actions"
  ON public.editorial_actions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins and editors can insert editorial actions"
  ON public.editorial_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
    AND user_id = auth.uid()
  );

CREATE INDEX idx_editorial_actions_article ON public.editorial_actions(article_id, created_at DESC);
CREATE INDEX idx_editorial_actions_created ON public.editorial_actions(created_at DESC);