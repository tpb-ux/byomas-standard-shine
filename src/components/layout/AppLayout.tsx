import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation, Link } from "react-router-dom";

interface AppLayoutProps {
  children: ReactNode;
}

const routeNames: Record<string, string> = {
  "/": "Home",
  "/blog": "Blog",
  "/sobre": "Sobre",
  "/contato": "Contato",
  "/auth": "Autenticação",
  "/admin": "Dashboard",
  "/admin/articles": "Artigos",
  "/admin/curator": "Curadoria",
  "/admin/categories": "Categorias",
  "/admin/seo": "SEO",
  "/admin/performance": "Performance",
  "/admin/sources": "Fontes",
  "/admin/settings": "Configurações",
  "/admin/site-settings": "Config. do Site",
};

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const getBreadcrumbs = () => {
    const breadcrumbs = [{ path: "/", name: "Home" }];
    let currentPath = "";

    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      const name = routeNames[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ path: currentPath, name });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <BreadcrumbItem key={crumb.path}>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage className="font-normal">{crumb.name}</BreadcrumbPage>
                  ) : (
                    <>
                      <BreadcrumbLink asChild>
                        <Link to={crumb.path} className="font-normal">{crumb.name}</Link>
                      </BreadcrumbLink>
                      <BreadcrumbSeparator />
                    </>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}