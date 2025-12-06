import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { 
  Award, 
  Plus, 
  Pencil, 
  Trash2, 
  Save,
  X,
  Sprout,
  BookOpen,
  Target,
  Trophy,
  GraduationCap,
  Flame,
  Compass,
  Diamond,
  Medal,
  Star,
  Zap,
  Crown,
  Heart,
  Bookmark
} from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string | null;
  requirement_type: string;
  requirement_value: number | null;
  points: number | null;
  is_active: boolean | null;
}

const REQUIREMENT_TYPES = [
  { value: "complete_lessons", label: "Completar Lições", description: "Quando completar X lições" },
  { value: "pass_quiz", label: "Passar em Quiz", description: "Quando passar em X quizzes" },
  { value: "finish_module", label: "Concluir Módulo", description: "Quando concluir X módulos" },
  { value: "finish_course", label: "Concluir Curso", description: "Quando concluir X cursos" },
  { value: "perfect_score", label: "Nota Perfeita", description: "Quando tirar 100% em um quiz" },
  { value: "login_streak", label: "Sequência de Dias", description: "Quando logar X dias seguidos" },
  { value: "first_lesson", label: "Primeira Lição", description: "Quando completar a primeira lição" },
];

const ICONS = [
  { value: "sprout", label: "Broto", icon: Sprout },
  { value: "book-open", label: "Livro", icon: BookOpen },
  { value: "target", label: "Alvo", icon: Target },
  { value: "trophy", label: "Troféu", icon: Trophy },
  { value: "graduation-cap", label: "Graduação", icon: GraduationCap },
  { value: "flame", label: "Chama", icon: Flame },
  { value: "compass", label: "Bússola", icon: Compass },
  { value: "diamond", label: "Diamante", icon: Diamond },
  { value: "medal", label: "Medalha", icon: Medal },
  { value: "star", label: "Estrela", icon: Star },
  { value: "zap", label: "Raio", icon: Zap },
  { value: "crown", label: "Coroa", icon: Crown },
  { value: "heart", label: "Coração", icon: Heart },
  { value: "bookmark", label: "Marcador", icon: Bookmark },
  { value: "award", label: "Prêmio", icon: Award },
];

const CATEGORIES = [
  { value: "achievement", label: "Conquista" },
  { value: "milestone", label: "Marco" },
  { value: "streak", label: "Sequência" },
  { value: "special", label: "Especial" },
];

const COLORS = [
  { value: "#10b981", label: "Verde" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#f59e0b", label: "Amarelo" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#06b6d4", label: "Ciano" },
  { value: "#84cc16", label: "Lima" },
];

function useAdminBadges() {
  return useQuery({
    queryKey: ["admin-badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Badge[];
    },
  });
}

const IconComponent = ({ iconName, className }: { iconName: string; className?: string }) => {
  const iconData = ICONS.find(i => i.value === iconName);
  if (iconData) {
    const Icon = iconData.icon;
    return <Icon className={className} />;
  }
  return <Award className={className} />;
};

export default function BadgeAdminTab() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);

  const { data: badges, isLoading } = useAdminBadges();

  const createBadgeMutation = useMutation({
    mutationFn: async (data: Omit<Badge, "id">) => {
      const { error } = await supabase.from("badges").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
      setIsDialogOpen(false);
      setEditingBadge(null);
      toast.success("Badge criado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao criar badge: ${error.message}`);
    },
  });

  const updateBadgeMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Badge> & { id: string }) => {
      const { error } = await supabase.from("badges").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
      setIsDialogOpen(false);
      setEditingBadge(null);
      toast.success("Badge atualizado!");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar badge: ${error.message}`);
    },
  });

  const deleteBadgeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("badges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
      toast.success("Badge excluído!");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir badge: ${error.message}`);
    },
  });

  const toggleBadgeStatus = (badge: Badge) => {
    updateBadgeMutation.mutate({ id: badge.id, is_active: !badge.is_active });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            <span>Gestão de Badges</span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingBadge(null)}>
                <Plus className="h-4 w-4 mr-1" />
                Novo Badge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBadge ? "Editar Badge" : "Novo Badge"}</DialogTitle>
              </DialogHeader>
              <BadgeForm
                badge={editingBadge}
                onSave={(data) => {
                  if (editingBadge) {
                    updateBadgeMutation.mutate({ ...data, id: editingBadge.id });
                  } else {
                    createBadgeMutation.mutate(data);
                  }
                }}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Carregando badges...</p>
        ) : badges?.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Nenhum badge cadastrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Badge</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Requisito</TableHead>
                <TableHead>Pontos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {badges?.map((badge) => (
                <TableRow key={badge.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: badge.color || "#10b981" }}
                      >
                        <IconComponent iconName={badge.icon || "award"} className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{badge.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <BadgeUI variant="outline">
                      {CATEGORIES.find(c => c.value === badge.category)?.label || badge.category}
                    </BadgeUI>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{REQUIREMENT_TYPES.find(r => r.value === badge.requirement_type)?.label || badge.requirement_type}</p>
                      {badge.requirement_value && badge.requirement_type !== "perfect_score" && (
                        <p className="text-muted-foreground">Valor: {badge.requirement_value}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{badge.points || 0} pts</span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={badge.is_active || false}
                      onCheckedChange={() => toggleBadgeStatus(badge)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingBadge(badge);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          if (confirm("Excluir este badge? Alunos que já conquistaram serão afetados.")) {
                            deleteBadgeMutation.mutate(badge.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Badge Form Component
function BadgeForm({ 
  badge, 
  onSave, 
  onCancel 
}: { 
  badge: Badge | null;
  onSave: (data: Omit<Badge, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(badge?.name || "");
  const [description, setDescription] = useState(badge?.description || "");
  const [icon, setIcon] = useState(badge?.icon || "award");
  const [color, setColor] = useState(badge?.color || "#10b981");
  const [category, setCategory] = useState(badge?.category || "achievement");
  const [requirementType, setRequirementType] = useState(badge?.requirement_type || "complete_lessons");
  const [requirementValue, setRequirementValue] = useState(badge?.requirement_value || 1);
  const [points, setPoints] = useState(badge?.points || 10);
  const [isActive, setIsActive] = useState(badge?.is_active ?? true);

  const requirementTypeInfo = REQUIREMENT_TYPES.find(r => r.value === requirementType);

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center gap-4 p-4 bg-accent rounded-lg">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <IconComponent iconName={icon} className="h-8 w-8 text-white" />
        </div>
        <div>
          <p className="font-bold text-lg">{name || "Nome do Badge"}</p>
          <p className="text-muted-foreground">{description || "Descrição do badge"}</p>
          <p className="text-sm text-primary">+{points} pontos</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome do Badge</Label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Ex: Primeiro Passo"
          />
        </div>
        <div className="space-y-2">
          <Label>Pontos</Label>
          <Input 
            type="number" 
            value={points} 
            onChange={(e) => setPoints(Number(e.target.value))} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Descrição do que o aluno precisa fazer..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ícone</Label>
          <Select value={icon} onValueChange={setIcon}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ICONS.map(({ value, label, icon: Icon }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Cor</Label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLORS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: value }} />
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tipo de Requisito</Label>
          <Select value={requirementType} onValueChange={setRequirementType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REQUIREMENT_TYPES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {requirementTypeInfo && (
        <p className="text-sm text-muted-foreground">
          ℹ️ {requirementTypeInfo.description}
        </p>
      )}

      {requirementType !== "perfect_score" && requirementType !== "first_lesson" && (
        <div className="space-y-2">
          <Label>Valor do Requisito</Label>
          <Input 
            type="number" 
            value={requirementValue} 
            onChange={(e) => setRequirementValue(Number(e.target.value))}
            min={1}
          />
          <p className="text-xs text-muted-foreground">
            Quantidade necessária para conquistar o badge
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Switch checked={isActive} onCheckedChange={setIsActive} />
        <Label>Badge ativo</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
        <Button 
          onClick={() => onSave({
            name,
            description,
            icon,
            color,
            category,
            requirement_type: requirementType,
            requirement_value: requirementType === "perfect_score" || requirementType === "first_lesson" ? 1 : requirementValue,
            points,
            is_active: isActive,
          })}
          disabled={!name}
        >
          <Save className="h-4 w-4 mr-1" />
          Salvar Badge
        </Button>
      </div>
    </div>
  );
}
