import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Find pending alerts (not yet emailed, still open)
  const { data: alerts } = await supabase
    .from("pipeline_alerts")
    .select("*")
    .is("resolved_at", null)
    .is("notified_email_at", null)
    .order("created_at", { ascending: true })
    .limit(20);

  if (!alerts || alerts.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get recipient email
  const { data: setting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "alerts_email")
    .maybeSingle();

  const rawEmail = setting?.value;
  const recipient = typeof rawEmail === "string" ? rawEmail : (rawEmail?.email || "");
  if (!recipient) {
    console.log("No alerts_email configured; skipping email dispatch");
    return new Response(JSON.stringify({ sent: 0, reason: "no_recipient" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.log("RESEND_API_KEY missing");
    return new Response(JSON.stringify({ sent: 0, reason: "no_resend_key" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let sent = 0;
  for (const alert of alerts) {
    const subject = `[${alert.severity.toUpperCase()}] Pipeline ${alert.stage}: ${alert.title}`;
    const html = `
      <h2>🚨 Alerta de Pipeline — ${alert.severity}</h2>
      <p><strong>Estágio:</strong> ${alert.stage}</p>
      ${alert.source_name ? `<p><strong>Fonte:</strong> ${alert.source_name}</p>` : ""}
      <p><strong>Título:</strong> ${alert.title}</p>
      <p><strong>Criado em:</strong> ${new Date(alert.created_at).toLocaleString("pt-BR")}</p>
      <h3>Detalhes</h3>
      <pre style="background:#f4f4f4;padding:12px;border-radius:6px;font-size:12px;overflow:auto">${
        JSON.stringify(alert.details, null, 2)
      }</pre>
      <p style="color:#888;font-size:12px">Dedupe key: ${alert.dedupe_key}</p>
    `;
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Amazonia Research <onboarding@resend.dev>",
          to: [recipient],
          subject,
          html,
        }),
      });
      if (r.ok) {
        await supabase
          .from("pipeline_alerts")
          .update({ notified_email_at: new Date().toISOString() })
          .eq("id", alert.id);
        sent++;
      } else {
        const err = await r.text();
        console.error("Resend failed:", err);
      }
    } catch (e) {
      console.error("Email send error:", e);
    }
  }

  await supabase.from("pipeline_logs").insert([{
    stage: "dispatcher",
    level: "info",
    event: "dispatch.done",
    message: `Enviados ${sent}/${alerts.length} alertas`,
    metadata: { sent, total: alerts.length },
  }]);

  return new Response(JSON.stringify({ sent, total: alerts.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});