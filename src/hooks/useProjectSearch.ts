import { useState, useEffect, useMemo } from "react";
import { projectsData } from "@/data/projectsData";

export const useProjectSearch = (query: string) => {
  const [results, setResults] = useState(projectsData);

  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return projectsData;
    }

    const searchTerm = query.toLowerCase();

    return projectsData.filter(
      (project) =>
        project.title.toLowerCase().includes(searchTerm) ||
        project.id.toLowerCase().includes(searchTerm) ||
        project.location.name.toLowerCase().includes(searchTerm) ||
        project.type.toLowerCase().includes(searchTerm) ||
        project.developer.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm)
    );
  }, [query]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setResults(filteredResults);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filteredResults]);

  return results;
};
