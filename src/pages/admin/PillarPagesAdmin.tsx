import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, BookOpen, Eye, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface PillarPage {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: string;
  views: number;
  reading_time: number;
  main_keyword: string | null;
  meta_title: string | null;
  meta_description: string | null;
  featured_image: string | null;
  category_id: string | null;
  category?: { id: string; name: string } | null;
}

const PillarPagesAdmin = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PillarPage | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    status: "draft",
    reading_time: 15,
    main_keyword: "",
    meta_title: "",
    meta_description: "",
    featured_image: "",
    category_id: "",
  });

  const { data: pillarPages, isLoading } = useQuery({
    queryKey: ["admin-pillar-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pillar_pages")
        .select(`
          *,
          category:categories(id, name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PillarPage[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories-for-pillar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("pillar_pages").insert({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content,
        status: data.status,
        reading_time: data.reading_time,
        main_keyword: data.main_keyword || null,
        meta_title: data.meta_title || null,
        meta_description: data.meta_description || null,
        featured_image: data.featured_image || null,
        category_id: data.category_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pillar-pages"] });
      toast.success("Pillar page criada com sucesso!");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("pillar_pages")
        .update({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || null,
          content: data.content,
          status: data.status,
          reading_time: data.reading_time,
          main_keyword: data.main_keyword || null,
          meta_title: data.meta_title || null,
          meta_description: data.meta_description || null,
          featured_image: data.featured_image || null,
          category_id: data.category_id || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pillar-pages"] });
      toast.success("Pillar page atualizada!");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pillar_pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pillar-pages"] });
      toast.success("Pillar page excluída!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("pillar_pages")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pillar-pages"] });
      toast.success("Status atualizado!");
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      status: "draft",
      reading_time: 15,
      main_keyword: "",
      meta_title: "",
      meta_description: "",
      featured_image: "",
      category_id: "",
    });
    setEditingPage(null);
  };

  const handleEdit = (page: PillarPage) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      excerpt: page.excerpt || "",
      content: page.content,
      status: page.status || "draft",
      reading_time: page.reading_time || 15,
      main_keyword: page.main_keyword || "",
      meta_title: page.meta_title || "",
      meta_description: page.meta_description || "",
      featured_image: page.featured_image || "",
      category_id: page.category_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPage) {
      updateMutation.mutate({ id: editingPage.id, data: formData });
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

  const totalViews = pillarPages?.reduce((acc, p) => acc + (p.views || 0), 0) || 0;
  const publishedCount = pillarPages?.filter((p) => p.status === "published").length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-widest text-primary block mb-2">
            CONTEÚDO CORNERSTONE
          </span>
          <h1 className="text-3xl font-light tracking-wide text-foreground">Pillar Pages</h1>
          <p className="text-muted-foreground font-normal">
            Gerencie guias completos e conteúdo fundamental para SEO
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Nova Pillar Page
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-normal">
                {editingPage ? "Editar Pillar Page" : "Nova Pillar Page"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: generateSlug(e.target.value),
                        meta_title: e.target.value,
                      });
                    }}
                    placeholder="Guia Completo de..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="guia-completo-..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Resumo</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Breve descrição do guia..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo (Markdown)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="# Título&#10;&#10;## Seção 1&#10;&#10;Conteúdo..."
                  rows={10}
                  className="font-mono text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
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

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reading_time">Tempo Leitura (min)</Label>
                  <Input
                    id="reading_time"
                    type="number"
                    value={formData.reading_time}
                    onChange={(e) => setFormData({ ...formData, reading_time: parseInt(e.target.value) || 15 })}
                    min={1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="main_keyword">Palavra-chave Principal</Label>
                  <Input
                    id="main_keyword"
                    value={formData.main_keyword}
                    onChange={(e) => setFormData({ ...formData, main_keyword: e.target.value })}
                    placeholder="crédito de carbono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featured_image">URL Imagem Destaque</Label>
                  <Input
                    id="featured_image"
                    value={formData.featured_image}
                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder="Título para SEO (máx 60 caracteres)"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.meta_title.length}/60 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="Descrição para SEO (máx 160 caracteres)"
                  maxLength={160}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.meta_description.length}/160 caracteres
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingPage ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal">Total Pillar Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light">{pillarPages?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal">Publicadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-primary">{publishedCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal">Views Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light">{totalViews}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="font-normal flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Todas as Pillar Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pillarPages && pillarPages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-normal">Título</TableHead>
                  <TableHead className="font-normal">Keyword</TableHead>
                  <TableHead className="font-normal">Status</TableHead>
                  <TableHead className="font-normal">Views</TableHead>
                  <TableHead className="font-normal">Leitura</TableHead>
                  <TableHead className="font-normal">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pillarPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell>
                      <div>
                        <div className="font-normal">{page.title}</div>
                        <div className="text-xs text-muted-foreground">/guia/{page.slug}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {page.main_keyword ? (
                        <Badge variant="outline">{page.main_keyword}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={page.status || "draft"}
                        onValueChange={(value) =>
                          toggleStatusMutation.mutate({ id: page.id, status: value })
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="published">Publicado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        {page.views || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {page.reading_time || 15} min
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(page)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Link to={`/guia/${page.slug}`} target="_blank">
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Excluir esta pillar page?")) {
                              deleteMutation.mutate(page.id);
                            }
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma pillar page cadastrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PillarPagesAdmin;
