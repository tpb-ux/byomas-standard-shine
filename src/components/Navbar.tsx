import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 z-50 w-full bg-background border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center space-x-1">
          <span className="text-xl font-bold text-primary">AMAZONIA</span>
          <span className="text-xl font-bold text-foreground">RESEARCH</span>
        </Link>
        
        <div className="hidden space-x-8 md:flex">
          <Link to="/blog" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            BLOG
          </Link>
          <Link to="/guias" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            GUIAS
          </Link>
          <Link to="/sobre" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            SOBRE
          </Link>
          <Link to="/contato" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            CONTATO
          </Link>
        </div>
        
        <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground hover:border-foreground">
          PT
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;