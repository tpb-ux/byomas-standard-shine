import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMapbox } from "@/hooks/useMapbox";
import MapboxTokenInput from "@/components/MapboxTokenInput";

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
  const { token, isReady, saveToken } = useMapbox();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!isReady || !token || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [location.lng, location.lat],
      zoom: 10,
      pitch: 45,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setMapLoaded(true);

      if (!map.current) return;

      // Create pulsating marker
      const el = document.createElement("div");
      el.className = "pulse-marker";
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#4CAF50";
      el.style.border = "4px solid white";
      el.style.boxShadow = "0 0 20px rgba(76, 175, 80, 0.6)";
      el.style.animation = "pulse 2s infinite";
      
      // Add CSS animation
      const style = document.createElement("style");
      style.textContent = `
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(76, 175, 80, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
          }
        }
      `;
      document.head.appendChild(style);

      new mapboxgl.Marker(el)
        .setLngLat([location.lng, location.lat])
        .addTo(map.current);
    });

    return () => {
      map.current?.remove();
    };
  }, [isReady, token, location]);

  const openInGoogleMaps = () => {
    window.open(
      `https://www.google.com/maps?q=${location.lat},${location.lng}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-6">
      {!isReady ? (
        <MapboxTokenInput onTokenSaved={saveToken} />
      ) : (
        <>
          <div 
            ref={mapContainer} 
            className="w-full h-[500px] border border-border"
            style={{ minHeight: "500px" }}
          />
          {mapLoaded && (
            <div className="flex justify-center">
              <Button onClick={openInGoogleMaps} variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Abrir no Google Maps
              </Button>
            </div>
          )}
        </>
      )}

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
