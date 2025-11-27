import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import ScrollReveal from "@/components/ScrollReveal";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="pt-32 pb-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">ENTRE EM CONTATO</h1>
            <p className="text-xl max-w-3xl text-primary-foreground/90">
              Estamos aqui para ajudar com suas dúvidas sobre certificação e padrões ambientais
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
                <p className="text-muted-foreground">contato@byomas.com</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="text-center p-6">
                <div className="inline-flex bg-primary/10 p-4 mb-4">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Telefone</h3>
                <p className="text-muted-foreground">+55 (11) 3000-0000</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="text-center p-6">
                <div className="inline-flex bg-primary/10 p-4 mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Endereço</h3>
                <p className="text-muted-foreground">São Paulo, Brasil</p>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.4}>
            <div className="max-w-3xl mx-auto bg-card border border-border p-8 shadow-card">
              <h2 className="text-3xl font-bold text-foreground mb-6">Envie sua Mensagem</h2>
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
