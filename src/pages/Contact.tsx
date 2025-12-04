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
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-hero">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <Breadcrumb items={breadcrumbItems} className="mb-6 text-muted-foreground" />
            
            <div className="max-w-4xl">
              <span className="text-xs font-medium tracking-widest text-primary mb-4 block">
                BYOMA RESEARCH
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                Entre em <span className="text-primary">Contato</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Quer contribuir, sugerir pautas ou saber mais sobre o Byoma Research? Fale conosco
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <ScrollReveal delay={0.1}>
              <div className="bg-card border border-border p-8 text-center hover:border-primary/50 transition-all group">
                <div className="inline-flex bg-primary/10 p-4 mb-6">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  Email
                </h3>
                <p className="text-muted-foreground">contato@byomaresearch.com</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="bg-card border border-border p-8 text-center hover:border-primary/50 transition-all group">
                <div className="inline-flex bg-primary/10 p-4 mb-6">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  Sugestões de Pauta
                </h3>
                <p className="text-muted-foreground">Envie suas ideias de temas para cobertura</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="bg-card border border-border p-8 text-center hover:border-primary/50 transition-all group">
                <div className="inline-flex bg-primary/10 p-4 mb-6">
                  <Linkedin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  LinkedIn
                </h3>
                <p className="text-muted-foreground">Siga-nos para atualizações diárias</p>
              </div>
            </ScrollReveal>
          </div>

          {/* Contact Form */}
          <ScrollReveal delay={0.4}>
            <div className="max-w-3xl mx-auto bg-card border border-border p-8">
              <span className="text-xs font-medium tracking-widest text-primary mb-4 block">
                FORMULÁRIO
              </span>
              <h2 className="text-3xl font-bold text-foreground mb-2">Envie sua Mensagem</h2>
              <p className="text-muted-foreground mb-8">
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