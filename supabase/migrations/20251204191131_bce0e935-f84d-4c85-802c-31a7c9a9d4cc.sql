-- Create function to recalculate SEO metrics for all articles
CREATE OR REPLACE FUNCTION public.recalculate_all_seo_metrics()
RETURNS TABLE(
  articles_processed INTEGER,
  avg_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_article RECORD;
  v_word_count INTEGER;
  v_h1_count INTEGER;
  v_h2_count INTEGER;
  v_h3_count INTEGER;
  v_keyword_density NUMERIC;
  v_seo_score NUMERIC;
  v_internal_links INTEGER;
  v_external_links INTEGER;
  v_count INTEGER := 0;
  v_total_score NUMERIC := 0;
BEGIN
  FOR v_article IN SELECT id, content, main_keyword, meta_title, meta_description FROM articles LOOP
    -- Calcular contagem de palavras
    v_word_count := array_length(regexp_split_to_array(v_article.content, '\s+'), 1);
    
    -- Contar headings no conteúdo
    v_h1_count := (SELECT COUNT(*) FROM regexp_matches(v_article.content, '<h1[^>]*>|^#\s', 'gi'));
    v_h2_count := (SELECT COUNT(*) FROM regexp_matches(v_article.content, '<h2[^>]*>|^##\s', 'gim'));
    v_h3_count := (SELECT COUNT(*) FROM regexp_matches(v_article.content, '<h3[^>]*>|^###\s', 'gim'));
    
    -- Calcular densidade da keyword
    IF v_article.main_keyword IS NOT NULL AND v_article.main_keyword != '' AND v_word_count > 0 THEN
      v_keyword_density := (
        (SELECT COUNT(*) FROM regexp_matches(LOWER(v_article.content), LOWER(v_article.main_keyword), 'gi'))::NUMERIC 
        / v_word_count * 100
      );
    ELSE
      v_keyword_density := 0;
    END IF;
    
    -- Contar links internos e externos (ATUALIZADO para pegar da tabela)
    SELECT COALESCE(COUNT(*), 0) INTO v_internal_links 
    FROM internal_links WHERE source_article_id = v_article.id;
    
    SELECT COALESCE(COUNT(*), 0) INTO v_external_links 
    FROM external_links WHERE article_id = v_article.id;
    
    -- Calcular score SEO (0-100)
    v_seo_score := 0;
    
    -- Pontos por meta title (max 15)
    IF v_article.meta_title IS NOT NULL AND LENGTH(v_article.meta_title) BETWEEN 30 AND 60 THEN
      v_seo_score := v_seo_score + 15;
    ELSIF v_article.meta_title IS NOT NULL THEN
      v_seo_score := v_seo_score + 8;
    END IF;
    
    -- Pontos por meta description (max 15)
    IF v_article.meta_description IS NOT NULL AND LENGTH(v_article.meta_description) BETWEEN 120 AND 160 THEN
      v_seo_score := v_seo_score + 15;
    ELSIF v_article.meta_description IS NOT NULL THEN
      v_seo_score := v_seo_score + 8;
    END IF;
    
    -- Pontos por keyword principal (max 10)
    IF v_article.main_keyword IS NOT NULL AND v_article.main_keyword != '' THEN
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
      v_article.id, v_word_count, v_h1_count, v_h2_count, v_h3_count,
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
    
    v_count := v_count + 1;
    v_total_score := v_total_score + v_seo_score;
  END LOOP;
  
  articles_processed := v_count;
  avg_score := CASE WHEN v_count > 0 THEN v_total_score / v_count ELSE 0 END;
  
  RETURN NEXT;
END;
$$;