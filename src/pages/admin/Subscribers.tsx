import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Download,
  UserCheck,
  UserX,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export default function AdminSubscribers() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && !isAdmin) {
      navigate("/admin");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    fetchSubscribers();
  }, [user]);

  const fetchSubscribers = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      toast.error("Erro ao carregar subscribers");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubscriberStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({
          is_active: !currentStatus,
          unsubscribed_at: !currentStatus ? null : new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      
      setSubscribers(subscribers.map(s => 
        s.id === id ? { ...s, is_active: !currentStatus, unsubscribed_at: !currentStatus ? null : new Date().toISOString() } : s
      ));
      
      toast.success(`Subscriber ${!currentStatus ? "ativado" : "desativado"} com sucesso`);
    } catch (error) {
      console.error("Error toggling subscriber:", error);
      toast.error("Erro ao atualizar subscriber");
    }
  };

  const exportToCSV = () => {
    const filteredData = getFilteredSubscribers();
    const csvContent = [
      ["Email", "Status", "Data de Inscrição", "Data de Cancelamento"].join(","),
      ...filteredData.map(s => [
        s.email,
        s.is_active ? "Ativo" : "Inativo",
        format(new Date(s.subscribed_at), "dd/MM/yyyy HH:mm"),
        s.unsubscribed_at ? format(new Date(s.unsubscribed_at), "dd/MM/yyyy HH:mm") : "",
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `subscribers_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    
    toast.success("Exportação concluída!");
  };

  const getFilteredSubscribers = () => {
    return subscribers.filter(s => {
      const matchesFilter = filter === "all" || 
        (filter === "active" && s.is_active) || 
        (filter === "inactive" && !s.is_active);
      const matchesSearch = s.email.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const activeCount = subscribers.filter(s => s.is_active).length;
  const inactiveCount = subscribers.filter(s => !s.is_active).length;

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredSubscribers = getFilteredSubscribers();

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-widest text-primary block mb-2">
            NEWSLETTER
          </span>
          <h1 className="text-3xl font-light tracking-wide text-foreground">Subscribers</h1>
          <p className="text-muted-foreground font-normal">
            {activeCount} ativos | {inactiveCount} inativos
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={exportToCSV}
          className="border-border hover:border-primary/50"
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-normal">
            <Mail className="h-5 w-5 text-primary" />
            Lista de Subscribers
          </CardTitle>
          <CardDescription>
            Gerencie os inscritos na newsletter do Byoma Research
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredSubscribers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-normal">Nenhum subscriber encontrado</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Inscrito em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id} className="hover:bg-muted/30">
                      <TableCell className="font-normal">{subscriber.email}</TableCell>
                      <TableCell>
                        <Badge variant={subscriber.is_active ? "default" : "secondary"}>
                          {subscriber.is_active ? (
                            <>
                              <UserCheck className="mr-1 h-3 w-3" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <UserX className="mr-1 h-3 w-3" />
                              Inativo
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(subscriber.subscribed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSubscriberStatus(subscriber.id, subscriber.is_active)}
                          className="hover:bg-primary/10"
                        >
                          {subscriber.is_active ? (
                            <>
                              <UserX className="mr-1 h-4 w-4" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-1 h-4 w-4" />
                              Ativar
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
