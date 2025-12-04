import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SubscribeRequest = await req.json();

    console.log("Newsletter subscription request:", email);

    // Validate email
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active")
      .eq("email", email)
      .single();

    if (existing) {
      if (existing.is_active) {
        return new Response(
          JSON.stringify({ success: true, message: "Você já está inscrito na nossa newsletter!" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Reactivate subscription
        await supabase
          .from("newsletter_subscribers")
          .update({ is_active: true, unsubscribed_at: null })
          .eq("id", existing.id);
      }
    } else {
      // New subscription
      const { error: dbError } = await supabase.from("newsletter_subscribers").insert({
        email,
        is_active: true,
      });

      if (dbError) {
        console.error("Database error:", dbError);
        if (dbError.code === "23505") {
          return new Response(
            JSON.stringify({ success: true, message: "Você já está inscrito!" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw dbError;
      }
    }

    // Send welcome email
    const emailResponse = await resend.emails.send({
      from: "Byoma Research <onboarding@resend.dev>",
      to: [email],
      subject: "Bem-vindo(a) à Newsletter Byoma Research!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 40px 0; background-color: #36454F;">
            <h1 style="color: #ffffff; margin: 0;">Byoma Research</h1>
          </div>
          
          <div style="padding: 40px 20px;">
            <h2 style="color: #36454F;">Bem-vindo(a) à nossa comunidade!</h2>
            
            <p style="color: #555; line-height: 1.6;">
              Você acaba de se inscrever na newsletter do Byoma Research. 
              Agora você receberá em primeira mão:
            </p>
            
            <ul style="color: #555; line-height: 1.8;">
              <li>Análises e insights sobre o mercado de crédito de carbono</li>
              <li>Atualizações sobre green tokens e tokenização</li>
              <li>Tendências em finanças verdes e sustentabilidade</li>
              <li>Novidades do mercado ReFi (Finanças Regenerativas)</li>
            </ul>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="margin: 0; color: #36454F; font-weight: bold;">
                📰 Enquanto isso, confira nossos últimos artigos no blog!
              </p>
            </div>
            
            <p style="color: #555;">
              Atenciosamente,<br>
              <strong style="color: #36454F;">Equipe Byoma Research</strong>
            </p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
            <p style="color: #888; font-size: 12px; margin: 0;">
              Byoma Research - Insights sobre mercado verde e sustentabilidade<br>
              <a href="https://byoma.com.br" style="color: #36454F;">byoma.com.br</a>
            </p>
            <p style="color: #888; font-size: 11px; margin-top: 10px;">
              Se você não deseja mais receber nossos emails, 
              <a href="#" style="color: #36454F;">clique aqui para cancelar</a>.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Inscrição realizada com sucesso! Verifique seu email." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in newsletter-subscribe function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
