
-- Fase 3: Topic Clusters
CREATE TABLE public.topic_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  icon TEXT DEFAULT 'folder',
  article_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.topic_clusters ENABLE ROW LEVEL SECURITY;

-- Policies for topic_clusters
CREATE POLICY "Topic clusters are viewable by everyone"
  ON public.topic_clusters FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage topic clusters"
  ON public.topic_clusters FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fase 4: Pillar Pages (MPI)
CREATE TABLE public.pillar_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  meta_title TEXT,
  meta_description TEXT,
  main_keyword TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  table_of_contents JSONB DEFAULT '[]'::jsonb,
  featured_articles UUID[] DEFAULT ARRAY[]::UUID[],
  featured_image TEXT,
  featured_image_alt TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  views INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 15,
  author_id UUID REFERENCES public.authors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pillar_pages ENABLE ROW LEVEL SECURITY;

-- Policies for pillar_pages
CREATE POLICY "Published pillar pages are viewable by everyone"
  ON public.pillar_pages FOR SELECT
  USING (status = 'published' OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins and editors can manage pillar pages"
  ON public.pillar_pages FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Fase 5 & 6: Authority Sources para links externos
CREATE TABLE public.authority_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 1 AND trust_score <= 100),
  category TEXT DEFAULT 'general',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.authority_sources ENABLE ROW LEVEL SECURITY;

-- Policies for authority_sources
CREATE POLICY "Authority sources viewable by admins and editors"
  ON public.authority_sources FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins can manage authority sources"
  ON public.authority_sources FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_topic_clusters_updated_at
  BEFORE UPDATE ON public.topic_clusters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pillar_pages_updated_at
  BEFORE UPDATE ON public.pillar_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment pillar page views
CREATE OR REPLACE FUNCTION public.increment_pillar_views(page_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE pillar_pages 
  SET views = COALESCE(views, 0) + 1 
  WHERE slug = page_slug;
END;
$$;

-- Adicionar coluna topic_cluster_id em articles (relacionamento)
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS topic_cluster_id UUID REFERENCES public.topic_clusters(id) ON DELETE SET NULL;

-- Inserir dados iniciais de authority_sources
INSERT INTO public.authority_sources (name, domain, url, trust_score, category, description) VALUES
  ('IBAMA', 'ibama.gov.br', 'https://www.ibama.gov.br', 95, 'governo', 'Instituto Brasileiro do Meio Ambiente'),
  ('Ministério do Meio Ambiente', 'gov.br/mma', 'https://www.gov.br/mma', 95, 'governo', 'Ministério do Meio Ambiente do Brasil'),
  ('Verra', 'verra.org', 'https://verra.org', 90, 'certificadora', 'Líder global em padrões de crédito de carbono'),
  ('Gold Standard', 'goldstandard.org', 'https://www.goldstandard.org', 90, 'certificadora', 'Padrão de certificação de projetos climáticos'),
  ('ONU Climate', 'unfccc.int', 'https://unfccc.int', 95, 'internacional', 'Convenção-Quadro das Nações Unidas sobre Mudança do Clima'),
  ('World Bank Climate', 'worldbank.org', 'https://www.worldbank.org/en/topic/climatechange', 90, 'internacional', 'Banco Mundial - Mudanças Climáticas'),
  ('Bloomberg Green', 'bloomberg.com', 'https://www.bloomberg.com/green', 85, 'midia', 'Bloomberg - Cobertura de Sustentabilidade'),
  ('Reuters Sustainability', 'reuters.com', 'https://www.reuters.com/sustainability', 85, 'midia', 'Reuters - Sustentabilidade'),
  ('Carbon Brief', 'carbonbrief.org', 'https://www.carbonbrief.org', 88, 'pesquisa', 'Análise científica de mudanças climáticas'),
  ('Climate Action Tracker', 'climateactiontracker.org', 'https://climateactiontracker.org', 88, 'pesquisa', 'Monitoramento de ações climáticas globais'),
  ('Science Based Targets', 'sciencebasedtargets.org', 'https://sciencebasedtargets.org', 92, 'certificadora', 'Iniciativa de Metas Baseadas na Ciência'),
  ('CDP', 'cdp.net', 'https://www.cdp.net', 90, 'ong', 'Sistema global de divulgação ambiental');
