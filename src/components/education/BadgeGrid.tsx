import { Badge, BadgeCard } from "./BadgeCard";

interface StudentBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string | null;
  badge?: Badge;
}

interface BadgeGridProps {
  badges: Badge[];
  studentBadges?: StudentBadge[];
  progress?: Record<string, number>;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
  columns?: number;
  onBadgeClick?: (badge: Badge) => void;
}

export const BadgeGrid = ({
  badges,
  studentBadges = [],
  progress = {},
  showProgress = false,
  size = "md",
  columns = 4,
  onBadgeClick,
}: BadgeGridProps) => {
  const earnedBadgeIds = new Set(studentBadges.map((sb) => sb.badge_id));

  const gridColsClasses: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  };

  // Sort badges: earned first, then by points
  const sortedBadges = [...badges].sort((a, b) => {
    const aEarned = earnedBadgeIds.has(a.id);
    const bEarned = earnedBadgeIds.has(b.id);
    if (aEarned && !bEarned) return -1;
    if (!aEarned && bEarned) return 1;
    return b.points - a.points;
  });

  return (
    <div className={`grid ${gridColsClasses[columns] || gridColsClasses[4]} gap-4`}>
      {sortedBadges.map((badge) => {
        const studentBadge = studentBadges.find((sb) => sb.badge_id === badge.id);
        const isEarned = earnedBadgeIds.has(badge.id);

        return (
          <BadgeCard
            key={badge.id}
            badge={badge}
            earned={isEarned}
            earnedAt={studentBadge?.earned_at}
            progress={progress[badge.requirement_type] || 0}
            showProgress={showProgress}
            size={size}
            onClick={() => onBadgeClick?.(badge)}
          />
        );
      })}
    </div>
  );
};