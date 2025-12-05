import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [eduOpen, setEduOpen] = useState(false);

  const navLinks = [
    { to: "/blog", label: "BLOG" },
    { to: "/guias", label: "GUIAS" },
  ];

  const educationalLinks = [
    { 
      to: "/educacional/curso/iniciando-credito-carbono", 
      label: "Iniciando no Crédito de Carbono",
      description: "Curso completo para iniciantes no mercado de carbono"
    },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full bg-background border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center space-x-1">
          <span className="text-xl font-bold text-primary">AMAZONIA</span>
          <span className="text-xl font-bold text-foreground">RESEARCH</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden space-x-8 md:flex items-center">
          {navLinks.map((link) => (
            <Link 
              key={link.to}
              to={link.to} 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          
          {/* Educacional Dropdown */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-medium text-muted-foreground bg-transparent hover:text-foreground hover:bg-transparent data-[state=open]:bg-transparent">
                  EDUCACIONAL
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[320px] gap-1 p-2 bg-card border border-border">
                    {educationalLinks.map((link) => (
                      <li key={link.to}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={link.to}
                            className={cn(
                              "block select-none space-y-1 p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent/10 focus:text-accent-foreground"
                            )}
                          >
                            <div className="text-sm font-medium text-foreground leading-none">
                              {link.label}
                            </div>
                            <p className="line-clamp-2 text-xs text-muted-foreground mt-1">
                              {link.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Link 
            to="/sobre" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            SOBRE
          </Link>
          <Link 
            to="/contato" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            CONTATO
          </Link>
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
                  <span className="text-xl font-bold text-primary">AMAZONIA</span>
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
                
                {/* Educacional Mobile Dropdown */}
                <div className="border-b border-border pb-2">
                  <button
                    onClick={() => setEduOpen(!eduOpen)}
                    className="flex items-center justify-between w-full text-lg font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
                  >
                    EDUCACIONAL
                    <ChevronDown className={cn("h-4 w-4 transition-transform", eduOpen && "rotate-180")} />
                  </button>
                  {eduOpen && (
                    <div className="pl-4 mt-2 space-y-2">
                      {educationalLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          className="block text-sm text-muted-foreground hover:text-primary py-2"
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                
                <Link 
                  to="/sobre" 
                  className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground py-2 border-b border-border"
                  onClick={() => setIsOpen(false)}
                >
                  SOBRE
                </Link>
                <Link 
                  to="/contato" 
                  className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground py-2 border-b border-border"
                  onClick={() => setIsOpen(false)}
                >
                  CONTATO
                </Link>
                
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
