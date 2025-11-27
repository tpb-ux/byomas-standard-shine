import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 z-50 w-full bg-forest-dark/95 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary-foreground">
            <span className="text-sm font-bold text-primary">BS</span>
          </div>
          <span className="text-xl font-bold text-primary-foreground">BYOMAS STANDARD</span>
        </div>
        
        <div className="hidden space-x-8 md:flex">
          <a href="#" className="text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground">
            PROGRAMAS
          </a>
          <a href="#" className="text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground">
            PROJETOS
          </a>
          <a href="#" className="text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground">
            SOBRE
          </a>
          <a href="#" className="text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground">
            NOTÍCIAS
          </a>
          <a href="#" className="text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground">
            CONTATO
          </a>
        </div>
        
        <Button variant="outline" size="sm" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-forest-dark">
          PT
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
