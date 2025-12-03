import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { useBlogArticles } from "@/hooks/useBlogArticles";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Leaf, TrendingUp, Globe, Zap } from "lucide-react";

const Index = () => {
  const { data: articles, isLoading } = useBlogArticles();
  const latestArticles = articles?.slice(0, 6) || [];

  const categories = [
    { name: "Crédito de Carbono", icon: Leaf, slug: "credito-carbono", color: "bg-emerald-500/10 text-emerald-600" },
    { name: "Green Tokens", icon: Zap, slug: "green-tokens", color: "bg-blue-500/10 text-blue-600" },
    { name: "Mercado ReFi", icon: TrendingUp, slug: "refi", color: "bg-purple-500/10 text-purple-600" },
    { name: "Sustentabilidade", icon: Globe, slug: "sustentabilidade", color: "bg-teal-500/10 text-teal-600" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      
      {/* Latest Articles Section */}
      <ScrollReveal>
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Últimos Artigos
                </h2>
                <p className="text-muted-foreground">
                  Análises e insights do mercado de finanças sustentáveis
                </p>
              </div>
              <Link to="/blog">
                <Button variant="outline" className="hidden md:flex items-center gap-2">
                  Ver todos <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-48 w-full rounded-t-lg" />
                    <CardContent className="p-6">
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
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nenhum artigo publicado ainda.
                </p>
                <Link to="/blog">
                  <Button>Explorar Blog</Button>
                </Link>
              </div>
            )}

            <div className="mt-8 text-center md:hidden">
              <Link to="/blog">
                <Button variant="outline" className="items-center gap-2">
                  Ver todos os artigos <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Categories Section */}
      <ScrollReveal>
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
              Explore por Categoria
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/blog?category=${category.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className={`p-4 rounded-full ${category.color} mb-4 transition-transform group-hover:scale-110`}>
                        <category.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-foreground">{category.name}</h3>
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
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Fique por dentro do mercado verde
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                Receba análises exclusivas, tendências do mercado de carbono e 
                insights sobre finanças regenerativas diretamente no seu email.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                />
                <Button variant="secondary" className="whitespace-nowrap">
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
