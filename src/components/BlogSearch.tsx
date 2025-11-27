import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BlogSearchProps {
  onSearch: (query: string) => void;
  value: string;
}

const BlogSearch = ({ onSearch, value }: BlogSearchProps) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(localValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, onSearch]);

  const handleClear = () => {
    setLocalValue("");
    onSearch("");
  };

  return (
    <div className="relative w-full max-w-xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Buscar por palavras-chave, tags ou conteúdo..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-10 pr-10"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default BlogSearch;
