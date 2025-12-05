import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StudentPoints {
  id: string;
  user_id: string;
  total_points: number;
  level: number;
  lessons_completed: number;
  quizzes_passed: number;
  modules_completed: number;
  courses_completed: number;
  login_streak: number;
  last_activity_at: string | null;
}

interface PointsDisplayProps {
  points: StudentPoints | null;
  compact?: boolean;
  showStats?: boolean;
}

const LEVEL_THRESHOLDS = [
  { level: 1, min: 0, max: 99, name: "Iniciante" },
  { level: 2, min: 100, max: 249, name: "Aprendiz" },
  { level: 3, min: 250, max: 499, name: "Estudante" },
  { level: 4, min: 500, max: 999, name: "Conhecedor" },
  { level: 5, min: 1000, max: 1999, name: "Especialista" },
  { level: 6, min: 2000, max: 3499, name: "Expert" },
  { level: 7, min: 3500, max: 4999, name: "Mestre" },
  { level: 8, min: 5000, max: Infinity, name: "Guru do Carbono" },
];

export const getLevelInfo = (points: number) => {
  const currentLevel = LEVEL_THRESHOLDS.find(
    (l) => points >= l.min && points <= l.max
  ) || LEVEL_THRESHOLDS[0];

  const nextLevel = LEVEL_THRESHOLDS.find((l) => l.level === currentLevel.level + 1);
  const progress = nextLevel
    ? ((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  return {
    ...currentLevel,
    progress: Math.min(progress, 100),
    pointsToNext: nextLevel ? nextLevel.min - points : 0,
  };
};

export const PointsDisplay = ({
  points,
  compact = false,
  showStats = false,
}: PointsDisplayProps) => {
  const totalPoints = points?.total_points || 0;
  const levelInfo = getLevelInfo(totalPoints);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-primary">
          <Star className="h-4 w-4 fill-primary" />
          <span className="font-semibold">{totalPoints}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          Nível {levelInfo.level}
        </span>
      </div>
    );
  }

  return (
    <Card className="bg-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-5 w-5 text-primary fill-primary" />
              <span className="text-2xl font-bold text-foreground">
                {totalPoints}
              </span>
              <span className="text-muted-foreground">pontos</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Nível {levelInfo.level} - {levelInfo.name}
            </p>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">{points?.login_streak || 0} dias</span>
          </div>
        </div>

        {/* Progress to next level */}
        {levelInfo.pointsToNext > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Próximo nível</span>
              <span>{levelInfo.pointsToNext} pts restantes</span>
            </div>
            <Progress value={levelInfo.progress} className="h-2" />
          </div>
        )}

        {/* Stats */}
        {showStats && points && (
          <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                {points.lessons_completed}
              </p>
              <p className="text-xs text-muted-foreground">Lições</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                {points.quizzes_passed}
              </p>
              <p className="text-xs text-muted-foreground">Quizzes</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                {points.modules_completed}
              </p>
              <p className="text-xs text-muted-foreground">Módulos</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                {points.courses_completed}
              </p>
              <p className="text-xs text-muted-foreground">Cursos</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};