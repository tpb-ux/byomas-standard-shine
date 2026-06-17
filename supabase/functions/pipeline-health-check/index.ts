import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const correlationId = crypto.randomUUID();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const alerts: any[] = [];
  const now = Date.now();

  // 1. Heartbeat check
  const checkHeartbeat = async (sourceName: string, maxMinutes: number, stageLabel: string) => {
    const since = new Date(now - maxMinutes * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("pipeline_metrics")
      .select("id")
      .eq("stage", "cron")
      .eq("event", "heartbeat")
      .eq("source_name", sourceName)
      .gte("created_at", since)
      .limit(1);
    if (!data || data.length === 0) {
      alerts.push({
        severity: "critical",
        stage: stageLabel,
        title: `Cron sem heartbeat: ${sourceName} (>${maxMinutes}min)`,
        details: { sourceName, maxMinutes, correlationId },
        dedupe_key: `cron.no_heartbeat:${sourceName}`,
      });
    }
  };
  await checkHeartbeat("fetch-news", 15, "cron");
  await checkHeartbeat("auto-publish-articles", 60, "cron");

  // 2. Source streak check: 3 consecutive failed runs
  const sinceSources = new Date(now - 6 * 60 * 60 * 1000).toISOString();
  const { data: failingSources } = await supabase
    .from("pipeline_metrics")
    .select("source_id, source_name, items_failed, items_ok, created_at")
    .eq("stage", "fetch")
    .eq("event", "source.run")
    .gte("created_at", sinceSources)
    .order("created_at", { ascending: false });

  if (failingSources) {
    const bySource = new Map<string, any[]>();
    for (const row of failingSources) {
      if (!row.source_id) continue;
      if (!bySource.has(row.source_id)) bySource.set(row.source_id, []);
      bySource.get(row.source_id)!.push(row);
    }
    for (const [sid, runs] of bySource) {
      const last3 = runs.slice(0, 3);
      if (last3.length >= 3 && last3.every((r) => r.items_failed > 0 || r.items_ok === 0)) {
        alerts.push({
          severity: "critical",
          stage: "fetch",
          source_id: sid,
          source_name: last3[0].source_name,
          title: `Fonte ${last3[0].source_name} falhou 3x seguidas`,
          details: { runs: last3, correlationId },
          dedupe_key: `fetch.streak_failed:${sid}`,
        });
      }
    }
  }

  // 3. Insert alerts (idempotent via dedupe_key)
  let alertsCreated = 0;
  for (const a of alerts) {
    const { error } = await supabase
      .from("pipeline_alerts")
      .upsert(a, { onConflict: "dedupe_key", ignoreDuplicates: true });
    if (!error) alertsCreated++;
  }

  // 4. Auto-resolve heartbeat alerts that no longer apply
  const recoveredKeys = [
    "cron.no_heartbeat:fetch-news",
    "cron.no_heartbeat:auto-publish-articles",
    "fetch.crash",
    "publisher.crash",
    "publisher.all_failed",
  ];
  const stillFiring = new Set(alerts.map((a) => a.dedupe_key));
  for (const key of recoveredKeys) {
    if (!stillFiring.has(key)) {
      await supabase
        .from("pipeline_alerts")
        .update({ resolved_at: new Date().toISOString() })
        .eq("dedupe_key", key)
        .is("resolved_at", null);
    }
  }

  // 5. Trigger dispatcher to send pending emails
  try {
    await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/pipeline-alert-dispatcher`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correlationId }),
    });
  } catch (e) {
    console.error("dispatcher trigger failed", e);
  }

  await supabase.from("pipeline_logs").insert([{
    stage: "health",
    level: "info",
    event: "health.run",
    message: `Health check: ${alertsCreated} alertas`,
    metadata: { alertsCreated, evaluated: alerts.length },
    correlation_id: correlationId,
  }]);
  await supabase.from("pipeline_metrics").insert([{
    stage: "cron", event: "heartbeat", source_name: "pipeline-health-check",
    items_in: 0, items_ok: 1, items_failed: 0, items_skipped: 0,
    correlation_id: correlationId,
  }]);

  return new Response(
    JSON.stringify({ success: true, alertsCreated, evaluated: alerts.length, correlationId }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});