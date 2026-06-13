import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Inbox,
  Search,
  CheckCircle2,
  XCircle,
  Send,
  Undo2,
  Eye,
  Pencil,
  Loader2,
  History,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type ArticleStatus = "draft" | "scheduled" | "published" | "archived";

type StatusFilter = "pending" | "approved" | "published_24h" | "archived" | "all";

interface QueueArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  main_keyword: string | null;
  source_name: string | null;
  source_url: string | null;
  status: ArticleStatus;
  is_curated: boolean;
  published_at: string | null;
  created_at: string;
  category: { id: string; name: string } | null;
  seo: { seo_score: number | null } | null;
}

interface EditorialAction {
  id: string;
  article_id: string;
  action: string;
  notes: string | null;
  created_at: string;
  user_id: string | null;
  article: { title: string; slug: string } | null;
  user: { full_name: string | null; email: string | null } | null;
}

const STATUS_LABELS: Record<string, string> = {
  approved: "Aprovado",
  rejected: "Rejeitado",
  published: "Publicado",
  unpublished: "Despublicado",
  edited: "Editado",
  reverted_to_draft: "Revertido para rascunho",
};

export default function CurationQueue() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [lowSeoOnly, setLowSeoOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewArticle, setPreviewArticle] = useState<QueueArticle | null>(null);
  const [rejectTarget, setRejectTarget] = useState<QueueArticle | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  // Queue list
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["curation-queue", statusFilter, categoryFilter, sourceFilter, lowSeoOnly],
    queryFn: async () => {
      let q = supabase
        .from("articles")
        .select(
          `id, slug, title, excerpt, featured_image, main_keyword, source_name, source_url,
           status, is_curated, published_at, created_at,
           category:categories(id, name),
           seo:seo_metrics(seo_score)`
        )
        .order("created_at", { ascending: false })
        .limit(200);

      if (statusFilter === "pending") {
        q = q.eq("status", "draft").eq("is_curated", false);
      } else if (statusFilter === "approved") {
        q = q.eq("status", "draft").eq("is_curated", true);
      } else if (statusFilter === "published_24h") {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        q = q.eq("status", "published").gte("published_at", since);
      } else if (statusFilter === "archived") {
        q = q.eq("status", "archived");
      }

      if (categoryFilter !== "all") q = q.eq("category_id", categoryFilter);
      if (sourceFilter !== "all") q = q.eq("source_name", sourceFilter);

      const { data, error } = await q;
      if (error) throw error;
      let rows = (data || []) as unknown as QueueArticle[];
      if (lowSeoOnly) {
        rows = rows.filter((r) => (r.seo?.seo_score ?? 0) < 60);
      }
      return rows;
    },
    refetchInterval: 60_000,
  });

  const filtered = useMemo(() => {
    if (!search) return articles;
    const s = search.toLowerCase();
    return articles.filter((a) => a.title.toLowerCase().includes(s));
  }, [articles, search]);

  // Filter options
  const { data: categories = [] } = useQuery({
    queryKey: ["queue-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, name").order("name");
      return data || [];
    },
  });

  const { data: sources = [] } = useQuery({
    queryKey: ["queue-sources"],
    queryFn: async () => {
      const { data } = await supabase
        .from("articles")
        .select("source_name")
        .not("source_name", "is", null);
      const set = new Set<string>();
      (data || []).forEach((r: { source_name: string | null }) => {
        if (r.source_name) set.add(r.source_name);
      });
      return Array.from(set).sort();
    },
  });

  // History
  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ["editorial-actions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("editorial_actions")
        .select(
          `id, article_id, action, notes, created_at, user_id,
           article:articles(title, slug),
           user:profiles(full_name, email)`
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as unknown as EditorialAction[];
    },
  });

  const logAction = async (
    articleId: string,
    action: string,
    notes?: string
  ) => {
    if (!user) return;
    await supabase.from("editorial_actions").insert({
      article_id: articleId,
      user_id: user.id,
      action,
      notes: notes || null,
    });
  };

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["curation-queue"] });
    qc.invalidateQueries({ queryKey: ["editorial-actions"] });
    qc.invalidateQueries({ queryKey: ["pending-queue-count"] });
  };

  // Mutations
  const approveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const { error } = await supabase
            .from("articles")
            .update({ is_curated: true })
            .eq("id", id);
          if (error) throw error;
          await logAction(id, "approved");
        })
      );
      return results;
    },
    onSuccess: (results) => {
      const ok = results.filter((r) => r.status === "fulfilled").length;
      const fail = results.length - ok;
      toast.success(`${ok} aprovado(s)${fail ? `, ${fail} falha(s)` : ""}`);
      setSelectedIds(new Set());
      invalidate();
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const { error } = await supabase
            .from("articles")
            .update({
              status: "published",
              published_at: new Date().toISOString(),
              is_curated: true,
            })
            .eq("id", id);
          if (error) throw error;
          await logAction(id, "published");
          // Fire-and-forget post-publish enrichment
          supabase.functions
            .invoke("process-article-tags", { body: { articleId: id } })
            .catch(() => undefined);
          supabase.functions
            .invoke("auto-internal-linking", { body: { articleId: id } })
            .catch(() => undefined);
        })
      );
      return results;
    },
    onSuccess: (results) => {
      const ok = results.filter((r) => r.status === "fulfilled").length;
      const fail = results.length - ok;
      toast.success(`${ok} publicado(s)${fail ? `, ${fail} falha(s)` : ""}`);
      setSelectedIds(new Set());
      invalidate();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ ids, notes }: { ids: string[]; notes?: string }) => {
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const { error } = await supabase
            .from("articles")
            .update({ status: "archived" as ArticleStatus })
            .eq("id", id);
          if (error) throw error;
          await logAction(id, "rejected", notes);
        })
      );
      return results;
    },
    onSuccess: (results) => {
      const ok = results.filter((r) => r.status === "fulfilled").length;
      toast.success(`${ok} rejeitado(s) e arquivado(s)`);
      setSelectedIds(new Set());
      setRejectTarget(null);
      setRejectNotes("");
      invalidate();
    },
  });

  const revertMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("articles")
        .update({ status: "draft" as ArticleStatus, published_at: null })
        .eq("id", id);
      if (error) throw error;
      await logAction(id, "reverted_to_draft");
    },
    onSuccess: () => {
      toast.success("Revertido para rascunho");
      invalidate();
    },
  });

  const allSelected = filtered.length > 0 && filtered.every((a) => selectedIds.has(a.id));
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((a) => a.id)));
  };
  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const seoBadge = (score: number | null | undefined) => {
    const s = score ?? 0;
    const variant = s >= 80 ? "default" : s >= 60 ? "secondary" : "destructive";
    return <Badge variant={variant as "default" | "secondary" | "destructive"}>{Math.round(s)}</Badge>;
  };

  return (
    <div className="container max-w-7xl py-8 space-y-6">
      <div>
        <span className="text-xs font-medium uppercase tracking-widest text-primary block mb-2">
          GOVERNANÇA EDITORIAL
        </span>
        <h1 className="text-3xl font-light tracking-wide text-foreground flex items-center gap-3">
          <Inbox className="h-7 w-7 text-primary" />
          Fila de Curadoria
        </h1>
        <p className="text-muted-foreground">
          Revise, aprove e publique os rascunhos gerados pelo pipeline determinístico
        </p>
      </div>

      <Tabs defaultValue="queue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="queue">
            <Inbox className="h-4 w-4 mr-2" /> Fila
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" /> Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-wrap gap-3">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                  <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Rascunhos pendentes</SelectItem>
                    <SelectItem value="approved">Aprovados (rascunho)</SelectItem>
                    <SelectItem value="published_24h">Publicados (últimas 24h)</SelectItem>
                    <SelectItem value="archived">Rejeitados / arquivados</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[200px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((c: { id: string; name: string }) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-[200px]"><SelectValue placeholder="Fonte" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as fontes</SelectItem>
                    {sources.map((s: string) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button
                  variant={lowSeoOnly ? "default" : "outline"}
                  onClick={() => setLowSeoOnly((v) => !v)}
                >
                  SEO &lt; 60
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bulk actions bar */}
          {selectedIds.size > 0 && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-3 flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{selectedIds.size} selecionado(s)</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => approveMutation.mutate(Array.from(selectedIds))}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Aprovar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => publishMutation.mutate(Array.from(selectedIds))}
                    disabled={publishMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" /> Publicar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => rejectMutation.mutate({ ids: Array.from(selectedIds) })}
                    disabled={rejectMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Rejeitar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-3" />
                  <p className="text-muted-foreground">Nenhum artigo encontrado para os filtros atuais</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">
                        <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                      </TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Fonte</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Palavra-chave</TableHead>
                      <TableHead>SEO</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(a.id)}
                            onCheckedChange={() => toggleOne(a.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium max-w-xs truncate">{a.title}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {a.source_name || "—"}
                        </TableCell>
                        <TableCell className="text-sm">{a.category?.name || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                          {a.main_keyword || "—"}
                        </TableCell>
                        <TableCell>{seoBadge(a.seo?.seo_score)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{a.status}</Badge>
                          {a.is_curated && a.status === "draft" && (
                            <Badge variant="secondary" className="ml-1">aprovado</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(new Date(a.created_at), "dd/MM HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button size="icon" variant="ghost" onClick={() => setPreviewArticle(a)} title="Pré-visualizar">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" asChild title="Editar">
                              <Link to={`/admin/articles/${a.id}`}><Pencil className="h-4 w-4" /></Link>
                            </Button>
                            {a.status === "draft" && !a.is_curated && (
                              <Button size="icon" variant="ghost" onClick={() => approveMutation.mutate([a.id])} title="Aprovar">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              </Button>
                            )}
                            {a.status !== "published" && a.status !== "archived" && (
                              <Button size="icon" variant="ghost" onClick={() => publishMutation.mutate([a.id])} title="Publicar">
                                <Send className="h-4 w-4 text-primary" />
                              </Button>
                            )}
                            {a.status === "published" && (
                              <Button size="icon" variant="ghost" onClick={() => revertMutation.mutate(a.id)} title="Reverter para rascunho">
                                <Undo2 className="h-4 w-4" />
                              </Button>
                            )}
                            {a.status !== "archived" && (
                              <Button size="icon" variant="ghost" onClick={() => { setRejectTarget(a); setRejectNotes(""); }} title="Rejeitar">
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              {historyLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">Nenhuma ação registrada ainda</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Artigo</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {format(new Date(h.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {h.user?.full_name || h.user?.email || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{STATUS_LABELS[h.action] || h.action}</Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {h.article ? (
                            <Link to={`/admin/articles/${h.article_id}`} className="hover:text-primary">
                              {h.article.title}
                            </Link>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {h.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Sheet */}
      <Sheet open={!!previewArticle} onOpenChange={(o) => !o && setPreviewArticle(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {previewArticle && (
            <>
              <SheetHeader>
                <SheetTitle>{previewArticle.title}</SheetTitle>
                <SheetDescription className="flex flex-wrap gap-2 items-center">
                  {previewArticle.source_name && <Badge variant="outline">{previewArticle.source_name}</Badge>}
                  {previewArticle.category && <Badge variant="secondary">{previewArticle.category.name}</Badge>}
                  {previewArticle.source_url && (
                    <a href={previewArticle.source_url} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-primary hover:underline">
                      Fonte original <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {previewArticle.featured_image && (
                  <img src={previewArticle.featured_image} alt="" className="w-full rounded-lg" />
                )}
                {previewArticle.excerpt && (
                  <p className="text-muted-foreground italic">{previewArticle.excerpt}</p>
                )}
                <div className="flex gap-2">
                  <Button onClick={() => { approveMutation.mutate([previewArticle.id]); setPreviewArticle(null); }} variant="outline">
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Aprovar
                  </Button>
                  <Button onClick={() => { publishMutation.mutate([previewArticle.id]); setPreviewArticle(null); }}>
                    <Send className="h-4 w-4 mr-2" /> Publicar
                  </Button>
                  <Button asChild variant="ghost">
                    <Link to={`/admin/articles/${previewArticle.id}`}>
                      <Pencil className="h-4 w-4 mr-2" /> Editar
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Reject dialog */}
      <AlertDialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar artigo?</AlertDialogTitle>
            <AlertDialogDescription>
              O artigo será arquivado (preservado para auditoria). Adicione uma justificativa opcional.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Motivo da rejeição (opcional)"
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rejectTarget && rejectMutation.mutate({ ids: [rejectTarget.id], notes: rejectNotes })}
            >
              Rejeitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
