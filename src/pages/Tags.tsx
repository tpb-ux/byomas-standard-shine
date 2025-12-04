import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import ScrollReveal from "@/components/ScrollReveal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Hash, Search, TrendingUp } from "lucide-react";
import { useState, useMemo } from "react";

interface TagWithCount {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
}

const TagsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all tags with article count
  const { data: tags, isLoading } = useQuery({
    queryKey: ["all-tags-with-count"],
    queryFn: async () => {
      const { data: tagsData, error: tagsError } = await supabase
        .from("tags")
        .select("id, name, slug")
        .order("name");

      if (tagsError) throw tagsError;

      // Get article count for each tag
      const tagsWithCount = await Promise.all(
        (tagsData || []).map(async (tag) => {
          const { count } = await supabase
            .from("article_tags")
            .select("article_id", { count: "exact", head: true })
            .eq("tag_id", tag.id);

          return {
            ...tag,
            articleCount: count || 0,
          };
        })
      );

      // Filter out tags with no articles and sort by count
      return tagsWithCount
        .filter((t) => t.articleCount > 0)
        .sort((a, b) => b.articleCount - a.articleCount) as TagWithCount[];
    },
  });

  const filteredTags = useMemo(() => {
    if (!tags) return [];
    if (!searchQuery.trim()) return tags;
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tags, searchQuery]);

  // Group tags by first letter for alphabetical navigation
  const groupedTags = useMemo(() => {
    if (!filteredTags) return {};
    return filteredTags.reduce((acc, tag) => {
      const firstLetter = tag.name[0].toUpperCase();
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(tag);
      return acc;
    }, {} as Record<string, TagWithCount[]>);
  }, [filteredTags]);

  // Top tags (most used)
  const topTags = useMemo(() => {
    return tags?.slice(0, 10) || [];
  }, [tags]);

  const breadcrumbItems = [
    { label: "Blog", href: "/blog" },
    { label: "Tags" },
  ];

  const schemaBreadcrumbItems = [
    { name: "Blog", url: "/blog" },
    { name: "Tags", url: "/tags" },
  ];

  // Calculate tag size based on article count
  const getTagSize = (count: number, maxCount: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return "text-2xl font-bold";
    if (ratio > 0.4) return "text-xl font-semibold";
    if (ratio > 0.2) return "text-lg font-medium";
    return "text-base";
  };

  const maxCount = tags?.[0]?.articleCount || 1;

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Todas as Tags - Byoma Research"
        description="Explore todas as tags e tópicos do Byoma Research. Encontre artigos sobre crédito de carbono, tokenização, ReFi, sustentabilidade e muito mais."
        url="/tags"
        keywords={["tags", "tópicos", "byoma research", "finanças sustentáveis", "crédito de carbono"]}
      />
      <BreadcrumbSchema items={schemaBreadcrumbItems} />

      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-hero">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <Breadcrumb items={breadcrumbItems} className="mb-6" />

            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Hash className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Todas as Tags
              </h1>
            </div>

            <p className="text-xl text-muted-foreground max-w-2xl mb-8">
              Explore todos os tópicos e assuntos do Byoma Research
            </p>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Top Tags Section */}
      {topTags.length > 0 && !searchQuery && (
        <section className="py-8 bg-card border-b border-border">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Tags mais populares</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {topTags.map((tag) => (
                  <Link key={tag.id} to={`/tag/${tag.slug}`}>
                    <Badge
                      variant="default"
                      className="px-4 py-2 text-sm hover:bg-primary/80 transition-colors cursor-pointer"
                    >
                      {tag.name}
                      <span className="ml-2 opacity-70">({tag.articleCount})</span>
                    </Badge>
                  </Link>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Tag Cloud Section */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : filteredTags.length > 0 ? (
              <>
                {/* Tag Cloud View */}
                <Card className="mb-12">
                  <CardContent className="p-8">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <Hash className="h-5 w-5 text-primary" />
                      Nuvem de Tags
                    </h2>
                    <div className="flex flex-wrap gap-4 items-center justify-center">
                      {filteredTags.map((tag) => (
                        <Link
                          key={tag.id}
                          to={`/tag/${tag.slug}`}
                          className={`${getTagSize(tag.articleCount, maxCount)} text-foreground hover:text-primary transition-colors`}
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Alphabetical List */}
                <div className="space-y-8">
                  <h2 className="text-lg font-semibold">Lista Alfabética</h2>
                  {Object.entries(groupedTags)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([letter, letterTags]) => (
                      <div key={letter}>
                        <h3 className="text-2xl font-bold text-primary mb-4 border-b border-border pb-2">
                          {letter}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {letterTags.map((tag) => (
                            <Link
                              key={tag.id}
                              to={`/tag/${tag.slug}`}
                              className="group"
                            >
                              <Card className="hover:border-primary/50 transition-colors">
                                <CardContent className="p-4 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Hash className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="font-medium group-hover:text-primary transition-colors">
                                      {tag.name}
                                    </span>
                                  </div>
                                  <Badge variant="secondary">
                                    {tag.articleCount} artigo{tag.articleCount !== 1 ? "s" : ""}
                                  </Badge>
                                </CardContent>
                              </Card>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Hash className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-lg text-muted-foreground">
                  {searchQuery
                    ? "Nenhuma tag encontrada com este termo."
                    : "Nenhuma tag disponível."}
                </p>
              </div>
            )}
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TagsPage;
