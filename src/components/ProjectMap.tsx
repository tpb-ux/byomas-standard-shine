import { MapPin } from "lucide-react";

const ProjectMap = () => {
  const projectLocations = [
    { name: "Projeto Amazônia", lat: -3.4653, lng: -62.2159, country: "Brasil" },
    { name: "Reflorestamento Cerrado", lat: -15.7801, lng: -47.9292, country: "Brasil" },
    { name: "Conservação Mata Atlântica", lat: -23.5505, lng: -46.6333, country: "Brasil" },
  ];

  return (
    <div className="bg-card border border-border p-8 shadow-card">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">Mapa de Projetos</h3>
        <p className="text-sm text-muted-foreground">
          Visualização interativa dos projetos certificados
        </p>
      </div>
      
      <div className="aspect-video bg-muted flex items-center justify-center border border-border">
        <div className="text-center">
          <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">Mapa Interativo</p>
          <p className="text-sm text-muted-foreground">
            Configure o Mapbox para visualizar projetos no mapa
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {projectLocations.map((location, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-muted hover:bg-muted/80 transition-colors">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">{location.name}</p>
              <p className="text-sm text-muted-foreground">{location.country}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectMap;
