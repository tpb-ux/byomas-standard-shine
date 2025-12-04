import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { SEOHead, OrganizationSchema } from "@/components/SEOHead";
import { useBlogArticles } from "@/hooks/useBlogArticles";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Leaf, TrendingUp, Globe, Zap, BookOpen, Clock, Eye } from "lucide-react";

const Index = () => {
  console.log("[Index] Rendering Index page");
  const { data: articles, isLoading } = useBlogArticles();
  const latestArticles = articles?.slice(0, 6) || [];

  // Fetch pillar pages for the home section
  const { data: pillarPages, isLoading: isPillarLoading } = useQuery({
    queryKey: ["pillar-pages-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pillar_pages")
        .select("id, title, slug, excerpt, featured_image, reading_time, views, main_keyword")
        .eq("status", "published")
        .order("views", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const categories = [
    { name: "Crédito de Carbono", icon: Leaf, slug: "credito-carbono" },
    { name: "Green Tokens", icon: Zap, slug: "green-tokens" },
    { name: "Mercado ReFi", icon: TrendingUp, slug: "refi" },
    { name: "Sustentabilidade", icon: Globe, slug: "sustentabilidade" },
  ];

  const metrics = [
    { value: "4+", label: "anos", description: "De análise do mercado de carbono" },
    { value: "500+", label: "artigos", description: "Publicados sobre economia verde" },
    { value: "50K+", label: "leitores", description: "Mensais engajados" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* SEO */}
      <SEOHead
        title="Amazonia Research - Insights de Finanças Sustentáveis e Mercado Verde"
        description="Sua fonte de inteligência sobre crédito de carbono, tokenização verde, finanças regenerativas e economia sustentável. Análises, tendências e insights do mercado verde."
        url="/"
        keywords={["crédito de carbono", "green tokens", "tokenização verde", "finanças regenerativas", "ReFi", "sustentabilidade", "mercado de carbono", "economia verde"]}
      />
      <OrganizationSchema />

      <Navbar />
      <Hero />

      {/* Metrics Section */}
      <ScrollReveal>
        <section className="py-16 md:py-20 bg-card border-y border-border">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {metrics.map((metric, index) => (
                <div key={index} className="text-center md:text-left">
                  <div className="flex items-baseline justify-center md:justify-start gap-2 mb-2">
                    <span className="text-5xl md:text-6xl font-bold text-primary">
                      {metric.value}
                    </span>
                    <span className="text-lg text-muted-foreground">
                      {metric.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>
      
      {/* Latest Articles Section */}
      <ScrollReveal>
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <span className="text-xs font-medium uppercase tracking-widest text-primary mb-2 block">
                  INSIGHTS
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Últimos Artigos
                </h2>
                <p className="text-muted-foreground">
                  Análises e insights do mercado de finanças sustentáveis
                </p>
              </div>
              <Link to="/blog">
                <Button 
                  variant="outline" 
                  className="hidden md:flex items-center gap-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                >
                  Ver todos <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="border border-border">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-6">
                      <Skeleton className="h-3 w-16 mb-3" />
                      <Skeleton className="h-4 w-24 mb-3" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4 mt-1" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : latestArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {latestArticles.map((article) => (
                  <BlogCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-border">
                <p className="text-muted-foreground mb-4">
                  Nenhum artigo publicado ainda.
                </p>
                <Link to="/blog">
                  <Button variant="outline" className="border-foreground text-foreground hover:bg-foreground hover:text-background">
                    Explorar Blog
                  </Button>
                </Link>
              </div>
            )}

            <div className="mt-8 text-center md:hidden">
              <Link to="/blog">
                <Button 
                  variant="outline" 
                  className="items-center gap-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                >
                  Ver todos os artigos <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Pillar Pages / Guias Completos Section */}
      {pillarPages && pillarPages.length > 0 && (
        <ScrollReveal>
          <section className="py-16 md:py-24 bg-card border-y border-border">
            <div className="container mx-auto px-6">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <span className="text-xs font-medium uppercase tracking-widest text-primary mb-2 block">
                    GUIAS COMPLETOS
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    Aprenda do Zero ao Avançado
                  </h2>
                  <p className="text-muted-foreground">
                    Conteúdo aprofundado para dominar o mercado verde
                  </p>
                </div>
                <Link to="/guias">
                  <Button 
                    variant="outline" 
                    className="hidden md:flex items-center gap-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  >
                    Ver todos <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isPillarLoading ? (
                  [...Array(4)].map((_, i) => (
                    <Card key={i} className="border border-border">
                      <Skeleton className="h-32 w-full" />
                      <CardContent className="p-4">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-full" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  pillarPages.map((page) => (
                    <Link key={page.id} to={`/guia/${page.slug}`} className="group">
                      <Card className="h-full border border-border hover:border-primary/50 transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-primary/10 rounded">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            {page.main_keyword && (
                              <Badge variant="outline" className="text-xs">
                                {page.main_keyword}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {page.title}
                          </h3>
                          {page.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {page.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {page.reading_time || 15} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {page.views || 0}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>

              <div className="mt-8 text-center md:hidden">
                <Link to="/guias">
                  <Button 
                    variant="outline" 
                    className="items-center gap-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  >
                    Ver todos os guias <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Categories Section */}
      <ScrollReveal>
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-medium uppercase tracking-widest text-primary mb-2 block">
                CATEGORIAS
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Explore por Tema
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/blog?category=${category.slug}`}
                  className="group"
                >
                  <Card className="h-full border border-border hover:border-primary/50 transition-all duration-300">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="p-4 bg-primary/10 mb-4 transition-transform group-hover:scale-110">
                        <category.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <span className="flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors mt-3">
                        EXPLORAR
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Newsletter Section */}
      <ScrollReveal>
        <section className="py-16 md:py-24 bg-card border-t border-border">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <span className="text-xs font-medium uppercase tracking-widest text-primary mb-2 block">
                NEWSLETTER
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Fique por dentro do mercado verde
              </h2>
              <p className="text-muted-foreground mb-8">
                Receba análises exclusivas, tendências do mercado de carbono e 
                insights sobre finanças regenerativas diretamente no seu email.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap">
                  Inscrever-se
                </Button>
              </form>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <Footer />
    </div>
  );
};

export default Index;
