import { LucideIcon, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ValueCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const ValueCard = ({ icon: Icon, title, description }: ValueCardProps) => {
  return (
    <Card className="border border-border bg-card hover:border-primary/50 transition-all duration-300 group">
      <CardContent className="p-8">
        <div className="mb-6 inline-flex bg-primary/10 p-4">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        <span className="flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
          SABER MAIS
          <ChevronRight className="ml-1 h-3 w-3" />
        </span>
      </CardContent>
    </Card>
  );
};

export default ValueCard;