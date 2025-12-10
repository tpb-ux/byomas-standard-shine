import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  reward_points: number;
  reward_badge_id: string | null;
  week_start: string;
  week_end: string;
  icon: string;
  color: string;
  is_active: boolean;
}

interface StudentChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  current_progress: number;
  is_completed: boolean;
  completed_at: string | null;
  reward_claimed: boolean;
}

// Get active weekly challenges
export function useWeeklyChallenges() {
  return useQuery({
    queryKey: ['weekly-challenges'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('is_active', true)
        .lte('week_start', today)
        .gte('week_end', today)
        .order('reward_points', { ascending: false });

      if (error) throw error;
      return data as WeeklyChallenge[];
    },
  });
}

// Get student's challenge progress
export function useStudentChallenges(userId: string | undefined) {
  return useQuery({
    queryKey: ['student-challenges', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('student_challenges')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data as StudentChallenge[];
    },
    enabled: !!userId,
  });
}

// Update challenge progress
export function useUpdateChallengeProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      challengeType, 
      incrementBy = 1 
    }: { 
      userId: string; 
      challengeType: string; 
      incrementBy?: number;
    }) => {
      // Get active challenges of this type
      const today = new Date().toISOString().split('T')[0];
      
      const { data: challenges, error: fetchError } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('challenge_type', challengeType)
        .eq('is_active', true)
        .lte('week_start', today)
        .gte('week_end', today);

      if (fetchError) throw fetchError;
      if (!challenges || challenges.length === 0) return null;

      // Update progress for each matching challenge
      for (const challenge of challenges) {
        // Check if student already has progress record
        const { data: existing } = await supabase
          .from('student_challenges')
          .select('*')
          .eq('user_id', userId)
          .eq('challenge_id', challenge.id)
          .maybeSingle();

        if (existing) {
          // Update existing progress
          const newProgress = existing.current_progress + incrementBy;
          const isCompleted = newProgress >= challenge.target_value;

          await supabase
            .from('student_challenges')
            .update({
              current_progress: newProgress,
              is_completed: isCompleted,
              completed_at: isCompleted && !existing.is_completed ? new Date().toISOString() : existing.completed_at,
            })
            .eq('id', existing.id);

          if (isCompleted && !existing.is_completed) {
            toast.success(`🎯 Desafio "${challenge.title}" completo!`, {
              description: `Resgate sua recompensa de ${challenge.reward_points} pontos!`,
            });
          }
        } else {
          // Create new progress record
          const isCompleted = incrementBy >= challenge.target_value;

          await supabase
            .from('student_challenges')
            .insert({
              user_id: userId,
              challenge_id: challenge.id,
              current_progress: incrementBy,
              is_completed: isCompleted,
              completed_at: isCompleted ? new Date().toISOString() : null,
            });

          if (isCompleted) {
            toast.success(`🎯 Desafio "${challenge.title}" completo!`, {
              description: `Resgate sua recompensa de ${challenge.reward_points} pontos!`,
            });
          }
        }
      }

      return challenges;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-challenges'] });
    },
  });
}

// Claim challenge reward
export function useClaimChallengeReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      challengeId, 
      userId, 
      rewardPoints 
    }: { 
      challengeId: string; 
      userId: string; 
      rewardPoints: number;
    }) => {
      // Mark reward as claimed
      const { error: updateError } = await supabase
        .from('student_challenges')
        .update({ reward_claimed: true })
        .eq('challenge_id', challengeId)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Add points to student
      const { data: existingPoints } = await supabase
        .from('student_points')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingPoints) {
        await supabase
          .from('student_points')
          .update({
            total_points: existingPoints.total_points + rewardPoints,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('student_points')
          .insert({
            user_id: userId,
            total_points: rewardPoints,
          });
      }

      // Log activity
      await supabase
        .from('student_activity_log')
        .insert({
          user_id: userId,
          activity_type: 'challenge_reward',
          description: `Resgatou recompensa de desafio semanal`,
          points_earned: rewardPoints,
        });

      return { success: true };
    },
    onSuccess: (_, variables) => {
      toast.success(`🎉 +${variables.rewardPoints} pontos resgatados!`);
      queryClient.invalidateQueries({ queryKey: ['student-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['student-points'] });
      queryClient.invalidateQueries({ queryKey: ['student-activity-log'] });
    },
    onError: (error) => {
      toast.error('Erro ao resgatar recompensa');
      console.error('Claim reward error:', error);
    },
  });
}
