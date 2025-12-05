import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Pencil, Trash2, RefreshCw, Hash, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Tag {
  id: string;
  name: string;
  slug: string;
  article_count?: number;
}

interface ProcessingResult {
  articleId: string;
  title: string;
  tagsAdded: string[];
}

export default function AdminTags() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMethod, setProcessingMethod] = useState<"keyword" | "ai" | null>(null);
  const [processingResults, setProcessingResults] = useState<ProcessingResult[]>([]);
  const [processingStats, setProcessingStats] = useState<{ processed: number; associations: number } | null>(null);

  // Fetch tags with article count
  const { data: tags, isLoading } = useQuery({
    queryKey: ["admin-tags"],
    queryFn: async () => {
      const { data: tagsData, error: tagsError } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      if (tagsError) throw tagsError;

      // Get article counts for each tag
      const tagsWithCount = await Promise.all(
        (tagsData || []).map(async (tag) => {
          const { count } = await supabase
            .from("article_tags")
            .select("*", { count: "exact", head: true })
            .eq("tag_id", tag.id);
          
          return { ...tag, article_count: count || 0 };
        })
      );

      return tagsWithCount as Tag[];
    },
  });

  // Create tag mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      const { error } = await supabase.from("tags").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      toast.success("Tag criada com sucesso!");
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao criar tag: ${error.message}`);
    },
  });

  // Update tag mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; slug: string } }) => {
      const { error } = await supabase.from("tags").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      toast.success("Tag atualizada com sucesso!");
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar tag: ${error.message}`);
    },
  });

  // Delete tag mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // First delete article_tags associations
      await supabase.from("article_tags").delete().eq("tag_id", id);
      // Then delete the tag
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      toast.success("Tag excluída com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir tag: ${error.message}`);
    },
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditingTag(null);
    setFormData({ name: "", slug: "" });
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, slug: tag.slug });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTag) {
      updateMutation.mutate({ id: editingTag.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      name,
      slug: editingTag ? formData.slug : generateSlug(name),
    });
  };

  const handleReprocessTags = async (useAI: boolean) => {
    setIsProcessing(true);
    setProcessingMethod(useAI ? "ai" : "keyword");
    setProcessingResults([]);
    setProcessingStats(null);

    try {
      const { data, error } = await supabase.functions.invoke("process-article-tags", {
        body: { processAll: true, useAI },
      });

      if (error) throw error;

      setProcessingStats({
        processed: data.articlesProcessed,
        associations: data.totalAssociations,
      });
      setProcessingResults(data.results || []);

      if (data.totalAssociations > 0) {
        toast.success(
          `${data.totalAssociations} tags associadas a ${data.results?.length || 0} artigos usando ${useAI ? "análise com IA" : "correspondência simples"}!`
        );
      } else {
        toast.info("Nenhuma nova associação de tag foi necessária.");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
    } catch (error) {
      toast.error(`Erro ao reprocessar tags: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    } finally {
      setIsProcessing(false);
      setProcessingMethod(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground">
            Gerencie as tags do blog para melhor categorização de conteúdo
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => handleReprocessTags(false)}
            disabled={isProcessing}
          >
            {isProcessing && processingMethod === "keyword" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Reprocessar Tags
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleReprocessTags(true)}
            disabled={isProcessing}
            className="bg-gradient-to-r from-primary/80 to-primary text-primary-foreground hover:from-primary hover:to-primary/90"
          >
            {isProcessing && processingMethod === "ai" ? (
              <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Reprocessar com IA
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tag
          </Button>
        </div>
      </div>

      {/* Processing Results Card */}
      {(isProcessing || processingStats) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  Processando artigos...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Processamento concluído
                </>
              )}
            </CardTitle>
            <CardDescription>
              {processingMethod === "ai" 
                ? "Usando análise semântica com IA (Gemini)" 
                : "Usando correspondência de palavras-chave"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isProcessing && (
              <Progress value={100} className="h-2 animate-pulse" />
            )}
            
            {processingStats && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{processingStats.processed}</p>
                  <p className="text-xs text-muted-foreground">Artigos analisados</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">{processingStats.associations}</p>
                  <p className="text-xs text-muted-foreground">Tags associadas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-500">{processingResults.length}</p>
                  <p className="text-xs text-muted-foreground">Artigos atualizados</p>
                </div>
              </div>
            )}

            {processingResults.length > 0 && (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border bg-background p-3">
                {processingResults.slice(0, 10).map((result, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <Hash className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <span className="font-medium">{result.title.length > 50 ? `${result.title.substring(0, 50)}...` : result.title}</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {result.tagsAdded.map((tag, tagIdx) => (
                          <Badge key={tagIdx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {processingResults.length > 10 && (
                  <p className="text-center text-xs text-muted-foreground">
                    + {processingResults.length - 10} artigos adicionais
                  </p>
                )}
              </div>
            )}

            {!isProcessing && processingStats && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  setProcessingStats(null);
                  setProcessingResults([]);
                }}
              >
                Fechar
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Métodos de Reprocessamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 font-medium">
                <RefreshCw className="h-4 w-4" />
                Correspondência Simples
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Busca exata de palavras-chave no texto. Rápido mas detecta apenas correspondências diretas.
              </p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Análise com IA
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Usa Gemini para entender contexto e sinônimos. Mais preciso para categorização semântica.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Lista de Tags ({tags?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tags && tags.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Artigos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">{tag.name}</TableCell>
                    <TableCell className="text-muted-foreground">{tag.slug}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{tag.article_count}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(tag)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Excluir a tag "${tag.name}"? Isso removerá a associação com ${tag.article_count} artigos.`)) {
                              deleteMutation.mutate(tag.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Hash className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhuma tag cadastrada</p>
              <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar primeira tag
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTag ? "Editar Tag" : "Nova Tag"}
            </DialogTitle>
            <DialogDescription>
              {editingTag
                ? "Atualize as informações da tag"
                : "Crie uma nova tag para categorizar artigos"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Crédito de Carbono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="credito-carbono"
                required
              />
              <p className="text-xs text-muted-foreground">
                URL amigável: /tag/{formData.slug || "slug"}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingTag ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
