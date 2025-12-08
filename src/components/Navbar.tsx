import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Menu, ChevronDown, User, LogOut, LayoutDashboard, Trophy, BookOpen, Calculator, FileText, GraduationCap, Building2, Leaf, Award, TrendingUp, BarChart3, Globe, DollarSign, Lightbulb, Mail } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [paraVoceOpen, setParaVoceOpen] = useState(false);
  const [paraEmpresaOpen, setParaEmpresaOpen] = useState(false);
  const [relatorioOpen, setRelatorioOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const paraVoceLinks = [
    { 
      to: "/glossario", 
      label: "Glossário",
      description: "Termos essenciais do mercado de carbono e sustentabilidade",
      icon: BookOpen
    },
    { 
      to: "/calculadora-carbono", 
      label: "Calculadora de Carbono",
      description: "Calcule sua pegada de carbono pessoal",
      icon: Calculator
    },
    { 
      to: "/blog", 
      label: "Blog",
      description: "Artigos e análises do mercado de sustentabilidade",
      icon: FileText
    },
    { 
      to: "/guias", 
      label: "Guias Práticos",
      description: "Guias passo a passo para investir em green finance",
      icon: BookOpen
    },
    { 
      to: "/educacional", 
      label: "Cursos",
      description: "Aprenda sobre crédito de carbono e finanças verdes",
      icon: GraduationCap
    },
  ];

  const paraEmpresaLinks = [
    { 
      to: "/contato", 
      label: "Consultoria ESG",
      description: "Soluções personalizadas para sua estratégia de sustentabilidade",
      icon: Building2
    },
    { 
      to: "/guias", 
      label: "Neutralização de Carbono",
      description: "Como compensar as emissões da sua empresa",
      icon: Leaf
    },
    { 
      to: "/certificacoes-ambientais", 
      label: "Certificações Ambientais",
      description: "Certificações e selos para empresas sustentáveis",
      icon: Award
    },
    { 
      to: "/casos-de-sucesso", 
      label: "Casos de Sucesso",
      description: "Empresas que transformaram seus negócios com sustentabilidade",
      icon: TrendingUp
    },
    { 
      to: "/ranking-sustentabilidade", 
      label: "Ranking de Sustentabilidade",
      description: "As empresas mais sustentáveis do Brasil em um ranking interativo",
      icon: Trophy
    },
    { 
      to: "/contato", 
      label: "Entre em Contato",
      description: "Fale com nossa equipe para soluções corporativas",
      icon: Mail
    },
  ];

  const relatorioLinks = [
    { 
      to: "/blog?tag=relatorios", 
      label: "Relatório de Mercado",
      description: "Análises semanais do mercado de crédito de carbono",
      icon: BarChart3
    },
    { 
      to: "/blog?tag=tendencias", 
      label: "Tendências Globais",
      description: "O que está movimentando o mercado de sustentabilidade",
      icon: Globe
    },
    { 
      to: "/blog?tag=precos", 
      label: "Preços de Carbono",
      description: "Acompanhe a evolução dos preços dos créditos de carbono",
      icon: DollarSign
    },
    { 
      to: "/blog?tag=refi", 
      label: "Insights ReFi",
      description: "Análises do mercado de finanças regenerativas",
      icon: Lightbulb
    },
    { 
      to: "/contato", 
      label: "Newsletters",
      description: "Assine nosso boletim semanal de insights",
      icon: Mail
    },
  ];

  // Check if any link in the menu matches current route
  const isMenuActive = (links: typeof paraVoceLinks) => {
    return links.some(link => {
      const linkPath = link.to.split('?')[0];
      return location.pathname === linkPath || location.pathname.startsWith(linkPath + '/');
    });
  };

  const renderDropdownMenu = (
    label: string,
    links: typeof paraVoceLinks
  ) => {
    const isActive = isMenuActive(links);
    
    return (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger 
              className={cn(
                "text-sm font-medium bg-transparent hover:text-foreground hover:bg-transparent data-[state=open]:bg-transparent transition-colors",
                isActive 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-muted-foreground"
              )}
            >
              {label}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[350px] gap-1 p-2 bg-card border border-border">
                {links.map((link) => (
                  <li key={link.to + link.label}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={link.to}
                        className={cn(
                          "flex items-start gap-3 select-none p-3 leading-none no-underline outline-none rounded-md",
                          "transition-all duration-200 ease-out",
                          "hover:translate-x-2 hover:bg-accent/10 hover:text-accent-foreground",
                          "focus:translate-x-2 focus:bg-accent/10 focus:text-accent-foreground"
                        )}
                      >
                        <link.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-foreground leading-none">
                            {link.label}
                          </div>
                          <p className="line-clamp-2 text-xs text-muted-foreground mt-1">
                            {link.description}
                          </p>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
  };

  const renderMobileDropdown = (
    label: string,
    links: typeof paraVoceLinks,
    isDropdownOpen: boolean,
    setOpen: (open: boolean) => void
  ) => (
    <div className="border-b border-border pb-2">
      <button
        onClick={() => setOpen(!isDropdownOpen)}
        className={cn(
          "flex items-center justify-between w-full text-lg font-medium transition-colors py-2",
          isMenuActive(links) ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isDropdownOpen && "rotate-180")} />
      </button>
      {isDropdownOpen && (
        <div className="pl-4 mt-2 space-y-2">
          {links.map((link) => (
            <Link
              key={link.to + link.label}
              to={link.to}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary py-2 transition-all duration-200 hover:translate-x-2"
              onClick={() => setIsOpen(false)}
            >
              <link.icon className="h-4 w-4 text-primary" />
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <nav className="fixed top-0 z-50 w-full bg-background border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center space-x-1 group transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]">
          <span className="text-xl font-bold text-primary transition-colors duration-300 group-hover:text-primary/80">AMAZONIA</span>
          <span className="text-xl font-bold text-foreground italic bg-primary/20 px-1.5 py-0.5 rounded transition-all duration-300 group-hover:bg-primary/30 group-hover:shadow-[0_0_8px_hsl(var(--primary)/0.4)]">RESEARCH</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden space-x-2 lg:flex items-center">
          {renderDropdownMenu("PARA VOCÊ", paraVoceLinks)}
          {renderDropdownMenu("PARA SUA EMPRESA", paraEmpresaLinks)}
          {renderDropdownMenu("RELATÓRIO", relatorioLinks)}

          <Link 
            to="/sobre" 
            className={cn(
              "text-sm font-medium transition-colors px-4",
              location.pathname === "/sobre" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            SOBRE
          </Link>
          <Link 
            to="/contato" 
            className={cn(
              "text-sm font-medium transition-colors px-4",
              location.pathname === "/contato" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            CONTATO
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="hidden lg:flex border-border text-muted-foreground hover:text-foreground hover:border-foreground">
            PT
          </Button>
          
          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden lg:flex gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[100px] truncate text-sm">
                    {profile?.full_name || "Minha Conta"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/minha-conta" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Meu Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/educacional/ranking" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Ranking
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="hidden lg:block">
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Entrar
              </Button>
            </Link>
          )}
          
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background border-border overflow-y-auto">
              <div className="flex flex-col gap-4 mt-8">
                <Link to="/" className="flex items-center space-x-1 mb-4 group transition-all duration-300 hover:drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]" onClick={() => setIsOpen(false)}>
                  <span className="text-xl font-bold text-primary transition-colors duration-300 group-hover:text-primary/80">AMAZONIA</span>
                  <span className="text-xl font-bold text-foreground italic bg-primary/20 px-1.5 py-0.5 rounded transition-all duration-300 group-hover:bg-primary/30 group-hover:shadow-[0_0_8px_hsl(var(--primary)/0.4)]">RESEARCH</span>
                </Link>
                
                {renderMobileDropdown("PARA VOCÊ", paraVoceLinks, paraVoceOpen, setParaVoceOpen)}
                {renderMobileDropdown("PARA SUA EMPRESA", paraEmpresaLinks, paraEmpresaOpen, setParaEmpresaOpen)}
                {renderMobileDropdown("RELATÓRIO", relatorioLinks, relatorioOpen, setRelatorioOpen)}
                
                <Link 
                  to="/sobre" 
                  className={cn(
                    "text-lg font-medium transition-colors py-2 border-b border-border",
                    location.pathname === "/sobre" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  SOBRE
                </Link>
                <Link 
                  to="/contato" 
                  className={cn(
                    "text-lg font-medium transition-colors py-2 border-b border-border",
                    location.pathname === "/contato" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  CONTATO
                </Link>

                {/* Mobile Auth */}
                {user ? (
                  <div className="mt-4 pt-4 border-t border-border space-y-2">
                    <Link 
                      to="/minha-conta" 
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Meu Dashboard
                    </Link>
                    <Link 
                      to="/educacional/ranking" 
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <Trophy className="h-4 w-4" />
                      Ranking
                    </Link>
                    <button 
                      onClick={() => { signOut(); setIsOpen(false); }}
                      className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 py-2 w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <User className="h-4 w-4" />
                        Entrar
                      </Button>
                    </Link>
                  </div>
                )}
                
                <div className="pt-4 border-t border-border">
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
