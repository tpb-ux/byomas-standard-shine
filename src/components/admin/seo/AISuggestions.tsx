import { useState } from "react";
import { Sparkles, Loader2, Check, RefreshCw, Copy, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AISuggestionsProps {
  article: any;
  onApplySuggestion: () => void;
}

interface Suggestion {
  type: "title" | "meta" | "content" | "keyword" | "structure";
  label: string;
  current?: string;
  suggested: string;
  reasoning?: string;
}

export default function AISuggestions({ article, onApplySuggestion }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([]);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-seo-article", {
        body: {
          articleId: article.id,
          action: "suggestions",
          content: article.content,
          title: article.title,
          metaTitle: article.meta_title,
          metaDescription: article.meta_description,
          keyword: article.main_keyword,
          excerpt: article.excerpt,
        },
      });

      if (error) throw error;

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        toast.success("Sugestões geradas com sucesso!");
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast.error("Erro ao gerar sugestões");
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = async (suggestion: Suggestion, index: number) => {
    try {
      const updateData: any = {};
      
      switch (suggestion.type) {
        case "title":
          updateData.title = suggestion.suggested;
          updateData.meta_title = suggestion.suggested.substring(0, 60);
          break;
        case "meta":
          updateData.meta_description = suggestion.suggested;
          break;
        case "keyword":
          updateData.main_keyword = suggestion.suggested;
          break;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from("articles")
          .update(updateData)
          .eq("id", article.id);

        if (error) throw error;

        setAppliedSuggestions(prev => [...prev, `${suggestion.type}-${index}`]);
        toast.success("Sugestão aplicada com sucesso!");
        onApplySuggestion();
      }
    } catch (error) {
      console.error("Error applying suggestion:", error);
      toast.error("Erro ao aplicar sugestão");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência");
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      title: "Título",
      meta: "Meta Description",
      content: "Conteúdo",
      keyword: "Palavra-chave",
      structure: "Estrutura",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      title: "bg-blue-500/10 text-blue-500 border-blue-500/30",
      meta: "bg-purple-500/10 text-purple-500 border-purple-500/30",
      content: "bg-primary/10 text-primary border-primary/30",
      keyword: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
      structure: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    };
    return colors[type] || "";
  };

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="font-normal flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Sugestões da IA
          </div>
          <Button
            onClick={generateSuggestions}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : suggestions.length > 0 ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerar
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Sugestões
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Análise de IA</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Clique em "Gerar Sugestões" para receber recomendações personalizadas
              de otimização SEO baseadas em IA.
            </p>
            <Button onClick={generateSuggestions} disabled={isLoading}>
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Sugestões
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Analisando artigo com IA...</p>
          </div>
        )}

        {suggestions.length > 0 && !isLoading && (
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => {
              const isApplied = appliedSuggestions.includes(`${suggestion.type}-${index}`);
              
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${isApplied ? "border-primary/50 bg-primary/5" : "border-border"}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getTypeColor(suggestion.type)}>
                      {getTypeLabel(suggestion.type)}
                    </Badge>
                    <span className="text-sm font-medium">{suggestion.label}</span>
                    {isApplied && (
                      <Badge variant="outline" className="text-primary border-primary ml-auto">
                        <Check className="h-3 w-3 mr-1" />
                        Aplicado
                      </Badge>
                    )}
                  </div>

                  {suggestion.current && (
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Atual:</p>
                      <p className="text-sm text-muted-foreground line-through">
                        {suggestion.current}
                      </p>
                    </div>
                  )}

                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Sugestão:</p>
                    <p className="text-sm bg-primary/5 p-2 rounded border border-primary/20">
                      {suggestion.suggested}
                    </p>
                  </div>

                  {suggestion.reasoning && (
                    <p className="text-xs text-muted-foreground mb-3">
                      💡 {suggestion.reasoning}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(suggestion.suggested)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </Button>
                    {!isApplied && suggestion.type !== "content" && suggestion.type !== "structure" && (
                      <Button
                        size="sm"
                        onClick={() => applySuggestion(suggestion, index)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Aplicar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
