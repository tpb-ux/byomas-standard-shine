import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { blogPosts } from "@/data/blogPosts";
import ScrollReveal from "@/components/ScrollReveal";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Blog = () => {
  const categories = ["Todos", ...Array.from(new Set(blogPosts.map(post => post.category)))];
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredPosts = selectedCategory === "Todos" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

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

      {/* Categories Filter */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <div className="flex flex-wrap gap-3 justify-center">
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
          </ScrollReveal>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <ScrollReveal key={post.id} delay={index * 0.1}>
                <BlogCard {...post} />
              </ScrollReveal>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                Nenhum artigo encontrado nesta categoria.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
