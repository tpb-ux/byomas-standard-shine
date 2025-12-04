import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { SEOHead } from "@/components/SEOHead";
import BlogCard from "@/components/BlogCard";
import BlogSearch from "@/components/BlogSearch";
import BlogSort, { SortOption } from "@/components/BlogSort";
import TopicClusters from "@/components/TopicClusters";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogArticles } from "@/hooks/useBlogArticles";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const { data: articles, isLoading, error } = useBlogArticles();

  const categories = useMemo(() => {
    if (!articles) return ["Todas"];
    const cats = new Set(articles.map((a) => a.category?.name).filter(Boolean));
    return ["Todas", ...Array.from(cats)] as string[];
  }, [articles]);

  const allTags = useMemo(() => {
    if (!articles) return [];
    const tagSet = new Set<string>();
    articles.forEach((a) => a.tags.forEach((t) => tagSet.add(t.name)));
    return Array.from(tagSet);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    if (!articles) return [];

    let filtered = [...articles];

    // Filter by category
    if (selectedCategory !== "Todas") {
      filtered = filtered.filter((a) => a.category?.name === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.excerpt?.toLowerCase().includes(query) ||
          a.content.toLowerCase().includes(query) ||
          a.tags.some((t) => t.name.toLowerCase().includes(query))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((a) =>
        selectedTags.every((tag) => a.tags.some((t) => t.name === tag))
      );
    }

    // Sort
    switch (sortBy) {
      case "recent":
        filtered.sort(
          (a, b) =>
            new Date(b.published_at || 0).getTime() -
            new Date(a.published_at || 0).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.published_at || 0).getTime() -
            new Date(b.published_at || 0).getTime()
        );
        break;
      case "popular":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "alphabetical":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [articles, selectedCategory, searchQuery, selectedTags, sortBy]);

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Breadcrumb items
  const breadcrumbItems = [{ label: "Blog" }];

  return (
    <div className="min-h-screen flex flex-col">
      {/* SEO */}
      <SEOHead
        title="Blog - Insights sobre Finanças Sustentáveis"
        description="Artigos e análises sobre crédito de carbono, tokenização verde, finanças regenerativas e mercado de sustentabilidade. Mantenha-se atualizado com as tendências do mercado verde."
        url="/blog"
        keywords={["blog finanças sustentáveis", "crédito de carbono", "green tokens", "ReFi", "mercado verde", "tokenização"]}
      />

      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-hero">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <Breadcrumb items={breadcrumbItems} className="mb-6 justify-center text-muted-foreground" />
            
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-xs font-medium tracking-widest text-primary mb-4 block">
                BYOMA RESEARCH
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Insights e <span className="text-primary">Análises</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Sustentabilidade, mercado de carbono, tokenização e finanças regenerativas
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-card border-y border-border">
        <div className="container mx-auto px-6 space-y-6">
          <ScrollReveal>
            {/* Search Bar */}
            <div className="flex justify-center">
              <BlogSearch value={searchQuery} onSearch={setSearchQuery} />
            </div>

            {/* Categories and Sort */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory !== category ? "border-border text-muted-foreground hover:text-foreground hover:border-primary/50" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <BlogSort value={sortBy} onChange={setSortBy} />
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "secondary"}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Active Filters Summary */}
            {(searchQuery || selectedTags.length > 0 || selectedCategory !== "Todas") && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                <span>
                  {filteredArticles.length} artigo{filteredArticles.length !== 1 ? "s" : ""} encontrado{filteredArticles.length !== 1 ? "s" : ""}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTags([]);
                    setSelectedCategory("Todas");
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* Topic Clusters - SEO Navigation */}
      <TopicClusters />

      {/* Blog Grid */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-lg text-destructive mb-4">
                  Erro ao carregar artigos. Tente novamente.
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Recarregar
                </Button>
              </div>
            ) : filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((article) => (
                  <BlogCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">
                  {articles?.length === 0
                    ? "Nenhum artigo publicado ainda."
                    : "Nenhum artigo encontrado com os filtros selecionados."}
                </p>
                {articles && articles.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTags([]);
                      setSelectedCategory("Todas");
                    }}
                  >
                    Ver todos os artigos
                  </Button>
                )}
              </div>
            )}
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;