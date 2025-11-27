import { useState, useEffect } from "react";
import { MapPin, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MAPBOX_TOKEN_KEY = "mapbox_token";

interface MapboxTokenInputProps {
  onTokenSaved: (token: string) => void;
}

const MapboxTokenInput = ({ onTokenSaved }: MapboxTokenInputProps) => {
  const [token, setToken] = useState("");
  const [savedToken, setSavedToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(MAPBOX_TOKEN_KEY);
    if (stored) {
      setSavedToken(stored);
      onTokenSaved(stored);
    }
  }, [onTokenSaved]);

  const handleSave = () => {
    if (token.trim().startsWith("pk.")) {
      localStorage.setItem(MAPBOX_TOKEN_KEY, token.trim());
      setSavedToken(token.trim());
      onTokenSaved(token.trim());
      setToken("");
    }
  };

  const handleRemove = () => {
    localStorage.removeItem(MAPBOX_TOKEN_KEY);
    setSavedToken(null);
    setToken("");
  };

  if (savedToken) {
    return (
      <Alert className="bg-primary/10 border-primary/20">
        <MapPin className="h-4 w-4 text-primary" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-sm">
            Token Mapbox configurado: {savedToken.substring(0, 20)}...
          </span>
          <Button variant="ghost" size="sm" onClick={handleRemove}>
            Remover
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 p-6 bg-muted border border-border">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Configure o Mapbox</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Para visualizar os mapas interativos, você precisa de um token público do Mapbox.
      </p>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Cole seu token público aqui (pk.ey...)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleSave} 
          disabled={!token.trim().startsWith("pk.")}
        >
          Salvar
        </Button>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <span>💡</span>
        <div className="space-y-1">
          <p>Como obter seu token:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Acesse <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">mapbox.com <ExternalLink className="h-3 w-3" /></a></li>
            <li>Crie uma conta gratuita (50.000 carregamentos/mês)</li>
            <li>No dashboard, vá em "Tokens" e copie seu "Default public token"</li>
            <li>Cole o token acima e clique em "Salvar"</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default MapboxTokenInput;
