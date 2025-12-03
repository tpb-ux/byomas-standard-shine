import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "editor";
}

export function ProtectedRoute({ children, requiredRole = "editor" }: ProtectedRouteProps) {
  const { user, isLoading, isAdmin, isEditor } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const hasRequiredRole = 
    requiredRole === "admin" ? isAdmin : (isAdmin || isEditor);

  if (!hasRequiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 text-center max-w-md px-4">
          <div className="p-4 rounded-full bg-destructive/10">
            <ShieldX className="h-12 w-12 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página. 
              É necessário ter a role de {requiredRole === "admin" ? "administrador" : "editor"}.
            </p>
          </div>
          <Button onClick={() => window.history.back()} variant="outline">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
