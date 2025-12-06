import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, StudentPoints } from "./useEducation";

interface CheckBadgesResult {
  newBadges: Badge[];
  totalPointsEarned: number;
}

export function useBadgeSystem() {
  const queryClient = useQueryClient();

  const checkAndAwardBadges = useCallback(async (
    userId: string,
    userEmail: string,
    userName: string,
    currentStats: StudentPoints | null
  ): Promise<CheckBadgesResult> => {
    const newBadges: Badge[] = [];
    let totalPointsEarned = 0;

    try {
      // 1. Fetch all active badges
      const { data: allBadges, error: badgesError } = await supabase
        .from("badges")
        .select("*")
        .eq("is_active", true);

      if (badgesError) throw badgesError;

      // 2. Fetch user's already earned badges
      const { data: earnedBadges, error: earnedError } = await supabase
        .from("student_badges")
        .select("badge_id")
        .eq("user_id", userId);

      if (earnedError) throw earnedError;

      const earnedBadgeIds = new Set(earnedBadges?.map(b => b.badge_id) || []);

      // 3. Get current stats (use provided or fetch)
      let stats = currentStats;
      if (!stats) {
        const { data: fetchedStats } = await supabase
          .from("student_points")
          .select("*")
          .eq("user_id", userId)
          .single();
        stats = fetchedStats;
      }

      // Default stats if not found
      const safeStats = {
        lessons_completed: stats?.lessons_completed || 0,
        quizzes_passed: stats?.quizzes_passed || 0,
        modules_completed: stats?.modules_completed || 0,
        courses_completed: stats?.courses_completed || 0,
        login_streak: stats?.login_streak || 0,
        total_points: stats?.total_points || 0,
      };

      // 4. Check eligibility for each badge
      for (const badge of allBadges || []) {
        // Skip if already earned
        if (earnedBadgeIds.has(badge.id)) continue;

        let isEligible = false;

        switch (badge.requirement_type) {
          case "complete_lessons":
            isEligible = safeStats.lessons_completed >= (badge.requirement_value || 1);
            break;
          case "pass_quiz":
            isEligible = safeStats.quizzes_passed >= (badge.requirement_value || 1);
            break;
          case "finish_module":
            isEligible = safeStats.modules_completed >= (badge.requirement_value || 1);
            break;
          case "finish_course":
            isEligible = safeStats.courses_completed >= (badge.requirement_value || 1);
            break;
          case "login_streak":
            isEligible = safeStats.login_streak >= (badge.requirement_value || 1);
            break;
          case "perfect_score":
            // This is handled separately when quiz is passed with 100%
            break;
          case "first_lesson":
            isEligible = safeStats.lessons_completed >= 1;
            break;
        }

        if (isEligible) {
          // Award the badge
          const { error: awardError } = await supabase
            .from("student_badges")
            .upsert({
              user_id: userId,
              badge_id: badge.id,
              earned_at: new Date().toISOString(),
            });

          if (!awardError) {
            newBadges.push(badge as Badge);
            totalPointsEarned += badge.points || 0;

            // Log the activity
            await supabase.from("student_activity_log").insert({
              user_id: userId,
              activity_type: "badge_earned",
              description: `Conquistou o badge "${badge.name}"`,
              points_earned: badge.points || 0,
              metadata: { badge_id: badge.id, badge_name: badge.name },
            });

            // Send email notification (fire and forget)
            supabase.functions.invoke("send-education-notification", {
              body: {
                type: "badge_earned",
                userEmail,
                userName,
                data: {
                  badgeName: badge.name,
                  badgeIcon: badge.icon,
                  badgePoints: badge.points,
                },
              },
            }).catch(err => console.error("Failed to send badge notification:", err));
          }
        }
      }

      // 5. Update total points if any badges were earned
      if (totalPointsEarned > 0) {
        const { data: currentPoints } = await supabase
          .from("student_points")
          .select("total_points")
          .eq("user_id", userId)
          .single();

        const newTotalPoints = (currentPoints?.total_points || 0) + totalPointsEarned;
        const newLevel = Math.floor(newTotalPoints / 500) + 1;

        await supabase
          .from("student_points")
          .upsert({
            user_id: userId,
            total_points: newTotalPoints,
            level: newLevel,
            updated_at: new Date().toISOString(),
          });
      }

      // 6. Invalidate queries
      if (newBadges.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["student-badges"] });
        queryClient.invalidateQueries({ queryKey: ["student-points"] });
        queryClient.invalidateQueries({ queryKey: ["student-activity"] });
        queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      }

      return { newBadges, totalPointsEarned };
    } catch (error) {
      console.error("Error checking and awarding badges:", error);
      return { newBadges: [], totalPointsEarned: 0 };
    }
  }, [queryClient]);

  const updateStudentStats = useCallback(async (
    userId: string,
    updates: Partial<Omit<StudentPoints, "id" | "user_id">>
  ) => {
    try {
      const { data: existing } = await supabase
        .from("student_points")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (existing) {
        // Merge updates with existing values
        const mergedUpdates: Record<string, number | string | null> = {
          ...updates,
          updated_at: new Date().toISOString(),
        };

        // Increment values instead of replacing
        if (updates.lessons_completed !== undefined) {
          mergedUpdates.lessons_completed = (existing.lessons_completed || 0) + 1;
        }
        if (updates.quizzes_passed !== undefined) {
          mergedUpdates.quizzes_passed = (existing.quizzes_passed || 0) + 1;
        }
        if (updates.modules_completed !== undefined) {
          mergedUpdates.modules_completed = (existing.modules_completed || 0) + 1;
        }
        if (updates.courses_completed !== undefined) {
          mergedUpdates.courses_completed = (existing.courses_completed || 0) + 1;
        }
        if (updates.total_points !== undefined) {
          mergedUpdates.total_points = (existing.total_points || 0) + (updates.total_points || 0);
        }

        const { data, error } = await supabase
          .from("student_points")
          .update(mergedUpdates)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from("student_points")
          .insert({
            user_id: userId,
            lessons_completed: updates.lessons_completed || 0,
            quizzes_passed: updates.quizzes_passed || 0,
            modules_completed: updates.modules_completed || 0,
            courses_completed: updates.courses_completed || 0,
            total_points: updates.total_points || 0,
            level: 1,
            login_streak: 0,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error("Error updating student stats:", error);
      return null;
    }
  }, []);

  const awardPerfectScoreBadge = useCallback(async (
    userId: string,
    userEmail: string,
    userName: string
  ) => {
    try {
      // Find the perfect score badge
      const { data: perfectBadge } = await supabase
        .from("badges")
        .select("*")
        .eq("requirement_type", "perfect_score")
        .eq("is_active", true)
        .single();

      if (!perfectBadge) return null;

      // Check if already earned
      const { data: existing } = await supabase
        .from("student_badges")
        .select("id")
        .eq("user_id", userId)
        .eq("badge_id", perfectBadge.id)
        .single();

      if (existing) return null;

      // Award the badge
      const { error } = await supabase
        .from("student_badges")
        .insert({
          user_id: userId,
          badge_id: perfectBadge.id,
          earned_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Log activity
      await supabase.from("student_activity_log").insert({
        user_id: userId,
        activity_type: "badge_earned",
        description: `Conquistou o badge "${perfectBadge.name}"`,
        points_earned: perfectBadge.points || 0,
        metadata: { badge_id: perfectBadge.id, badge_name: perfectBadge.name },
      });

      // Update points
      await updateStudentStats(userId, {
        total_points: perfectBadge.points || 0,
      });

      // Send notification
      supabase.functions.invoke("send-education-notification", {
        body: {
          type: "badge_earned",
          userEmail,
          userName,
          data: {
            badgeName: perfectBadge.name,
            badgeIcon: perfectBadge.icon,
            badgePoints: perfectBadge.points,
          },
        },
      }).catch(err => console.error("Failed to send perfect score notification:", err));

      return perfectBadge as Badge;
    } catch (error) {
      console.error("Error awarding perfect score badge:", error);
      return null;
    }
  }, [updateStudentStats]);

  return {
    checkAndAwardBadges,
    updateStudentStats,
    awardPerfectScoreBadge,
  };
}
