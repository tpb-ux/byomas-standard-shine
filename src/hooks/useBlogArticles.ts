import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FAQ {
  question: string;
  answer: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  featured_image_alt: string | null;
  reading_time: number | null;
  views: number | null;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  main_keyword: string | null;
  faqs: FAQ[] | null;
  // New SEO 2025 fields
  long_tail_keywords: string[] | null;
  direct_answer: string | null;
  geotags: string[] | null;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
  author: {
    id: string;
    name: string;
    avatar: string | null;
    bio: string | null;
    role: string | null;
  } | null;
  tags: { id: string; name: string; slug: string }[];
}

export const useBlogArticles = () => {
  return useQuery({
    queryKey: ["blog-articles"],
    queryFn: async (): Promise<Article[]> => {
      const { data: articles, error } = await supabase
        .from("articles")
        .select(`
          id,
          slug,
          title,
          excerpt,
          content,
          featured_image,
          featured_image_alt,
          reading_time,
          views,
          published_at,
          meta_title,
          meta_description,
          main_keyword,
          faqs,
          long_tail_keywords,
          direct_answer,
          geotags,
          category:categories(id, name, slug, color),
          author:authors(id, name, avatar, bio, role)
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;

      // Fetch tags for each article
      const articlesWithTags = await Promise.all(
        (articles || []).map(async (article) => {
          const { data: tagData } = await supabase
            .from("article_tags")
            .select("tags(id, name, slug)")
            .eq("article_id", article.id);

          const tags = tagData?.map((t: any) => t.tags).filter(Boolean) || [];
          
          return {
            ...article,
            faqs: (article.faqs as unknown as FAQ[]) || [],
            tags,
          } as Article;
        })
      );

      return articlesWithTags;
    },
  });
};

export const useBlogArticle = (slug: string) => {
  return useQuery({
    queryKey: ["blog-article", slug],
    queryFn: async (): Promise<Article | null> => {
      const { data: article, error } = await supabase
        .from("articles")
        .select(`
          id,
          slug,
          title,
          excerpt,
          content,
          featured_image,
          featured_image_alt,
          reading_time,
          views,
          published_at,
          meta_title,
          meta_description,
          main_keyword,
          faqs,
          long_tail_keywords,
          direct_answer,
          geotags,
          category:categories(id, name, slug, color),
          author:authors(id, name, avatar, bio, role)
        `)
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }

      // Fetch tags
      const { data: tagData } = await supabase
        .from("article_tags")
        .select("tags(id, name, slug)")
        .eq("article_id", article.id);

      const tags = tagData?.map((t: any) => t.tags).filter(Boolean) || [];

      // Increment views using RPC function (bypasses RLS)
      try {
        await supabase.rpc("increment_article_views", { article_slug: slug });
      } catch (err) {
        console.error("Error incrementing views:", err);
      }

      return { ...article, faqs: (article.faqs as unknown as FAQ[]) || [], tags } as Article;
    },
    enabled: !!slug,
  });
};

export const useRelatedArticles = (categoryId: string | undefined, currentArticleId: string) => {
  return useQuery({
    queryKey: ["related-articles", categoryId, currentArticleId],
    queryFn: async (): Promise<Article[]> => {
      if (!categoryId) return [];

      const { data, error } = await supabase
        .from("articles")
        .select(`
          id,
          slug,
          title,
          excerpt,
          featured_image,
          reading_time,
          category:categories(id, name, slug, color)
        `)
        .eq("status", "published")
        .eq("category_id", categoryId)
        .neq("id", currentArticleId)
        .limit(3);

      if (error) throw error;
      return (data || []) as Article[];
    },
    enabled: !!categoryId,
  });
};
