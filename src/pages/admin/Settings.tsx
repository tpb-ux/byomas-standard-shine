import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, User, Shield, Bell, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Settings = () => {
  const queryClient = useQueryClient();
  const { user, profile, isAdmin } = useAuth();
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || "",
    avatar_url: profile?.avatar_url || "",
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      if (!isAdmin) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      const roleMap: Record<string, string> = {};
      roles?.forEach((r) => {
        roleMap[r.user_id] = r.role;
      });

      return profiles.map((p) => ({
        ...p,
        role: roleMap[p.id] || "viewer",
      }));
    },
    enabled: isAdmin,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          avatar_url: data.avatar_url || null,
        })
        .eq("id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      // First check if user has a role
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existingRole) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: role as "admin" | "editor" | "viewer" })
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").insert({
          user_id: userId,
          role: role as "admin" | "editor" | "viewer",
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Permissão atualizada!");
    },
    onError: () => {
      toast.error("Erro ao atualizar permissão");
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <span className="text-xs font-medium uppercase tracking-widest text-primary block mb-2">
          CONFIGURAÇÕES
        </span>
        <h1 className="text-3xl font-light tracking-wide text-foreground">Configurações</h1>
        <p className="text-muted-foreground font-normal">
          Gerencie seu perfil e configurações do sistema
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-normal">
            <User className="h-5 w-5 text-primary" />
            Perfil
          </CardTitle>
          <CardDescription>Atualize suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled />
              <p className="text-xs text-muted-foreground mt-1">
                O email não pode ser alterado
              </p>
            </div>
            <div>
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={profileData.full_name}
                onChange={(e) =>
                  setProfileData({ ...profileData, full_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="avatar_url">URL do Avatar</Label>
              <Input
                id="avatar_url"
                value={profileData.avatar_url}
                onChange={(e) =>
                  setProfileData({ ...profileData, avatar_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              variant="outline"
              className="border-border hover:border-primary/50"
            >
              {updateProfileMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Save className="h-4 w-4 mr-2" />
              Salvar Perfil
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* User Management - Admin Only */}
      {isAdmin && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-normal">
              <Shield className="h-5 w-5 text-primary" />
              Gerenciamento de Usuários
            </CardTitle>
            <CardDescription>
              Gerencie permissões dos usuários do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-normal">Usuário</TableHead>
                    <TableHead className="font-normal">Email</TableHead>
                    <TableHead className="font-normal">Função</TableHead>
                    <TableHead className="font-normal">Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((u) => (
                    <TableRow key={u.id} className="hover:bg-accent/50">
                      <TableCell className="font-normal">
                        {u.full_name || "Sem nome"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={u.role}
                          onValueChange={(value) =>
                            updateRoleMutation.mutate({ userId: u.id, role: value })
                          }
                          disabled={u.id === user?.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(u.created_at || "").toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Blog Settings */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-normal">
            <Palette className="h-5 w-5 text-primary" />
            Configurações do Blog
          </CardTitle>
          <CardDescription>
            Configurações gerais do Byoma Research
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Publicação Automática</Label>
              <p className="text-sm text-muted-foreground">
                Publicar artigos automaticamente após geração
              </p>
            </div>
            <Switch disabled />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">
                Receber alertas sobre novas notícias curadas
              </p>
            </div>
            <Switch disabled />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Score SEO Mínimo</Label>
              <p className="text-sm text-muted-foreground">
                Score mínimo para publicação automática
              </p>
            </div>
            <Input
              type="number"
              className="w-20"
              defaultValue={70}
              disabled
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Essas configurações estarão disponíveis em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;