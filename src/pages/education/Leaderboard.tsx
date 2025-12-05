import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import ScrollReveal from "@/components/ScrollReveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, Star, ArrowLeft, Crown } from "lucide-react";
import { useLeaderboard, useStudentPoints } from "@/hooks/useEducation";
import { useAuth } from "@/hooks/useAuth";
import { getLevelInfo } from "@/components/education/PointsDisplay";
import { cn } from "@/lib/utils";

const Leaderboard = () => {
  const { user } = useAuth();
  const { data: leaderboard, isLoading } = useLeaderboard(50);
  const { data: myPoints } = useStudentPoints(user?.id);

  // Find current user's rank
  const myRank = leaderboard?.findIndex((entry) => entry.user_id === user?.id) ?? -1;

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Crown className="h-6 w-6 text-amber-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-amber-700" />;
      default:
        return null;
    }
  };

  const getPositionClass = (position: number) => {
    switch (position) {
      case 0:
        return "bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-amber-500/30";
      case 1:
        return "bg-gradient-to-r from-gray-400/20 to-gray-400/5 border-gray-400/30";
      case 2:
        return "bg-gradient-to-r from-amber-700/20 to-amber-700/5 border-amber-700/30";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Ranking dos Alunos | Amazonia Research"
        description="Veja o ranking dos melhores alunos da plataforma educacional Amazonia Research"
        url="/educacional/ranking"
      />

      <Navbar />

      <section className="pt-32 pb-16 flex-1">
        <div className="container mx-auto px-6 max-w-4xl">
          <ScrollReveal>
            {/* Back button */}
            <Link to="/educacional" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Educacional
            </Link>

            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Ranking dos Alunos
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Os melhores alunos da plataforma ordenados por pontuação. 
                Complete lições, passe em quizzes e conquiste badges para subir no ranking!
              </p>
            </div>

            {/* My Position Card */}
            {user && myPoints && myRank >= 0 && (
              <Card className="mb-8 border-primary/30 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-primary">
                        #{myRank + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Sua Posição</p>
                        <p className="text-sm text-muted-foreground">
                          {myPoints.total_points} pontos • Nível {getLevelInfo(myPoints.total_points).level}
                        </p>
                      </div>
                    </div>
                    <Link to="/minha-conta">
                      <Button variant="outline" size="sm">
                        Ver meu progresso
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : !leaderboard?.length ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Nenhum aluno no ranking ainda. Seja o primeiro!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Top 3 Podium */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {/* 2nd place */}
                  <div className="order-1 flex flex-col items-center pt-8">
                    {leaderboard[1] && (
                      <Card className={cn("w-full text-center p-4", getPositionClass(1))}>
                        <div className="flex justify-center mb-2">
                          <Medal className="h-8 w-8 text-gray-400" />
                        </div>
                        <Avatar className="h-16 w-16 mx-auto mb-2">
                          <AvatarFallback className="bg-gray-400/20 text-gray-400">
                            {(leaderboard[1] as any)?.profiles?.full_name?.[0] || "2"}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-semibold text-foreground truncate">
                          {(leaderboard[1] as any)?.profiles?.full_name || "Aluno"}
                        </p>
                        <p className="text-lg font-bold text-gray-400">
                          {leaderboard[1].total_points} pts
                        </p>
                        <Badge variant="secondary" className="mt-2">
                          Nível {leaderboard[1].level}
                        </Badge>
                      </Card>
                    )}
                  </div>

                  {/* 1st place */}
                  <div className="order-2 flex flex-col items-center">
                    {leaderboard[0] && (
                      <Card className={cn("w-full text-center p-4", getPositionClass(0))}>
                        <div className="flex justify-center mb-2">
                          <Crown className="h-10 w-10 text-amber-500" />
                        </div>
                        <Avatar className="h-20 w-20 mx-auto mb-2 ring-4 ring-amber-500/30">
                          <AvatarFallback className="bg-amber-500/20 text-amber-500 text-xl">
                            {(leaderboard[0] as any)?.profiles?.full_name?.[0] || "1"}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-semibold text-foreground truncate">
                          {(leaderboard[0] as any)?.profiles?.full_name || "Aluno"}
                        </p>
                        <p className="text-xl font-bold text-amber-500">
                          {leaderboard[0].total_points} pts
                        </p>
                        <Badge className="mt-2 bg-amber-500/20 text-amber-500 border-amber-500/30">
                          Nível {leaderboard[0].level}
                        </Badge>
                      </Card>
                    )}
                  </div>

                  {/* 3rd place */}
                  <div className="order-3 flex flex-col items-center pt-12">
                    {leaderboard[2] && (
                      <Card className={cn("w-full text-center p-4", getPositionClass(2))}>
                        <div className="flex justify-center mb-2">
                          <Medal className="h-8 w-8 text-amber-700" />
                        </div>
                        <Avatar className="h-14 w-14 mx-auto mb-2">
                          <AvatarFallback className="bg-amber-700/20 text-amber-700">
                            {(leaderboard[2] as any)?.profiles?.full_name?.[0] || "3"}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-semibold text-foreground truncate text-sm">
                          {(leaderboard[2] as any)?.profiles?.full_name || "Aluno"}
                        </p>
                        <p className="text-lg font-bold text-amber-700">
                          {leaderboard[2].total_points} pts
                        </p>
                        <Badge variant="secondary" className="mt-2">
                          Nível {leaderboard[2].level}
                        </Badge>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Rest of the leaderboard */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ranking Completo</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {leaderboard.slice(3).map((entry, index) => {
                        const position = index + 4;
                        const isCurrentUser = entry.user_id === user?.id;
                        const levelInfo = getLevelInfo(entry.total_points);

                        return (
                          <div
                            key={entry.id}
                            className={cn(
                              "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors",
                              isCurrentUser && "bg-primary/5"
                            )}
                          >
                            {/* Position */}
                            <div className="w-10 text-center">
                              <span className={cn(
                                "text-lg font-bold",
                                isCurrentUser ? "text-primary" : "text-muted-foreground"
                              )}>
                                {position}
                              </span>
                            </div>

                            {/* Avatar */}
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-muted">
                                {(entry as any)?.profiles?.full_name?.[0] || "?"}
                              </AvatarFallback>
                            </Avatar>

                            {/* Name & Level */}
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "font-medium truncate",
                                isCurrentUser ? "text-primary" : "text-foreground"
                              )}>
                                {(entry as any)?.profiles?.full_name || "Aluno"}
                                {isCurrentUser && " (você)"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Nível {levelInfo.level} - {levelInfo.name}
                              </p>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm">
                              <div className="text-center">
                                <p className="font-semibold text-foreground">{entry.lessons_completed}</p>
                                <p className="text-xs text-muted-foreground">Lições</p>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold text-foreground">{entry.modules_completed}</p>
                                <p className="text-xs text-muted-foreground">Módulos</p>
                              </div>
                            </div>

                            {/* Points */}
                            <div className="flex items-center gap-1 text-primary font-bold">
                              <Star className="h-4 w-4 fill-primary" />
                              {entry.total_points}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Leaderboard;
