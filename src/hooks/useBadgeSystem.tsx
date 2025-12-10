import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge, StudentPoints } from "./useEducation";
import { toast } from "sonner";
import { CelebrationToast } from "@/components/education/CelebrationToast";

interface CheckBadgesResult {
  newBadges: Badge[];
  totalPointsEarned: number;
}

// Debug logging helper
const DEBUG = true;
const log = (message: string, data?: unknown) => {
  if (DEBUG) {
    console.log(`🎖️ [BadgeSystem] ${message}`, data ?? "");
  }
};

// Show celebration toast for badge
const showCelebrationToast = (badge: Badge) => {
  log(`🎉 Showing celebration toast for badge: ${badge.name}`);
  toast.custom(
    (t) => (
      <CelebrationToast
        badgeName={badge.name}
        badgeIcon={badge.icon || "award"}
        badgeColor={badge.color || "#10b981"}
        points={badge.points || 0}
        onDismiss={() => toast.dismiss(t)}
      />
    ),
    {
      duration: 6000,
      position: "top-center",
    }
  );
};

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

    log("Starting badge check", { userId, userName });

    try {
      // 1. Fetch all active badges
      const { data: allBadges, error: badgesError } = await supabase
        .from("badges")
        .select("*")
        .eq("is_active", true);

      if (badgesError) throw badgesError;
      log(`Found ${allBadges?.length || 0} active badges`);

      // 2. Fetch user's already earned badges
      const { data: earnedBadges, error: earnedError } = await supabase
        .from("student_badges")
        .select("badge_id")
        .eq("user_id", userId);

      if (earnedError) throw earnedError;

      const earnedBadgeIds = new Set(earnedBadges?.map(b => b.badge_id) || []);
      log(`User has ${earnedBadgeIds.size} earned badges`);

      // 3. Get current stats (use provided or fetch)
      let stats = currentStats;
      if (!stats) {
        const { data: fetchedStats } = await supabase
          .from("student_points")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        stats = fetchedStats;
        log("Fetched stats from DB", fetchedStats);
      } else {
        log("Using provided stats", currentStats);
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
      log("Safe stats for eligibility check", safeStats);

      // 4. Check eligibility for each badge
      for (const badge of allBadges || []) {
        // Skip if already earned
        if (earnedBadgeIds.has(badge.id)) {
          log(`⏭️ Skipping badge "${badge.name}" - already earned`);
          continue;
        }

        let isEligible = false;

        switch (badge.requirement_type) {
          case "complete_lessons":
            isEligible = safeStats.lessons_completed >= (badge.requirement_value || 1);
            log(`Checking "${badge.name}": lessons_completed(${safeStats.lessons_completed}) >= ${badge.requirement_value} = ${isEligible}`);
            break;
          case "pass_quiz":
            isEligible = safeStats.quizzes_passed >= (badge.requirement_value || 1);
            log(`Checking "${badge.name}": quizzes_passed(${safeStats.quizzes_passed}) >= ${badge.requirement_value} = ${isEligible}`);
            break;
          case "finish_module":
            isEligible = safeStats.modules_completed >= (badge.requirement_value || 1);
            log(`Checking "${badge.name}": modules_completed(${safeStats.modules_completed}) >= ${badge.requirement_value} = ${isEligible}`);
            break;
          case "finish_course":
            isEligible = safeStats.courses_completed >= (badge.requirement_value || 1);
            log(`Checking "${badge.name}": courses_completed(${safeStats.courses_completed}) >= ${badge.requirement_value} = ${isEligible}`);
            break;
          case "login_streak":
            isEligible = safeStats.login_streak >= (badge.requirement_value || 1);
            log(`Checking "${badge.name}": login_streak(${safeStats.login_streak}) >= ${badge.requirement_value} = ${isEligible}`);
            break;
          case "perfect_score":
            log(`Skipping "${badge.name}" - perfect_score handled separately`);
            break;
          case "first_lesson":
            isEligible = safeStats.lessons_completed >= 1;
            log(`Checking "${badge.name}": first_lesson(${safeStats.lessons_completed}) >= 1 = ${isEligible}`);
            break;
          default:
            log(`Unknown requirement_type: ${badge.requirement_type}`);
        }

        if (isEligible) {
          log(`✅ ELIGIBLE for badge "${badge.name}"! Awarding...`);
          
          // Award the badge
          const { error: awardError } = await supabase
            .from("student_badges")
            .upsert({
              user_id: userId,
              badge_id: badge.id,
              earned_at: new Date().toISOString(),
            });

          if (awardError) {
            log(`❌ Error awarding badge: ${awardError.message}`);
          } else {
            log(`🏆 Badge "${badge.name}" awarded successfully!`);
            const awardedBadge = badge as Badge;
            newBadges.push(awardedBadge);
            totalPointsEarned += badge.points || 0;

            // Show celebration toast immediately
            showCelebrationToast(awardedBadge);

            // Log the activity
            const { error: activityError } = await supabase.from("student_activity_log").insert({
              user_id: userId,
              activity_type: "badge_earned",
              description: `Conquistou o badge "${badge.name}"`,
              points_earned: badge.points || 0,
              metadata: { badge_id: badge.id, badge_name: badge.name },
            });
            
            if (activityError) {
              log(`⚠️ Error logging activity: ${activityError.message}`);
            }

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
            }).then(() => log(`📧 Email notification sent for badge "${badge.name}"`))
              .catch(err => log(`⚠️ Failed to send badge notification: ${err.message}`));
          }
        }
      }

      // 5. Update total points if any badges were earned
      if (totalPointsEarned > 0) {
        log(`Updating total points: +${totalPointsEarned}`);
        
        const { data: currentPoints } = await supabase
          .from("student_points")
          .select("total_points")
          .eq("user_id", userId)
          .maybeSingle();

        const newTotalPoints = (currentPoints?.total_points || 0) + totalPointsEarned;
        const newLevel = Math.floor(newTotalPoints / 500) + 1;

        const { error: updateError } = await supabase
          .from("student_points")
          .upsert({
            user_id: userId,
            total_points: newTotalPoints,
            level: newLevel,
            updated_at: new Date().toISOString(),
          });
          
        if (updateError) {
          log(`❌ Error updating points: ${updateError.message}`);
        } else {
          log(`Points updated: ${newTotalPoints}, Level: ${newLevel}`);
        }
      }

      // 6. Invalidate queries
      if (newBadges.length > 0) {
        log(`Invalidating queries - ${newBadges.length} new badge(s)`);
        queryClient.invalidateQueries({ queryKey: ["student-badges"] });
        queryClient.invalidateQueries({ queryKey: ["student-points"] });
        queryClient.invalidateQueries({ queryKey: ["student-activity"] });
        queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      }

      log("Badge check complete", { newBadges: newBadges.map(b => b.name), totalPointsEarned });
      return { newBadges, totalPointsEarned };
    } catch (error) {
      log("❌ Error in checkAndAwardBadges", error);
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
        .maybeSingle();

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
    log("Checking for perfect score badge", { userId });
    
    try {
      // Find the perfect score badge
      const { data: perfectBadge, error: findError } = await supabase
        .from("badges")
        .select("*")
        .eq("requirement_type", "perfect_score")
        .eq("is_active", true)
        .maybeSingle();

      if (findError) {
        log("No perfect score badge found or error", findError.message);
      }
      
      if (!perfectBadge) {
        log("No perfect score badge configured");
        return null;
      }
      
      log(`Found perfect score badge: "${perfectBadge.name}"`);

      // Check if already earned
      const { data: existing } = await supabase
        .from("student_badges")
        .select("id")
        .eq("user_id", userId)
        .eq("badge_id", perfectBadge.id)
        .maybeSingle();

      if (existing) {
        log("User already has perfect score badge");
        return null;
      }

      log("Awarding perfect score badge...");
      
      // Award the badge
      const { error } = await supabase
        .from("student_badges")
        .insert({
          user_id: userId,
          badge_id: perfectBadge.id,
          earned_at: new Date().toISOString(),
        });

      if (error) throw error;

      log(`🏆 Perfect score badge "${perfectBadge.name}" awarded!`);
      
      const awardedBadge = perfectBadge as Badge;
      
      // Show celebration toast
      showCelebrationToast(awardedBadge);

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
      }).then(() => log("📧 Perfect score notification sent"))
        .catch(err => log(`⚠️ Failed to send perfect score notification: ${err.message}`));
        
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["student-badges"] });
      queryClient.invalidateQueries({ queryKey: ["student-points"] });

      return awardedBadge;
    } catch (error) {
      log("❌ Error awarding perfect score badge", error);
      console.error("Error awarding perfect score badge:", error);
      return null;
    }
  }, [updateStudentStats, queryClient]);

  return {
    checkAndAwardBadges,
    updateStudentStats,
    awardPerfectScoreBadge,
  };
}
