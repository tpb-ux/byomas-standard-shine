import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type NotificationType = 
  | "badge_earned"
  | "module_completed"
  | "quiz_passed"
  | "certificate_issued";

interface NotificationRequest {
  type: NotificationType;
  userEmail: string;
  userName: string;
  data: {
    badgeName?: string;
    badgeIcon?: string;
    badgePoints?: number;
    moduleName?: string;
    courseName?: string;
    quizScore?: number;
    certificateCode?: string;
    pointsEarned?: number;
  };
}

const iconMap: Record<string, string> = {
  award: "🏆",
  star: "⭐",
  book: "📚",
  trophy: "🏅",
  zap: "⚡",
  target: "🎯",
  flame: "🔥",
  graduation: "🎓",
  medal: "🥇",
  rocket: "🚀",
};

function getEmailIcon(iconName: string): string {
  return iconMap[iconName] || "🏆";
}

function getBadgeEarnedEmail(userName: string, data: NotificationRequest["data"]): string {
  const icon = getEmailIcon(data.badgeIcon || "award");
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8faf8;">
      <div style="background: linear-gradient(135deg, #36454F 0%, #4a5f6d 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Parabéns, ${userName}!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Você conquistou um novo badge!</p>
      </div>
      
      <div style="padding: 40px 20px; text-align: center;">
        <div style="width: 120px; height: 120px; margin: 0 auto 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 60px;">${icon}</span>
        </div>
        
        <h2 style="color: #36454F; margin: 0 0 10px 0; font-size: 24px;">${data.badgeName}</h2>
        <p style="color: #10b981; font-weight: bold; margin: 0 0 20px 0;">+${data.badgePoints || 0} pontos</p>
        
        <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0;">Continue sua jornada de aprendizado para conquistar mais badges e subir no ranking!</p>
        </div>
        
        <a href="https://amazonia.research/minha-conta" style="display: inline-block; background: linear-gradient(135deg, #36454F 0%, #4a5f6d 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin-top: 20px;">Continuar Estudando</a>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          Amazonia Research - Educação em Sustentabilidade<br>
          <a href="https://amazonia.research" style="color: #36454F;">amazonia.research</a>
        </p>
      </div>
    </div>
  `;
}

function getModuleCompletedEmail(userName: string, data: NotificationRequest["data"]): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8faf8;">
      <div style="background: linear-gradient(135deg, #36454F 0%, #4a5f6d 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">📚 Módulo Concluído!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Excelente progresso, ${userName}!</p>
      </div>
      
      <div style="padding: 40px 20px; text-align: center;">
        <div style="width: 100px; height: 100px; margin: 0 auto 20px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 50px;">✓</span>
        </div>
        
        <h2 style="color: #36454F; margin: 0 0 10px 0; font-size: 24px;">${data.moduleName}</h2>
        <p style="color: #6b7280; margin: 0 0 20px 0;">do curso ${data.courseName}</p>
        
        ${data.pointsEarned ? `<p style="color: #10b981; font-weight: bold;">+${data.pointsEarned} pontos conquistados!</p>` : ""}
        
        <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0;">Você está progredindo muito bem! Continue para o próximo módulo e avance ainda mais.</p>
        </div>
        
        <a href="https://amazonia.research/educacional" style="display: inline-block; background: linear-gradient(135deg, #36454F 0%, #4a5f6d 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin-top: 20px;">Ver Próximo Módulo</a>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          Amazonia Research - Educação em Sustentabilidade<br>
          <a href="https://amazonia.research" style="color: #36454F;">amazonia.research</a>
        </p>
      </div>
    </div>
  `;
}

function getQuizPassedEmail(userName: string, data: NotificationRequest["data"]): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8faf8;">
      <div style="background: linear-gradient(135deg, #36454F 0%, #4a5f6d 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎯 Avaliação Aprovada!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Parabéns pelo seu desempenho, ${userName}!</p>
      </div>
      
      <div style="padding: 40px 20px; text-align: center;">
        <div style="width: 120px; height: 120px; margin: 0 auto 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 48px; color: white; font-weight: bold;">${data.quizScore}%</span>
        </div>
        
        <h2 style="color: #36454F; margin: 0 0 10px 0; font-size: 24px;">Você passou!</h2>
        <p style="color: #6b7280; margin: 0 0 20px 0;">Módulo: ${data.moduleName}</p>
        
        ${data.pointsEarned ? `<p style="color: #10b981; font-weight: bold;">+${data.pointsEarned} pontos conquistados!</p>` : ""}
        
        <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0;">Excelente resultado! Continue avançando para conquistar seu certificado.</p>
        </div>
        
        <a href="https://amazonia.research/educacional" style="display: inline-block; background: linear-gradient(135deg, #36454F 0%, #4a5f6d 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin-top: 20px;">Continuar Curso</a>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          Amazonia Research - Educação em Sustentabilidade<br>
          <a href="https://amazonia.research" style="color: #36454F;">amazonia.research</a>
        </p>
      </div>
    </div>
  `;
}

function getCertificateIssuedEmail(userName: string, data: NotificationRequest["data"]): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8faf8;">
      <div style="background: linear-gradient(135deg, #36454F 0%, #4a5f6d 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎓 Certificado Emitido!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Parabéns pela sua conquista, ${userName}!</p>
      </div>
      
      <div style="padding: 40px 20px; text-align: center;">
        <div style="width: 120px; height: 120px; margin: 0 auto 20px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 60px;">🎓</span>
        </div>
        
        <h2 style="color: #36454F; margin: 0 0 10px 0; font-size: 24px;">${data.courseName}</h2>
        <p style="color: #6b7280; margin: 0 0 20px 0;">Curso concluído com sucesso!</p>
        
        <div style="background-color: #ffffff; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0 0 10px 0;">Código do certificado:</p>
          <p style="color: #36454F; font-size: 18px; font-weight: bold; font-family: monospace; margin: 0;">${data.certificateCode}</p>
        </div>
        
        <a href="https://amazonia.research/educacional/certificado/${data.certificateCode}" style="display: inline-block; background: linear-gradient(135deg, #36454F 0%, #4a5f6d 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin-top: 20px;">Ver Certificado</a>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          Amazonia Research - Educação em Sustentabilidade<br>
          <a href="https://amazonia.research" style="color: #36454F;">amazonia.research</a>
        </p>
      </div>
    </div>
  `;
}

function getEmailContent(type: NotificationType, userName: string, data: NotificationRequest["data"]): { subject: string; html: string } {
  switch (type) {
    case "badge_earned":
      return {
        subject: `🏆 Você conquistou o badge "${data.badgeName}"! - Amazonia Research`,
        html: getBadgeEarnedEmail(userName, data),
      };
    case "module_completed":
      return {
        subject: `📚 Módulo "${data.moduleName}" concluído! - Amazonia Research`,
        html: getModuleCompletedEmail(userName, data),
      };
    case "quiz_passed":
      return {
        subject: `🎯 Você passou na avaliação com ${data.quizScore}%! - Amazonia Research`,
        html: getQuizPassedEmail(userName, data),
      };
    case "certificate_issued":
      return {
        subject: `🎓 Seu certificado está pronto! - Amazonia Research`,
        html: getCertificateIssuedEmail(userName, data),
      };
    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, userEmail, userName, data }: NotificationRequest = await req.json();

    console.log("Sending education notification:", { type, userEmail, userName, data });

    // Validate required fields
    if (!type || !userEmail || !userName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, userEmail, userName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, html } = getEmailContent(type, userName, data);

    const emailResponse = await resend.emails.send({
      from: "Amazonia Research <onboarding@resend.dev>",
      to: [userEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent successfully", emailResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-education-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
