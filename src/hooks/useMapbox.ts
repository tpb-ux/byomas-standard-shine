import { useState, useEffect } from "react";

const MAPBOX_TOKEN_KEY = "mapbox_token";

export const useMapbox = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(MAPBOX_TOKEN_KEY);
    if (stored) {
      setToken(stored);
      setIsReady(true);
    }
  }, []);

  const saveToken = (newToken: string) => {
    localStorage.setItem(MAPBOX_TOKEN_KEY, newToken);
    setToken(newToken);
    setIsReady(true);
  };

  return {
    token,
    isReady,
    saveToken,
  };
};
