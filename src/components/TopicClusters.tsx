import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Folder, ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion } from "framer-motion";

interface TopicCluster {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  article_count: number;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const TopicClusters = () => {
  // Fetch all categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories-for-topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");

      if (error) throw error;
      return data as Category[];
    },
  });

  // Fetch all topic clusters
  const { data: topics, isLoading: isLoadingTopics } = useQuery({
    queryKey: ["all-topic-clusters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topic_clusters")
        .select("id, name, slug, description, icon, article_count, category_id")
        .eq("is_active", true)
        .order("article_count", { ascending: false });

      if (error) throw error;
      return data as TopicCluster[];
    },
  });

  const isLoading = isLoadingCategories || isLoadingTopics;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!topics || topics.length === 0) {
    return null;
  }

  // Group topics by category
  const topicsByCategory = categories?.reduce((acc, cat) => {
    acc[cat.id] = topics.filter((t) => t.category_id === cat.id);
    return acc;
  }, {} as Record<string, TopicCluster[]>) || {};

  // Topics without category
  const uncategorizedTopics = topics.filter((t) => !t.category_id);

  const allTopicGroups = [
    { id: "all", name: "Todos", topics: topics },
    ...categories?.filter((cat) => topicsByCategory[cat.id]?.length > 0).map((cat) => ({
      id: cat.id,
      name: cat.name,
      topics: topicsByCategory[cat.id],
    })) || [],
  ];

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Explore por Tópicos</h2>
          <p className="text-muted-foreground">Navegue por áreas de interesse específicas</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 mb-6">
          {allTopicGroups.map((group) => (
            <TabsTrigger
              key={group.id}
              value={group.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-full border border-border"
            >
              {group.name}
              <Badge variant="secondary" className="ml-2 text-xs">
                {group.topics.length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {allTopicGroups.map((group) => (
          <TabsContent key={group.id} value={group.id} className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {group.topics.map((topic, index) => {
                const IconComponent = topic.icon
                  ? (LucideIcons as any)[topic.icon] || Folder
                  : Folder;

                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`/topico/${topic.slug}`}>
                      <Card className="group h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <CardContent className="p-4 flex flex-col h-full">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {topic.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {topic.article_count} artigo{topic.article_count !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>

                          {topic.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                              {topic.description}
                            </p>
                          )}

                          <div className="mt-3 flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Explorar</span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
};

export default TopicClusters;
