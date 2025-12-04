import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, FileText } from "lucide-react";
import { toast } from "sonner";

interface ArticleClusterModalProps {
  clusterId: string;
  clusterName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string | null;
  topic_cluster_id: string | null;
}

const ArticleClusterModal = ({
  clusterId,
  clusterName,
  open,
  onOpenChange,
}: ArticleClusterModalProps) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());

  // Fetch all published articles
  const { data: articles, isLoading } = useQuery({
    queryKey: ["articles-for-cluster", clusterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, status, topic_cluster_id")
        .eq("status", "published")
        .order("title");
      if (error) throw error;
      return data as Article[];
    },
    enabled: open,
  });

  // Initialize selected articles when modal opens
  useEffect(() => {
    if (articles && open) {
      const currentClusterArticles = articles
        .filter((a) => a.topic_cluster_id === clusterId)
        .map((a) => a.id);
      setSelectedArticles(new Set(currentClusterArticles));
    }
  }, [articles, clusterId, open]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Get articles currently in this cluster
      const currentArticles = articles?.filter((a) => a.topic_cluster_id === clusterId) || [];
      const currentIds = new Set(currentArticles.map((a) => a.id));

      // Articles to add to cluster
      const toAdd = Array.from(selectedArticles).filter((id) => !currentIds.has(id));
      // Articles to remove from cluster
      const toRemove = Array.from(currentIds).filter((id) => !selectedArticles.has(id));

      // Update articles being added
      if (toAdd.length > 0) {
        const { error: addError } = await supabase
          .from("articles")
          .update({ topic_cluster_id: clusterId })
          .in("id", toAdd);
        if (addError) throw addError;
      }

      // Update articles being removed (set to null)
      if (toRemove.length > 0) {
        const { error: removeError } = await supabase
          .from("articles")
          .update({ topic_cluster_id: null })
          .in("id", toRemove);
        if (removeError) throw removeError;
      }

      // Update article_count on topic_cluster
      const { error: countError } = await supabase
        .from("topic_clusters")
        .update({ article_count: selectedArticles.size })
        .eq("id", clusterId);
      if (countError) throw countError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-topic-clusters"] });
      queryClient.invalidateQueries({ queryKey: ["articles-for-cluster"] });
      toast.success("Artigos atualizados com sucesso!");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  const toggleArticle = (articleId: string) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId);
    } else {
      newSelected.add(articleId);
    }
    setSelectedArticles(newSelected);
  };

  const filteredArticles = articles?.filter((article) =>
    article.title.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCount = selectedArticles.size;
  const currentClusterCount = articles?.filter((a) => a.topic_cluster_id === clusterId).length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-normal flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Gerenciar Artigos - {clusterName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar artigos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="secondary">
              {selectedCount} selecionado(s)
            </Badge>
            <span className="text-muted-foreground">
              {currentClusterCount} atualmente no cluster
            </span>
          </div>

          {/* Articles List */}
          <ScrollArea className="h-[350px] border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredArticles && filteredArticles.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredArticles.map((article) => {
                  const isSelected = selectedArticles.has(article.id);
                  const isInOtherCluster =
                    article.topic_cluster_id && article.topic_cluster_id !== clusterId;

                  return (
                    <div
                      key={article.id}
                      className={`flex items-center gap-3 p-3 hover:bg-accent/50 cursor-pointer transition-colors ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                      onClick={() => toggleArticle(article.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleArticle(article.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-normal text-sm truncate">{article.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          /blog/{article.slug}
                        </p>
                      </div>
                      {isInOtherCluster && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          Outro cluster
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Nenhum artigo encontrado
              </div>
            )}
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (selectedArticles.size === filteredArticles?.length) {
                  setSelectedArticles(new Set());
                } else {
                  setSelectedArticles(new Set(filteredArticles?.map((a) => a.id) || []));
                }
              }}
            >
              {selectedArticles.size === filteredArticles?.length
                ? "Desmarcar todos"
                : "Selecionar todos"}
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Salvar ({selectedCount})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleClusterModal;
