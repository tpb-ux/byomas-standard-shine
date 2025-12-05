import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import Breadcrumb from "@/components/Breadcrumb";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Clock, 
  Award, 
  GraduationCap,
  Leaf,
  TrendingUp
} from "lucide-react";
import { useCourses } from "@/hooks/useEducation";

const Education = () => {
  const { data: courses, isLoading } = useCourses();
  
  const breadcrumbItems = [{ label: "Educacional" }];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Educacional | Cursos sobre Crédito de Carbono | Amazonia Research"
        description="Aprenda sobre crédito de carbono, mercado verde e sustentabilidade com nossos cursos gratuitos. Certificados inclusos."
        url="/educacional"
        keywords={["curso crédito carbono", "educação sustentabilidade", "mercado carbono", "certificação"]}
      />
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-hero">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <Breadcrumb items={breadcrumbItems} className="mb-6 justify-center text-muted-foreground" />
            
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-xs font-medium tracking-widest text-primary mb-4 block">
                AMAZONIA RESEARCH EDUCACIONAL
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Aprenda sobre <span className="text-primary">Crédito de Carbono</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Cursos completos e gratuitos para você dominar o mercado de carbono 
                e contribuir para um futuro mais sustentável.
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>Conteúdo estruturado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>Certificados grátis</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <span>Aprenda no seu ritmo</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Leaf className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Sustentabilidade
                </h3>
                <p className="text-muted-foreground text-sm">
                  Aprenda conceitos fundamentais sobre meio ambiente e mudanças climáticas.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Mercado de Carbono
                </h3>
                <p className="text-muted-foreground text-sm">
                  Entenda como funciona o mercado de créditos de carbono no Brasil e no mundo.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Certificação
                </h3>
                <p className="text-muted-foreground text-sm">
                  Receba certificados verificáveis ao completar nossos cursos.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      
      {/* Courses Section */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Nossos Cursos
            </h2>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-72" />
                ))}
              </div>
            ) : courses?.length ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <Link key={course.id} to={`/educacional/curso/${course.slug}`}>
                    <Card className="bg-card border-border hover:border-primary/50 transition-all h-full group">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-primary/20 text-primary border-primary/30">
                            {course.is_free ? "Gratuito" : "Premium"}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{course.duration_hours}h</span>
                          </div>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {course.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                          {course.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <GraduationCap className="h-4 w-4" />
                          <span>Começar curso</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhum curso disponível no momento.
                </p>
              </div>
            )}
          </ScrollReveal>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-card border-t border-border">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Pronto para começar?
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  Nossos cursos são completamente gratuitos e você pode começar agora mesmo. 
                  Basta criar uma conta para acompanhar seu progresso e receber seu certificado.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/auth">
                    <Button size="lg" className="gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Criar conta gratuita
                    </Button>
                  </Link>
                  {courses?.[0] && (
                    <Link to={`/educacional/curso/${courses[0].slug}`}>
                      <Button variant="outline" size="lg">
                        Ver primeiro curso
                      </Button>
                    </Link>
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
};

export default Education;
