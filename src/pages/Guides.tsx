import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import Breadcrumb from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, Eye, ChevronRight, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Guides = () => {
  const [sortBy, setSortBy] = useState<"views" | "recent">("views");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: pillarPages, isLoading } = useQuery({
    queryKey: ["pillar-pages", sortBy, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from("pillar_pages")
        .select(`
          id,
          title,
          slug,
          excerpt,
          featured_image,
          featured_image_alt,
          reading_time,
          views,
          main_keyword,
          status,
          category:categories(id, name, slug)
        `)
        .eq("status", "published");

      if (categoryFilter !== "all") {
        query = query.eq("category_id", categoryFilter);
      }

      if (sortBy === "views") {
        query = query.order("views", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories-for-guides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Guias", current: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Guias Completos | Amazonia Research"
        description="Guias definitivos e completos sobre crédito de carbono, tokenização de ativos verdes, finanças regenerativas (ReFi) e mercado voluntário de carbono. Aprenda do básico ao avançado."
        url="/guias"
        keywords={[
          "guia crédito de carbono",
          "guia tokenização verde",
          "guia ReFi",
          "finanças regenerativas",
          "mercado de carbono completo",
          "economia verde tutorial",
        ]}
      />

      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-card border-b border-border">
        <div className="container mx-auto px-6">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mt-8 max-w-3xl">
            <span className="text-xs font-medium uppercase tracking-widest text-primary mb-2 block">
              GUIAS COMPLETOS
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Aprenda do Zero ao Avançado
            </h1>
            <p className="text-lg text-muted-foreground">
              Conteúdo aprofundado e estruturado sobre o mercado de finanças sustentáveis. 
              Cada guia foi desenvolvido para ser sua referência definitiva no assunto.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b border-border bg-background">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{pillarPages?.length || 0} guias disponíveis</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px] bg-card border-border">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas categorias</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as "views" | "recent")}>
                <SelectTrigger className="w-[160px] bg-card border-border">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="views">Mais populares</SelectItem>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="border border-border overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pillarPages && pillarPages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pillarPages.map((page) => (
                <Link key={page.id} to={`/guia/${page.slug}`} className="group">
                  <Card className="h-full border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden">
                    {page.featured_image && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={page.featured_image}
                          alt={page.featured_image_alt || page.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <Badge variant="secondary" className="bg-background/90">
                            {page.category?.name || "Guia"}
                          </Badge>
                          <div className="flex items-center gap-3 text-xs text-foreground/80">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {page.reading_time || 15} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {page.views || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-6">
                      {page.main_keyword && (
                        <Badge variant="outline" className="mb-3 text-xs">
                          {page.main_keyword}
                        </Badge>
                      )}
                      <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {page.title}
                      </h2>
                      {page.excerpt && (
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {page.excerpt}
                        </p>
                      )}
                      <div className="mt-4 flex items-center text-primary text-sm font-medium">
                        Ler guia completo
                        <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-border rounded-lg">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum guia encontrado
              </h3>
              <p className="text-muted-foreground mb-6">
                {categoryFilter !== "all"
                  ? "Não há guias nesta categoria ainda."
                  : "Em breve teremos guias completos disponíveis."}
              </p>
              {categoryFilter !== "all" && (
                <Button
                  variant="outline"
                  onClick={() => setCategoryFilter("all")}
                  className="border-border"
                >
                  Ver todos os guias
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-card border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-primary mb-2 block">
            QUER MAIS CONTEÚDO?
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Explore nosso blog para artigos diários
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Além dos guias completos, publicamos análises e insights diários sobre o mercado verde.
          </p>
          <Link to="/blog">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Explorar Blog
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Guides;
