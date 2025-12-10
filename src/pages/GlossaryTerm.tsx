import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead, BreadcrumbSchema, DefinedTermSchema } from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, ExternalLink, Link2 } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  "mercado-carbono": "Mercado de Carbono",
  "tecnologia": "Tecnologia",
  "investimentos": "Investimentos",
  "sustentabilidade": "Sustentabilidade",
  "regulamentacao": "Regulamentação",
  "certificacao": "Certificação",
  "geral": "Geral",
};

const GlossaryTerm = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: term, isLoading, error } = useQuery({
    queryKey: ["glossary-term", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("glossary_terms")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: relatedTerms } = useQuery({
    queryKey: ["related-terms", term?.related_terms],
    queryFn: async () => {
      if (!term?.related_terms?.length) return [];
      const { data, error } = await supabase
        .from("glossary_terms")
        .select("term, slug, short_definition")
        .in("slug", term.related_terms);
      if (error) throw error;
      return data;
    },
    enabled: !!term?.related_terms?.length,
  });

  const { data: relatedArticles } = useQuery({
    queryKey: ["glossary-related-articles", term?.term],
    queryFn: async () => {
      if (!term?.term) return [];
      const { data, error } = await supabase
        .from("articles")
        .select("title, slug, excerpt")
        .eq("status", "published")
        .or(`title.ilike.%${term.term}%,content.ilike.%${term.term}%`)
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!term?.term,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-12 w-3/4 mb-6" />
          <Skeleton className="h-6 w-32 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !term) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Termo não encontrado</h1>
          <p className="text-muted-foreground mb-8">
            O termo que você está procurando não existe no nosso glossário.
          </p>
          <Button onClick={() => navigate("/glossario")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Glossário
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Início", href: "/" },
    { label: "Glossário", href: "/glossario" },
    { label: term.term, href: `/glossario/${term.slug}` },
  ];

  const schemaBreadcrumbItems = [
    { name: "Início", url: "/" },
    { name: "Glossário", url: "/glossario" },
    { name: term.term, url: `/glossario/${term.slug}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${term.term} - Definição e Significado | Glossário`}
        description={term.short_definition || term.definition.substring(0, 160)}
        url={`/glossario/${term.slug}`}
        keywords={[term.term, "definição", "significado", term.category || "sustentabilidade"]}
      />
      <BreadcrumbSchema items={schemaBreadcrumbItems} />
      <DefinedTermSchema
        term={term.term}
        definition={term.definition}
        url={`/glossario/${term.slug}`}
      />

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/glossario")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Glossário
          </Button>

          {/* Term Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              {term.category && (
                <Badge variant="secondary">
                  {CATEGORY_LABELS[term.category] || term.category}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {term.term}
            </h1>
            {term.short_definition && (
              <p className="text-xl text-muted-foreground">
                {term.short_definition}
              </p>
            )}
          </div>

          {/* Definition */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Definição Completa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{term.definition}</p>
              {term.source_url && (
                <a
                  href={term.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline mt-4"
                >
                  <ExternalLink className="h-4 w-4" />
                  Fonte
                </a>
              )}
            </CardContent>
          </Card>

          {/* Related Terms */}
          {relatedTerms && relatedTerms.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Termos Relacionados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedTerms.map(related => (
                  <Link key={related.slug} to={`/glossario/${related.slug}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-primary hover:underline">
                          {related.term}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {related.short_definition}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles && relatedArticles.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Artigos Relacionados</h2>
              <div className="space-y-4">
                {relatedArticles.map(article => (
                  <Link key={article.slug} to={`/blog/${article.slug}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-primary hover:underline">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {article.excerpt}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">
                Quer aprender mais sobre o mercado verde?
              </h3>
              <p className="text-muted-foreground mb-4">
                Explore nossos guias completos e artigos sobre sustentabilidade.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link to="/blog">Ver Artigos</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/guias">Ver Guias</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GlossaryTerm;
