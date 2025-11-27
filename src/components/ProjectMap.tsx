import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "lucide-react";
import { useMapbox } from "@/hooks/useMapbox";
import MapboxTokenInput from "@/components/MapboxTokenInput";
import { projectsData } from "@/data/projectsData";

const ProjectMap = () => {
  const { token, isReady, saveToken } = useMapbox();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const navigate = useNavigate();
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!isReady || !token || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [-50, -12],
      zoom: 3.5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setMapLoaded(true);

      // Add markers for each project
      projectsData.forEach((project) => {
        if (!map.current) return;

        // Determine marker color by project type
        let color = "#4CAF50"; // Green for reforestation
        if (project.type.toLowerCase().includes("conservação")) {
          color = "#2196F3"; // Blue for conservation
        } else if (project.type.toLowerCase().includes("energia") || project.type.toLowerCase().includes("solar")) {
          color = "#FF9800"; // Orange for renewable energy
        }

        // Create custom marker
        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.width = "32px";
        el.style.height = "32px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = color;
        el.style.border = "3px solid white";
        el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
        el.style.cursor = "pointer";
        el.style.transition = "transform 0.2s";
        
        el.addEventListener("mouseenter", () => {
          el.style.transform = "scale(1.2)";
        });
        
        el.addEventListener("mouseleave", () => {
          el.style.transform = "scale(1)";
        });

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="font-weight: 600; margin-bottom: 8px; color: #1a1a1a;">${project.title}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">
              <strong>Tipo:</strong> ${project.type}
            </p>
            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">
              <strong>Localização:</strong> ${project.location.name}
            </p>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">
              <strong>Créditos:</strong> ${typeof project.credits === 'string' ? project.credits : project.credits.total}
            </p>
            <button 
              onclick="window.location.href='/projetos/${project.id}'"
              style="background: ${color}; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; width: 100%; font-size: 12px; font-weight: 500;"
            >
              Ver Detalhes
            </button>
          </div>
        `);

        // Add marker to map
        new mapboxgl.Marker(el)
          .setLngLat([project.location.lng, project.location.lat])
          .setPopup(popup)
          .addTo(map.current);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [isReady, token, navigate]);

  return (
    <div className="bg-card border border-border shadow-card">
      <div className="p-6 border-b border-border">
        <h3 className="text-xl font-semibold text-foreground mb-2">Mapa de Projetos</h3>
        <p className="text-sm text-muted-foreground">
          Visualização interativa de todos os projetos certificados
        </p>
      </div>

      {!isReady ? (
        <div className="p-6">
          <MapboxTokenInput onTokenSaved={saveToken} />
        </div>
      ) : (
        <>
          <div 
            ref={mapContainer} 
            className="w-full h-[500px]"
            style={{ minHeight: "500px" }}
          />
          
          {mapLoaded && (
            <div className="p-4 bg-muted/30 border-t border-border">
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#4CAF50] border-2 border-white shadow" />
                  <span className="text-muted-foreground">Reflorestamento</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#2196F3] border-2 border-white shadow" />
                  <span className="text-muted-foreground">Conservação</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#FF9800] border-2 border-white shadow" />
                  <span className="text-muted-foreground">Energia Renovável</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectMap;
