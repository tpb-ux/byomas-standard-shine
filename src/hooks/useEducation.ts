import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

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

export interface StudentBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string | null;
  shared_at: string | null;
}

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
  updated_at: string | null;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  description: string | null;
  points_earned: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  duration_hours: number | null;
  is_active: boolean | null;
  is_free: boolean | null;
  created_at: string | null;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  description: string | null;
  order_index: number;
  duration_minutes: number | null;
  is_active: boolean | null;
}

export interface ModuleLesson {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  content: string;
  order_index: number;
  video_url: string | null;
  duration_minutes: number | null;
}

export interface ModuleQuiz {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  questions: QuizQuestion[];
  passing_score: number | null;
  max_attempts: number | null;
  time_limit_minutes: number | null;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

export interface StudentProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string | null;
  time_spent_seconds: number | null;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_code: string;
  student_name: string;
  student_email: string | null;
  issued_at: string | null;
}

// Fetch course by slug
export function useCourse(slug: string) {
  return useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      
      if (error) throw error;
      return data as Course | null;
    },
    enabled: !!slug,
  });
}

// Fetch all courses
export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Course[];
    },
  });
}

// Fetch course modules
export function useCourseModules(courseId: string | undefined) {
  return useQuery({
    queryKey: ["course-modules", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", courseId!)
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      return data as CourseModule[];
    },
    enabled: !!courseId,
  });
}

// Fetch module by slug
export function useModule(courseId: string | undefined, moduleSlug: string) {
  return useQuery({
    queryKey: ["module", courseId, moduleSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", courseId!)
        .eq("slug", moduleSlug)
        .maybeSingle();
      
      if (error) throw error;
      return data as CourseModule | null;
    },
    enabled: !!courseId && !!moduleSlug,
  });
}

// Fetch module lessons
export function useModuleLessons(moduleId: string | undefined) {
  return useQuery({
    queryKey: ["module-lessons", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_lessons")
        .select("*")
        .eq("module_id", moduleId!)
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      return data as ModuleLesson[];
    },
    enabled: !!moduleId,
  });
}

// Fetch lesson by slug
export function useLesson(moduleId: string | undefined, lessonSlug: string) {
  return useQuery({
    queryKey: ["lesson", moduleId, lessonSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_lessons")
        .select("*")
        .eq("module_id", moduleId!)
        .eq("slug", lessonSlug)
        .maybeSingle();
      
      if (error) throw error;
      return data as ModuleLesson | null;
    },
    enabled: !!moduleId && !!lessonSlug,
  });
}

// Fetch module quiz
export function useModuleQuiz(moduleId: string | undefined) {
  return useQuery({
    queryKey: ["module-quiz", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_quizzes")
        .select("*")
        .eq("module_id", moduleId!)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        questions: data.questions as unknown as QuizQuestion[]
      } as ModuleQuiz;
    },
    enabled: !!moduleId,
  });
}

// Fetch student progress for a course
export function useStudentProgress(userId: string | undefined, courseId: string | undefined) {
  return useQuery({
    queryKey: ["student-progress", userId, courseId],
    queryFn: async () => {
      // First get all lessons from the course
      const { data: modules } = await supabase
        .from("course_modules")
        .select("id")
        .eq("course_id", courseId!);
      
      if (!modules?.length) return [];

      const moduleIds = modules.map(m => m.id);
      
      const { data: lessons } = await supabase
        .from("module_lessons")
        .select("id")
        .in("module_id", moduleIds);
      
      if (!lessons?.length) return [];

      const lessonIds = lessons.map(l => l.id);

      const { data, error } = await supabase
        .from("student_progress")
        .select("*")
        .eq("user_id", userId!)
        .in("lesson_id", lessonIds);
      
      if (error) throw error;
      return data as StudentProgress[];
    },
    enabled: !!userId && !!courseId,
  });
}

// Mark lesson as complete
export function useMarkLessonComplete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, lessonId }: { userId: string; lessonId: string }) => {
      const { data, error } = await supabase
        .from("student_progress")
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-progress"] });
    },
  });
}

// Submit quiz attempt
export function useSubmitQuizAttempt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      quizId, 
      score, 
      answers, 
      passed 
    }: { 
      userId: string; 
      quizId: string; 
      score: number; 
      answers: Record<string, number>; 
      passed: boolean;
    }) => {
      const { data, error } = await supabase
        .from("student_quiz_attempts")
        .insert({
          user_id: userId,
          quiz_id: quizId,
          score,
          answers,
          passed,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
    },
  });
}

// Get quiz attempts
export function useQuizAttempts(userId: string | undefined, quizId: string | undefined) {
  return useQuery({
    queryKey: ["quiz-attempts", userId, quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_quiz_attempts")
        .select("*")
        .eq("user_id", userId!)
        .eq("quiz_id", quizId!)
        .order("attempted_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!quizId,
  });
}

// Generate certificate
export function useGenerateCertificate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      courseId, 
      studentName,
      studentEmail 
    }: { 
      userId: string; 
      courseId: string; 
      studentName: string;
      studentEmail?: string;
    }) => {
      const certificateCode = `AR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from("certificates")
        .insert({
          user_id: userId,
          course_id: courseId,
          student_name: studentName,
          student_email: studentEmail,
          certificate_code: certificateCode,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Certificate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
}

// Get certificate by code
export function useCertificate(code: string) {
  return useQuery({
    queryKey: ["certificate", code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select(`
          *,
          courses:course_id (title, description)
        `)
        .eq("certificate_code", code)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!code,
  });
}

// Get user certificates
export function useUserCertificates(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-certificates", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select(`
          *,
          courses:course_id (title, slug)
        `)
        .eq("user_id", userId!)
        .order("issued_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

// ============ GAMIFICATION HOOKS ============

// Fetch all badges
export function useBadges() {
  return useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .eq("is_active", true)
        .order("points", { ascending: true });
      
      if (error) throw error;
      return data as Badge[];
    },
  });
}

// Fetch student badges
export function useStudentBadges(userId: string | undefined) {
  return useQuery({
    queryKey: ["student-badges", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_badges")
        .select("*")
        .eq("user_id", userId!);
      
      if (error) throw error;
      return data as StudentBadge[];
    },
    enabled: !!userId,
  });
}

// Fetch student points
export function useStudentPoints(userId: string | undefined) {
  return useQuery({
    queryKey: ["student-points", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_points")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      
      if (error) throw error;
      return data as StudentPoints | null;
    },
    enabled: !!userId,
  });
}

// Fetch leaderboard
export function useLeaderboard(limit: number = 50) {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_points")
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .order("total_points", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
  });
}

// Fetch student activity log
export function useStudentActivityLog(userId: string | undefined, limit: number = 50) {
  return useQuery({
    queryKey: ["student-activity", userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_activity_log")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: !!userId,
  });
}

// Award a badge to a student
export function useAwardBadge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, badgeId }: { userId: string; badgeId: string }) => {
      const { data, error } = await supabase
        .from("student_badges")
        .upsert({
          user_id: userId,
          badge_id: badgeId,
          earned_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-badges"] });
    },
  });
}

// Add or update student points
export function useUpdatePoints() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      pointsToAdd,
      statsToUpdate,
    }: {
      userId: string;
      pointsToAdd: number;
      statsToUpdate?: Partial<Omit<StudentPoints, "id" | "user_id" | "total_points">>;
    }) => {
      // First check if record exists
      const { data: existing } = await supabase
        .from("student_points")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("student_points")
          .update({
            total_points: existing.total_points + pointsToAdd,
            ...statsToUpdate,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("student_points")
          .insert({
            user_id: userId,
            total_points: pointsToAdd,
            ...statsToUpdate,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-points"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

// Log an activity
export function useLogActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      activityType,
      description,
      pointsEarned = 0,
      metadata = {},
    }: {
      userId: string;
      activityType: string;
      description: string;
      pointsEarned?: number;
      metadata?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from("student_activity_log")
        .insert({
          user_id: userId,
          activity_type: activityType,
          description,
          points_earned: pointsEarned,
          metadata: metadata as Json,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-activity"] });
    },
  });
}
