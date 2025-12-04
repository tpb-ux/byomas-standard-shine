import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Loader2, Plus, Pencil, Trash2, FolderTree, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface TopicCluster {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  article_count: number;
  category_id: string | null;
  category?: { id: string; name: string } | null;
}

const TopicClustersAdmin = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCluster, setEditingCluster] = useState<TopicCluster | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "folder",
    is_active: true,
    category_id: "",
  });

  const { data: clusters, isLoading } = useQuery({
    queryKey: ["admin-topic-clusters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topic_clusters")
        .select(`
          *,
          category:categories(id, name)
        `)
        .order("name");
      if (error) throw error;
      return data as TopicCluster[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories-for-clusters"],
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
      const { error } = await supabase.from("topic_clusters").insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        icon: data.icon || "folder",
        is_active: data.is_active,
        category_id: data.category_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-topic-clusters"] });
      toast.success("Topic cluster criado com sucesso!");
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
        .from("topic_clusters")
        .update({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          icon: data.icon || "folder",
          is_active: data.is_active,
          category_id: data.category_id || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-topic-clusters"] });
      toast.success("Topic cluster atualizado!");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("topic_clusters").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-topic-clusters"] });
      toast.success("Topic cluster excluído!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("topic_clusters")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-topic-clusters"] });
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon: "folder",
      is_active: true,
      category_id: "",
    });
    setEditingCluster(null);
  };

  const handleEdit = (cluster: TopicCluster) => {
    setEditingCluster(cluster);
    setFormData({
      name: cluster.name,
      slug: cluster.slug,
      description: cluster.description || "",
      icon: cluster.icon || "folder",
      is_active: cluster.is_active,
      category_id: cluster.category_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCluster) {
      updateMutation.mutate({ id: editingCluster.id, data: formData });
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
            NAVEGAÇÃO TEMÁTICA
          </span>
          <h1 className="text-3xl font-light tracking-wide text-foreground">Topic Clusters</h1>
          <p className="text-muted-foreground font-normal">
            Gerencie agrupamentos temáticos para melhorar SEO e navegação
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cluster
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-normal">
                {editingCluster ? "Editar Topic Cluster" : "Novo Topic Cluster"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
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
                  placeholder="credito-de-carbono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do cluster..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Ativo</Label>
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
                  {editingCluster ? "Salvar" : "Criar"}
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
            <CardTitle className="text-sm font-normal">Total Clusters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light">{clusters?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal">Clusters Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-primary">
              {clusters?.filter((c) => c.is_active).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal">Total Artigos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light">
              {clusters?.reduce((acc, c) => acc + (c.article_count || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="font-normal flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" />
            Todos os Topic Clusters
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clusters && clusters.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-normal">Nome</TableHead>
                  <TableHead className="font-normal">Categoria</TableHead>
                  <TableHead className="font-normal">Artigos</TableHead>
                  <TableHead className="font-normal">Status</TableHead>
                  <TableHead className="font-normal">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clusters.map((cluster) => (
                  <TableRow key={cluster.id}>
                    <TableCell>
                      <div>
                        <div className="font-normal">{cluster.name}</div>
                        <div className="text-xs text-muted-foreground">/topico/{cluster.slug}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cluster.category ? (
                        <Badge variant="secondary">{cluster.category.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>{cluster.article_count || 0}</TableCell>
                    <TableCell>
                      <Switch
                        checked={cluster.is_active}
                        onCheckedChange={(checked) =>
                          toggleActiveMutation.mutate({ id: cluster.id, is_active: checked })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(cluster)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Link to={`/topico/${cluster.slug}`} target="_blank">
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Excluir este topic cluster?")) {
                              deleteMutation.mutate(cluster.id);
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
              Nenhum topic cluster cadastrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TopicClustersAdmin;
