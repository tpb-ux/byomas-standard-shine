import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStudentPoints, useStudentBadges, useBadges, useUserCertificates } from "@/hooks/useEducation";
import { SEOHead } from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Mail, Award, Trophy, BookOpen, Target, 
  Calendar, Save, Loader2, ArrowLeft, GraduationCap,
  Star, Flame, CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    avatar_url: profile?.avatar_url || "",
  });

  // Fetch student data
  const { data: studentPoints, isLoading: pointsLoading } = useStudentPoints(user?.id);
  const { data: studentBadges, isLoading: badgesLoading } = useStudentBadges(user?.id);
  const { data: allBadges } = useBadges();
  const { data: certificates, isLoading: certificatesLoading } = useUserCertificates(user?.id);

  // Get earned badge details
  const earnedBadges = studentBadges?.map(sb => {
    const badge = allBadges?.find(b => b.id === sb.badge_id);
    return badge ? { ...badge, earned_at: sb.earned_at } : null;
  }).filter(Boolean) || [];

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          avatar_url: data.avatar_url || null,
        })
        .eq("id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      refreshProfile();
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  // Redirect if not logged in
  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  const isLoading = authLoading || pointsLoading || badgesLoading || certificatesLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Meu Perfil | Amazonia Research"
        description="Gerencie seu perfil, visualize suas conquistas e acompanhe seu progresso."
        noIndex
      />

      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <div className="flex items-center gap-6">
              {isLoading ? (
                <Skeleton className="h-24 w-24 rounded-full" />
              ) : (
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-5 w-32" />
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-foreground">
                      {profile?.full_name || "Usuário"}
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user?.email}
                    </p>
                    {studentPoints && (
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3" />
                          Nível {studentPoints.level || 1}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Trophy className="h-3 w-3" />
                          {studentPoints.total_points || 0} pontos
                        </Badge>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-2">
                <Award className="h-4 w-4" />
                Conquistas
              </TabsTrigger>
              <TabsTrigger value="certificates" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Certificados
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Atualize suas informações de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user?.email || ""} disabled />
                      <p className="text-xs text-muted-foreground mt-1">
                        O email não pode ser alterado
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="full_name">Nome Completo</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({ ...formData, full_name: e.target.value })
                        }
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="avatar_url">URL do Avatar</Label>
                      <Input
                        id="avatar_url"
                        value={formData.avatar_url}
                        onChange={(e) =>
                          setFormData({ ...formData, avatar_url: e.target.value })
                        }
                        placeholder="https://exemplo.com/avatar.jpg"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Cole o link de uma imagem para usar como avatar
                      </p>
                    </div>
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Stats Card */}
              {studentPoints && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Estatísticas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <BookOpen className="h-6 w-6 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">{studentPoints.lessons_completed || 0}</p>
                        <p className="text-xs text-muted-foreground">Lições Completas</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-2" />
                        <p className="text-2xl font-bold">{studentPoints.quizzes_passed || 0}</p>
                        <p className="text-xs text-muted-foreground">Quizzes Aprovados</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Flame className="h-6 w-6 mx-auto text-orange-500 mb-2" />
                        <p className="text-2xl font-bold">{studentPoints.login_streak || 0}</p>
                        <p className="text-xs text-muted-foreground">Dias Seguidos</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Award className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
                        <p className="text-2xl font-bold">{earnedBadges.length}</p>
                        <p className="text-xs text-muted-foreground">Badges Conquistados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Minhas Conquistas
                  </CardTitle>
                  <CardDescription>
                    Badges e conquistas que você desbloqueou
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                      ))}
                    </div>
                  ) : earnedBadges.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {earnedBadges.map((badge: any) => (
                        <div
                          key={badge.id}
                          className="p-4 border rounded-lg text-center hover:border-primary/50 transition-colors"
                          style={{ borderColor: badge.color + "40" }}
                        >
                          <div 
                            className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3"
                            style={{ backgroundColor: badge.color + "20" }}
                          >
                            <Award className="h-6 w-6" style={{ color: badge.color }} />
                          </div>
                          <h4 className="font-semibold text-sm">{badge.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            +{badge.points} pts
                          </Badge>
                          {badge.earned_at && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(badge.earned_at), "d MMM yyyy", { locale: ptBR })}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Você ainda não conquistou nenhum badge.
                      </p>
                      <Button asChild>
                        <Link to="/educacional">Começar a Aprender</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Certificates Tab */}
            <TabsContent value="certificates">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Meus Certificados
                  </CardTitle>
                  <CardDescription>
                    Certificados de conclusão dos cursos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24" />
                      ))}
                    </div>
                  ) : certificates && certificates.length > 0 ? (
                    <div className="space-y-4">
                      {certificates.map((cert: any) => (
                        <div
                          key={cert.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <GraduationCap className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{cert.courses?.title}</h4>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {cert.issued_at && format(new Date(cert.issued_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/educacional/certificado/${cert.certificate_code}`}>
                              Ver Certificado
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Você ainda não possui certificados.
                      </p>
                      <Button asChild>
                        <Link to="/educacional">Explorar Cursos</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
