import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, RefreshCw, ExternalLink, Rss } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface NewsSource {
  id: string;
  name: string;
  url: string;
  rss_feed: string | null;
  category: string | null;
  is_active: boolean | null;
  last_fetched_at: string | null;
}

const Sources = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<NewsSource | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    rss_feed: "",
    category: "",
    is_active: true,
  });

  const { data: sources, isLoading } = useQuery({
    queryKey: ["admin-sources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_sources")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as NewsSource[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("news_sources").insert({
        name: data.name,
        url: data.url,
        rss_feed: data.rss_feed || null,
        category: data.category || null,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sources"] });
      toast.success("Fonte criada com sucesso!");
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao criar fonte");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("news_sources")
        .update({
          name: data.name,
          url: data.url,
          rss_feed: data.rss_feed || null,
          category: data.category || null,
          is_active: data.is_active,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sources"] });
      toast.success("Fonte atualizada com sucesso!");
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao atualizar fonte");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news_sources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sources"] });
      toast.success("Fonte removida com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao remover fonte");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("news_sources")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sources"] });
    },
  });

  const fetchNewsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-news");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-sources"] });
      toast.success(`Busca concluída! ${data?.newsFound || 0} notícias encontradas.`);
    },
    onError: () => {
      toast.error("Erro ao buscar notícias");
    },
  });

  const resetForm = () => {
    setFormData({ name: "", url: "", rss_feed: "", category: "", is_active: true });
    setEditingSource(null);
    setIsOpen(false);
  };

  const handleEdit = (source: NewsSource) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      url: source.url,
      rss_feed: source.rss_feed || "",
      category: source.category || "",
      is_active: source.is_active ?? true,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSource) {
      updateMutation.mutate({ id: editingSource.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-widest text-primary block mb-2">
            FEEDS RSS
          </span>
          <h1 className="text-3xl font-light tracking-wide text-foreground">Fontes de Notícias</h1>
          <p className="text-muted-foreground font-normal">
            Gerencie as fontes RSS para curadoria automática
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchNewsMutation.mutate()}
            disabled={fetchNewsMutation.isPending}
            className="border-border hover:border-primary/50"
          >
            {fetchNewsMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Buscar Notícias
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => resetForm()}
                variant="outline"
                className="border-border hover:border-primary/50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Fonte
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-normal">
                  {editingSource ? "Editar Fonte" : "Nova Fonte"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL do Site</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rss_feed">Feed RSS</Label>
                  <Input
                    id="rss_feed"
                    type="url"
                    value={formData.rss_feed}
                    onChange={(e) =>
                      setFormData({ ...formData, rss_feed: e.target.value })
                    }
                    placeholder="https://site.com/feed.xml"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="ex: carbon, sustainability"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">Fonte ativa</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm} className="border-border">
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingSource ? "Salvar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-normal">
            <Rss className="h-5 w-5 text-primary" />
            Todas as Fontes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sources && sources.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-normal">Status</TableHead>
                  <TableHead className="font-normal">Nome</TableHead>
                  <TableHead className="font-normal">Categoria</TableHead>
                  <TableHead className="font-normal">RSS</TableHead>
                  <TableHead className="font-normal">Última Busca</TableHead>
                  <TableHead className="text-right font-normal">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources?.map((source) => (
                  <TableRow key={source.id} className="hover:bg-accent/50">
                    <TableCell>
                      <Switch
                        checked={source.is_active ?? false}
                        onCheckedChange={(checked) =>
                          toggleActiveMutation.mutate({ id: source.id, is_active: checked })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-normal">{source.name}</span>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      {source.category ? (
                        <Badge variant="secondary">{source.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {source.rss_feed ? (
                        <Badge variant="outline" className="text-primary border-primary/50">
                          Configurado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Sem RSS
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(source.last_fetched_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(source)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(source.id)}
                          disabled={deleteMutation.isPending}
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
            <div className="text-center py-12">
              <span className="text-xs font-medium uppercase tracking-widest text-primary block mb-4">
                BYOMA RESEARCH
              </span>
              <Rss className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-normal mb-2">Nenhuma fonte encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando sua primeira fonte RSS
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Sources;