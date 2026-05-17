ALTER TABLE public.news_sources ADD COLUMN IF NOT EXISTS trust_score integer NOT NULL DEFAULT 50;

DELETE FROM public.curated_news a
USING public.curated_news b
WHERE a.original_url = b.original_url AND a.ctid > b.ctid;

CREATE UNIQUE INDEX IF NOT EXISTS curated_news_original_url_unique
  ON public.curated_news (original_url);

INSERT INTO public.news_sources (name, url, rss_feed, category, is_active, trust_score)
VALUES
  ('Reuters Sustainable Business', 'https://www.reutersagency.com/en/coverage/business/sustainable-business/', 'https://www.reutersagency.com/feed/?best-topics=sustainable-business&post_type=best', 'sustainability', true, 90),
  ('AP Climate', 'https://apnews.com/hub/climate', 'https://apnews.com/hub/climate.rss', 'sustainability', true, 88),
  ('UNFCCC News', 'https://unfccc.int/news', 'https://unfccc.int/news/rss', 'carbon', true, 95),
  ('IEA News', 'https://www.iea.org/news', 'https://www.iea.org/news/rss', 'sustainability', true, 92),
  ('ICAP', 'https://icapcarbonaction.com/en', 'https://icapcarbonaction.com/en/rss.xml', 'carbon', true, 88),
  ('Observatório do Clima', 'https://www.oc.eco.br', 'https://www.oc.eco.br/feed/', 'carbon', true, 80),
  ('((o))eco', 'https://oeco.org.br', 'https://oeco.org.br/feed/', 'sustainability', true, 78),
  ('MapBiomas', 'https://mapbiomas.org', 'https://mapbiomas.org/feed', 'sustainability', true, 85)
ON CONFLICT DO NOTHING;