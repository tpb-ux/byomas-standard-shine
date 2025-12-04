import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link2, Search, Save, Globe, Share2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { AppLayout } from "@/components/layout/AppLayout";

const SiteSettings = () => {
  const { data: socialSettings, isLoading: loadingSocial } = useSiteSettings("social");
  const { data: seoSettings, isLoading: loadingSEO } = useSiteSettings("seo");
  const updateSetting = useUpdateSiteSetting();

  const [socialValues, setSocialValues] = useState<Record<string, string>>({});
  const [seoValues, setSeoValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (socialSettings) {
      const values: Record<string, string> = {};
      socialSettings.forEach((s) => {
        values[s.key] = s.value || "";
      });
      setSocialValues(values);
    }
  }, [socialSettings]);

  useEffect(() => {
    if (seoSettings) {
      const values: Record<string, string> = {};
      seoSettings.forEach((s) => {
        values[s.key] = s.value || "";
      });
      setSeoValues(values);
    }
  }, [seoSettings]);

  const handleSaveSocial = () => {
    Object.entries(socialValues).forEach(([key, value]) => {
      const original = socialSettings?.find((s) => s.key === key)?.value || "";
      if (value !== original) {
        updateSetting.mutate({ key, value });
      }
    });
  };

  const handleSaveSEO = () => {
    Object.entries(seoValues).forEach(([key, value]) => {
      const original = seoSettings?.find((s) => s.key === key)?.value || "";
      if (value !== original) {
        updateSetting.mutate({ key, value });
      }
    });
  };

  const socialFields = [
    { key: "social_linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/byomaresearch", icon: Link2 },
    { key: "social_twitter", label: "Twitter / X", placeholder: "https://twitter.com/byomaresearch", icon: Link2 },
    { key: "social_instagram", label: "Instagram", placeholder: "https://instagram.com/byomaresearch", icon: Link2 },
    { key: "social_facebook", label: "Facebook", placeholder: "https://facebook.com/byomaresearch", icon: Link2 },
  ];

  const seoFields = [
    { 
      key: "google_verification", 
      label: "Google Search Console", 
      placeholder: "Cole o código de verificação do Google",
      description: "Encontre em: Google Search Console → Configurações → Verificação de propriedade → Tag HTML"
    },
    { 
      key: "bing_verification", 
      label: "Bing Webmaster Tools", 
      placeholder: "Cole o código de verificação do Bing",
      description: "Encontre em: Bing Webmaster Tools → Adicionar site → Tag meta"
    },
  ];

  return (
    <AppLayout>
      <Helmet>
        <title>Configurações do Site | Admin - Byoma Research</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações do Site</h1>
          <p className="text-muted-foreground">
            Gerencie links sociais e configurações de SEO
          </p>
        </div>

        <Tabs defaultValue="social" className="space-y-6">
          <TabsList>
            <TabsTrigger value="social" className="gap-2">
              <Share2 className="h-4 w-4" />
              Redes Sociais
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <Search className="h-4 w-4" />
              SEO & Verificação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Redes Sociais
                </CardTitle>
                <CardDescription>
                  Configure os links das redes sociais que aparecem no rodapé do site.
                  Deixe em branco para ocultar o ícone.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingSocial ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid gap-6 md:grid-cols-2">
                      {socialFields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor={field.key} className="flex items-center gap-2">
                            <field.icon className="h-4 w-4" />
                            {field.label}
                          </Label>
                          <Input
                            id={field.key}
                            type="url"
                            placeholder={field.placeholder}
                            value={socialValues[field.key] || ""}
                            onChange={(e) =>
                              setSocialValues((prev) => ({
                                ...prev,
                                [field.key]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSaveSocial} 
                        disabled={updateSetting.isPending}
                        className="gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Salvar Redes Sociais
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Verificação de Search Engines
                </CardTitle>
                <CardDescription>
                  Configure os códigos de verificação do Google Search Console e Bing Webmaster Tools
                  para indexar seu site corretamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingSEO ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {seoFields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor={field.key}>{field.label}</Label>
                          <Input
                            id={field.key}
                            placeholder={field.placeholder}
                            value={seoValues[field.key] || ""}
                            onChange={(e) =>
                              setSeoValues((prev) => ({
                                ...prev,
                                [field.key]: e.target.value,
                              }))
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            {field.description}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                      <h4 className="font-medium mb-2">Como verificar seu site:</h4>
                      <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                        <li>Acesse o <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Search Console</a></li>
                        <li>Adicione sua propriedade: byomaresearch.com</li>
                        <li>Escolha "Tag HTML" como método de verificação</li>
                        <li>Copie apenas o conteúdo do atributo "content" da tag</li>
                        <li>Cole no campo acima e salve</li>
                        <li>Repita o processo para o <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Bing Webmaster Tools</a></li>
                      </ol>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSaveSEO} 
                        disabled={updateSetting.isPending}
                        className="gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Salvar Verificações
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default SiteSettings;
