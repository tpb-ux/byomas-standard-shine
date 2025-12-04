-- Create web_vitals_metrics table for storing Core Web Vitals data
CREATE TABLE public.web_vitals_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL NOT NULL,
  metric_rating TEXT,
  page_url TEXT,
  user_agent TEXT,
  connection_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_web_vitals_created_at ON public.web_vitals_metrics(created_at DESC);
CREATE INDEX idx_web_vitals_metric_name ON public.web_vitals_metrics(metric_name);
CREATE INDEX idx_web_vitals_page_url ON public.web_vitals_metrics(page_url);

-- Enable Row Level Security
ALTER TABLE public.web_vitals_metrics ENABLE ROW LEVEL SECURITY;

-- Admins and editors can view web vitals metrics
CREATE POLICY "Admins and editors can view web vitals" ON public.web_vitals_metrics
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Anyone can insert web vitals (anonymous tracking)
CREATE POLICY "Anyone can insert web vitals" ON public.web_vitals_metrics
  FOR INSERT WITH CHECK (true);