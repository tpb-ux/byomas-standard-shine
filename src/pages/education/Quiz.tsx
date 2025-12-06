import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  XCircle,
  Award,
  RotateCcw,
  ChevronRight
} from "lucide-react";
import { useCourse, useModule, useModuleQuiz, useSubmitQuizAttempt, useQuizAttempts, useStudentPoints, Badge } from "@/hooks/useEducation";
import { useAuth } from "@/hooks/useAuth";
import { useBadgeSystem } from "@/hooks/useBadgeSystem";
import { BadgeUnlockModal } from "@/components/education/BadgeUnlockModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Quiz = () => {
  const { courseSlug, moduleSlug } = useParams<{ courseSlug: string; moduleSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: course } = useCourse(courseSlug || "");
  const { data: module, isLoading: moduleLoading } = useModule(course?.id, moduleSlug || "");
  const { data: quiz, isLoading: quizLoading } = useModuleQuiz(module?.id);
  const { data: attempts } = useQuizAttempts(user?.id, quiz?.id);
  const { data: studentPoints } = useStudentPoints(user?.id);
  const submitAttempt = useSubmitQuizAttempt();
  const { checkAndAwardBadges, updateStudentStats, awardPerfectScoreBadge } = useBadgeSystem();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null);
  
  const isLoading = moduleLoading || quizLoading;
  const questions = quiz?.questions || [];
  const passingScore = quiz?.passing_score || 70;
  const maxAttempts = quiz?.max_attempts || 3;
  const attemptsUsed = attempts?.length || 0;
  const hasPassed = attempts?.some(a => a.passed) || false;
  const canAttempt = attemptsUsed < maxAttempts && !hasPassed;

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleSubmit = async () => {
    if (!user || !quiz) {
      toast.error("Você precisa estar logado para fazer a avaliação");
      return;
    }
    
    // Calculate score
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        correct++;
      }
    });
    
    const finalScore = Math.round((correct / questions.length) * 100);
    const passed = finalScore >= passingScore;
    const isPerfectScore = finalScore === 100;
    
    setScore(finalScore);
    setShowResults(true);
    
    try {
      await submitAttempt.mutateAsync({
        userId: user.id,
        quizId: quiz.id,
        score: finalScore,
        answers,
        passed,
      });
      
      if (passed) {
        toast.success("Parabéns! Você passou na avaliação!");
        
        // Update student stats
        const pointsEarned = isPerfectScore ? 100 : 50;
        await updateStudentStats(user.id, {
          quizzes_passed: 1,
          total_points: pointsEarned,
        });
        
        // Check for perfect score badge
        const userEmail = user.email || "";
        const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Aluno";
        
        if (isPerfectScore) {
          const perfectBadge = await awardPerfectScoreBadge(user.id, userEmail, userName);
          if (perfectBadge) {
            setEarnedBadge(perfectBadge);
            setShowBadgeModal(true);
          }
        }
        
        // Check for other badges
        const { newBadges } = await checkAndAwardBadges(
          user.id,
          userEmail,
          userName,
          studentPoints || null
        );
        
        // Show first earned badge if not showing perfect badge
        if (!isPerfectScore && newBadges.length > 0) {
          setEarnedBadge(newBadges[0]);
          setShowBadgeModal(true);
        }
        
        // Send quiz passed notification
        supabase.functions.invoke("send-education-notification", {
          body: {
            type: "quiz_passed",
            userEmail,
            userName,
            data: {
              moduleName: module?.title,
              courseName: course?.title,
              quizScore: finalScore,
              pointsEarned,
            },
          },
        }).catch(err => console.error("Failed to send quiz notification:", err));
        
      } else {
        toast.error(`Você não atingiu a nota mínima de ${passingScore}%`);
      }
    } catch (error) {
      toast.error("Erro ao salvar resultado");
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setScore(0);
  };

  const handleBadgeModalClose = () => {
    setShowBadgeModal(false);
    setEarnedBadge(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 pt-32 pb-16">
          <div className="container mx-auto px-6 max-w-3xl">
            <Skeleton className="h-12 w-full mb-8" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!quiz || !module || !course) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 pt-32 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Avaliação não encontrada</h1>
            <Link to={`/educacional/modulo/${courseSlug}/${moduleSlug}`}>
              <Button>Voltar ao módulo</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show results screen
  if (showResults) {
    const passed = score >= passingScore;
    
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SEOHead
          title={`Resultado | ${quiz.title} | Amazonia Research`}
          description="Resultado da avaliação"
          url={`/educacional/quiz/${courseSlug}/${moduleSlug}`}
        />
        
        <Navbar />
        
        {/* Badge Unlock Modal */}
        <BadgeUnlockModal 
          badge={earnedBadge} 
          open={showBadgeModal} 
          onClose={handleBadgeModalClose} 
        />
        
        <section className="pt-32 pb-16 flex-1">
          <div className="container mx-auto px-6 max-w-2xl">
            <ScrollReveal>
              <Card className="bg-card border-border text-center">
                <CardContent className="p-12">
                  <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
                    passed ? "bg-primary/20" : "bg-destructive/20"
                  }`}>
                    {passed ? (
                      <Award className="h-12 w-12 text-primary" />
                    ) : (
                      <XCircle className="h-12 w-12 text-destructive" />
                    )}
                  </div>
                  
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {passed ? "Parabéns!" : "Não foi dessa vez"}
                  </h1>
                  
                  <p className="text-muted-foreground mb-8">
                    {passed 
                      ? "Você completou a avaliação com sucesso!"
                      : `Você precisa de pelo menos ${passingScore}% para passar.`
                    }
                  </p>
                  
                  <div className="text-6xl font-bold mb-8" style={{ 
                    color: passed ? "hsl(var(--primary))" : "hsl(var(--destructive))" 
                  }}>
                    {score}%
                  </div>
                  
                  {passed && (
                    <p className="text-primary mb-8">
                      +{score === 100 ? "100" : "50"} pontos conquistados!
                    </p>
                  )}
                  
                  <div className="space-y-4">
                    {passed ? (
                      <Link to={`/educacional/modulo/${courseSlug}/${moduleSlug}`}>
                        <Button size="lg" className="gap-2">
                          Continuar Curso
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    ) : canAttempt ? (
                      <Button size="lg" onClick={handleRetry} className="gap-2">
                        <RotateCcw className="h-5 w-5" />
                        Tentar Novamente ({maxAttempts - attemptsUsed - 1} tentativas restantes)
                      </Button>
                    ) : (
                      <div className="text-muted-foreground">
                        <p>Você usou todas as suas tentativas.</p>
                        <Link to={`/educacional/modulo/${courseSlug}/${moduleSlug}`}>
                          <Button variant="outline" className="mt-4">
                            Voltar ao Módulo
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </section>
        
        <Footer />
      </div>
    );
  }

  // Already passed
  if (hasPassed) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <section className="pt-32 pb-16 flex-1">
          <div className="container mx-auto px-6 max-w-2xl">
            <Card className="bg-card border-border text-center">
              <CardContent className="p-12">
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Avaliação já concluída!
                </h1>
                <p className="text-muted-foreground mb-8">
                  Você já passou nesta avaliação. Continue sua jornada no curso.
                </p>
                <Link to={`/educacional/modulo/${courseSlug}/${moduleSlug}`}>
                  <Button size="lg">Voltar ao Módulo</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  // Quiz interface
  const currentQ = questions[currentQuestion];
  const progressPercent = ((currentQuestion + 1) / questions.length) * 100;
  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={`${quiz.title} | Amazonia Research`}
        description={quiz.description || "Avaliação do módulo"}
        url={`/educacional/quiz/${courseSlug}/${moduleSlug}`}
      />
      
      <Navbar />
      
      <section className="pt-32 pb-16 flex-1">
        <div className="container mx-auto px-6 max-w-3xl">
          <ScrollReveal>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {quiz.title}
              </h1>
              <p className="text-muted-foreground mb-4">
                Módulo: {module.title}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>Questão {currentQuestion + 1} de {questions.length}</span>
                <span>•</span>
                <span>Nota mínima: {passingScore}%</span>
              </div>
              
              <Progress value={progressPercent} className="h-2" />
            </div>
            
            {/* Question Card */}
            {currentQ && (
              <Card className="bg-card border-border mb-8">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {currentQ.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={answers[currentQ.id]?.toString()}
                    onValueChange={(value) => handleAnswer(currentQ.id, parseInt(value))}
                    className="space-y-3"
                  >
                    {currentQ.options.map((option, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                          answers[currentQ.id] === index
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )}
            
            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                Anterior
              </Button>
              
              {currentQuestion < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  disabled={answers[currentQ?.id] === undefined}
                >
                  Próxima
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitAttempt.isPending}
                >
                  {submitAttempt.isPending ? "Enviando..." : "Finalizar Avaliação"}
                </Button>
              )}
            </div>
            
            {/* Question Navigator */}
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Navegação rápida:</p>
              <div className="flex flex-wrap gap-2">
                {questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentQuestion === index
                        ? "bg-primary text-primary-foreground"
                        : answers[q.id] !== undefined
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Quiz;
