-- Adicionar coluna faqs na tabela articles
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.articles.faqs IS 'Array de FAQs: [{"question": "...", "answer": "..."}]';