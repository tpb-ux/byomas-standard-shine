
-- =========================
-- pipeline_logs
-- =========================
CREATE TABLE public.pipeline_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  stage text NOT NULL CHECK (stage IN ('cron','fetch','parser','curator','publisher','health','dispatcher','linking','tags','external_links','sitemap')),
  source_id uuid REFERENCES public.news_sources(id) ON DELETE SET NULL,
  source_name text,
  level text NOT NULL CHECK (level IN ('info','warn','error')),
  event text NOT NULL,
  message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  duration_ms integer,
  correlation_id uuid
);

GRANT SELECT ON public.pipeline_logs TO authenticated;
GRANT ALL ON public.pipeline_logs TO service_role;

ALTER TABLE public.pipeline_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view pipeline logs"
  ON public.pipeline_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_pipeline_logs_stage_created ON public.pipeline_logs(stage, created_at DESC);
CREATE INDEX idx_pipeline_logs_level_created ON public.pipeline_logs(level, created_at DESC);
CREATE INDEX idx_pipeline_logs_source_created ON public.pipeline_logs(source_id, created_at DESC);
CREATE INDEX idx_pipeline_logs_correlation ON public.pipeline_logs(correlation_id);

-- =========================
-- pipeline_metrics
-- =========================
CREATE TABLE public.pipeline_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  stage text NOT NULL,
  source_id uuid REFERENCES public.news_sources(id) ON DELETE SET NULL,
  source_name text,
  event text NOT NULL DEFAULT 'run',
  items_in integer NOT NULL DEFAULT 0,
  items_ok integer NOT NULL DEFAULT 0,
  items_failed integer NOT NULL DEFAULT 0,
  items_skipped integer NOT NULL DEFAULT 0,
  duration_ms integer,
  correlation_id uuid
);

GRANT SELECT ON public.pipeline_metrics TO authenticated;
GRANT ALL ON public.pipeline_metrics TO service_role;

ALTER TABLE public.pipeline_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view pipeline metrics"
  ON public.pipeline_metrics FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_pipeline_metrics_stage_created ON public.pipeline_metrics(stage, created_at DESC);
CREATE INDEX idx_pipeline_metrics_source_created ON public.pipeline_metrics(source_id, created_at DESC);

-- =========================
-- pipeline_alerts
-- =========================
CREATE TABLE public.pipeline_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  severity text NOT NULL CHECK (severity IN ('warning','critical')),
  stage text NOT NULL,
  source_id uuid REFERENCES public.news_sources(id) ON DELETE SET NULL,
  source_name text,
  title text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  dedupe_key text NOT NULL,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notified_email_at timestamptz
);

GRANT SELECT, UPDATE ON public.pipeline_alerts TO authenticated;
GRANT ALL ON public.pipeline_alerts TO service_role;

ALTER TABLE public.pipeline_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view alerts"
  ON public.pipeline_alerts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can resolve alerts"
  ON public.pipeline_alerts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Apenas um alerta aberto por dedupe_key
CREATE UNIQUE INDEX idx_pipeline_alerts_dedupe_open
  ON public.pipeline_alerts(dedupe_key)
  WHERE resolved_at IS NULL;

CREATE INDEX idx_pipeline_alerts_created ON public.pipeline_alerts(created_at DESC);
CREATE INDEX idx_pipeline_alerts_open ON public.pipeline_alerts(resolved_at) WHERE resolved_at IS NULL;

CREATE TRIGGER trg_pipeline_alerts_updated_at
  BEFORE UPDATE ON public.pipeline_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- Função de limpeza (retenção)
-- =========================
CREATE OR REPLACE FUNCTION public.cleanup_pipeline_observability()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.pipeline_logs WHERE created_at < now() - interval '30 days';
  DELETE FROM public.pipeline_metrics WHERE created_at < now() - interval '90 days';
  DELETE FROM public.pipeline_alerts WHERE resolved_at IS NOT NULL AND resolved_at < now() - interval '60 days';
END;
$$;

-- =========================
-- site_settings: alerts_email
-- =========================
INSERT INTO public.site_settings (key, value, description)
VALUES ('alerts_email', '""'::jsonb, 'E-mail para receber alertas de observabilidade do pipeline')
ON CONFLICT (key) DO NOTHING;
