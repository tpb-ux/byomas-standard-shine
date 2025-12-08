-- Tabela para armazenar CTAs configuráveis
CREATE TABLE public.article_ctas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  position text NOT NULL DEFAULT 'middle' CHECK (position IN ('after_h2', 'middle', 'end')),
  title text NOT NULL,
  description text,
  button_text text NOT NULL DEFAULT 'Saiba mais',
  button_link text NOT NULL,
  background_color text DEFAULT '#36454F',
  icon text DEFAULT 'mail',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela para tracking de cliques em CTAs
CREATE TABLE public.cta_clicks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cta_id uuid REFERENCES article_ctas(id) ON DELETE CASCADE,
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  clicked_at timestamptz DEFAULT now(),
  user_agent text,
  referrer text
);

-- Adicionar novos campos SEO avançados na tabela articles
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS long_tail_keywords text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS direct_answer text,
ADD COLUMN IF NOT EXISTS geotags text[] DEFAULT '{}';

-- RLS policies para article_ctas
ALTER TABLE public.article_ctas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CTAs são visíveis por todos" 
ON public.article_ctas FOR SELECT 
USING (true);

CREATE POLICY "Admins e editores podem gerenciar CTAs" 
ON public.article_ctas FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- RLS policies para cta_clicks
ALTER TABLE public.cta_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode inserir cliques" 
ON public.cta_clicks FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins podem ver cliques" 
ON public.cta_clicks FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Criar índices para performance
CREATE INDEX idx_article_ctas_article_id ON public.article_ctas(article_id);
CREATE INDEX idx_article_ctas_position ON public.article_ctas(position);
CREATE INDEX idx_cta_clicks_cta_id ON public.cta_clicks(cta_id);
CREATE INDEX idx_cta_clicks_article_id ON public.cta_clicks(article_id);
CREATE INDEX idx_cta_clicks_clicked_at ON public.cta_clicks(clicked_at);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_article_ctas_updated_at
BEFORE UPDATE ON public.article_ctas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE public.article_ctas IS 'CTAs estratégicos posicionáveis em artigos';
COMMENT ON TABLE public.cta_clicks IS 'Tracking de cliques em CTAs';
COMMENT ON COLUMN articles.long_tail_keywords IS 'Array de 2-4 palavras-chave de cauda longa';
COMMENT ON COLUMN articles.direct_answer IS 'Resposta direta para rich snippets (50-80 palavras)';
COMMENT ON COLUMN articles.geotags IS 'Tags de localização geográfica quando relevante';