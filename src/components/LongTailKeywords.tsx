import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LongTailKeywordsProps {
  keywords: string[];
  className?: string;
}

const LongTailKeywords = ({ keywords, className = "" }: LongTailKeywordsProps) => {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div className={`mt-6 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-medium text-muted-foreground">
          Buscas Relacionadas
        </h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <Badge
            key={index}
            variant="outline"
            className="text-xs bg-muted/50 hover:bg-muted transition-colors cursor-default"
          >
            {keyword}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default LongTailKeywords;
