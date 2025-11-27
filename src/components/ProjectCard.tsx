import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Leaf } from "lucide-react";

interface Project {
  id: string;
  title: string;
  type: string;
  location: { name: string; lat: number; lng: number; country: string } | string;
  status: string;
  credits: { total: string; issued: string; retired: string } | string;
  image: string;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const statusColors = {
    active: "bg-secondary text-secondary-foreground",
    certified: "bg-primary text-primary-foreground",
    review: "bg-accent text-accent-foreground",
    "Em andamento": "bg-secondary text-secondary-foreground",
    "Certificado": "bg-primary text-primary-foreground",
    "Em análise": "bg-accent text-accent-foreground",
  };

  const location = typeof project.location === 'string' ? project.location : `${project.location.name}, ${project.location.country}`;
  const credits = typeof project.credits === 'string' ? project.credits : `${project.credits.total} VCUs`;

  return (
    <Card className="group overflow-hidden border-none shadow-card transition-all hover:shadow-lg cursor-pointer" onClick={() => window.location.href = `/projetos/${project.id}`}>
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        <img 
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <Badge className={statusColors[project.status as keyof typeof statusColors]}>
            {project.status === "active" || project.status === "Em andamento" ? "Em Andamento" : ""}
            {project.status === "certified" || project.status === "Certificado" ? "Certificado" : ""}
            {project.status === "review" || project.status === "Em análise" ? "Em Análise" : ""}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Leaf className="h-4 w-4" />
            <span>{credits}</span>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">{project.type}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
