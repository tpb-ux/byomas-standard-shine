import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Home,
  FileText,
  Tags,
  BarChart3,
  FolderTree,
  Mail,
  Settings,
  Newspaper,
  TrendingUp,
  Search,
  ChevronDown,
  LogOut,
  User,
  Activity,
  Zap,
  MessageSquare,
  Users,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

const publicNavItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Blog", url: "/blog", icon: FileText },
  { title: "Projetos", url: "/projetos", icon: FolderTree },
  { title: "Sobre", url: "/sobre", icon: User },
  { title: "Contato", url: "/contato", icon: Mail },
];

const adminNavItems = [
  { title: "Dashboard", url: "/admin", icon: BarChart3 },
  { title: "Gerar Artigo", url: "/admin/generate", icon: Sparkles },
  { title: "Artigos", url: "/admin/articles", icon: FileText },
  { title: "Curadoria", url: "/admin/curator", icon: Newspaper },
  { title: "Automação", url: "/admin/automation", icon: Zap },
  { title: "Topic Clusters", url: "/admin/topics", icon: FolderTree },
  { title: "Pillar Pages", url: "/admin/pillar-pages", icon: FileText },
  { title: "Categorias", url: "/admin/categories", icon: Tags },
  { title: "SEO", url: "/admin/seo", icon: TrendingUp },
  { title: "Performance", url: "/admin/performance", icon: Activity },
  { title: "Fontes", url: "/admin/sources", icon: Search },
  { title: "Newsletter", url: "/admin/subscribers", icon: Users },
  { title: "Mensagens", url: "/admin/messages", icon: MessageSquare },
  { title: "Configurações", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, profile, signOut, isAdmin, isEditor } = useAuth();
  const [adminOpen, setAdminOpen] = useState(location.pathname.startsWith("/admin"));

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const hasAdminAccess = isAdmin || isEditor;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-primary">
            <span className="text-lg font-light tracking-wide text-primary">BR</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-widest text-primary">BYOMA</span>
              <span className="text-lg font-light tracking-wide text-foreground">Research</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span className="font-normal">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {hasAdminAccess && (
          <SidebarGroup>
            <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="flex cursor-pointer items-center justify-between text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  <span>Administração</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      adminOpen && "rotate-180"
                    )}
                  />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminNavItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                          tooltip={item.title}
                        >
                          <Link to={item.url} className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            <span className="font-normal">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm border border-primary/20">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-normal">
                      {profile?.full_name || "Usuário"}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {isAdmin ? "Admin" : isEditor ? "Editor" : "Viewer"}
                    </span>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Perfil
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
          <Link
            to="/auth"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-transparent p-2 text-primary hover:bg-primary/10 transition-colors"
          >
            <User className="h-4 w-4" />
            {!collapsed && <span className="font-normal">Entrar</span>}
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}