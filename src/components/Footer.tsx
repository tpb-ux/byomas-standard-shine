import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-ocean-blue text-primary-foreground">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider">Sobre</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/sobre" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider">Temas</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/blog" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
                  Crédito de Carbono
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
                  Sustentabilidade
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
                  Finanças Verdes
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
                  Tokenização
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider">Recursos</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/blog" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/projetos" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
                  Projetos
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider">Newsletter</h3>
            <p className="mb-4 text-sm text-primary-foreground/80">
              Receba insights sobre mercado verde e sustentabilidade
            </p>
            <div className="mb-4 flex gap-2">
              <Input 
                type="email" 
                placeholder="Seu e-mail" 
                className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                Inscrever
              </Button>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-primary-foreground/20 pt-8 text-center">
          <p className="text-sm text-primary-foreground/60">
            © 2025 Byoma Research. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
