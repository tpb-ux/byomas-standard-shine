import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: "/blog", label: "BLOG" },
    { to: "/guias", label: "GUIAS" },
    { to: "/sobre", label: "SOBRE" },
    { to: "/contato", label: "CONTATO" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full bg-background border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center space-x-1">
          <span className="text-xl font-bold text-primary">BYOMA</span>
          <span className="text-xl font-bold text-foreground">RESEARCH</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden space-x-8 md:flex">
          {navLinks.map((link) => (
            <Link 
              key={link.to}
              to={link.to} 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="hidden md:flex border-border text-muted-foreground hover:text-foreground hover:border-foreground">
            PT
          </Button>
          
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background border-border">
              <div className="flex flex-col gap-6 mt-8">
                <Link to="/" className="flex items-center space-x-1 mb-4" onClick={() => setIsOpen(false)}>
                  <span className="text-xl font-bold text-primary">BYOMA</span>
                  <span className="text-xl font-bold text-foreground">RESEARCH</span>
                </Link>
                
                {navLinks.map((link) => (
                  <Link 
                    key={link.to}
                    to={link.to} 
                    className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground py-2 border-b border-border"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" className="w-full border-border text-muted-foreground">
                    PT - Português
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;