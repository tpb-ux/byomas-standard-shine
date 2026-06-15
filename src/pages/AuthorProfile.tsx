import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Linkedin, Twitter, Globe, Mail, MapPin, BookOpen, Calendar, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://amazonia.estrato.com.br";

interface AuthorData {
  id: string;
  slug: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  role: string | null;
  title: string | null;
  credentials: string | null;
  expertise: string[] | null;
  years_experience: number | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  email_public: string | null;
  website_url: string | null;
  location: string | null;
  seo_meta_title: string | null;
  seo_meta_description: string | null;
}

interface AuthorArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  reading_time: number | null;
  category: { name: string; slug: string } | null;
}

const useAuthor = (slug: string) =>
  useQuery({
    queryKey: ["author", slug],
    queryFn: async (): Promise<AuthorData | null> => {
      const { data, error } = await supabase
        .from("authors")
        .select(
          "id, slug, name, avatar, bio, role, title, credentials, expertise, years_experience, linkedin_url, twitter_url, email_public, website_url, location, seo_meta_title, seo_meta_description",
        )
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data as AuthorData | null) ?? null;
    },
    enabled: !!slug,
  });

const useAuthorArticles = (authorId: string | undefined) =>
  useQuery({
    queryKey: ["author-articles", authorId],
    queryFn: async (): Promise<AuthorArticle[]> => {
      const { data, error } = await supabase
        .from("articles")
        .select(
          "id, slug, title, excerpt, featured_image, published_at, reading_time, category:categories(name, slug)",
        )
        .eq("author_id", authorId!)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return (data ?? []) as unknown as AuthorArticle[];
    },
    enabled: !!authorId,
  });

const AuthorProfile = () => {
  const { slug = "" } = useParams();
  const { data: author, isLoading, error } = useAuthor(slug);
  const { data: articles } = useAuthorArticles(author?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="pt-24 container mx-auto px-6 max-w-4xl space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !author) {
    return <Navigate to="/equipe-editorial" replace />;
  }

  const sameAs = [
    author.linkedin_url,
    author.twitter_url,
    author.website_url,
  ].filter(Boolean) as string[];

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    jobTitle: author.title || author.role || undefined,
    description: author.bio || undefined,
    image: author.avatar || undefined,
    url: `${BASE_URL}/autores/${author.slug}`,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    knowsAbout: author.expertise && author.expertise.length > 0 ? author.expertise : undefined,
    worksFor: {
      "@type": "NewsMediaOrganization",
      name: "Amazonia Research",
      url: BASE_URL,
    },
  };

  const seoTitle =
    author.seo_meta_title || `${author.name} — ${author.title || author.role || "Autor"}`;
  const seoDescription =
    author.seo_meta_description ||
    (author.bio ? author.bio.slice(0, 155) : `Perfil de ${author.name} no Amazonia Research.`);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        url={`/autores/${author.slug}`}
        image={author.avatar || undefined}
        type="website"
        author={author.name}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(personLd)}</script>
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-24">
        <section className="container mx-auto px-6 max-w-4xl">
          <Breadcrumb
            items={[
              { label: "Equipe Editorial", href: "/equipe-editorial" },
              { label: author.name },
            ]}
          />

          {/* Header */}
          <header className="py-12 flex flex-col md:flex-row gap-8 items-start">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                width={160}
                height={160}
                className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover border-2 border-primary/30 shadow-md"
              />
            ) : (
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-semibold">
                {author.name.slice(0, 1)}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-light text-foreground mb-2">
                {author.name}
              </h1>
              {(author.title || author.role) && (
                <p className="text-lg text-primary font-medium mb-3">
                  {author.title || author.role}
                </p>
              )}
              {author.credentials && (
                <p className="text-sm text-muted-foreground italic mb-3">
                  {author.credentials}
                </p>
              )}

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground mb-4">
                {author.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {author.location}
                  </span>
                )}
                {author.years_experience && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> {author.years_experience}+ anos de experiência
                  </span>
                )}
                {articles && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" /> {articles.length} artigos publicados
                  </span>
                )}
              </div>

              {/* Social links — rel="me" reinforces E-E-A-T identity */}
              <div className="flex flex-wrap gap-2">
                {author.linkedin_url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={author.linkedin_url} target="_blank" rel="me noopener noreferrer">
                      <Linkedin className="h-4 w-4 mr-2" /> LinkedIn
                    </a>
                  </Button>
                )}
                {author.twitter_url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={author.twitter_url} target="_blank" rel="me noopener noreferrer">
                      <Twitter className="h-4 w-4 mr-2" /> Twitter
                    </a>
                  </Button>
                )}
                {author.website_url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={author.website_url} target="_blank" rel="me noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" /> Site
                    </a>
                  </Button>
                )}
                {author.email_public && (
                  <Button asChild variant="outline" size="sm">
                    <a href={`mailto:${author.email_public}`} rel="me">
                      <Mail className="h-4 w-4 mr-2" /> Email
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Bio */}
          {author.bio && (
            <section aria-labelledby="bio" className="mb-12">
              <h2 id="bio" className="text-2xl font-semibold text-foreground mb-4">
                Sobre <em>{author.name.split(" ")[0]}</em>
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {author.bio}
              </p>
            </section>
          )}

          {/* Expertise */}
          {author.expertise && author.expertise.length > 0 && (
            <section aria-labelledby="expertise" className="mb-12">
              <h2 id="expertise" className="text-2xl font-semibold text-foreground mb-4">
                Áreas de cobertura
              </h2>
              <div className="flex flex-wrap gap-2">
                {author.expertise.map((tag) => (
                  <Link
                    key={tag}
                    to={`/tag/${tag
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "")}`}
                  >
                    <Badge variant="secondary" className="hover:bg-primary/20 cursor-pointer">
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Artigos */}
          <section aria-labelledby="artigos" className="mb-16">
            <h2 id="artigos" className="text-2xl font-semibold text-foreground mb-6">
              Artigos recentes de {author.name.split(" ")[0]}
            </h2>

            {(articles?.length ?? 0) === 0 ? (
              <p className="text-muted-foreground">
                Este autor ainda não tem artigos publicados.{" "}
                <Link to="/blog" className="text-primary hover:underline">
                  Ver todos os artigos do blog
                </Link>
                .
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {articles!.map((a) => (
                  <Card key={a.id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <Link to={`/blog/${a.slug}`} className="block">
                        {a.featured_image && (
                          <img
                            src={a.featured_image}
                            alt={a.title}
                            width={600}
                            height={300}
                            loading="lazy"
                            className="w-full aspect-video object-cover rounded-t-lg"
                          />
                        )}
                        <div className="p-5">
                          {a.category && (
                            <Badge variant="secondary" className="mb-2 text-xs">
                              {a.category.name}
                            </Badge>
                          )}
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {a.title}
                          </h3>
                          {a.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {a.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {a.published_at && (
                              <time dateTime={a.published_at}>
                                {new Date(a.published_at).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </time>
                            )}
                            {a.reading_time && <span>· {a.reading_time} min</span>}
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="mt-8">
              <Button asChild variant="outline">
                <Link to="/equipe-editorial">
                  Ver toda a equipe editorial <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AuthorProfile;