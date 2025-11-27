import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption = "recent" | "oldest" | "popular" | "alphabetical";

interface BlogSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const BlogSort = ({ value, onChange }: BlogSortProps) => {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Mais recentes</SelectItem>
          <SelectItem value="oldest">Mais antigos</SelectItem>
          <SelectItem value="popular">Mais populares</SelectItem>
          <SelectItem value="alphabetical">A-Z</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default BlogSort;
