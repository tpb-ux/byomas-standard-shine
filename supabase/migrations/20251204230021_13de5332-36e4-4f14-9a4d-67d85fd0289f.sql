-- Create site_settings table for social links and verification codes
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  category TEXT DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for site settings
CREATE POLICY "Site settings are viewable by everyone"
  ON public.site_settings FOR SELECT USING (true);

-- Only admins can modify - direct check on user_roles table
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::public.app_role
    )
  );

-- Insert default social media settings
INSERT INTO public.site_settings (key, value, description, category) VALUES
  ('social_linkedin', '', 'URL do perfil LinkedIn', 'social'),
  ('social_twitter', '', 'URL do perfil Twitter/X', 'social'),
  ('social_instagram', '', 'URL do perfil Instagram', 'social'),
  ('social_facebook', '', 'URL do perfil Facebook', 'social'),
  ('google_verification', '', 'Código de verificação Google Search Console', 'seo'),
  ('bing_verification', '', 'Código de verificação Bing Webmaster Tools', 'seo');

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();