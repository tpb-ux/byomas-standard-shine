import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectFiltersProps {
  selectedType: string;
  selectedLocation: string;
  selectedStatus: string;
  onTypeChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const ProjectFilters = ({
  selectedType,
  selectedLocation,
  selectedStatus,
  onTypeChange,
  onLocationChange,
  onStatusChange,
}: ProjectFiltersProps) => {
  return (
    <div className="grid md:grid-cols-3 gap-4 mb-8">
      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Tipo de Projeto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Tipos</SelectItem>
          <SelectItem value="reforestation">Florestamento</SelectItem>
          <SelectItem value="conservation">Conservação</SelectItem>
          <SelectItem value="renewable">Energia Renovável</SelectItem>
          <SelectItem value="agriculture">Agricultura Sustentável</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedLocation} onValueChange={onLocationChange}>
        <SelectTrigger>
          <SelectValue placeholder="Localização" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Localizações</SelectItem>
          <SelectItem value="brazil">Brasil</SelectItem>
          <SelectItem value="latin-america">América Latina</SelectItem>
          <SelectItem value="africa">África</SelectItem>
          <SelectItem value="asia">Ásia</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          <SelectItem value="active">Em Andamento</SelectItem>
          <SelectItem value="certified">Certificado</SelectItem>
          <SelectItem value="review">Em Análise</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProjectFilters;
