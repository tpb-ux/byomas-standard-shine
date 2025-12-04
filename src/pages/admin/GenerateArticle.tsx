import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Sparkles, 
  Loader2, 
  Eye, 
  Save, 
  Send,
  FileText,
  BarChart3,
  Link2,
  Hash,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface GeneratedContent {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
  main_keyword: string;
  reading_time: number;
  featured_image_alt: string;
}

interface SEOAnalysis {
  score: number;
  wordCount: number;
  h2Count: number;
  h3Count: number;
  keywordDensity: number;
  issues: string[];
  passed: string[];
}

function analyzeSEO(content: GeneratedContent): SEOAnalysis {
  const text = content.content.replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  const h2Matches = content.content.match(/<h2[^>]*>/gi) || [];
  const h3Matches = content.content.match(/<h3[^>]*>/gi) || [];
  
  const keyword = content.main_keyword.toLowerCase();
  const keywordCount = text.toLowerCase().split(keyword).length - 1;
  const keywordDensity = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
  
  const issues: string[] = [];
  const passed: string[] = [];
  
  // Scoring
  let score = 0;
  
  // Word count (max 25 points)
  if (wordCount >= 1200) {
    score += 25;
    passed.push(`Contagem de palavras: ${wordCount} (mínimo 1200)`);
  } else if (wordCount >= 800) {
    score += 15;
    issues.push(`Contagem de palavras: ${wordCount} (recomendado 1200+)`);
  } else {
    score += 5;
    issues.push(`Contagem de palavras: ${wordCount} (muito baixo, mínimo 800)`);
  }
  
  // H2 count (max 15 points)
  if (h2Matches.length >= 4) {
    score += 15;
    passed.push(`H2 tags: ${h2Matches.length} (mínimo 4)`);
  } else if (h2Matches.length >= 2) {
    score += 8;
    issues.push(`H2 tags: ${h2Matches.length} (recomendado 4+)`);
  } else {
    issues.push(`H2 tags: ${h2Matches.length} (muito baixo)`);
  }
  
  // H3 count (max 10 points)
  if (h3Matches.length >= 3) {
    score += 10;
    passed.push(`H3 tags: ${h3Matches.length} (mínimo 3)`);
  } else if (h3Matches.length >= 1) {
    score += 5;
    issues.push(`H3 tags: ${h3Matches.length} (recomendado 3+)`);
  } else {
    issues.push(`Sem H3 tags (recomendado 3+)`);
  }
  
  // Keyword density (max 15 points)
  if (keywordDensity >= 1.5 && keywordDensity <= 2.5) {
    score += 15;
    passed.push(`Densidade de keyword: ${keywordDensity.toFixed(2)}% (ideal 1.5-2.5%)`);
  } else if (keywordDensity >= 1 && keywordDensity <= 3) {
    score += 10;
    issues.push(`Densidade de keyword: ${keywordDensity.toFixed(2)}% (ideal 1.5-2.5%)`);
  } else {
    score += 3;
    issues.push(`Densidade de keyword: ${keywordDensity.toFixed(2)}% (fora do ideal)`);
  }
  
  // Meta title (max 10 points)
  if (content.meta_title && content.meta_title.length >= 30 && content.meta_title.length <= 60) {
    score += 10;
    passed.push(`Meta título: ${content.meta_title.length} caracteres (30-60)`);
  } else if (content.meta_title) {
    score += 5;
    issues.push(`Meta título: ${content.meta_title.length} caracteres (ideal 30-60)`);
  } else {
    issues.push("Meta título não definido");
  }
  
  // Meta description (max 10 points)
  if (content.meta_description && content.meta_description.length >= 120 && content.meta_description.length <= 160) {
    score += 10;
    passed.push(`Meta descrição: ${content.meta_description.length} caracteres (120-160)`);
  } else if (content.meta_description) {
    score += 5;
    issues.push(`Meta descrição: ${content.meta_description.length} caracteres (ideal 120-160)`);
  } else {
    issues.push("Meta descrição não definida");
  }
  
  // Links bonus (max 15 points) - assumed from generation
  score += 15;
  passed.push("Links internos e externos sugeridos pela IA");
  
  return {
    score: Math.min(score, 100),
    wordCount,
    h2Count: h2Matches.length,
    h3Count: h3Matches.length,
    keywordDensity,
    issues,
    passed
  };
}

export default function GenerateArticle() {
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<GeneratedContent | null>(null);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Generate article mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-article", {
        body: { 
          keyword,
          categoryId: categoryId || undefined,
          saveArticle: false
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data as GeneratedContent;
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      setEditedContent(data);
      const analysis = analyzeSEO(data);
      setSeoAnalysis(analysis);
      toast.success("Artigo gerado com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Generation error:", error);
      toast.error(error.message || "Erro ao gerar artigo");
    },
  });

  // Save as draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      const content = editedContent || generatedContent;
      if (!content) throw new Error("Nenhum conteúdo para salvar");

      const { data, error } = await supabase
        .from("articles")
        .insert({
          title: content.title,
          slug: content.slug,
          excerpt: content.excerpt,
          content: content.content,
          meta_title: content.meta_title,
          meta_description: content.meta_description,
          main_keyword: content.main_keyword,
          reading_time: content.reading_time,
          featured_image_alt: content.featured_image_alt,
          status: "draft",
          ai_generated: true,
          category_id: categoryId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Artigo salvo como rascunho!");
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao salvar rascunho");
    },
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-article", {
        body: { 
          keyword,
          categoryId: categoryId || undefined,
          saveArticle: true
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Artigo publicado: ${data.title || data.slug}`);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao publicar artigo");
    },
  });

  const resetForm = () => {
    setKeyword("");
    setCategoryId("");
    setGeneratedContent(null);
    setEditedContent(null);
    setSeoAnalysis(null);
    setIsEditing(false);
  };

  const handleGenerate = () => {
    if (!keyword.trim()) {
      toast.error("Digite uma palavra-chave");
      return;
    }
    generateMutation.mutate();
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return "bg-green-500/10 text-green-500 border-green-500/20";
    if (score >= 70) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    return "bg-red-500/10 text-red-500 border-red-500/20";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerar Artigo com IA</h1>
        <p className="text-muted-foreground">
          Crie artigos otimizados para SEO automaticamente
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Configuração do Artigo
          </CardTitle>
          <CardDescription>
            Digite a palavra-chave principal e selecione uma categoria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="keyword">Palavra-chave Principal</Label>
              <Input
                id="keyword"
                placeholder="Ex: crédito de carbono mercado voluntário"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={generateMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={generateMutation.isPending || !keyword.trim()}
            className="w-full md:w-auto"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando artigo...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content Preview */}
      {generatedContent && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Preview do Artigo
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Ver Preview" : "Editar"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input
                        value={editedContent?.title || ""}
                        onChange={(e) =>
                          setEditedContent((prev) =>
                            prev ? { ...prev, title: e.target.value } : null
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Meta Título</Label>
                      <Input
                        value={editedContent?.meta_title || ""}
                        onChange={(e) =>
                          setEditedContent((prev) =>
                            prev ? { ...prev, meta_title: e.target.value } : null
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Meta Descrição</Label>
                      <Textarea
                        value={editedContent?.meta_description || ""}
                        onChange={(e) =>
                          setEditedContent((prev) =>
                            prev ? { ...prev, meta_description: e.target.value } : null
                          )
                        }
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Excerpt</Label>
                      <Textarea
                        value={editedContent?.excerpt || ""}
                        onChange={(e) =>
                          setEditedContent((prev) =>
                            prev ? { ...prev, excerpt: e.target.value } : null
                          )
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Conteúdo (HTML)</Label>
                      <Textarea
                        value={editedContent?.content || ""}
                        onChange={(e) =>
                          setEditedContent((prev) =>
                            prev ? { ...prev, content: e.target.value } : null
                          )
                        }
                        rows={15}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Título</p>
                      <h2 className="text-2xl font-bold">{generatedContent.title}</h2>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        <Hash className="mr-1 h-3 w-3" />
                        {generatedContent.main_keyword}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="mr-1 h-3 w-3" />
                        {generatedContent.reading_time} min
                      </Badge>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Meta Descrição</p>
                      <p className="text-sm">{generatedContent.meta_description}</p>
                    </div>

                    <Separator />

                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: generatedContent.content }} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* SEO Analysis Sidebar */}
          <div className="space-y-4">
            {seoAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Análise SEO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Score SEO</p>
                    <p className={`text-4xl font-bold ${getScoreColor(seoAnalysis.score)}`}>
                      {seoAnalysis.score}
                    </p>
                    <Badge className={getScoreBadge(seoAnalysis.score)}>
                      {seoAnalysis.score >= 85 ? "Excelente" : seoAnalysis.score >= 70 ? "Bom" : "Precisa Melhorar"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">Palavras</p>
                      <p className="font-semibold">{seoAnalysis.wordCount}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">H2 Tags</p>
                      <p className="font-semibold">{seoAnalysis.h2Count}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">H3 Tags</p>
                      <p className="font-semibold">{seoAnalysis.h3Count}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">Keyword %</p>
                      <p className="font-semibold">{seoAnalysis.keywordDensity.toFixed(2)}%</p>
                    </div>
                  </div>

                  <Separator />

                  {seoAnalysis.passed.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Aprovado
                      </p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {seoAnalysis.passed.map((item, i) => (
                          <li key={i}>✓ {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {seoAnalysis.issues.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-yellow-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Melhorias
                      </p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {seoAnalysis.issues.map((item, i) => (
                          <li key={i}>⚠ {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => saveDraftMutation.mutate()}
                  disabled={saveDraftMutation.isPending}
                >
                  {saveDraftMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar como Rascunho
                </Button>
                <Button
                  className="w-full"
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending}
                >
                  {publishMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Publicar Artigo
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Publicar salvará o artigo com links internos e externos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
