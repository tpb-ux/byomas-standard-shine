import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PipelineLog = {
  id: string;
  created_at: string;
  stage: string;
  source_id: string | null;
  source_name: string | null;
  level: "info" | "warn" | "error";
  event: string;
  message: string | null;
  metadata: Record<string, any>;
  duration_ms: number | null;
  correlation_id: string | null;
};

export type PipelineAlert = {
  id: string;
  created_at: string;
  severity: "warning" | "critical";
  stage: string;
  source_id: string | null;
  source_name: string | null;
  title: string;
  details: Record<string, any>;
  dedupe_key: string;
  resolved_at: string | null;
  notified_email_at: string | null;
};

export type PipelineMetric = {
  id: string;
  created_at: string;
  stage: string;
  source_id: string | null;
  source_name: string | null;
  event: string;
  items_in: number;
  items_ok: number;
  items_failed: number;
  items_skipped: number;
  duration_ms: number | null;
};

export type LogFilters = {
  stage?: string;
  level?: string;
  sourceId?: string;
  correlationId?: string;
  limit?: number;
};

export function usePipelineLogs(filters: LogFilters = {}) {
  return useQuery({
    queryKey: ["pipeline_logs", filters],
    queryFn: async () => {
      let q = supabase
        .from("pipeline_logs" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(filters.limit ?? 200);
      if (filters.stage) q = q.eq("stage", filters.stage);
      if (filters.level) q = q.eq("level", filters.level);
      if (filters.sourceId) q = q.eq("source_id", filters.sourceId);
      if (filters.correlationId) q = q.eq("correlation_id", filters.correlationId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as PipelineLog[];
    },
    refetchInterval: 15000,
  });
}

export function usePipelineAlerts(onlyOpen = true) {
  return useQuery({
    queryKey: ["pipeline_alerts", onlyOpen],
    queryFn: async () => {
      let q = supabase
        .from("pipeline_alerts" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (onlyOpen) q = q.is("resolved_at", null);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as PipelineAlert[];
    },
    refetchInterval: 10000,
  });
}

export function usePipelineMetrics(hours = 24) {
  return useQuery({
    queryKey: ["pipeline_metrics", hours],
    queryFn: async () => {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("pipeline_metrics" as any)
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return (data ?? []) as unknown as PipelineMetric[];
    },
    refetchInterval: 30000,
  });
}

export async function resolveAlert(id: string) {
  const { error } = await supabase
    .from("pipeline_alerts" as any)
    .update({ resolved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}