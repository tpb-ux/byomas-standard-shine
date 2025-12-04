import { Facebook, Twitter, Linkedin, Instagram, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-primary">
              Sobre
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/sobre" 
                  className="group flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Quem Somos
                  <ChevronRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/contato" 
                  className="group flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contato
                  <ChevronRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-primary">
              Temas
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/blog" 
                  className="group flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Crédito de Carbono
                  <ChevronRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="group flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sustentabilidade
                  <ChevronRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="group flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Finanças Verdes
                  <ChevronRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="group flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tokenização
                  <ChevronRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-primary">
              Recursos
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/blog" 
                  className="group flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                  <ChevronRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/projetos" 
                  className="group flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Projetos
                  <ChevronRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-primary">
              Newsletter
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Receba insights sobre mercado verde e sustentabilidade
            </p>
            <div className="mb-4 flex gap-2">
              <Input 
                type="email" 
                placeholder="Seu e-mail" 
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Inscrever
              </Button>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Byoma Research. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;