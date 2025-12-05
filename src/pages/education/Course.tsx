import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import Breadcrumb from "@/components/Breadcrumb";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Clock, 
  Award, 
  CheckCircle2, 
  Lock, 
  PlayCircle,
  GraduationCap
} from "lucide-react";
import { useCourse, useCourseModules, useStudentProgress } from "@/hooks/useEducation";
import { useAuth } from "@/hooks/useAuth";

const Course = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  
  const { data: course, isLoading: courseLoading } = useCourse(slug || "");
  const { data: modules, isLoading: modulesLoading } = useCourseModules(course?.id);
  const { data: progress } = useStudentProgress(user?.id, course?.id);
  
  const isLoading = courseLoading || modulesLoading;
  
  const completedLessons = progress?.length || 0;
  const totalLessons = 21; // This should come from actual lesson count
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  
  const breadcrumbItems = [
    { label: "Educacional", href: "/educacional" },
    { label: course?.title || "Curso" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 pt-32 pb-16">
          <div className="container mx-auto px-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-12 w-full max-w-2xl mb-8" />
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 pt-32 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Curso não encontrado</h1>
            <Link to="/">
              <Button>Voltar ao início</Button>
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
        title={`${course.title} | Amazonia Research Educacional`}
        description={course.description || "Curso completo sobre crédito de carbono e mercado verde."}
        url={`/educacional/curso/${slug}`}
        keywords={["curso crédito carbono", "educação sustentabilidade", "mercado carbono"]}
      />
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-hero">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <Breadcrumb items={breadcrumbItems} className="mb-6 text-muted-foreground" />
            
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1">
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                  {course.is_free ? "Gratuito" : "Premium"}
                </Badge>
                
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  {course.title}
                </h1>
                
                <p className="text-xl text-muted-foreground mb-6 max-w-2xl">
                  {course.description}
                </p>
                
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-8">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>{modules?.length || 0} Módulos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{course.duration_hours}h de conteúdo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span>Certificado incluso</span>
                  </div>
                </div>
                
                {user ? (
                  <Link to={modules?.[0] ? `/educacional/modulo/${course.slug}/${modules[0].slug}` : "#"}>
                    <Button size="lg" className="gap-2">
                      <PlayCircle className="h-5 w-5" />
                      {progressPercent > 0 ? "Continuar Jornada" : "Começar Jornada"}
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth">
                    <Button size="lg" className="gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Criar conta para começar
                    </Button>
                  </Link>
                )}
              </div>
              
              {/* Progress Card */}
              {user && (
                <Card className="w-full lg:w-80 bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Seu Progresso
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Conclusão</span>
                          <span className="font-medium text-foreground">{progressPercent}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {completedLessons} de {totalLessons} lições concluídas
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
      
      {/* Modules Section */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Conteúdo do Curso
            </h2>
            
            <div className="space-y-4">
              {modules?.map((module, index) => {
                const isFirstModule = index === 0;
                const isLocked = !user && !isFirstModule;
                
                return (
                  <Card 
                    key={module.id} 
                    className={`bg-card border-border transition-all ${
                      isLocked ? "opacity-60" : "hover:border-primary/50"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isLocked 
                            ? "bg-muted text-muted-foreground" 
                            : "bg-primary/20 text-primary"
                        }`}>
                          {isLocked ? (
                            <Lock className="h-5 w-5" />
                          ) : (
                            <span className="font-bold">{index + 1}</span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-1">
                            {module.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {module.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {module.duration_minutes} min
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          {isLocked ? (
                            <Badge variant="outline" className="text-muted-foreground">
                              Bloqueado
                            </Badge>
                          ) : (
                            <Link to={`/educacional/modulo/${course.slug}/${module.slug}`}>
                              <Button variant="outline" size="sm" className="gap-2">
                                <PlayCircle className="h-4 w-4" />
                                Acessar
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Certificate Info */}
            <Card className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
              <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <Award className="h-10 w-10 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Certificado de Conclusão
                  </h3>
                  <p className="text-muted-foreground">
                    Ao completar todos os módulos e passar nas avaliações, você receberá um certificado 
                    verificável da Amazonia Research, comprovando seu conhecimento em crédito de carbono.
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Course;
