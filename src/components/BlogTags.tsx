import { Badge } from "@/components/ui/badge";
import { BlogPost } from "@/data/blogPosts";

interface BlogTagsProps {
  posts: BlogPost[];
  selectedTags: string[];
  onTagClick: (tag: string) => void;
}

const BlogTags = ({ posts, selectedTags, onTagClick }: BlogTagsProps) => {
  // Extract all unique tags with counts
  const tagCounts = posts.reduce((acc, post) => {
    post.tags.forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15); // Show top 15 tags

  if (sortedTags.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Tags Populares</h3>
      <div className="flex flex-wrap gap-2">
        {sortedTags.map(([tag, count]) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <Badge
              key={tag}
              variant={isSelected ? "default" : "secondary"}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onTagClick(tag)}
            >
              {tag} ({count})
            </Badge>
          );
        })}
      </div>
      {selectedTags.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Clique nas tags selecionadas para removê-las
        </p>
      )}
    </div>
  );
};

export default BlogTags;
