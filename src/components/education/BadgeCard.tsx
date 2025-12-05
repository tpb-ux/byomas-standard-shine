import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Award,
  BookOpen,
  Target,
  Trophy,
  Bookmark,
  GraduationCap,
  Flame,
  Compass,
  Diamond,
  Medal,
  Sprout,
  Lock,
} from "lucide-react";

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  points: number;
  is_active: boolean | null;
}

interface BadgeCardProps {
  badge: Badge;
  earned?: boolean;
  earnedAt?: string | null;
  progress?: number;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  award: Award,
  "book-open": BookOpen,
  target: Target,
  trophy: Trophy,
  bookmark: Bookmark,
  "graduation-cap": GraduationCap,
  flame: Flame,
  compass: Compass,
  diamond: Diamond,
  medal: Medal,
  sprout: Sprout,
};

export const BadgeCard = ({
  badge,
  earned = false,
  earnedAt,
  progress = 0,
  showProgress = false,
  size = "md",
  onClick,
}: BadgeCardProps) => {
  const Icon = iconMap[badge.icon] || Award;
  
  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const iconSizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const progressPercent = Math.min((progress / badge.requirement_value) * 100, 100);

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 cursor-pointer group",
        earned
          ? "bg-card hover:shadow-lg"
          : "bg-muted/50 opacity-70 hover:opacity-90",
        onClick && "hover:scale-105"
      )}
      onClick={onClick}
    >
      <CardContent className={cn("text-center", sizeClasses[size])}>
        {/* Badge Icon */}
        <div
          className={cn(
            "mx-auto rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
            iconSizeClasses[size],
            earned ? "bg-primary/20" : "bg-muted"
          )}
          style={{
            backgroundColor: earned ? `${badge.color}20` : undefined,
          }}
        >
          {earned ? (
            <Icon
              className={cn(
                iconSizeClasses[size],
                "p-2"
              )}
              style={{ color: badge.color }}
            />
          ) : (
            <Lock className={cn(iconSizeClasses[size], "p-2 text-muted-foreground")} />
          )}
        </div>

        {/* Badge Name */}
        <h4
          className={cn(
            "font-semibold mb-1",
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base",
            earned ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {badge.name}
        </h4>

        {/* Description */}
        {size !== "sm" && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {badge.description}
          </p>
        )}

        {/* Points */}
        <div
          className={cn(
            "text-xs font-medium",
            earned ? "text-primary" : "text-muted-foreground"
          )}
        >
          +{badge.points} pts
        </div>

        {/* Progress bar (when not earned) */}
        {showProgress && !earned && (
          <div className="mt-3">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/50 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {progress}/{badge.requirement_value}
            </p>
          </div>
        )}

        {/* Earned date */}
        {earned && earnedAt && size !== "sm" && (
          <p className="text-[10px] text-muted-foreground mt-2">
            Conquistado em {new Date(earnedAt).toLocaleDateString("pt-BR")}
          </p>
        )}
      </CardContent>
    </Card>
  );
};