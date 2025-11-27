import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectFilters from "@/components/ProjectFilters";
import ProjectCard from "@/components/ProjectCard";
import ProjectMap from "@/components/ProjectMap";
import ProjectSearch from "@/components/ProjectSearch";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Grid, Map } from "lucide-react";
import { projectsData } from "@/data/projectsData";

const Projects = () => {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projectsData.filter((project) => {
    // Search filter
    const searchMatch = !searchQuery || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter
    const typeMatch = selectedType === "all" || 
      (selectedType === "reforestation" && project.type === "Reflorestamento") ||
      (selectedType === "conservation" && project.type === "Conservação") ||
      (selectedType === "renewable" && project.type === "Energia Renovável") ||
      (selectedType === "agriculture" && project.type === "Agricultura Sustentável");
    
    // Location filter
    const locationMatch = selectedLocation === "all" || 
      (selectedLocation === "brazil" && project.location.country === "Brasil");
    
    // Status filter
    const statusMatch = selectedStatus === "all" || 
      (selectedStatus === "certified" && project.status === "Certificado") ||
      (selectedStatus === "active" && project.status === "Em andamento") ||
      (selectedStatus === "review" && project.status === "Em análise");
    
    return searchMatch && typeMatch && locationMatch && statusMatch;
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
            <div className="mb-8 flex flex-col gap-6">
              <ProjectSearch onSearch={setSearchQuery} />
              
              <div className="flex items-center justify-between">
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
