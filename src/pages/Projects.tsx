import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectFilters from "@/components/ProjectFilters";
import ProjectCard from "@/components/ProjectCard";
import ProjectMap from "@/components/ProjectMap";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Grid, Map } from "lucide-react";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";

const Projects = () => {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const projects = [
    {
      id: "1",
      title: "Reflorestamento Amazônia",
      type: "Florestamento",
      location: "Amazonas, Brasil",
      status: "certified",
      credits: "1.2M tCO2e",
      image: project1,
    },
    {
      id: "2",
      title: "Conservação Mata Atlântica",
      type: "Conservação",
      location: "São Paulo, Brasil",
      status: "active",
      credits: "850K tCO2e",
      image: project2,
    },
    {
      id: "3",
      title: "Energia Solar Rural",
      type: "Energia Renovável",
      location: "Bahia, Brasil",
      status: "certified",
      credits: "600K tCO2e",
      image: project1,
    },
    {
      id: "4",
      title: "Agricultura Regenerativa",
      type: "Agricultura Sustentável",
      location: "Mato Grosso, Brasil",
      status: "review",
      credits: "400K tCO2e",
      image: project2,
    },
    {
      id: "5",
      title: "Proteção de Mangues",
      type: "Conservação",
      location: "Pará, Brasil",
      status: "active",
      credits: "950K tCO2e",
      image: project1,
    },
    {
      id: "6",
      title: "Bioenergia Comunitária",
      type: "Energia Renovável",
      location: "Ceará, Brasil",
      status: "certified",
      credits: "700K tCO2e",
      image: project2,
    },
  ];

  const filteredProjects = projects.filter((project) => {
    const typeMatch = selectedType === "all" || 
      (selectedType === "reforestation" && project.type === "Florestamento") ||
      (selectedType === "conservation" && project.type === "Conservação") ||
      (selectedType === "renewable" && project.type === "Energia Renovável") ||
      (selectedType === "agriculture" && project.type === "Agricultura Sustentável");
    
    const locationMatch = selectedLocation === "all" || 
      (selectedLocation === "brazil" && project.location.includes("Brasil"));
    
    const statusMatch = selectedStatus === "all" || project.status === selectedStatus;
    
    return typeMatch && locationMatch && statusMatch;
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="pt-32 pb-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">PROJETOS CERTIFICADOS</h1>
            <p className="text-xl max-w-3xl text-primary-foreground/90">
              Explore nossa carteira global de projetos de ação climática verificados
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {filteredProjects.length} Projetos Encontrados
                </h2>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <ProjectFilters
              selectedType={selectedType}
              selectedLocation={selectedLocation}
              selectedStatus={selectedStatus}
              onTypeChange={setSelectedType}
              onLocationChange={setSelectedLocation}
              onStatusChange={setSelectedStatus}
            />
          </ScrollReveal>

          {viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => (
                <ScrollReveal key={project.id} delay={0.1 * (index % 3)}>
                  <ProjectCard project={project} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <ScrollReveal delay={0.2}>
              <ProjectMap />
            </ScrollReveal>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
