import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Download, MessageSquare, ArrowRight, Sparkles, BookOpen, Phone } from "lucide-react";
import { motion } from "framer-motion";

interface ArticleCTA {
  id: string;
  article_id: string | null;
  position: string;
  title: string;
  description: string | null;
  button_text: string;
  button_link: string;
  background_color: string | null;
  icon: string | null;
  is_active: boolean | null;
}

interface ArticleCTAProps {
  articleId: string;
  position: "after_h2" | "middle" | "end";
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  mail: Mail,
  download: Download,
  message: MessageSquare,
  arrow: ArrowRight,
  sparkles: Sparkles,
  book: BookOpen,
  phone: Phone,
};

// Generate session ID for tracking
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("byoma_session_id");
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("byoma_session_id", sessionId);
  }
  return sessionId;
};

export const ArticleCTA = ({ articleId, position, className = "" }: ArticleCTAProps) => {
  const [isTracking, setIsTracking] = useState(false);

  const { data: cta, isLoading } = useQuery({
    queryKey: ["article-cta", articleId, position],
    queryFn: async (): Promise<ArticleCTA | null> => {
      // First try to get article-specific CTA
      let { data, error } = await supabase
        .from("article_ctas")
        .select("*")
        .eq("article_id", articleId)
        .eq("position", position)
        .eq("is_active", true)
        .single();

      if (!data) {
        // Fallback to global CTA for this position
        const { data: globalCta } = await supabase
          .from("article_ctas")
          .select("*")
          .is("article_id", null)
          .eq("position", position)
          .eq("is_active", true)
          .single();
        
        data = globalCta;
      }

      return data as ArticleCTA | null;
    },
    enabled: !!articleId,
  });

  const trackClick = async () => {
    if (!cta || isTracking) return;
    
    setIsTracking(true);
    
    try {
      await supabase.from("cta_clicks").insert({
        cta_id: cta.id,
        article_id: articleId,
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
      });
    } catch (error) {
      console.error("Error tracking CTA click:", error);
    } finally {
      setIsTracking(false);
    }
  };

  const handleClick = () => {
    trackClick();
    
    // Handle link navigation
    if (cta?.button_link) {
      if (cta.button_link.startsWith("http")) {
        window.open(cta.button_link, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = cta.button_link;
      }
    }
  };

  if (isLoading || !cta) {
    return null;
  }

  const IconComponent = iconMap[cta.icon || "sparkles"] || Sparkles;
  const bgColor = cta.background_color || "#36454F";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card 
        className="overflow-hidden border-0 shadow-lg"
        style={{ 
          background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}ee 100%)` 
        }}
      >
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="p-3 bg-white/10 rounded-xl flex-shrink-0">
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                {cta.title}
              </h3>
              {cta.description && (
                <p className="text-white/80 text-sm md:text-base">
                  {cta.description}
                </p>
              )}
            </div>
            
            <Button
              onClick={handleClick}
              size="lg"
              className="bg-white text-foreground hover:bg-white/90 font-semibold shadow-md flex-shrink-0"
            >
              {cta.button_text}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Default CTAs for when none are configured
export const DefaultCTAs = {
  after_h2: {
    title: "Receba Insights Exclusivos",
    description: "Assine nossa newsletter e receba análises semanais do mercado verde.",
    button_text: "Assinar Grátis",
    button_link: "/#newsletter",
    icon: "mail",
  },
  middle: {
    title: "Aprofunde seus Conhecimentos",
    description: "Explore nossos cursos sobre sustentabilidade e finanças verdes.",
    button_text: "Ver Cursos",
    button_link: "/educacao",
    icon: "book",
  },
  end: {
    title: "Tire suas Dúvidas",
    description: "Fale com nossos especialistas sobre o mercado de crédito de carbono.",
    button_text: "Entre em Contato",
    button_link: "/contato",
    icon: "message",
  },
};

export default ArticleCTA;
