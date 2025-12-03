-- =============================================
-- BYOMA RESEARCH - COMPLETE DATABASE SCHEMA
-- =============================================

-- 1. ENUM TYPES
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE public.article_status AS ENUM ('draft', 'scheduled', 'published', 'archived');

-- 2. AUTHORS TABLE
CREATE TABLE public.authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  avatar TEXT,
  role TEXT,
  is_ai BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#36454F',
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TAGS TABLE
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NEWS SOURCES TABLE
CREATE TABLE public.news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  rss_feed TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  last_fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ARTICLES TABLE
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  main_keyword TEXT,
  meta_title TEXT,
  meta_description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.authors(id) ON DELETE SET NULL,
  featured_image TEXT,
  featured_image_alt TEXT,
  status public.article_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  reading_time INT DEFAULT 5,
  views INT DEFAULT 0,
  engagement_score DECIMAL DEFAULT 0,
  source_url TEXT,
  source_name TEXT,
  is_curated BOOLEAN DEFAULT false,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ARTICLE TAGS (Junction Table)
CREATE TABLE public.article_tags (
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- 8. INTERNAL LINKS TABLE
CREATE TABLE public.internal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  target_article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  anchor_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. EXTERNAL LINKS TABLE
CREATE TABLE public.external_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  anchor_text TEXT NOT NULL,
  domain TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CURATED NEWS TABLE
CREATE TABLE public.curated_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.news_sources(id) ON DELETE SET NULL,
  original_title TEXT NOT NULL,
  original_url TEXT NOT NULL,
  original_content TEXT,
  engagement_potential DECIMAL DEFAULT 0,
  processed BOOLEAN DEFAULT false,
  article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. USER READING HISTORY TABLE
CREATE TABLE public.user_reading_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  time_spent INT DEFAULT 0,
  scroll_depth DECIMAL DEFAULT 0
);

-- 12. SEO METRICS TABLE
CREATE TABLE public.seo_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE UNIQUE,
  keyword_density DECIMAL DEFAULT 0,
  h1_count INT DEFAULT 0,
  h2_count INT DEFAULT 0,
  h3_count INT DEFAULT 0,
  internal_links_count INT DEFAULT 0,
  external_links_count INT DEFAULT 0,
  word_count INT DEFAULT 0,
  seo_score DECIMAL DEFAULT 0,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. USER ROLES TABLE (Security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- 14. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SECURITY DEFINER FUNCTION FOR ROLE CHECK
-- =============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =============================================
-- TRIGGER FOR AUTO-CREATE PROFILE
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON public.authors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curated_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - PUBLIC READ ACCESS
-- =============================================

-- Authors: Public read
CREATE POLICY "Authors are viewable by everyone"
  ON public.authors FOR SELECT
  USING (true);

-- Categories: Public read
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

-- Tags: Public read
CREATE POLICY "Tags are viewable by everyone"
  ON public.tags FOR SELECT
  USING (true);

-- Articles: Public read for published only
CREATE POLICY "Published articles are viewable by everyone"
  ON public.articles FOR SELECT
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- Article Tags: Public read
CREATE POLICY "Article tags are viewable by everyone"
  ON public.article_tags FOR SELECT
  USING (true);

-- Internal Links: Public read
CREATE POLICY "Internal links are viewable by everyone"
  ON public.internal_links FOR SELECT
  USING (true);

-- External Links: Public read
CREATE POLICY "External links are viewable by everyone"
  ON public.external_links FOR SELECT
  USING (true);

-- SEO Metrics: Admin/Editor only
CREATE POLICY "SEO metrics viewable by admins and editors"
  ON public.seo_metrics FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- =============================================
-- RLS POLICIES - ADMIN/EDITOR WRITE ACCESS
-- =============================================

-- Authors: Admin can manage
CREATE POLICY "Admins can manage authors"
  ON public.authors FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Categories: Admin can manage
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tags: Admin/Editor can manage
CREATE POLICY "Admins and editors can manage tags"
  ON public.tags FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- Articles: Admin/Editor can manage
CREATE POLICY "Admins and editors can manage articles"
  ON public.articles FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- Article Tags: Admin/Editor can manage
CREATE POLICY "Admins and editors can manage article tags"
  ON public.article_tags FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- Internal Links: Admin/Editor can manage
CREATE POLICY "Admins and editors can manage internal links"
  ON public.internal_links FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- External Links: Admin/Editor can manage
CREATE POLICY "Admins and editors can manage external links"
  ON public.external_links FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- News Sources: Admin only
CREATE POLICY "Admins can view news sources"
  ON public.news_sources FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage news sources"
  ON public.news_sources FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Curated News: Admin/Editor can manage
CREATE POLICY "Admins and editors can view curated news"
  ON public.curated_news FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins and editors can manage curated news"
  ON public.curated_news FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- SEO Metrics: Admin/Editor can manage
CREATE POLICY "Admins and editors can manage SEO metrics"
  ON public.seo_metrics FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- User Reading History: Anyone can insert (for tracking)
CREATE POLICY "Anyone can insert reading history"
  ON public.user_reading_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view reading history"
  ON public.user_reading_history FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- User Roles: Admin only
CREATE POLICY "Admins can view user roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Profiles: Users can view/edit own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_category ON public.articles(category_id);
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX idx_article_tags_article ON public.article_tags(article_id);
CREATE INDEX idx_article_tags_tag ON public.article_tags(tag_id);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_tags_slug ON public.tags(slug);
CREATE INDEX idx_user_reading_history_session ON public.user_reading_history(session_id);
CREATE INDEX idx_user_reading_history_article ON public.user_reading_history(article_id);
CREATE INDEX idx_curated_news_processed ON public.curated_news(processed);
CREATE INDEX idx_seo_metrics_article ON public.seo_metrics(article_id);