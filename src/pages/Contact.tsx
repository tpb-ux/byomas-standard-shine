import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { SEOHead } from "@/components/SEOHead";
import ContactForm from "@/components/ContactForm";
import ScrollReveal from "@/components/ScrollReveal";
import { Mail, MessageSquare, Linkedin } from "lucide-react";

const Contact = () => {
  const breadcrumbItems = [{ label: "Contato" }];

  return (
    <div className="min-h-screen">
      {/* SEO */}
      <SEOHead
        title="Contato - Fale com o Byoma Research"
        description="Entre em contato com o Byoma Research. Envie sugestões de pauta, dúvidas ou propostas de parceria. Estamos prontos para ajudar."
        url="/contact"
        keywords={["contato byoma research", "fale conosco", "sugestões de pauta", "parceria finanças sustentáveis"]}
      />

      <Navbar />
      
      <section className="pt-32 pb-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} className="mb-6 text-primary-foreground/70" />
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">ENTRE EM CONTATO</h1>
            <p className="text-xl max-w-3xl text-primary-foreground/90">
              Quer contribuir, sugerir pautas ou saber mais sobre o Byoma Research? Fale conosco
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12 mb-16">
            <ScrollReveal delay={0.1}>
              <div className="text-center p-6">
                <div className="inline-flex bg-primary/10 p-4 mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Email</h3>
                <p className="text-muted-foreground">contato@byomaresearch.com</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="text-center p-6">
                <div className="inline-flex bg-primary/10 p-4 mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Sugestões de Pauta</h3>
                <p className="text-muted-foreground">Envie suas ideias de temas para cobertura</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="text-center p-6">
                <div className="inline-flex bg-primary/10 p-4 mb-4">
                  <Linkedin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">LinkedIn</h3>
                <p className="text-muted-foreground">Siga-nos para atualizações diárias</p>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.4}>
            <div className="max-w-3xl mx-auto bg-card border border-border p-8 shadow-card">
              <h2 className="text-3xl font-bold text-foreground mb-2">Envie sua Mensagem</h2>
              <p className="text-muted-foreground mb-6">
                Interessado em parcerias, contribuições ou tem alguma dúvida? Preencha o formulário abaixo.
              </p>
              <ContactForm />
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
