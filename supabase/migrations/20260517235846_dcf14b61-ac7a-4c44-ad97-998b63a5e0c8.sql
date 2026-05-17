-- Remove jobs anteriores se existirem
SELECT cron.unschedule(jobname) FROM cron.job WHERE jobname IN ('fetch-news-every-5min','auto-publish-every-30min');

-- Coleta RSS a cada 5 minutos
SELECT cron.schedule(
  'fetch-news-every-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://scjknnhoiuaregewuxws.supabase.co/functions/v1/fetch-news',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjamtubmhvaXVhcmVnZXd1eHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzQ3ODUsImV4cCI6MjA4MDM1MDc4NX0.hnYDikVv88BOZGj7CyTQOfjdGvsvgUMkO2l3IV2J2pQ"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Promoção de rascunhos a cada 30 minutos (cria drafts a partir das notícias mais relevantes)
SELECT cron.schedule(
  'auto-publish-every-30min',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://scjknnhoiuaregewuxws.supabase.co/functions/v1/auto-publish-articles',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjamtubmhvaXVhcmVnZXd1eHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzQ3ODUsImV4cCI6MjA4MDM1MDc4NX0.hnYDikVv88BOZGj7CyTQOfjdGvsvgUMkO2l3IV2J2pQ"}'::jsonb,
    body := '{"count":3,"publish":false}'::jsonb
  ) AS request_id;
  $$
);