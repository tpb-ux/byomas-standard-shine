import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  category: string | null;
  updated_at: string | null;
}

export function useSiteSettings(category?: string) {
  return useQuery({
    queryKey: ["site-settings", category],
    queryFn: async () => {
      let query = supabase
        .from("site_settings")
        .select("*")
        .order("key");

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SiteSetting[];
    },
  });
}

export function useSiteSettingByKey(key: string) {
  return useQuery({
    queryKey: ["site-setting", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", key)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as SiteSetting | null;
    },
  });
}

export function useUpdateSiteSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { data, error } = await supabase
        .from("site_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-setting"] });
      toast.success("Configuração atualizada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });
}

export function useSocialLinks() {
  const { data: settings, isLoading } = useSiteSettings("social");

  const socialLinks = {
    linkedin: settings?.find((s) => s.key === "social_linkedin")?.value || "",
    twitter: settings?.find((s) => s.key === "social_twitter")?.value || "",
    instagram: settings?.find((s) => s.key === "social_instagram")?.value || "",
    facebook: settings?.find((s) => s.key === "social_facebook")?.value || "",
  };

  return { socialLinks, isLoading };
}
