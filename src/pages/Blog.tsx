import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import BlogSearch from "@/components/BlogSearch";
import BlogSort, { SortOption } from "@/components/BlogSort";
import BlogTags from "@/components/BlogTags";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/data/blogPosts";
import { useBlogSearch } from "@/hooks/useBlogSearch";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const categories = ["Todas", ...new Set(blogPosts.map((post) => post.category))];

  const filteredPosts = useBlogSearch({
    posts: blogPosts,
    searchQuery,
    category: selectedCategory,
    selectedTags,
    sortBy,
  });

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Blog Byomas
              </h1>
              <p className="text-xl text-muted-foreground">
                Insights sobre sustentabilidade, mercado de carbono e ação climática
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-muted/30">
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
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <BlogSort value={sortBy} onChange={setSortBy} />
            </div>

            {/* Tags */}
            <BlogTags
              posts={blogPosts}
              selectedTags={selectedTags}
              onTagClick={handleTagClick}
            />

            {/* Active Filters Summary */}
            {(searchQuery || selectedTags.length > 0 || selectedCategory !== "Todas") && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {filteredPosts.length} artigo{filteredPosts.length !== 1 ? "s" : ""} encontrado{filteredPosts.length !== 1 ? "s" : ""}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
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

      {/* Blog Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <BlogCard key={post.id} {...post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">
                  Nenhum artigo encontrado com os filtros selecionados.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTags([]);
                    setSelectedCategory("Todas");
                  }}
                >
                  Ver todos os artigos
                </Button>
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
