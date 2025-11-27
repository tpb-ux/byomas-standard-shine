import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Users, Globe } from "lucide-react";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";

const ProjectsSection = () => {
  const projects = [
    {
      image: project1,
      icon: Leaf,
      title: "FLORESTAMENTO E REFLORESTAMENTO",
      description: "Promovendo a restauração de ecossistemas florestais nativos"
    },
    {
      image: project2,
      icon: Globe,
      title: "CONSERVAÇÃO DA BIODIVERSIDADE",
      description: "Protegendo habitats naturais e espécies ameaçadas"
    }
  ];

  return (
    <section className="bg-muted py-20">
      <div className="container mx-auto px-6">
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">PROJETOS EM DESTAQUE</h2>
          <a href="#" className="text-sm font-semibold text-primary hover:text-primary/80">
            VER TODOS →
          </a>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          {projects.map((project, index) => {
            const Icon = project.icon;
            return (
              <Card key={index} className="group overflow-hidden border-none shadow-card transition-all hover:shadow-lg">
                <div className="aspect-[16/10] overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground">{project.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
