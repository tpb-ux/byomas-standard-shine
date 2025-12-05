import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import ScrollReveal from "@/components/ScrollReveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  BookOpen,
  Award,
  GraduationCap,
  Trophy,
  ArrowRight,
  Target,
  Flame,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useStudentPoints,
  useStudentBadges,
  useBadges,
  useStudentActivityLog,
  useUserCertificates,
  useCourses,
} from "@/hooks/useEducation";
import { PointsDisplay, getLevelInfo } from "@/components/education/PointsDisplay";
import { BadgeGrid } from "@/components/education/BadgeGrid";
import { ActivityFeed } from "@/components/education/ActivityFeed";
import { cn } from "@/lib/utils";

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const { data: points, isLoading: loadingPoints } = useStudentPoints(user?.id);
  const { data: studentBadges, isLoading: loadingStudentBadges } = useStudentBadges(user?.id);
  const { data: allBadges, isLoading: loadingBadges } = useBadges();
  const { data: activities, isLoading: loadingActivities } = useStudentActivityLog(user?.id);
  const { data: certificates, isLoading: loadingCertificates } = useUserCertificates(user?.id);
  const { data: courses } = useCourses();

  const isLoading = loadingPoints || loadingStudentBadges || loadingBadges;
  const levelInfo = getLevelInfo(points?.total_points || 0);

  const stats = [
    {
      icon: Star,
      label: "Pontos",
      value: points?.total_points || 0,
      color: "text-primary",
    },
    {
      icon: BookOpen,
      label: "Lições",
      value: points?.lessons_completed || 0,
      color: "text-blue-500",
    },
    {
      icon: Award,
      label: "Badges",
      value: studentBadges?.length || 0,
      color: "text-purple-500",
    },
    {
      icon: Flame,
      label: "Sequência",
      value: `${points?.login_streak || 0} dias`,
      color: "text-orange-500",
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 pt-32 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Acesso Restrito
            </h1>
            <p className="text-muted-foreground mb-8">
              Faça login para acessar seu dashboard.
            </p>
            <Link to="/auth">
              <Button>Fazer Login</Button>
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
        title="Meu Dashboard | Amazonia Research"
        description="Acompanhe seu progresso, badges conquistados e atividades na plataforma educacional"
        url="/minha-conta"
      />

      <Navbar />

      <section className="pt-32 pb-16 flex-1">
        <div className="container mx-auto px-6 max-w-6xl">
          <ScrollReveal>
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  👋 Olá, {profile?.full_name || "Estudante"}!
                </h1>
                <p className="text-muted-foreground">
                  Nível {levelInfo.level} - {levelInfo.name}
                </p>
              </div>
              <div className="flex gap-3">
                <Link to="/educacional/ranking">
                  <Button variant="outline" className="gap-2">
                    <Trophy className="h-4 w-4" />
                    Ranking
                  </Button>
                </Link>
                <Link to="/educacional">
                  <Button className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Continuar Estudando
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Overview */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={cn("p-3 rounded-full bg-muted", stat.color)}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {stat.value}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {stat.label}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Level Progress */}
            {points && levelInfo.pointsToNext > 0 && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">
                        Progresso para Nível {levelInfo.level + 1}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {levelInfo.pointsToNext} pts restantes
                    </span>
                  </div>
                  <Progress value={levelInfo.progress} className="h-3" />
                </CardContent>
              </Card>
            )}

            {/* Main Content Tabs */}
            <Tabs defaultValue="progress" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="progress">Progresso</TabsTrigger>
                <TabsTrigger value="badges">Badges</TabsTrigger>
                <TabsTrigger value="certificates">Certificados</TabsTrigger>
                <TabsTrigger value="activity">Atividades</TabsTrigger>
              </TabsList>

              {/* Progress Tab */}
              <TabsContent value="progress" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Meus Cursos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {courses?.map((course) => {
                      // Calculate progress (simplified - would need actual progress data)
                      const progress = Math.floor(
                        ((points?.lessons_completed || 0) / 22) * 100
                      );

                      return (
                        <div
                          key={course.id}
                          className="p-4 border border-border rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-foreground">
                                {course.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {course.duration_hours}h de conteúdo
                              </p>
                            </div>
                            <Link
                              to={`/educacional/curso/${course.slug}`}
                            >
                              <Button size="sm" variant="outline" className="gap-1">
                                Continuar
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Progresso
                              </span>
                              <span className="font-medium text-primary">
                                {progress}%
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </div>
                      );
                    })}
                    {!courses?.length && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhum curso disponível no momento.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <PointsDisplay points={points} showStats />
              </TabsContent>

              {/* Badges Tab */}
              <TabsContent value="badges">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-500" />
                      Meus Badges
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({studentBadges?.length || 0}/{allBadges?.length || 0} conquistados)
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingBadges ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <Skeleton key={i} className="h-32" />
                        ))}
                      </div>
                    ) : allBadges?.length ? (
                      <BadgeGrid
                        badges={allBadges}
                        studentBadges={studentBadges}
                        progress={{
                          complete_lessons: points?.lessons_completed || 0,
                          pass_quiz: points?.quizzes_passed || 0,
                          complete_modules: points?.modules_completed || 0,
                          complete_courses: points?.courses_completed || 0,
                          login_streak: points?.login_streak || 0,
                        }}
                        showProgress
                        size="md"
                        columns={4}
                      />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhum badge disponível.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Certificates Tab */}
              <TabsContent value="certificates">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-pink-500" />
                      Meus Certificados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingCertificates ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-24" />
                        ))}
                      </div>
                    ) : certificates?.length ? (
                      <div className="space-y-4">
                        {certificates.map((cert: any) => (
                          <div
                            key={cert.id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-pink-500/10 rounded-full">
                                <GraduationCap className="h-6 w-6 text-pink-500" />
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground">
                                  {cert.courses?.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Emitido em{" "}
                                  {new Date(cert.issued_at).toLocaleDateString(
                                    "pt-BR"
                                  )}
                                </p>
                              </div>
                            </div>
                            <Link
                              to={`/educacional/certificado/${cert.certificate_code}`}
                            >
                              <Button variant="outline" size="sm">
                                Ver Certificado
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="mb-2">
                          Você ainda não possui certificados.
                        </p>
                        <p className="text-sm">
                          Complete um curso para receber seu certificado!
                        </p>
                        <Link to="/educacional" className="inline-block mt-4">
                          <Button>Explorar Cursos</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity">
                {loadingActivities ? (
                  <Skeleton className="h-96" />
                ) : (
                  <ActivityFeed
                    activities={activities || []}
                    maxHeight="500px"
                  />
                )}
              </TabsContent>
            </Tabs>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StudentDashboard;