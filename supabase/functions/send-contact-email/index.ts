import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  message: string;
}

const inquiryTypeLabels: Record<string, string> = {
  certification: "Certificação de Projetos",
  information: "Informações sobre Padrões",
  partnership: "Parcerias Comerciais",
  support: "Suporte Técnico",
  press: "Imprensa e Mídia",
  other: "Outros",
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, inquiryType, message }: ContactRequest = await req.json();

    console.log("Received contact form submission:", { name, email, inquiryType });

    // Validate required fields
    if (!name || !email || !inquiryType || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase.from("contact_messages").insert({
      name,
      email,
      phone: phone || null,
      inquiry_type: inquiryType,
      message,
    });

    if (dbError) {
      console.error("Database error:", dbError);
    }

    // Send notification email to admin
    const adminEmail = await resend.emails.send({
      from: "Amazonia Research <onboarding@resend.dev>",
      to: ["contato@amazonia.research"],
      subject: `[Amazonia Research] Nova mensagem de contato: ${inquiryTypeLabels[inquiryType] || inquiryType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #36454F;">Nova Mensagem de Contato</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Telefone:</strong> ${phone}</p>` : ""}
            <p><strong>Tipo de Consulta:</strong> ${inquiryTypeLabels[inquiryType] || inquiryType}</p>
          </div>
          <div style="background-color: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #36454F;">Mensagem:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">
            Esta mensagem foi enviada através do formulário de contato do Amazonia Research.
          </p>
        </div>
      `,
    });

    console.log("Admin notification sent:", adminEmail);

    // Send confirmation email to user
    const userEmail = await resend.emails.send({
      from: "Amazonia Research <onboarding@resend.dev>",
      to: [email],
      subject: "Recebemos sua mensagem - Amazonia Research",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #36454F;">Olá ${name}!</h2>
          <p>Obrigado por entrar em contato conosco. Recebemos sua mensagem e nossa equipe irá analisá-la em breve.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Tipo de Consulta:</strong> ${inquiryTypeLabels[inquiryType] || inquiryType}</p>
            <p><strong>Sua mensagem:</strong></p>
            <p style="white-space: pre-wrap; font-style: italic;">"${message.substring(0, 200)}${message.length > 200 ? "..." : ""}"</p>
          </div>
          <p>Normalmente respondemos dentro de 1-2 dias úteis.</p>
          <p>Atenciosamente,<br><strong>Equipe Amazonia Research</strong></p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          <p style="color: #888; font-size: 12px;">
            Amazonia Research - Insights sobre mercado verde e sustentabilidade<br>
            <a href="https://amazonia.research" style="color: #36454F;">amazonia.research</a>
          </p>
        </div>
      `,
    });

    console.log("User confirmation sent:", userEmail);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
