import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/data/blogPosts";
import ScrollReveal from "@/components/ScrollReveal";

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Artigo não encontrado</h1>
            <Button onClick={() => navigate("/blog")}>
              Voltar para o Blog
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(post.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-muted/30">
        <div className="container mx-auto px-6 max-w-4xl">
          <ScrollReveal>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/blog")}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o Blog
            </Button>

            <Badge className="mb-4">{post.category}</Badge>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
              {post.views && (
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{post.views.toLocaleString('pt-BR')} visualizações</span>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Image */}
      <section>
        <div className="container mx-auto px-6 max-w-4xl">
          <ScrollReveal>
            <div className="aspect-video overflow-hidden bg-muted mb-12">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <ScrollReveal>
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
              style={{
                color: 'hsl(var(--foreground))',
              }}
            />
          </ScrollReveal>

          {/* Author Bio */}
          <ScrollReveal delay={0.2}>
            <div className="mt-12 p-6 bg-muted border-l-4 border-primary">
              <div className="flex items-center gap-4">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-16 h-16 object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    Sobre o autor
                  </p>
                  <p className="text-muted-foreground">{post.author.name}</p>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <ScrollReveal>
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Tags do Artigo</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`}>
                      <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </ScrollReveal>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                Artigos Relacionados
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {relatedPosts.map((relatedPost, index) => (
                <ScrollReveal key={relatedPost.id} delay={index * 0.1}>
                  <div
                    onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                    className="cursor-pointer group"
                  >
                    <div className="aspect-video overflow-hidden bg-muted mb-4">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <Badge className="mb-2">{relatedPost.category}</Badge>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {relatedPost.readTime}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
