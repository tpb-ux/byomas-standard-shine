import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Target, Flame, GraduationCap, CheckCircle, Gift, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  reward_points: number;
  icon: string;
  color: string;
  is_active: boolean;
}

interface StudentChallenge {
  challenge_id: string;
  current_progress: number;
  is_completed: boolean;
  reward_claimed: boolean;
}

interface ChallengeCardProps {
  challenge: Challenge;
  progress?: StudentChallenge;
  onClaimReward?: (challengeId: string) => void;
  isLoading?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'book-open': BookOpen,
  'target': Target,
  'flame': Flame,
  'graduation-cap': GraduationCap,
  'check-circle': CheckCircle,
  'trophy': Trophy,
};

export function ChallengeCard({ challenge, progress, onClaimReward, isLoading }: ChallengeCardProps) {
  const IconComponent = iconMap[challenge.icon] || Target;
  const currentProgress = progress?.current_progress || 0;
  const progressPercent = Math.min((currentProgress / challenge.target_value) * 100, 100);
  const isCompleted = progress?.is_completed || false;
  const rewardClaimed = progress?.reward_claimed || false;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
      isCompleted && !rewardClaimed && "ring-2 ring-primary animate-pulse",
      rewardClaimed && "opacity-75"
    )}>
      {/* Decorative corner */}
      <div 
        className="absolute top-0 right-0 w-16 h-16 opacity-20"
        style={{ 
          background: `linear-gradient(135deg, transparent 50%, ${challenge.color} 50%)` 
        }}
      />
      
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div 
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${challenge.color}20` }}
          >
            <IconComponent 
              className="w-6 h-6" 
              style={{ color: challenge.color }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground truncate">
                {challenge.title}
              </h4>
              {isCompleted && (
                <Badge variant="default" className="bg-green-500 text-white text-xs">
                  ✓ Completo
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {challenge.description}
            </p>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Progresso: {currentProgress}/{challenge.target_value}
                </span>
                <span className="font-medium" style={{ color: challenge.color }}>
                  +{challenge.reward_points} pts
                </span>
              </div>
              
              <Progress 
                value={progressPercent} 
                className="h-2"
                style={{ 
                  ['--progress-background' as string]: challenge.color 
                }}
              />
            </div>

            {/* Claim button */}
            {isCompleted && !rewardClaimed && (
              <Button
                size="sm"
                className="w-full mt-3 gap-2"
                onClick={() => onClaimReward?.(challenge.id)}
                disabled={isLoading}
              >
                <Gift className="w-4 h-4" />
                Resgatar Recompensa
              </Button>
            )}

            {rewardClaimed && (
              <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>Recompensa resgatada!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
