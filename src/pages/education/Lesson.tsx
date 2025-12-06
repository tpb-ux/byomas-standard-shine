import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import Breadcrumb from "@/components/Breadcrumb";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Clock, 
  CheckCircle2, 
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCourse, useModule, useModuleLessons, useLesson, useMarkLessonComplete, useStudentProgress, useStudentPoints, Badge } from "@/hooks/useEducation";
import { useAuth } from "@/hooks/useAuth";
import { useBadgeSystem } from "@/hooks/useBadgeSystem";
import { BadgeUnlockModal } from "@/components/education/BadgeUnlockModal";
import { toast } from "sonner";

const Lesson = () => {
  const { courseSlug, moduleSlug, lessonSlug } = useParams<{ 
    courseSlug: string; 
    moduleSlug: string; 
    lessonSlug: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: course } = useCourse(courseSlug || "");
  const { data: module } = useModule(course?.id, moduleSlug || "");
  const { data: lessons } = useModuleLessons(module?.id);
  const { data: lesson, isLoading } = useLesson(module?.id, lessonSlug || "");
  const { data: progress } = useStudentProgress(user?.id, course?.id);
  const { data: studentPoints } = useStudentPoints(user?.id);
  const markComplete = useMarkLessonComplete();
  const { checkAndAwardBadges, updateStudentStats } = useBadgeSystem();
  
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null);
  
  const completedLessonIds = new Set(progress?.map(p => p.lesson_id) || []);
  const isCompleted = lesson ? completedLessonIds.has(lesson.id) : false;
  
  // Get current lesson index and adjacent lessons
  const currentLessonIndex = lessons?.findIndex(l => l.slug === lessonSlug) ?? -1;
  const prevLesson = currentLessonIndex > 0 ? lessons?.[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < (lessons?.length || 0) - 1 
    ? lessons?.[currentLessonIndex + 1] 
    : null;
  
  const breadcrumbItems = [
    { label: "Educacional", href: "/educacional" },
    { label: course?.title || "Curso", href: `/educacional/curso/${courseSlug}` },
    { label: module?.title || "Módulo", href: `/educacional/modulo/${courseSlug}/${moduleSlug}` },
    { label: lesson?.title || "Lição" }
  ];

  const handleMarkComplete = async () => {
    if (!user || !lesson) {
      toast.error("Você precisa estar logado para marcar como concluído");
      return;
    }
    
    try {
      // 1. Mark the lesson as complete
      await markComplete.mutateAsync({ userId: user.id, lessonId: lesson.id });
      
      // 2. Update student stats
      await updateStudentStats(user.id, {
        lessons_completed: 1, // Will be incremented
        total_points: 10, // Points for completing a lesson
      });
      
      // 3. Check if this completes the module
      const completedAfter = completedLessonIds.size + 1;
      const totalLessons = lessons?.length || 0;
      const moduleComplete = completedAfter >= totalLessons;
      
      if (moduleComplete) {
        await updateStudentStats(user.id, {
          modules_completed: 1,
          total_points: 50, // Bonus points for module completion
        });
      }
      
      // 4. Check and award badges
      const userEmail = user.email || "";
      const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Aluno";
      
      const { newBadges } = await checkAndAwardBadges(
        user.id,
        userEmail,
        userName,
        studentPoints || null
      );
      
      // 5. Show badge modal if earned
      if (newBadges.length > 0) {
        setEarnedBadge(newBadges[0]);
        setShowBadgeModal(true);
      } else {
        toast.success("Lição marcada como concluída! +10 pontos");
      }
      
      // 6. Navigate to next lesson after modal or immediately
      if (nextLesson && newBadges.length === 0) {
        navigate(`/educacional/licao/${courseSlug}/${moduleSlug}/${nextLesson.slug}`);
      }
    } catch (error) {
      toast.error("Erro ao salvar progresso");
    }
  };

  const handleBadgeModalClose = () => {
    setShowBadgeModal(false);
    setEarnedBadge(null);
    
    // Navigate to next lesson after closing modal
    if (nextLesson) {
      navigate(`/educacional/licao/${courseSlug}/${moduleSlug}/${nextLesson.slug}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 pt-32 pb-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-12 w-full mb-8" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!lesson || !module || !course) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 pt-32 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Lição não encontrada</h1>
            <Link to={`/educacional/modulo/${courseSlug}/${moduleSlug}`}>
              <Button>Voltar ao módulo</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={`${lesson.title} | ${module.title} | Amazonia Research`}
        description={`Lição ${currentLessonIndex + 1} do módulo ${module.title}`}
        url={`/educacional/licao/${courseSlug}/${moduleSlug}/${lessonSlug}`}
      />
      
      <Navbar />
      
      {/* Badge Unlock Modal */}
      <BadgeUnlockModal 
        badge={earnedBadge} 
        open={showBadgeModal} 
        onClose={handleBadgeModalClose} 
      />
      
      {/* Header */}
      <section className="pt-32 pb-8 bg-gradient-hero">
        <div className="container mx-auto px-6 max-w-4xl">
          <ScrollReveal>
            <Breadcrumb items={breadcrumbItems} className="mb-6 text-muted-foreground" />
            
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-muted-foreground">
                    Lição {currentLessonIndex + 1} de {lessons?.length}
                  </span>
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-sm text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                      Concluída
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {lesson.title}
                </h1>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{lesson.duration_minutes} min de leitura</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      
      {/* Content */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-6 max-w-4xl">
          <ScrollReveal>
            {/* Video if available */}
            {lesson.video_url && (
              <div className="aspect-video mb-8 rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={lesson.video_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            
            {/* Lesson Content */}
            <Card className="bg-card border-border">
              <CardContent className="p-8">
                <article className="prose prose-invert prose-lg max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {lesson.content}
                  </ReactMarkdown>
                </article>
              </CardContent>
            </Card>
            
            {/* Complete Button */}
            {user && !isCompleted && (
              <div className="mt-8 text-center">
                <Button 
                  size="lg" 
                  onClick={handleMarkComplete}
                  disabled={markComplete.isPending}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {markComplete.isPending ? "Salvando..." : "Marcar como Concluída"}
                </Button>
              </div>
            )}
            
            {!user && (
              <div className="mt-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Faça login para salvar seu progresso
                </p>
                <Link to="/auth">
                  <Button variant="outline">Entrar</Button>
                </Link>
              </div>
            )}
            
            {/* Navigation */}
            <div className="flex justify-between mt-12 pt-8 border-t border-border">
              {prevLesson ? (
                <Link to={`/educacional/licao/${courseSlug}/${moduleSlug}/${prevLesson.slug}`}>
                  <Button variant="outline" className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Lição Anterior</span>
                    <span className="sm:hidden">Anterior</span>
                  </Button>
                </Link>
              ) : (
                <Link to={`/educacional/modulo/${courseSlug}/${moduleSlug}`}>
                  <Button variant="outline" className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Voltar ao Módulo</span>
                    <span className="sm:hidden">Módulo</span>
                  </Button>
                </Link>
              )}
              
              {nextLesson ? (
                <Link to={`/educacional/licao/${courseSlug}/${moduleSlug}/${nextLesson.slug}`}>
                  <Button className="gap-2">
                    <span className="hidden sm:inline">Próxima Lição</span>
                    <span className="sm:hidden">Próxima</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link to={`/educacional/modulo/${courseSlug}/${moduleSlug}`}>
                  <Button className="gap-2">
                    <span className="hidden sm:inline">Concluir Módulo</span>
                    <span className="sm:hidden">Concluir</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Lesson;
