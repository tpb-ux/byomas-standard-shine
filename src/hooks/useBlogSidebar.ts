import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LatestArticle {
  id: string;
  slug: string;
  title: string;
  featured_image: string | null;
  published_at: string | null;
  reading_time: number | null;
}

export interface PopularTag {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export const useLatestArticles = (limit: number = 5, excludeId?: string) => {
  return useQuery({
    queryKey: ["latest-articles", limit, excludeId],
    queryFn: async (): Promise<LatestArticle[]> => {
      let query = supabase
        .from("articles")
        .select("id, slug, title, featured_image, published_at, reading_time")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(limit + 1);

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).slice(0, limit);
    },
  });
};

export const usePopularTags = (limit: number = 10) => {
  return useQuery({
    queryKey: ["popular-tags", limit],
    queryFn: async (): Promise<PopularTag[]> => {
      // Get all article_tags with tag info
      const { data: articleTags, error } = await supabase
        .from("article_tags")
        .select("tag_id, tags(id, name, slug)");

      if (error) throw error;

      // Count occurrences of each tag
      const tagCounts = new Map<string, { tag: PopularTag; count: number }>();
      
      (articleTags || []).forEach((at: any) => {
        if (at.tags) {
          const existing = tagCounts.get(at.tags.id);
          if (existing) {
            existing.count++;
          } else {
            tagCounts.set(at.tags.id, {
              tag: { ...at.tags, count: 0 },
              count: 1,
            });
          }
        }
      });

      // Convert to array and sort by count
      const sortedTags = Array.from(tagCounts.values())
        .map(({ tag, count }) => ({ ...tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return sortedTags;
    },
  });
};

export const useAllTags = () => {
  return useQuery({
    queryKey: ["all-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("id, name, slug")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });
};
