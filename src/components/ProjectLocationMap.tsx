import { MapPin } from "lucide-react";

interface Location {
  name: string;
  lat: number;
  lng: number;
  country: string;
}

interface ProjectLocationMapProps {
  location: Location;
  area: string;
}

const ProjectLocationMap = ({ location, area }: ProjectLocationMapProps) => {
  return (
    <div className="space-y-6">
      <div className="aspect-video bg-muted flex items-center justify-center border border-border">
        <div className="text-center">
          <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">Mapa Interativo</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto px-4">
            Configure o Mapbox para visualizar a localização exata do projeto no mapa
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-muted">
          <h4 className="font-semibold text-foreground mb-4">Localização</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {location.name}, {location.country}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Coordenadas: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          </div>
        </div>

        <div className="p-6 bg-muted">
          <h4 className="font-semibold text-foreground mb-4">Área do Projeto</h4>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-primary">{area}</p>
            <p className="text-sm text-muted-foreground">
              Área total sob gestão do projeto
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectLocationMap;
