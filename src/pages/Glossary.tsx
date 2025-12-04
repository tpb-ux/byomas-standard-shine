import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead, BreadcrumbSchema } from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, BookOpen, ArrowRight } from "lucide-react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const CATEGORY_LABELS: Record<string, string> = {
  "mercado-carbono": "Mercado de Carbono",
  "tecnologia": "Tecnologia",
  "investimentos": "Investimentos",
  "sustentabilidade": "Sustentabilidade",
  "regulamentacao": "Regulamentação",
  "certificacao": "Certificação",
  "geral": "Geral",
};

const Glossary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: terms, isLoading } = useQuery({
    queryKey: ["glossary-terms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("glossary_terms")
        .select("*")
        .order("term");
      if (error) throw error;
      return data;
    },
  });

  const categories = useMemo(() => {
    if (!terms) return [];
    const cats = [...new Set(terms.map(t => t.category))];
    return cats.filter(Boolean);
  }, [terms]);

  const filteredTerms = useMemo(() => {
    if (!terms) return [];
    
    return terms.filter(term => {
      const matchesSearch = searchTerm === "" || 
        term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLetter = !selectedLetter || 
        term.term.charAt(0).toUpperCase() === selectedLetter;
      
      const matchesCategory = !selectedCategory || 
        term.category === selectedCategory;
      
      return matchesSearch && matchesLetter && matchesCategory;
    });
  }, [terms, searchTerm, selectedLetter, selectedCategory]);

  const availableLetters = useMemo(() => {
    if (!terms) return new Set<string>();
    return new Set(terms.map(t => t.term.charAt(0).toUpperCase()));
  }, [terms]);

  const breadcrumbItems = [
    { label: "Início", href: "/" },
    { label: "Glossário", href: "/glossario" },
  ];

  const schemaBreadcrumbItems = [
    { name: "Início", url: "/" },
    { name: "Glossário", url: "/glossario" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Glossário do Mercado Verde - Termos de Carbono e Sustentabilidade"
        description="Glossário completo com definições de termos do mercado de carbono, ESG, tokenização, finanças sustentáveis e economia verde. Aprenda o vocabulário essencial."
        url="/glossario"
        keywords={["glossário carbono", "termos ESG", "vocabulário sustentabilidade", "definições mercado verde", "dicionário carbono"]}
      />
      <BreadcrumbSchema items={schemaBreadcrumbItems} />
      
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">Glossário Completo</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Glossário do Mercado Verde
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Definições e explicações dos principais termos do mercado de carbono, 
            ESG, tokenização e sustentabilidade.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar termo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            Todos
          </Badge>
          {categories.map(cat => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            >
              {CATEGORY_LABELS[cat || ""] || cat}
            </Badge>
          ))}
        </div>

        {/* Alphabet Navigation */}
        <div className="flex flex-wrap justify-center gap-1 mb-8 p-4 bg-muted/50 rounded-lg">
          <button
            onClick={() => setSelectedLetter(null)}
            className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
              selectedLetter === null 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted"
            }`}
          >
            Aa
          </button>
          {ALPHABET.map(letter => {
            const hasTerms = availableLetters.has(letter);
            return (
              <button
                key={letter}
                onClick={() => hasTerms && setSelectedLetter(letter === selectedLetter ? null : letter)}
                disabled={!hasTerms}
                className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                  selectedLetter === letter
                    ? "bg-primary text-primary-foreground"
                    : hasTerms
                    ? "hover:bg-muted"
                    : "text-muted-foreground/40 cursor-not-allowed"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        <p className="text-center text-muted-foreground mb-8">
          {filteredTerms.length} {filteredTerms.length === 1 ? "termo encontrado" : "termos encontrados"}
        </p>

        {/* Terms Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum termo encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar sua busca ou filtros
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTerms.map(term => (
              <Link key={term.id} to={`/glossario/${term.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {term.term}
                      </CardTitle>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    {term.category && (
                      <Badge variant="secondary" className="w-fit">
                        {CATEGORY_LABELS[term.category] || term.category}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">
                      {term.short_definition || term.definition}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Glossary;
