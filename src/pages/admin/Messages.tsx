import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Mail,
  Phone,
  Loader2,
  Search,
  Filter,
  Eye,
  Check,
  CheckCheck,
  Trash2,
  X,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  inquiry_type: string;
  message: string;
  created_at: string;
  read_at: string | null;
  responded_at: string | null;
}

export default function AdminMessages() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read" | "responded">("all");
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && !isAdmin) {
      navigate("/admin");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    fetchMessages();
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Erro ao carregar mensagens");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      
      setMessages(messages.map(m => 
        m.id === id ? { ...m, read_at: new Date().toISOString() } : m
      ));
      
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, read_at: new Date().toISOString() });
      }
      
      toast.success("Marcada como lida");
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Erro ao atualizar mensagem");
    }
  };

  const markAsResponded = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ 
          responded_at: new Date().toISOString(),
          read_at: messages.find(m => m.id === id)?.read_at || new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
      
      setMessages(messages.map(m => 
        m.id === id ? { 
          ...m, 
          responded_at: new Date().toISOString(),
          read_at: m.read_at || new Date().toISOString()
        } : m
      ));
      
      if (selectedMessage?.id === id) {
        setSelectedMessage({ 
          ...selectedMessage, 
          responded_at: new Date().toISOString(),
          read_at: selectedMessage.read_at || new Date().toISOString()
        });
      }
      
      toast.success("Marcada como respondida");
    } catch (error) {
      console.error("Error marking as responded:", error);
      toast.error("Erro ao atualizar mensagem");
    }
  };

  const deleteMessage = async () => {
    if (!deleteId) return;
    
    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;
      
      setMessages(messages.filter(m => m.id !== deleteId));
      toast.success("Mensagem excluída");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Erro ao excluir mensagem");
    } finally {
      setDeleteId(null);
    }
  };

  const openMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.read_at) {
      await markAsRead(message.id);
    }
  };

  const getFilteredMessages = () => {
    return messages.filter(m => {
      const matchesFilter = filter === "all" || 
        (filter === "unread" && !m.read_at) || 
        (filter === "read" && m.read_at && !m.responded_at) ||
        (filter === "responded" && m.responded_at);
      const matchesSearch = 
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.message.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const getMessageStatus = (message: ContactMessage) => {
    if (message.responded_at) return "responded";
    if (message.read_at) return "read";
    return "unread";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return <Badge variant="destructive" className="text-xs">Não lida</Badge>;
      case "read":
        return <Badge variant="secondary" className="text-xs">Lida</Badge>;
      case "responded":
        return <Badge variant="default" className="text-xs"><CheckCheck className="mr-1 h-3 w-3" />Respondida</Badge>;
    }
  };

  const getInquiryTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      general: "Informação Geral",
      partnership: "Parcerias Comerciais",
      consultation: "Consultoria",
      press: "Imprensa",
      support: "Suporte Técnico",
      certification: "Certificação",
    };
    return types[type] || type;
  };

  const unreadCount = messages.filter(m => !m.read_at).length;
  const pendingCount = messages.filter(m => m.read_at && !m.responded_at).length;

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredMessages = getFilteredMessages();

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-widest text-primary block mb-2">
            COMUNICAÇÃO
          </span>
          <h1 className="text-3xl font-light tracking-wide text-foreground">Mensagens de Contato</h1>
          <p className="text-muted-foreground font-normal">
            {unreadCount} não lidas | {pendingCount} aguardando resposta
          </p>
        </div>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-normal">
            <MessageSquare className="h-5 w-5 text-primary" />
            Mensagens Recebidas
          </CardTitle>
          <CardDescription>
            Visualize e gerencie as mensagens enviadas pelo formulário de contato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou conteúdo..."
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
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">Não lidas</SelectItem>
                <SelectItem value="read">Lidas</SelectItem>
                <SelectItem value="responded">Respondidas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-normal">Nenhuma mensagem encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((message) => {
                const status = getMessageStatus(message);
                return (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      status === "unread" 
                        ? "border-primary/50 bg-primary/5 hover:bg-primary/10" 
                        : "border-border hover:border-primary/30 hover:bg-muted/30"
                    }`}
                    onClick={() => openMessage(message)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{message.name}</span>
                          {getStatusBadge(status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {getInquiryTypeLabel(message.inquiry_type)}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {message.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.created_at), "dd/MM HH:mm")}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(message.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-normal">
              <MessageSquare className="h-5 w-5 text-primary" />
              Mensagem de {selectedMessage?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedMessage && getInquiryTypeLabel(selectedMessage.inquiry_type)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                {selectedMessage.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href={`tel:${selectedMessage.phone}`} className="hover:underline">
                      {selectedMessage.phone}
                    </a>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                Recebida em {format(new Date(selectedMessage.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              
              <div className="flex gap-2 pt-2">
                {!selectedMessage.read_at && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsRead(selectedMessage.id)}
                    className="border-border hover:border-primary/50"
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Marcar como Lida
                  </Button>
                )}
                {!selectedMessage.responded_at && (
                  <Button
                    size="sm"
                    onClick={() => markAsResponded(selectedMessage.id)}
                  >
                    <CheckCheck className="mr-1 h-4 w-4" />
                    Marcar como Respondida
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir mensagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A mensagem será permanentemente excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteMessage} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
