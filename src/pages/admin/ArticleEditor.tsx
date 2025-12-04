import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Save,
  ArrowLeft,
  Loader2,
  Sparkles,
  Eye,
  TrendingUp,
  Link2,
  Image as ImageIcon,
  RefreshCw,
  AlertTriangle,
  Wand2,
  HelpCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AIGenerationProgress, GenerationStep } from "@/components/admin/AIGenerationProgress";

const articleSchema = z.object({
  title: z.string().min(10, "Título deve ter pelo menos 10 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
  excerpt: z.string().min(50, "Resumo deve ter pelo menos 50 caracteres"),
  content: z.string().min(200, "Conteúdo deve ter pelo menos 200 caracteres"),
  main_keyword: z.string().min(3, "Palavra-chave principal obrigatória"),
  meta_title: z.string().max(60, "Meta título deve ter no máximo 60 caracteres").optional(),
  meta_description: z.string().max(160, "Meta descrição deve ter no máximo 160 caracteres").optional(),
  category_id: z.string().optional(),
  featured_image: z.string().url("URL da imagem inválida").optional().or(z.literal("")),
  featured_image_alt: z.string().optional(),
  status: z.enum(["draft", "published", "scheduled", "archived"]),
});

type ArticleFormData = z.infer<typeof articleSchema>;
type RegeneratingSection = 'none' | 'title' | 'excerpt' | 'content' | 'meta';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SeoAnalysis {
  score: number;
  keywordDensity: number;
  wordCount: number;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  issues: string[];
  suggestions: string[];
}

interface FAQ {
  question: string;
  answer: string;
}

const sectionLabels: Record<RegeneratingSection, string> = {
  none: '',
  title: 'Título',
  excerpt: 'Resumo',
  content: 'Conteúdo',
  meta: 'Meta Tags',
};

export default function ArticleEditor() {
  const { id } = useParams();
  const isEditing = !!id && id !== "new";
  const navigate = useNavigate();
  const { user, isAdmin, isEditor, isLoading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationStep, setGenerationStep] = useState<GenerationStep>('idle');
  const [regeneratingSection, setRegeneratingSection] = useState<RegeneratingSection>('none');
  const [categories, setCategories] = useState<Category[]>([]);
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysis | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  
  const generationTimersRef = useRef<NodeJS.Timeout[]>([]);

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      main_keyword: "",
      meta_title: "",
      meta_description: "",
      category_id: "",
      featured_image: "",
      featured_image_alt: "",
      status: "draft",
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && !isAdmin && !isEditor) {
      navigate("/");
    }
  }, [user, isAdmin, isEditor, authLoading, navigate]);

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchArticle();
    }
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name");
    setCategories(data || []);
  };

  const fetchArticle = async () => {
    if (!id || id === "new") return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      form.reset({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || "",
        content: data.content,
        main_keyword: data.main_keyword || "",
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || "",
        category_id: data.category_id || "",
        featured_image: data.featured_image || "",
        featured_image_alt: data.featured_image_alt || "",
        status: data.status as ArticleFormData["status"],
      });

      // Load FAQs
      if (data.faqs && Array.isArray(data.faqs)) {
        setFaqs(data.faqs as unknown as FAQ[]);
      }

      analyzeSeo(data.content, data.main_keyword || "");
    } catch (error) {
      console.error("Error fetching article:", error);
      toast.error("Erro ao carregar artigo");
      navigate("/admin/articles");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const analyzeSeo = (content: string, keyword: string) => {
    const wordCount = content.split(/\s+/).length;
    const keywordCount = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), "g")) || []).length;
    const keywordDensity = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;

    const h1Matches = content.match(/<h1[^>]*>/gi) || [];
    const h2Matches = content.match(/<h2[^>]*>/gi) || content.match(/^## /gm) || [];
    const h3Matches = content.match(/<h3[^>]*>/gi) || content.match(/^### /gm) || [];

    const issues: string[] = [];
    const suggestions: string[] = [];

    if (wordCount < 300) {
      issues.push("Conteúdo muito curto (mínimo 300 palavras recomendado)");
    }
    if (keywordDensity < 0.5) {
      issues.push("Densidade de palavra-chave muito baixa");
    } else if (keywordDensity > 3) {
      issues.push("Densidade de palavra-chave muito alta (possível keyword stuffing)");
    }
    if (h1Matches.length === 0) {
      issues.push("Falta H1 no conteúdo");
    } else if (h1Matches.length > 1) {
      issues.push("Múltiplos H1 encontrados (use apenas 1)");
    }
    if (h2Matches.length < 2) {
      suggestions.push("Adicione mais subtítulos H2 para melhor estrutura");
    }

    let score = 100;
    score -= issues.length * 15;
    score -= (suggestions.length * 5);
    score = Math.max(0, Math.min(100, score));

    setSeoAnalysis({
      score,
      keywordDensity: Math.round(keywordDensity * 100) / 100,
      wordCount,
      h1Count: h1Matches.length,
      h2Count: h2Matches.length,
      h3Count: h3Matches.length,
      issues,
      suggestions,
    });
  };

  const onSubmit = async (data: ArticleFormData) => {
    // Validate: published articles MUST have featured image
    if (data.status === "published" && !data.featured_image) {
      toast.error("Artigos publicados precisam de uma imagem destacada", {
        description: "Adicione uma imagem ou clique em 'Gerar Imagem com IA' na aba Mídia",
      });
      return;
    }

    setIsSaving(true);

    try {
      const articleData = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        main_keyword: data.main_keyword,
        meta_title: data.meta_title || data.title.substring(0, 60),
        meta_description: data.meta_description || data.excerpt.substring(0, 160),
        category_id: data.category_id || null,
        featured_image: data.featured_image || null,
        featured_image_alt: data.featured_image_alt || null,
        status: data.status as "draft" | "published" | "scheduled" | "archived",
        published_at: data.status === "published" ? new Date().toISOString() : null,
        faqs: faqs.length > 0 ? JSON.parse(JSON.stringify(faqs)) : [],
      };

      if (isEditing) {
        const { error } = await supabase
          .from("articles")
          .update(articleData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Artigo atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("articles")
          .insert([articleData]);

        if (error) throw error;
        toast.success("Artigo criado com sucesso!");
      }

      navigate("/admin/articles");
    } catch (error: any) {
      console.error("Error saving article:", error);
      if (error.code === "23505") {
        toast.error("Já existe um artigo com este slug");
      } else {
        toast.error("Erro ao salvar artigo");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const generateImageWithAI = async () => {
    const title = form.getValues("title");
    const keyword = form.getValues("main_keyword");

    if (!title && !keyword) {
      toast.error("Defina um título ou palavra-chave primeiro");
      return;
    }

    setIsGeneratingImage(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { title, keyword },
      });

      if (error) throw error;

      if (data?.url) {
        form.setValue("featured_image", data.url);
        form.setValue("featured_image_alt", data.alt || `Imagem sobre ${keyword || title}`);
        toast.success("Imagem gerada com sucesso!");
      } else {
        throw new Error("Nenhuma imagem retornada");
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast.error(error.message || "Erro ao gerar imagem");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const generateWithAI = async () => {
    const keyword = form.getValues("main_keyword");
    if (!keyword) {
      toast.error("Defina uma palavra-chave principal primeiro");
      return;
    }

    generationTimersRef.current.forEach(timer => clearTimeout(timer));
    generationTimersRef.current = [];

    setIsGenerating(true);
    setGenerationStep('analyzing');

    const timer1 = setTimeout(() => setGenerationStep('generating'), 2000);
    const timer2 = setTimeout(() => setGenerationStep('optimizing'), 5000);
    generationTimersRef.current.push(timer1, timer2);

    try {
      const { data, error } = await supabase.functions.invoke("generate-article", {
        body: { keyword, type: "full" },
      });

      if (error) throw error;

      generationTimersRef.current.forEach(timer => clearTimeout(timer));
      setGenerationStep('complete');

      if (data) {
        form.setValue("title", data.title || form.getValues("title"));
        form.setValue("slug", generateSlug(data.title || form.getValues("title")));
        form.setValue("excerpt", data.excerpt || form.getValues("excerpt"));
        form.setValue("content", data.content || form.getValues("content"));
        form.setValue("meta_title", data.meta_title || "");
        form.setValue("meta_description", data.meta_description || "");

        analyzeSeo(data.content, keyword);
        toast.success("Conteúdo gerado com sucesso!");
      }

      setTimeout(() => {
        setGenerationStep('idle');
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Erro ao gerar conteúdo. Tente novamente.");
      generationTimersRef.current.forEach(timer => clearTimeout(timer));
      setGenerationStep('idle');
      setIsGenerating(false);
    }
  };

  const regenerateSection = async (section: RegeneratingSection) => {
    const keyword = form.getValues("main_keyword");
    if (!keyword) {
      toast.error("Defina uma palavra-chave principal primeiro");
      return;
    }

    setRegeneratingSection(section);

    try {
      const context = {
        title: form.getValues("title"),
        content: form.getValues("content"),
        excerpt: form.getValues("excerpt"),
      };

      const { data, error } = await supabase.functions.invoke("generate-article", {
        body: { keyword, section, context },
      });

      if (error) throw error;

      if (data) {
        switch (section) {
          case 'title':
            if (data.title) {
              form.setValue("title", data.title);
              form.setValue("slug", generateSlug(data.title));
            }
            break;
          case 'excerpt':
            if (data.excerpt) {
              form.setValue("excerpt", data.excerpt);
            }
            break;
          case 'content':
            if (data.content) {
              form.setValue("content", data.content);
              analyzeSeo(data.content, keyword);
            }
            break;
          case 'meta':
            if (data.meta_title) form.setValue("meta_title", data.meta_title);
            if (data.meta_description) form.setValue("meta_description", data.meta_description);
            break;
        }

        toast.success(`${sectionLabels[section]} regenerado com sucesso!`);
      }
    } catch (error) {
      console.error("Error regenerating section:", error);
      toast.error("Erro ao regenerar. Tente novamente.");
    } finally {
      setRegeneratingSection('none');
    }
  };

  const isRegenerating = regeneratingSection !== 'none';
  const isDisabled = isGenerating || isRegenerating;

  const RegenerateButton = ({ section }: { section: RegeneratingSection }) => (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={() => regenerateSection(section)}
      disabled={isDisabled || !form.getValues("main_keyword")}
      className="h-7 text-xs gap-1 text-muted-foreground hover:text-primary"
    >
      {regeneratingSection === section ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <RefreshCw className="h-3 w-3" />
      )}
      Regenerar
    </Button>
  );

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/articles")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? "Editar Artigo" : "Novo Artigo"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Atualize o conteúdo do artigo" : "Crie um novo artigo para o blog"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={generateWithAI}
            disabled={isDisabled}
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Gerar com IA
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar
          </Button>
        </div>
      </div>

      {/* AI Generation Progress Indicator */}
      {isGenerating && (
        <AIGenerationProgress currentStep={generationStep} isVisible={isGenerating} />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Conteúdo</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="media">Mídia</TabsTrigger>
                  <TabsTrigger value="faqs">FAQs</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4 mt-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>Título</FormLabel>
                              <RegenerateButton section="title" />
                            </div>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Título do artigo"
                                onChange={(e) => {
                                  field.onChange(e);
                                  if (!isEditing) {
                                    form.setValue("slug", generateSlug(e.target.value));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug (URL)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="url-do-artigo" />
                            </FormControl>
                            <FormDescription>
                              /blog/{field.value || "url-do-artigo"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="excerpt"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>Resumo</FormLabel>
                              <RegenerateButton section="excerpt" />
                            </div>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Breve descrição do artigo..."
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>Conteúdo</FormLabel>
                              <RegenerateButton section="content" />
                            </div>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Conteúdo completo do artigo (suporta HTML/Markdown)"
                                rows={20}
                                className="font-mono text-sm"
                                onChange={(e) => {
                                  field.onChange(e);
                                  const keyword = form.getValues("main_keyword");
                                  if (keyword) {
                                    analyzeSeo(e.target.value, keyword);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Otimização SEO
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="main_keyword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Palavra-chave Principal</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="ex: crédito de carbono"
                                onChange={(e) => {
                                  field.onChange(e);
                                  const content = form.getValues("content");
                                  if (content) {
                                    analyzeSeo(content, e.target.value);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="meta_title"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>Meta Título ({field.value?.length || 0}/60)</FormLabel>
                              <RegenerateButton section="meta" />
                            </div>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Título para mecanismos de busca"
                                maxLength={60}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="meta_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Descrição ({field.value?.length || 0}/160)</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Descrição para resultados de busca"
                                maxLength={160}
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="media" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Imagem Destacada
                      </CardTitle>
                      <CardDescription>
                        Artigos publicados precisam obrigatoriamente de uma imagem
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Warning if no image and status is published */}
                      {!form.watch("featured_image") && form.watch("status") === "published" && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Artigos publicados precisam de uma imagem destacada.
                            Adicione uma URL ou gere automaticamente com IA.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Generate Image Button */}
                      {!form.watch("featured_image") && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={generateImageWithAI}
                          disabled={isGeneratingImage || (!form.getValues("title") && !form.getValues("main_keyword"))}
                          className="w-full border-dashed border-2 h-auto py-6"
                        >
                          {isGeneratingImage ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Gerando imagem com IA...
                            </>
                          ) : (
                            <>
                              <Wand2 className="mr-2 h-5 w-5" />
                              Gerar Imagem com IA
                            </>
                          )}
                        </Button>
                      )}

                      <FormField
                        control={form.control}
                        name="featured_image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL da Imagem</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="featured_image_alt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Texto Alternativo (Alt)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Descrição da imagem para SEO"
                              />
                            </FormControl>
                            <FormDescription>
                              Inclua a palavra-chave principal quando possível
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("featured_image") && (
                        <div className="mt-4 space-y-2">
                          <img
                            src={form.watch("featured_image")}
                            alt={form.watch("featured_image_alt") || "Preview"}
                            className="rounded-lg max-h-48 object-cover"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={generateImageWithAI}
                            disabled={isGeneratingImage}
                          >
                            {isGeneratingImage ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Regenerar Imagem
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="faqs" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        Perguntas Frequentes (FAQs)
                      </CardTitle>
                      <CardDescription>
                        FAQs aparecem como Rich Snippets no Google e melhoram o SEO
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {faqs.length === 0 && (
                        <div className="text-center py-8 border border-dashed border-border rounded-lg">
                          <HelpCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground mb-4">
                            Nenhuma FAQ adicionada ainda
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Adicione perguntas frequentes para melhorar o SEO com Rich Snippets
                          </p>
                        </div>
                      )}

                      {faqs.map((faq, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-3">
                              <div>
                                <Label className="text-sm font-medium">Pergunta {index + 1}</Label>
                                <Input
                                  value={faq.question}
                                  onChange={(e) => {
                                    const newFaqs = [...faqs];
                                    newFaqs[index].question = e.target.value;
                                    setFaqs(newFaqs);
                                  }}
                                  placeholder="Digite a pergunta..."
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Resposta</Label>
                                <Textarea
                                  value={faq.answer}
                                  onChange={(e) => {
                                    const newFaqs = [...faqs];
                                    newFaqs[index].answer = e.target.value;
                                    setFaqs(newFaqs);
                                  }}
                                  placeholder="Digite a resposta (50-100 palavras recomendado)..."
                                  rows={3}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newFaqs = faqs.filter((_, i) => i !== index);
                                setFaqs(newFaqs);
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {faqs.length < 10 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setFaqs([...faqs, { question: "", answer: "" }]);
                          }}
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar FAQ ({faqs.length}/10)
                        </Button>
                      )}

                      {faqs.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {faqs.length} FAQ{faqs.length !== 1 ? 's' : ''} adicionada{faqs.length !== 1 ? 's' : ''}. 
                          Recomendamos 5 FAQs com respostas de 50-100 palavras cada.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Publicação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Rascunho</SelectItem>
                            <SelectItem value="published">Publicado</SelectItem>
                            <SelectItem value="scheduled">Agendado</SelectItem>
                            <SelectItem value="archived">Arquivado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* SEO Analysis */}
              {seoAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Análise SEO
                      </span>
                      <Badge
                        variant={
                          seoAnalysis.score >= 80
                            ? "default"
                            : seoAnalysis.score >= 50
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {seoAnalysis.score}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Palavras</p>
                        <p className="font-semibold">{seoAnalysis.wordCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Densidade KW</p>
                        <p className="font-semibold">{seoAnalysis.keywordDensity}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">H2</p>
                        <p className="font-semibold">{seoAnalysis.h2Count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">H3</p>
                        <p className="font-semibold">{seoAnalysis.h3Count}</p>
                      </div>
                    </div>

                    {seoAnalysis.issues.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-destructive mb-2">
                          Problemas:
                        </p>
                        <ul className="text-xs space-y-1">
                          {seoAnalysis.issues.map((issue, i) => (
                            <li key={i} className="text-muted-foreground">
                              • {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {seoAnalysis.suggestions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-primary mb-2">
                          Sugestões:
                        </p>
                        <ul className="text-xs space-y-1">
                          {seoAnalysis.suggestions.map((sug, i) => (
                            <li key={i} className="text-muted-foreground">
                              • {sug}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
