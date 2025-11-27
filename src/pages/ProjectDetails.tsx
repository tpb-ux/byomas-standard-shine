import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, TrendingUp, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectGallery from "@/components/ProjectGallery";
import ProjectDocuments from "@/components/ProjectDocuments";
import ProjectMethodology from "@/components/ProjectMethodology";
import ProjectCreditsChart from "@/components/ProjectCreditsChart";
import ProjectLocationMap from "@/components/ProjectLocationMap";
import { projectsData } from "@/data/projectsData";
import ScrollReveal from "@/components/ScrollReveal";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projectsData.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Projeto não encontrado</h1>
            <Button onClick={() => navigate("/projetos")}>
              Voltar para Projetos
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    "Certificado": "bg-[#4CAF50]",
    "Em andamento": "bg-[#FF9800]",
    "Em análise": "bg-[#2196F3]",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-6 pb-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/projetos")}
            className="mb-4 text-white hover:text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <Badge className={`${statusColors[project.status]} text-white`}>
              {project.status}
            </Badge>
            <Badge variant="outline" className="text-white border-white">
              {project.type}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {project.title}
          </h1>
          <p className="text-xl text-white/90 max-w-3xl">
            {project.description}
          </p>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 bg-card border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Localização</p>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {project.location.name}
                </p>
                <p className="text-sm text-muted-foreground">{project.location.country}</p>
              </div>

              <div className="p-6 bg-card border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Créditos Totais</p>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {project.credits.total}
                </p>
                <p className="text-sm text-muted-foreground">VCUs emitidos</p>
              </div>

              <div className="p-6 bg-card border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Início</p>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {new Date(project.startDate).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm text-muted-foreground">Data de início</p>
              </div>

              <div className="p-6 bg-card border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Área</p>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {project.area}
                </p>
                <p className="text-sm text-muted-foreground">Área total</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-8">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="location">Localização</TabsTrigger>
                <TabsTrigger value="methodology">Metodologia</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="credits">Créditos</TabsTrigger>
                <TabsTrigger value="gallery">Galeria</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Sobre o Projeto</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.longDescription}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4">Desenvolvedor</h3>
                  <p className="text-muted-foreground">{project.developer}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4">Timeline do Projeto</h3>
                  <div className="space-y-4">
                    {project.timeline.map((event, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-24 text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                        </div>
                        <div className="flex-1 pb-4 border-l-2 border-border pl-4">
                          <h4 className="font-semibold text-foreground mb-1">{event.event}</h4>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="location">
                <ProjectLocationMap location={project.location} area={project.area} />
              </TabsContent>

              <TabsContent value="methodology">
                <ProjectMethodology methodology={project.methodology} />
              </TabsContent>

              <TabsContent value="documents">
                <ProjectDocuments documents={project.documents} />
              </TabsContent>

              <TabsContent value="credits">
                <ProjectCreditsChart creditsHistory={project.creditsHistory} />
              </TabsContent>

              <TabsContent value="gallery">
                <ProjectGallery gallery={project.gallery} />
              </TabsContent>
            </Tabs>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProjectDetails;
