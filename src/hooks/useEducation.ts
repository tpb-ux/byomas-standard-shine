import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        .single();
      
      if (error) throw error;
      return data as Course;
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
        .single();
      
      if (error) throw error;
      return data as CourseModule;
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
        .single();
      
      if (error) throw error;
      return data as ModuleLesson;
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
        .single();
      
      if (error) throw error;
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
        .single();
      
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
