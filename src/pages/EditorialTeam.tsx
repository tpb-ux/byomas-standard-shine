import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ShieldCheck, FileText, Mail, BookOpen, CheckCircle2 } from "lucide-react";
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

interface TeamAuthor {
  id: string;
  slug: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  role: string | null;
  title: string | null;
  credentials: string | null;
  expertise: string[] | null;
  published_articles_count: number | null;
}

const useEditorialTeam = () =>
  useQuery({
    queryKey: ["editorial-team"],
    queryFn: async (): Promise<TeamAuthor[]> => {
      const { data, error } = await supabase
        .from("authors")
        .select(
          "id, slug, name, avatar, bio, role, title, credentials, expertise, published_articles_count, is_ai",
        )
        .eq("is_ai", false)
        .order("name");
      if (error) throw error;
      return (data ?? []) as TeamAuthor[];
    },
  });

const principles = [
  {
    icon: ShieldCheck,
    title: "Independência editorial",
    desc: "Nossa curadoria é determinística e auditável. Não publicamos conteúdo patrocinado disfarçado de notícia.",
  },
  {
    icon: CheckCircle2,
    title: "Sem IA na produção",
    desc: "Todo conteúdo é selecionado por critérios objetivos a partir de fontes RSS confiáveis e revisado por humanos.",
  },
  {
    icon: FileText,
    title: "Fontes auditáveis",
    desc: "Cada matéria cita a fonte original com link permanente, permitindo verificação independente.",
  },
  {
    icon: BookOpen,
    title: "Correções abertas",
    desc: "Erros factuais são corrigidos com transparência. Qualquer leitor pode reportar imprecisões.",
  },
];

const EditorialTeam = () => {
  const { data: team, isLoading } = useEditorialTeam();

  const itemListLd = team
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: team.map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${BASE_URL}/autores/${a.slug}`,
          name: a.name,
        })),
      }
    : null;

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: "Amazonia Research",
    url: BASE_URL,
    diversityPolicy: `${BASE_URL}/equipe-editorial`,
    ethicsPolicy: `${BASE_URL}/equipe-editorial`,
    correctionsPolicy: `${BASE_URL}/equipe-editorial`,
    masthead: `${BASE_URL}/equipe-editorial`,
    mission: "Curadoria editorial determinística sobre mercado de carbono, finanças verdes e ReFi.",
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Equipe Editorial — Amazonia Research"
        description="Conheça a equipe editorial do Amazonia Research: princípios, padrões e processo deterministicamente curado de conteúdo sobre mercado de carbono e ReFi."
        url="/equipe-editorial"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(organizationLd)}</script>
        {itemListLd && (
          <script type="application/ld+json">{JSON.stringify(itemListLd)}</script>
        )}
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-24">
        <section className="container mx-auto px-6 max-w-5xl">
          <Breadcrumb items={[{ label: "Equipe Editorial" }]} />

          <header className="py-12">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-6">
              <em>Equipe</em>{" "}
              <span className="bg-primary/20 px-2 py-1 rounded italic">Editorial</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              O Amazonia Research é mantido por uma equipe enxuta de analistas e
              editores comprometidos com rigor factual e independência. Aqui você
              conhece quem está por trás do conteúdo e como ele é produzido.
            </p>
          </header>

          {/* Princípios */}
          <section aria-labelledby="principios" className="mb-16">
            <h2 id="principios" className="text-2xl md:text-3xl font-semibold mb-6 text-foreground">
              Princípios editoriais
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {principles.map((p) => (
                <Card key={p.title} className="border-l-4 border-l-primary">
                  <CardContent className="p-6 flex gap-4">
                    <p.icon className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{p.title}</h3>
                      <p className="text-sm text-muted-foreground">{p.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Processo */}
          <section aria-labelledby="processo" className="mb-16">
            <h2 id="processo" className="text-2xl md:text-3xl font-semibold mb-6 text-foreground">
              Como o conteúdo é produzido
            </h2>
            <ol className="space-y-4 border-l-2 border-primary/30 pl-6">
              {[
                ["Coleta via RSS", "Pipeline determinístico monitora fontes oficiais e veículos de imprensa especializados a cada 5 minutos."],
                ["Scoring de confiança", "Cada item é pontuado por reputação da fonte, recência, originalidade e relevância para os temas do site."],
                ["Curadoria humana", "Editores revisam os candidatos na fila de curadoria, ajustam título, resumo e categorização."],
                ["Publicação", "Após aprovação, o sistema gera links internos, tags e publica com schema.org completo."],
              ].map(([title, desc], i) => (
                <li key={title} className="relative">
                  <span className="absolute -left-[33px] top-0 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-muted-foreground">
              Leia mais em{" "}
              <Link to="/sobre" className="text-primary hover:underline">
                Sobre o projeto
              </Link>
              .
            </p>
          </section>

          {/* Equipe */}
          <section aria-labelledby="equipe" className="mb-16">
            <h2 id="equipe" className="text-2xl md:text-3xl font-semibold mb-6 text-foreground">
              Nossa equipe
            </h2>

            {isLoading && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            )}

            {!isLoading && (team?.length ?? 0) === 0 && (
              <p className="text-muted-foreground">
                Em breve apresentaremos os perfis completos da equipe.
              </p>
            )}

            {!isLoading && team && team.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {team.map((author) => (
                  <Card key={author.id} className="group hover:shadow-lg transition-shadow flex flex-col">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-4">
                        {author.avatar ? (
                          <img
                            src={author.avatar}
                            alt={author.name}
                            width={64}
                            height={64}
                            loading="lazy"
                            className="h-16 w-16 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                            {author.name.slice(0, 1)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-foreground">{author.name}</h3>
                          {(author.title || author.role) && (
                            <p className="text-sm text-muted-foreground">
                              {author.title || author.role}
                            </p>
                          )}
                        </div>
                      </div>

                      {author.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {author.bio}
                        </p>
                      )}

                      {author.expertise && author.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {author.expertise.slice(0, 4).map((e) => (
                            <Badge key={e} variant="secondary" className="text-xs">
                              {e}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto pt-4">
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link to={`/autores/${author.slug}`}>
                            Ver perfil <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Correções */}
          <section aria-labelledby="correcoes" className="mb-16">
            <Card className="bg-muted/30 border-l-4 border-l-primary">
              <CardContent className="p-6">
                <h2 id="correcoes" className="text-xl font-semibold text-foreground mb-2">
                  Correções e contato
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Encontrou um erro factual? Quer sugerir uma pauta? Fale com a
                  equipe e responderemos em até 48 horas.
                </p>
                <Button asChild>
                  <Link to="/contato">
                    <Mail className="mr-2 h-4 w-4" />
                    Entrar em contato
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EditorialTeam;