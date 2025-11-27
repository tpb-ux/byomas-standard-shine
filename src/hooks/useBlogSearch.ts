import { useMemo } from "react";
import { BlogPost } from "@/data/blogPosts";
import { SortOption } from "@/components/BlogSort";

interface UseBlogSearchProps {
  posts: BlogPost[];
  searchQuery: string;
  category: string;
  selectedTags: string[];
  sortBy: SortOption;
}

export const useBlogSearch = ({
  posts,
  searchQuery,
  category,
  selectedTags,
  sortBy,
}: UseBlogSearchProps) => {
  return useMemo(() => {
    let filtered = [...posts];

    // Filter by category
    if (category !== "Todas") {
      filtered = filtered.filter((post) => post.category === category);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((post) =>
        selectedTags.every((tag) => post.tags.includes(tag))
      );
    }

    // Sort posts
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case "popular":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "alphabetical":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [posts, searchQuery, category, selectedTags, sortBy]);
};
