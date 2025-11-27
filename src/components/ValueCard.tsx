import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ValueCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const ValueCard = ({ icon: Icon, title, description }: ValueCardProps) => {
  return (
    <Card className="border-none shadow-card hover:shadow-lg transition-all">
      <CardContent className="p-8 text-center">
        <div className="mx-auto mb-6 inline-flex bg-primary/10 p-4">
          <Icon className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default ValueCard;
