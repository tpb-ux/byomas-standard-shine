import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProjectSearch } from "@/hooks/useProjectSearch";
import { useNavigate } from "react-router-dom";

interface ProjectSearchProps {
  onSearch: (query: string) => void;
}

const ProjectSearch = ({ onSearch }: ProjectSearchProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchResults = useProjectSearch(query);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    onSearch(value);
    setIsOpen(value.length > 0);
  };

  const handleResultClick = (projectId: string) => {
    navigate(`/projetos/${projectId}`);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nome, ID, localização ou desenvolvedor..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && query && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border shadow-lg max-h-96 overflow-y-auto z-50">
          {searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleResultClick(project.id)}
                  className="w-full px-4 py-3 hover:bg-muted transition-colors text-left flex items-start gap-3"
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-16 h-16 object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {project.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {project.type} • {project.location.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {project.id}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p>Nenhum projeto encontrado</p>
              <p className="text-sm mt-1">Tente buscar por outro termo</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectSearch;
