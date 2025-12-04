import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Eye,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  views: number;
  created_at: string;
  published_at: string | null;
  category: { name: string } | null;
}

export default function AdminArticles() {
  const { user, isAdmin, isEditor, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && !isAdmin && !isEditor) {
      navigate("/");
    }
  }, [user, isAdmin, isEditor, authLoading, navigate]);

  useEffect(() => {
    fetchArticles();
  }, [user, statusFilter]);

  const fetchArticles = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from("articles")
        .select(`
          id,
          title,
          slug,
          status,
          views,
          created_at,
          published_at,
          category:categories(name)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as "draft" | "published" | "scheduled" | "archived");
      }

      const { data, error } = await query;

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Erro ao carregar artigos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      setArticles(articles.filter((a) => a.id !== deleteId));
      toast.success("Artigo excluído com sucesso");
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Erro ao excluir artigo");
    } finally {
      setDeleteId(null);
    }
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "published":
        return <Badge variant="default">Publicado</Badge>;
      case "draft":
        return <Badge variant="secondary">Rascunho</Badge>;
      case "scheduled":
        return <Badge variant="outline">Agendado</Badge>;
      case "archived":
        return <Badge variant="destructive">Arquivado</Badge>;
      default:
        return <Badge variant="secondary">{status || "Rascunho"}</Badge>;
    }
  };

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
        <div>
          <span className="text-xs font-medium uppercase tracking-widest text-primary block mb-2">
            GESTÃO DE CONTEÚDO
          </span>
          <h1 className="text-3xl font-light tracking-wide text-foreground">Artigos</h1>
          <p className="text-muted-foreground font-normal">
            Gerencie todos os artigos do blog
          </p>
        </div>
        <Button 
          onClick={() => navigate("/admin/articles/new")}
          variant="outline"
          className="border-border hover:border-primary/50"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Artigo
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artigos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Rascunhos</SelectItem>
                <SelectItem value="scheduled">Agendados</SelectItem>
                <SelectItem value="archived">Arquivados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-normal">
            <FileText className="h-5 w-5 text-primary" />
            Lista de Artigos ({filteredArticles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-xs font-medium uppercase tracking-widest text-primary block mb-4">
                BYOMA RESEARCH
              </span>
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-normal mb-2">Nenhum artigo encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Tente uma busca diferente"
                  : "Comece criando seu primeiro artigo"}
              </p>
              <Button 
                onClick={() => navigate("/admin/articles/new")}
                variant="outline"
                className="border-border hover:border-primary/50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Artigo
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-normal">Título</TableHead>
                    <TableHead className="font-normal">Categoria</TableHead>
                    <TableHead className="font-normal">Status</TableHead>
                    <TableHead className="text-center font-normal">Views</TableHead>
                    <TableHead className="font-normal">Criado em</TableHead>
                    <TableHead className="text-right font-normal">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((article) => (
                    <TableRow key={article.id} className="hover:bg-accent/50">
                      <TableCell className="font-normal max-w-xs truncate">
                        {article.title}
                      </TableCell>
                      <TableCell>
                        {article.category?.name || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(article.status)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.views}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(article.created_at), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => navigate(`/blog/${article.slug}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/admin/articles/${article.id}`)
                              }
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(article.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-normal">Excluir artigo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O artigo será permanentemente
              removido do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}