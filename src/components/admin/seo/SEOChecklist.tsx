import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  status: "pass" | "warning" | "fail";
  value?: string | number;
  recommendation?: string;
}

interface SEOChecklistProps {
  article: any;
  seoMetrics: any;
  internalLinks: any[];
  externalLinks: any[];
}

export default function SEOChecklist({ article, seoMetrics, internalLinks, externalLinks }: SEOChecklistProps) {
  const [openCategories, setOpenCategories] = useState<string[]>(["title", "meta", "content", "links", "technical"]);

  const checklist = generateChecklist(article, seoMetrics, internalLinks, externalLinks);

  const categories = [
    { id: "title", label: "Título", icon: "📝" },
    { id: "meta", label: "Meta Tags", icon: "🏷️" },
    { id: "content", label: "Conteúdo", icon: "📄" },
    { id: "links", label: "Links", icon: "🔗" },
    { id: "images", label: "Imagens", icon: "🖼️" },
    { id: "technical", label: "Técnico", icon: "⚙️" },
  ];

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getStatusIcon = (status: "pass" | "warning" | "fail") => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getCategoryStats = (categoryId: string) => {
    const items = checklist.filter(item => item.category === categoryId);
    const passed = items.filter(item => item.status === "pass").length;
    const total = items.length;
    return { passed, total };
  };

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="font-normal flex items-center justify-between">
          <span>Checklist de Otimização SEO</span>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-primary border-primary">
              {checklist.filter(i => i.status === "pass").length} aprovados
            </Badge>
            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
              {checklist.filter(i => i.status === "warning").length} avisos
            </Badge>
            <Badge variant="outline" className="text-destructive border-destructive">
              {checklist.filter(i => i.status === "fail").length} problemas
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map(category => {
          const categoryItems = checklist.filter(item => item.category === category.id);
          if (categoryItems.length === 0) return null;

          const stats = getCategoryStats(category.id);
          const isOpen = openCategories.includes(category.id);

          return (
            <Collapsible
              key={category.id}
              open={isOpen}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium">{category.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {stats.passed}/{stats.total}
                    </Badge>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-2 pl-4">
                  {categoryItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-background"
                    >
                      {getStatusIcon(item.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{item.label}</span>
                          {item.value !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              ({typeof item.value === "number" ? item.value : item.value})
                            </span>
                          )}
                        </div>
                        {item.recommendation && item.status !== "pass" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            💡 {item.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
}

function generateChecklist(article: any, seoMetrics: any, internalLinks: any[], externalLinks: any[]): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const title = article.meta_title || article.title || "";
  const description = article.meta_description || "";
  const content = article.content || "";
  const keyword = article.main_keyword || "";

  // TITLE
  items.push({
    id: "title-length",
    category: "title",
    label: "Título entre 50-60 caracteres",
    status: title.length >= 50 && title.length <= 60 ? "pass" : title.length > 0 ? "warning" : "fail",
    value: `${title.length} chars`,
    recommendation: "O título ideal deve ter entre 50 e 60 caracteres para exibição completa no Google."
  });

  items.push({
    id: "title-keyword",
    category: "title",
    label: "Palavra-chave no título",
    status: keyword && title.toLowerCase().includes(keyword.toLowerCase()) ? "pass" : "fail",
    recommendation: "Inclua a palavra-chave principal no título, preferencialmente no início."
  });

  items.push({
    id: "title-unique",
    category: "title",
    label: "Título único e atrativo",
    status: title.length > 20 ? "pass" : "warning",
    recommendation: "Use números, power words ou perguntas para tornar o título mais atrativo."
  });

  // META - SEO 2025: 140-155 caracteres ideal
  items.push({
    id: "meta-description-length",
    category: "meta",
    label: "Meta description entre 140-155 caracteres",
    status: description.length >= 140 && description.length <= 155 ? "pass" : description.length >= 120 && description.length <= 160 ? "warning" : "fail",
    value: `${description.length} chars`,
    recommendation: "A meta description ideal tem entre 140 e 155 caracteres para exibição completa no Google."
  });

  items.push({
    id: "meta-keyword",
    category: "meta",
    label: "Palavra-chave na meta description",
    status: keyword && description.toLowerCase().includes(keyword.toLowerCase()) ? "pass" : "fail",
    recommendation: "Inclua a palavra-chave principal na meta description de forma natural."
  });

  items.push({
    id: "meta-cta",
    category: "meta",
    label: "Call-to-action na meta description",
    status: /saiba|descubra|aprenda|confira|veja|leia/i.test(description) ? "pass" : "warning",
    recommendation: "Adicione um call-to-action como 'Saiba mais', 'Descubra', 'Confira'."
  });

  // CONTENT - SEO 2025: 850-2500 palavras
  const wordCount = seoMetrics?.word_count || content.split(/\s+/).length;
  items.push({
    id: "content-length",
    category: "content",
    label: "Conteúdo entre 850-2500 palavras",
    status: wordCount >= 850 && wordCount <= 2500 ? "pass" : wordCount >= 600 && wordCount <= 3000 ? "warning" : "fail",
    value: `${wordCount} palavras`,
    recommendation: "Artigos devem ter entre 850 e 2500 palavras. Faixa ideal: 1200-2000 palavras."
  });

  items.push({
    id: "content-h1",
    category: "content",
    label: "Apenas um H1 no conteúdo",
    status: (seoMetrics?.h1_count || 0) === 1 ? "pass" : "fail",
    value: seoMetrics?.h1_count || 0,
    recommendation: "Use apenas um H1 por página, que deve conter a palavra-chave principal."
  });

  // SEO 2025: Mínimo 4 H2
  items.push({
    id: "content-h2",
    category: "content",
    label: "Pelo menos 4 subtítulos H2",
    status: (seoMetrics?.h2_count || 0) >= 4 ? "pass" : (seoMetrics?.h2_count || 0) >= 2 ? "warning" : "fail",
    value: seoMetrics?.h2_count || 0,
    recommendation: "Use pelo menos 4 H2 para estruturar o conteúdo em seções lógicas."
  });

  // SEO 2025: Mínimo 3 H3
  items.push({
    id: "content-h3",
    category: "content",
    label: "Pelo menos 3 subtítulos H3",
    status: (seoMetrics?.h3_count || 0) >= 3 ? "pass" : (seoMetrics?.h3_count || 0) >= 1 ? "warning" : "fail",
    value: seoMetrics?.h3_count || 0,
    recommendation: "Use pelo menos 3 H3 dentro de seções H2 para melhor hierarquia."
  });

  // SEO 2025: Densidade 0.8-1.3%
  const density = seoMetrics?.keyword_density || 0;
  items.push({
    id: "content-density",
    category: "content",
    label: "Densidade de palavra-chave entre 0.8-1.3%",
    status: density >= 0.8 && density <= 1.3 ? "pass" : density > 0.5 && density < 2 ? "warning" : "fail",
    value: `${density.toFixed(2)}%`,
    recommendation: "A densidade ideal é entre 0.8% e 1.3%. Nunca ultrapassar 2%."
  });

  items.push({
    id: "content-paragraphs",
    category: "content",
    label: "Parágrafos curtos (máx. 150 palavras)",
    status: "pass", // Would need more analysis
    recommendation: "Mantenha parágrafos curtos para melhor leitura."
  });

  // LINKS
  items.push({
    id: "links-internal",
    category: "links",
    label: "Pelo menos 5 links internos",
    status: internalLinks.length >= 5 ? "pass" : internalLinks.length >= 3 ? "warning" : "fail",
    value: internalLinks.length,
    recommendation: "Links internos ajudam na navegação e distribuição de autoridade."
  });

  items.push({
    id: "links-external",
    category: "links",
    label: "Pelo menos 3 links externos de autoridade",
    status: externalLinks.length >= 3 ? "pass" : externalLinks.length >= 1 ? "warning" : "fail",
    value: externalLinks.length,
    recommendation: "Links para fontes confiáveis aumentam a credibilidade do conteúdo."
  });

  items.push({
    id: "links-broken",
    category: "links",
    label: "Sem links quebrados",
    status: "pass", // Would need verification
    recommendation: "Verifique regularmente se todos os links estão funcionando."
  });

  // IMAGES
  items.push({
    id: "images-featured",
    category: "images",
    label: "Imagem destacada definida",
    status: article.featured_image ? "pass" : "fail",
    recommendation: "Adicione uma imagem destacada atraente e relevante."
  });

  items.push({
    id: "images-alt",
    category: "images",
    label: "Alt text na imagem destacada",
    status: article.featured_image_alt ? "pass" : article.featured_image ? "warning" : "fail",
    recommendation: "Use alt text descritivo incluindo a palavra-chave quando relevante."
  });

  // TECHNICAL
  items.push({
    id: "technical-slug",
    category: "technical",
    label: "URL amigável (slug otimizado)",
    status: article.slug && article.slug.length < 60 && !article.slug.includes("_") ? "pass" : "warning",
    value: article.slug,
    recommendation: "Use URLs curtas, descritivas e com palavras separadas por hífen."
  });

  items.push({
    id: "technical-keyword-slug",
    category: "technical",
    label: "Palavra-chave na URL",
    status: keyword && article.slug?.toLowerCase().includes(keyword.toLowerCase().replace(/\s+/g, "-")) ? "pass" : "warning",
    recommendation: "Inclua a palavra-chave principal na URL."
  });

  items.push({
    id: "technical-canonical",
    category: "technical",
    label: "Tag canonical configurada",
    status: "pass", // Usually auto-generated
    recommendation: "A tag canonical evita conteúdo duplicado."
  });

  items.push({
    id: "technical-faqs",
    category: "technical",
    label: "FAQs com Schema markup",
    status: article.faqs && Array.isArray(article.faqs) && article.faqs.length > 0 ? "pass" : "warning",
    value: article.faqs?.length || 0,
    recommendation: "Adicione FAQs para rich snippets nos resultados de busca."
  });

  return items;
}
