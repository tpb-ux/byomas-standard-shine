import { Badge } from "@/components/ui/badge";

interface BlogTagsProps {
  tags: string[];
  selectedTags: string[];
  onTagClick: (tag: string) => void;
}

const BlogTags = ({ tags, selectedTags, onTagClick }: BlogTagsProps) => {
  if (tags.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Tags Populares</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <Badge
              key={tag}
              variant={isSelected ? "default" : "secondary"}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onTagClick(tag)}
            >
              {tag}
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
