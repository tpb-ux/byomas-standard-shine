import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  Target,
  Award,
  GraduationCap,
  BookOpen,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  description: string | null;
  points_earned: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface ActivityFeedProps {
  activities: ActivityLog[];
  maxHeight?: string;
  showHeader?: boolean;
}

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  lesson_completed: CheckCircle,
  quiz_passed: Target,
  badge_earned: Award,
  certificate_earned: GraduationCap,
  module_completed: BookOpen,
  login: LogIn,
};

const activityColors: Record<string, string> = {
  lesson_completed: "text-green-500 bg-green-500/10",
  quiz_passed: "text-amber-500 bg-amber-500/10",
  badge_earned: "text-purple-500 bg-purple-500/10",
  certificate_earned: "text-pink-500 bg-pink-500/10",
  module_completed: "text-blue-500 bg-blue-500/10",
  login: "text-muted-foreground bg-muted",
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return date.toLocaleDateString("pt-BR");
};

export const ActivityFeed = ({
  activities,
  maxHeight = "400px",
  showHeader = true,
}: ActivityFeedProps) => {
  if (activities.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="text-lg">Atividades Recentes</CardTitle>
          </CardHeader>
        )}
        <CardContent className="text-center py-8 text-muted-foreground">
          <p>Nenhuma atividade registrada ainda.</p>
          <p className="text-sm mt-2">
            Complete lições e quizzes para ver seu histórico aqui!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group activities by day
  const groupedActivities = activities.reduce((acc, activity) => {
    const date = new Date(activity.created_at).toLocaleDateString("pt-BR");
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, ActivityLog[]>);

  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            📋 Atividades Recentes
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          <div className="p-4 pt-0 space-y-4">
            {Object.entries(groupedActivities).map(([date, dayActivities]) => (
              <div key={date}>
                <p className="text-xs font-medium text-muted-foreground mb-2 sticky top-0 bg-card py-1">
                  {date === new Date().toLocaleDateString("pt-BR")
                    ? "Hoje"
                    : date === new Date(Date.now() - 86400000).toLocaleDateString("pt-BR")
                    ? "Ontem"
                    : date}
                </p>
                <div className="space-y-3">
                  {dayActivities.map((activity) => {
                    const Icon = activityIcons[activity.activity_type] || CheckCircle;
                    const colorClass = activityColors[activity.activity_type] || activityColors.login;

                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 group"
                      >
                        <div
                          className={cn(
                            "p-2 rounded-full shrink-0",
                            colorClass
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground line-clamp-2">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(activity.created_at)}
                            </span>
                            {activity.points_earned > 0 && (
                              <span className="text-xs text-primary font-medium">
                                +{activity.points_earned} pts
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};