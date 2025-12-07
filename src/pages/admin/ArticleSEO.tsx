import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  ExternalLink, 
  Edit, 
  Download, 
  Sparkles,
  Loader2,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import SEOScoreCard from "@/components/admin/seo/SEOScoreCard";
import SEOChecklist from "@/components/admin/seo/SEOChecklist";
import AISuggestions from "@/components/admin/seo/AISuggestions";
import CompetitorAnalysis from "@/components/admin/seo/CompetitorAnalysis";
import ContentStructure from "@/components/admin/seo/ContentStructure";
import ArticleSearchConsole from "@/components/admin/seo/ArticleSearchConsole";

export default function ArticleSEO() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [isOptimizing, setIsOptimizing] = useState(false);

  const { data: article, isLoading, refetch } = useQuery({
    queryKey: ["article-seo", articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          category:categories(id, name, slug),
          author:authors(id, name),
          seo_metrics(*),
          internal_links:internal_links!source_article_id(id, anchor_text, target_article_id),
          external_links:external_links(id, anchor_text, url, domain)
        `)
        .eq("id", articleId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!articleId,
  });

  const { data: searchConsoleData } = useQuery({
    queryKey: ["article-gsc", articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("search_console_data")
        .select("*")
        .eq("article_id", articleId)
        .order("clicks", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!articleId,
  });

  const handleOptimizeWithAI = async () => {
    setIsOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-seo-article", {
        body: { 
          articleId, 
          action: "optimize",
          content: article?.content,
          title: article?.title,
          keyword: article?.main_keyword
        },
      });

      if (error) throw error;

      if (data?.optimizedContent) {
        const { error: updateError } = await supabase
          .from("articles")
          .update({
            content: data.optimizedContent,
            meta_title: data.optimizedMetaTitle || article?.meta_title,
            meta_description: data.optimizedMetaDescription || article?.meta_description,
          })
          .eq("id", articleId);

        if (updateError) throw updateError;

        toast.success("Artigo otimizado com sucesso!");
        refetch();
      }
    } catch (error) {
      console.error("Error optimizing:", error);
      toast.error("Erro ao otimizar artigo");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleExportPDF = () => {
    toast.info("Exportação de PDF será implementada em breve");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Artigo não encontrado</p>
        <Button onClick={() => navigate("/admin/seo")}>
          Voltar para SEO Analytics
        </Button>
      </div>
    );
  }

  const seoMetrics = article.seo_metrics?.[0] || null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/seo")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              ANÁLISE SEO INDIVIDUAL
            </span>
          </div>
          <h1 className="text-2xl font-light tracking-wide text-foreground line-clamp-2">
            {article.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Keyword: <strong className="text-foreground">{article.main_keyword || "Não definida"}</strong></span>
            {article.category && (
              <>
                <span>•</span>
                <span>{article.category.name}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/blog/${article.slug}`, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Artigo
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link to={`/admin/articles/${articleId}`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Artigo
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button
            size="sm"
            onClick={handleOptimizeWithAI}
            disabled={isOptimizing}
          >
            {isOptimizing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Otimizar com IA
          </Button>
        </div>
      </div>

      {/* Score Card */}
      <SEOScoreCard 
        article={article} 
        seoMetrics={seoMetrics} 
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="checklist" className="space-y-4">
        <TabsList className="bg-card border border-border flex-wrap">
          <TabsTrigger value="checklist">Checklist SEO</TabsTrigger>
          <TabsTrigger value="suggestions">Sugestões IA</TabsTrigger>
          <TabsTrigger value="competitors">Comparativo</TabsTrigger>
          <TabsTrigger value="structure">Estrutura</TabsTrigger>
          <TabsTrigger value="search-console">Search Console</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist">
          <SEOChecklist 
            article={article} 
            seoMetrics={seoMetrics}
            internalLinks={article.internal_links || []}
            externalLinks={article.external_links || []}
          />
        </TabsContent>

        <TabsContent value="suggestions">
          <AISuggestions 
            article={article}
            onApplySuggestion={refetch}
          />
        </TabsContent>

        <TabsContent value="competitors">
          <CompetitorAnalysis 
            article={article}
          />
        </TabsContent>

        <TabsContent value="structure">
          <ContentStructure 
            content={article.content}
          />
        </TabsContent>

        <TabsContent value="search-console">
          <ArticleSearchConsole 
            data={searchConsoleData || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
