import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen } from "lucide-react";

interface InArticleLinksProps {
  articleId: string;
  className?: string;
}

interface InternalLink {
  id: string;
  anchor_text: string;
  target_article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
  } | null;
}

const InArticleLinks = ({ articleId, className }: InArticleLinksProps) => {
  const { data: links, isLoading } = useQuery({
    queryKey: ["in-article-links", articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internal_links")
        .select(`
          id,
          anchor_text,
          target_article:articles!internal_links_target_article_id_fkey(
            id, title, slug, excerpt
          )
        `)
        .eq("source_article_id", articleId)
        .limit(3);

      if (error) throw error;
      return data as InternalLink[];
    },
    enabled: !!articleId,
  });

  if (isLoading || !links || links.length === 0) return null;

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Leia também</h3>
        </div>

        <div className="space-y-4">
          {links.map((link) =>
            link.target_article ? (
              <Link
                key={link.id}
                to={`/blog/${link.target_article.slug}`}
                className="group block"
              >
                <div className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 text-primary mt-1 shrink-0 group-hover:translate-x-1 transition-transform" />
                  <div>
                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {link.target_article.title}
                    </h4>
                    {link.target_article.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {link.target_article.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ) : null
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InArticleLinks;
