import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-ocean-blue text-primary-foreground">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider">Sobre</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Nossa História</a></li>
              <li><a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Equipe</a></li>
              <li><a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Carreiras</a></li>
              <li><a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Contato</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider">Programas</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">VCS</a></li>
              <li><a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">CCB Standards</a></li>
              <li><a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">SD VISta</a></li>
              <li><a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Plastic Program</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider">Recursos</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Documentação</a></li>
              <li><a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Base de Dados</a></li>
              <li><a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Ferramentas</a></li>
              <li><a href="#" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider">Newsletter</h3>
            <p className="mb-4 text-sm text-primary-foreground/80">
              Receba as últimas atualizações sobre ação climática
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
            © 2025 Byomas Standard. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
