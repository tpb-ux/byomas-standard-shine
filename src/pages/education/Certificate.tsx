import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Download, CheckCircle2 } from "lucide-react";
import { useCertificate } from "@/hooks/useEducation";
import { toast } from "sonner";
import { SocialShareButtons } from "@/components/education/SocialShareButtons";

const Certificate = () => {
  const { code } = useParams<{ code: string }>();
  const { data: certificate, isLoading, error } = useCertificate(code || "");

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = certificate 
    ? `🎓 Certificado: ${certificate.student_name} - ${(certificate as any)?.courses?.title} | Amazonia Research`
    : "Certificado Amazonia Research";
  const shareDescription = certificate
    ? `${certificate.student_name} completou com sucesso o curso "${(certificate as any)?.courses?.title}" na Amazonia Research`
    : "";

  const handleDownload = () => {
    toast.info("Funcionalidade de download PDF em desenvolvimento");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 pt-32 pb-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <Skeleton className="h-[600px] w-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 pt-32 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Certificado não encontrado</h1>
            <p className="text-muted-foreground mb-8">
              O código de certificado informado não existe ou é inválido.
            </p>
            <Link to="/">
              <Button>Voltar ao início</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const issuedDate = certificate.issued_at 
    ? new Date(certificate.issued_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : '';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={`Certificado - ${certificate.student_name} | Amazonia Research`}
        description={`Certificado de conclusão do curso ${(certificate as any)?.courses?.title}`}
        url={`/educacional/certificado/${code}`}
      />
      
      <Navbar />
      
      <section className="pt-32 pb-16 flex-1">
        <div className="container mx-auto px-6 max-w-4xl">
          <ScrollReveal>
            {/* Verification Badge */}
            <div className="flex items-center justify-center gap-2 text-primary mb-8">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Certificado Verificado</span>
            </div>
            
            {/* Certificate Card */}
            <Card className="bg-card border-2 border-primary/30 overflow-hidden">
              <CardContent className="p-0">
                {/* Certificate Content */}
                <div className="p-12 md:p-16 text-center relative">
                  {/* Decorative corners */}
                  <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary/50" />
                  <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary/50" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary/50" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-primary/50" />
                  
                  {/* Logo */}
                  <div className="flex items-center justify-center gap-1 mb-8">
                    <span className="text-2xl font-bold text-primary">AMAZONIA</span>
                    <span className="text-2xl font-bold text-foreground">RESEARCH</span>
                  </div>
                  
                  {/* Title */}
                  <h1 className="text-lg tracking-widest text-muted-foreground mb-4">
                    CERTIFICADO DE CONCLUSÃO
                  </h1>
                  
                  {/* Award Icon */}
                  <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-8">
                    <Award className="h-10 w-10 text-primary" />
                  </div>
                  
                  {/* This is to certify */}
                  <p className="text-muted-foreground mb-4">
                    Certificamos que
                  </p>
                  
                  {/* Student Name */}
                  <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 border-b-2 border-primary/30 pb-4 inline-block px-8">
                    {certificate.student_name}
                  </h2>
                  
                  {/* Course completion text */}
                  <p className="text-muted-foreground mt-8 mb-2">
                    concluiu com sucesso o curso
                  </p>
                  
                  {/* Course Title */}
                  <h3 className="text-2xl font-semibold text-primary mb-8">
                    {(certificate as any)?.courses?.title}
                  </h3>
                  
                  {/* Date and Code */}
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-muted-foreground mt-12">
                    <div>
                      <p className="font-medium text-foreground">Data de Emissão</p>
                      <p>{issuedDate}</p>
                    </div>
                    <div className="hidden md:block w-px h-10 bg-border" />
                    <div>
                      <p className="font-medium text-foreground">Código de Verificação</p>
                      <p className="font-mono">{certificate.certificate_code}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Actions */}
            <div className="flex flex-col items-center gap-6 mt-8">
              {/* Social Share Buttons */}
              <div>
                <p className="text-sm text-muted-foreground mb-3 text-center">
                  Compartilhe sua conquista
                </p>
                <SocialShareButtons
                  url={shareUrl}
                  title={shareTitle}
                  description={shareDescription}
                  hashtags={["CreditoCarbono", "Sustentabilidade", "AmazoniaResearch", "Certificado"]}
                />
              </div>
              
              <Button onClick={handleDownload} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Baixar PDF
              </Button>
            </div>
            
            {/* Verification Info */}
            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground">
                Este certificado pode ser verificado em{" "}
                <span className="text-primary">
                  amazonia.research/educacional/certificado/{certificate.certificate_code}
                </span>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Certificate;
