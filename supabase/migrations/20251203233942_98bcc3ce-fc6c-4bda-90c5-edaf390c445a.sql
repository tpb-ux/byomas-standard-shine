-- Função para calcular métricas SEO de um artigo
CREATE OR REPLACE FUNCTION public.calculate_seo_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_word_count INTEGER;
  v_h1_count INTEGER;
  v_h2_count INTEGER;
  v_h3_count INTEGER;
  v_keyword_density NUMERIC;
  v_seo_score NUMERIC;
  v_internal_links INTEGER;
  v_external_links INTEGER;
BEGIN
  -- Calcular contagem de palavras (aproximado)
  v_word_count := array_length(regexp_split_to_array(NEW.content, '\s+'), 1);
  
  -- Contar headings no conteúdo
  v_h1_count := (SELECT COUNT(*) FROM regexp_matches(NEW.content, '<h1[^>]*>|^#\s', 'gi'));
  v_h2_count := (SELECT COUNT(*) FROM regexp_matches(NEW.content, '<h2[^>]*>|^##\s', 'gim'));
  v_h3_count := (SELECT COUNT(*) FROM regexp_matches(NEW.content, '<h3[^>]*>|^###\s', 'gim'));
  
  -- Calcular densidade da keyword (se existir)
  IF NEW.main_keyword IS NOT NULL AND NEW.main_keyword != '' AND v_word_count > 0 THEN
    v_keyword_density := (
      (SELECT COUNT(*) FROM regexp_matches(LOWER(NEW.content), LOWER(NEW.main_keyword), 'gi'))::NUMERIC 
      / v_word_count * 100
    );
  ELSE
    v_keyword_density := 0;
  END IF;
  
  -- Contar links internos e externos do artigo
  SELECT COALESCE(COUNT(*), 0) INTO v_internal_links 
  FROM internal_links WHERE source_article_id = NEW.id;
  
  SELECT COALESCE(COUNT(*), 0) INTO v_external_links 
  FROM external_links WHERE article_id = NEW.id;
  
  -- Calcular score SEO (0-100)
  v_seo_score := 0;
  
  -- Pontos por meta title (max 15)
  IF NEW.meta_title IS NOT NULL AND LENGTH(NEW.meta_title) BETWEEN 30 AND 60 THEN
    v_seo_score := v_seo_score + 15;
  ELSIF NEW.meta_title IS NOT NULL THEN
    v_seo_score := v_seo_score + 8;
  END IF;
  
  -- Pontos por meta description (max 15)
  IF NEW.meta_description IS NOT NULL AND LENGTH(NEW.meta_description) BETWEEN 120 AND 160 THEN
    v_seo_score := v_seo_score + 15;
  ELSIF NEW.meta_description IS NOT NULL THEN
    v_seo_score := v_seo_score + 8;
  END IF;
  
  -- Pontos por keyword principal (max 10)
  IF NEW.main_keyword IS NOT NULL AND NEW.main_keyword != '' THEN
    v_seo_score := v_seo_score + 10;
  END IF;
  
  -- Pontos por contagem de palavras (max 20)
  IF v_word_count >= 1500 THEN
    v_seo_score := v_seo_score + 20;
  ELSIF v_word_count >= 1000 THEN
    v_seo_score := v_seo_score + 15;
  ELSIF v_word_count >= 500 THEN
    v_seo_score := v_seo_score + 10;
  ELSIF v_word_count >= 300 THEN
    v_seo_score := v_seo_score + 5;
  END IF;
  
  -- Pontos por headings (max 15)
  IF v_h2_count >= 3 THEN
    v_seo_score := v_seo_score + 10;
  ELSIF v_h2_count >= 1 THEN
    v_seo_score := v_seo_score + 5;
  END IF;
  IF v_h3_count >= 2 THEN
    v_seo_score := v_seo_score + 5;
  END IF;
  
  -- Pontos por densidade de keyword (max 10)
  IF v_keyword_density BETWEEN 1 AND 3 THEN
    v_seo_score := v_seo_score + 10;
  ELSIF v_keyword_density BETWEEN 0.5 AND 5 THEN
    v_seo_score := v_seo_score + 5;
  END IF;
  
  -- Pontos por links (max 15)
  IF v_internal_links >= 3 THEN
    v_seo_score := v_seo_score + 8;
  ELSIF v_internal_links >= 1 THEN
    v_seo_score := v_seo_score + 4;
  END IF;
  IF v_external_links >= 3 THEN
    v_seo_score := v_seo_score + 7;
  ELSIF v_external_links >= 1 THEN
    v_seo_score := v_seo_score + 3;
  END IF;
  
  -- Inserir ou atualizar métricas SEO
  INSERT INTO seo_metrics (
    article_id, word_count, h1_count, h2_count, h3_count, 
    keyword_density, seo_score, internal_links_count, external_links_count, analyzed_at
  ) VALUES (
    NEW.id, v_word_count, v_h1_count, v_h2_count, v_h3_count,
    v_keyword_density, v_seo_score, v_internal_links, v_external_links, NOW()
  )
  ON CONFLICT (article_id) DO UPDATE SET
    word_count = EXCLUDED.word_count,
    h1_count = EXCLUDED.h1_count,
    h2_count = EXCLUDED.h2_count,
    h3_count = EXCLUDED.h3_count,
    keyword_density = EXCLUDED.keyword_density,
    seo_score = EXCLUDED.seo_score,
    internal_links_count = EXCLUDED.internal_links_count,
    external_links_count = EXCLUDED.external_links_count,
    analyzed_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Criar trigger para calcular métricas SEO após insert/update de artigo
DROP TRIGGER IF EXISTS trigger_calculate_seo_metrics ON articles;
CREATE TRIGGER trigger_calculate_seo_metrics
  AFTER INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_seo_metrics();

-- Adicionar constraint única em seo_metrics se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'seo_metrics_article_id_key'
  ) THEN
    ALTER TABLE seo_metrics ADD CONSTRAINT seo_metrics_article_id_key UNIQUE (article_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;