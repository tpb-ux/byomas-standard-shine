import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChallengeCard } from "./ChallengeCard";
import { Target, Clock } from "lucide-react";
import { useWeeklyChallenges, useStudentChallenges, useClaimChallengeReward } from "@/hooks/useChallenges";
import { useAuth } from "@/hooks/useAuth";
import { differenceInDays, differenceInHours, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function WeeklyChallenges() {
  const { user } = useAuth();
  const { data: challenges, isLoading: loadingChallenges } = useWeeklyChallenges();
  const { data: studentChallenges, isLoading: loadingProgress } = useStudentChallenges(user?.id);
  const claimReward = useClaimChallengeReward();

  const isLoading = loadingChallenges || loadingProgress;

  // Calculate time remaining in the week
  const getTimeRemaining = () => {
    if (!challenges || challenges.length === 0) return null;
    const weekEnd = new Date(challenges[0].week_end);
    weekEnd.setHours(23, 59, 59, 999);
    const now = new Date();
    
    const daysRemaining = differenceInDays(weekEnd, now);
    const hoursRemaining = differenceInHours(weekEnd, now) % 24;
    
    if (daysRemaining > 0) {
      return `${daysRemaining}d ${hoursRemaining}h restantes`;
    } else if (hoursRemaining > 0) {
      return `${hoursRemaining}h restantes`;
    }
    return "Última hora!";
  };

  const handleClaimReward = async (challengeId: string) => {
    if (!user) return;
    
    const challenge = challenges?.find(c => c.id === challengeId);
    if (!challenge) return;

    await claimReward.mutateAsync({
      challengeId,
      userId: user.id,
      rewardPoints: challenge.reward_points,
    });
  };

  const getProgressForChallenge = (challengeId: string) => {
    return studentChallenges?.find(sc => sc.challenge_id === challengeId);
  };

  const completedCount = studentChallenges?.filter(sc => sc.is_completed).length || 0;
  const totalChallenges = challenges?.length || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!challenges || challenges.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Sem desafios ativos</h3>
          <p className="text-muted-foreground">
            Novos desafios serão disponibilizados em breve!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Desafios da Semana</CardTitle>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              {completedCount}/{totalChallenges} completos
            </span>
            
            <div className="flex items-center gap-1 text-primary">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{getTimeRemaining()}</span>
            </div>
          </div>
        </div>
        
        {challenges[0] && (
          <p className="text-xs text-muted-foreground mt-1">
            Semana de {format(new Date(challenges[0].week_start), "dd MMM", { locale: ptBR })} a{" "}
            {format(new Date(challenges[0].week_end), "dd MMM", { locale: ptBR })}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {challenges.map(challenge => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            progress={getProgressForChallenge(challenge.id)}
            onClaimReward={handleClaimReward}
            isLoading={claimReward.isPending}
          />
        ))}
      </CardContent>
    </Card>
  );
}
