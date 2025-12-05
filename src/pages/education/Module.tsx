import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import Breadcrumb from "@/components/Breadcrumb";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Circle,
  PlayCircle,
  FileQuestion,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useCourse, useCourseModules, useModule, useModuleLessons, useModuleQuiz, useStudentProgress } from "@/hooks/useEducation";
import { useAuth } from "@/hooks/useAuth";

const Module = () => {
  const { courseSlug, moduleSlug } = useParams<{ courseSlug: string; moduleSlug: string }>();
  const { user } = useAuth();
  
  const { data: course } = useCourse(courseSlug || "");
  const { data: modules } = useCourseModules(course?.id);
  const { data: module, isLoading: moduleLoading } = useModule(course?.id, moduleSlug || "");
  const { data: lessons, isLoading: lessonsLoading } = useModuleLessons(module?.id);
  const { data: quiz } = useModuleQuiz(module?.id);
  const { data: progress } = useStudentProgress(user?.id, course?.id);
  
  const isLoading = moduleLoading || lessonsLoading;
  
  const completedLessonIds = new Set(progress?.map(p => p.lesson_id) || []);
  const completedInModule = lessons?.filter(l => completedLessonIds.has(l.id)).length || 0;
  const totalInModule = lessons?.length || 0;
  const moduleProgress = totalInModule > 0 ? Math.round((completedInModule / totalInModule) * 100) : 0;
  
  // Get current module index and adjacent modules
  const currentModuleIndex = modules?.findIndex(m => m.slug === moduleSlug) ?? -1;
  const prevModule = currentModuleIndex > 0 ? modules?.[currentModuleIndex - 1] : null;
  const nextModule = currentModuleIndex >= 0 && currentModuleIndex < (modules?.length || 0) - 1 
    ? modules?.[currentModuleIndex + 1] 
    : null;
  
  const breadcrumbItems = [
    { label: "Educacional", href: "/educacional" },
    { label: course?.title || "Curso", href: `/educacional/curso/${courseSlug}` },
    { label: module?.title || "Módulo" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 pt-32 pb-16">
          <div className="container mx-auto px-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-12 w-full max-w-2xl mb-8" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!module || !course) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 pt-32 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Módulo não encontrado</h1>
            <Link to={`/educacional/curso/${courseSlug}`}>
              <Button>Voltar ao curso</Button>
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
        title={`${module.title} | ${course.title} | Amazonia Research`}
        description={module.description || "Módulo do curso de crédito de carbono."}
        url={`/educacional/modulo/${courseSlug}/${moduleSlug}`}
      />
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-8 bg-gradient-hero">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <Breadcrumb items={breadcrumbItems} className="mb-6 text-muted-foreground" />
            
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1">
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                  Módulo {(currentModuleIndex || 0) + 1}
                </Badge>
                
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {module.title}
                </h1>
                
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                  {module.description}
                </p>
                
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>{lessons?.length || 0} Lições</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{module.duration_minutes} min</span>
                  </div>
                  {quiz && (
                    <div className="flex items-center gap-2">
                      <FileQuestion className="h-4 w-4 text-primary" />
                      <span>Avaliação incluída</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress Card */}
              {user && (
                <Card className="w-full lg:w-72 bg-card border-border">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium text-foreground">{moduleProgress}%</span>
                        </div>
                        <Progress value={moduleProgress} className="h-2" />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {completedInModule} de {totalInModule} lições
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
      
      {/* Lessons Section */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-xl font-bold text-foreground mb-6">
              Lições do Módulo
            </h2>
            
            <div className="space-y-3">
              {lessons?.map((lesson, index) => {
                const isCompleted = completedLessonIds.has(lesson.id);
                
                return (
                  <Link 
                    key={lesson.id}
                    to={`/educacional/licao/${courseSlug}/${moduleSlug}/${lesson.slug}`}
                  >
                    <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? "bg-primary/20 text-primary" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">
                            {lesson.title}
                          </h3>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lesson.duration_minutes} min
                          </span>
                        </div>
                        
                        <PlayCircle className="h-5 w-5 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
              
              {/* Quiz Card */}
              {quiz && (
                <Card className={`bg-card border-border ${
                  moduleProgress === 100 ? "hover:border-primary/50 cursor-pointer" : "opacity-60"
                }`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <FileQuestion className="h-5 w-5 text-accent" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        Avaliação do Módulo
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {moduleProgress === 100 
                          ? "Complete as lições para liberar" 
                          : "Disponível após completar todas as lições"
                        }
                      </span>
                    </div>
                    
                    {moduleProgress === 100 ? (
                      <Link to={`/educacional/quiz/${courseSlug}/${moduleSlug}`}>
                        <Button size="sm">Fazer Avaliação</Button>
                      </Link>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Bloqueado
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between mt-12 pt-8 border-t border-border">
              {prevModule ? (
                <Link to={`/educacional/modulo/${courseSlug}/${prevModule.slug}`}>
                  <Button variant="outline" className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Módulo Anterior
                  </Button>
                </Link>
              ) : (
                <div />
              )}
              
              {nextModule ? (
                <Link to={`/educacional/modulo/${courseSlug}/${nextModule.slug}`}>
                  <Button variant="outline" className="gap-2">
                    Próximo Módulo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link to={`/educacional/curso/${courseSlug}`}>
                  <Button variant="outline" className="gap-2">
                    Voltar ao Curso
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

export default Module;
