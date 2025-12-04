import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, XCircle, LucideIcon } from "lucide-react";

interface WebVitalsCardProps {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  unit: string;
  description: string;
  target: string;
  icon: LucideIcon;
}

export function WebVitalsCard({
  name,
  value,
  rating,
  unit,
  description,
  target,
  icon: Icon,
}: WebVitalsCardProps) {
  const formatValue = (val: number, metricUnit: string) => {
    if (metricUnit === 'ms') {
      return val > 1000 ? `${(val / 1000).toFixed(2)}s` : `${Math.round(val)}ms`;
    }
    return val.toFixed(3);
  };

  const getRatingConfig = (r: string) => {
    switch (r) {
      case 'good':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          label: 'Bom',
        };
      case 'needs-improvement':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          label: 'Precisa melhorar',
        };
      default:
        return {
          icon: XCircle,
          color: 'text-red-500',
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          label: 'Ruim',
        };
    }
  };

  const ratingConfig = getRatingConfig(rating);
  const RatingIcon = ratingConfig.icon;

  return (
    <Card className={cn("relative overflow-hidden", ratingConfig.border, "border")}>
      <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10", ratingConfig.bg)} />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {name}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {formatValue(value, unit)}
          </span>
          <RatingIcon className={cn("h-5 w-5", ratingConfig.color)} />
        </div>
        
        <div className="mt-2 flex items-center gap-2">
          <span className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            ratingConfig.bg,
            ratingConfig.color
          )}>
            {ratingConfig.label}
          </span>
          <span className="text-xs text-muted-foreground">Meta: {target}</span>
        </div>
        
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
