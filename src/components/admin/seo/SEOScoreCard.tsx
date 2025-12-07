import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, FileText, Link as LinkIcon, Hash, Type } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SEOScoreCardProps {
  article: any;
  seoMetrics: any;
}

export default function SEOScoreCard({ article, seoMetrics }: SEOScoreCardProps) {
  const score = seoMetrics?.seo_score || 0;

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-primary";
    if (s >= 60) return "text-yellow-500";
    return "text-destructive";
  };

  const getScoreBg = (s: number) => {
    if (s >= 80) return "bg-primary/10";
    if (s >= 60) return "bg-yellow-500/10";
    return "bg-destructive/10";
  };

  const metrics = [
    {
      label: "Título",
      score: calculateTitleScore(article),
      icon: Type,
      description: "Meta título e otimização"
    },
    {
      label: "Meta",
      score: calculateMetaScore(article),
      icon: FileText,
      description: "Meta description e tags"
    },
    {
      label: "Conteúdo",
      score: calculateContentScore(seoMetrics),
      icon: Hash,
      description: "Estrutura e qualidade"
    },
    {
      label: "Links",
      score: calculateLinksScore(seoMetrics),
      icon: LinkIcon,
      description: "Internos e externos"
    },
  ];

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="font-normal flex items-center gap-2">
          Score SEO Geral
          {score > 70 ? (
            <TrendingUp className="h-4 w-4 text-primary" />
          ) : score > 50 ? (
            <Minus className="h-4 w-4 text-yellow-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Score */}
          <div className="flex flex-col items-center justify-center lg:col-span-1">
            <div className={`relative w-32 h-32 rounded-full ${getScoreBg(score)} flex items-center justify-center`}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className={`text-4xl font-light ${getScoreColor(score)}`}>
                  {score.toFixed(0)}
                </span>
              </motion.div>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-border"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className={getScoreColor(score)}
                  initial={{ strokeDasharray: "0 365" }}
                  animate={{ strokeDasharray: `${(score / 100) * 365} 365` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground mt-2">de 100</p>
          </div>

          {/* Breakdown */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <div 
                key={metric.label}
                className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{metric.label}</span>
                </div>
                <div className={`text-2xl font-light ${getScoreColor(metric.score)}`}>
                  {metric.score}
                </div>
                <Progress value={metric.score} className="mt-2 h-1" />
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-light">{seoMetrics?.word_count || 0}</p>
            <p className="text-xs text-muted-foreground">Palavras</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-light">{seoMetrics?.h1_count || 0}</p>
            <p className="text-xs text-muted-foreground">H1</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-light">{seoMetrics?.h2_count || 0}</p>
            <p className="text-xs text-muted-foreground">H2</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-light">{seoMetrics?.h3_count || 0}</p>
            <p className="text-xs text-muted-foreground">H3</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-light">{seoMetrics?.internal_links_count || 0}</p>
            <p className="text-xs text-muted-foreground">Links Int.</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-light">{seoMetrics?.external_links_count || 0}</p>
            <p className="text-xs text-muted-foreground">Links Ext.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateTitleScore(article: any): number {
  let score = 0;
  const title = article.meta_title || article.title || "";
  
  // Title length 50-60 chars
  if (title.length >= 50 && title.length <= 60) score += 40;
  else if (title.length >= 30 && title.length <= 70) score += 25;
  else if (title.length > 0) score += 10;

  // Keyword in title
  if (article.main_keyword && title.toLowerCase().includes(article.main_keyword.toLowerCase())) {
    score += 30;
  }

  // Title exists
  if (article.meta_title) score += 30;

  return Math.min(100, score);
}

function calculateMetaScore(article: any): number {
  let score = 0;
  const desc = article.meta_description || "";

  // Meta description length 120-160 chars
  if (desc.length >= 120 && desc.length <= 160) score += 40;
  else if (desc.length >= 80 && desc.length <= 180) score += 25;
  else if (desc.length > 0) score += 10;

  // Keyword in meta description
  if (article.main_keyword && desc.toLowerCase().includes(article.main_keyword.toLowerCase())) {
    score += 30;
  }

  // Meta description exists
  if (desc) score += 30;

  return Math.min(100, score);
}

function calculateContentScore(metrics: any): number {
  if (!metrics) return 0;
  let score = 0;

  // Word count
  const words = metrics.word_count || 0;
  if (words >= 1500) score += 30;
  else if (words >= 1000) score += 20;
  else if (words >= 500) score += 10;

  // H1 count (should be 1)
  if (metrics.h1_count === 1) score += 20;
  else if (metrics.h1_count > 0) score += 10;

  // H2 count (should be 3+)
  if (metrics.h2_count >= 3) score += 25;
  else if (metrics.h2_count >= 1) score += 15;

  // Keyword density
  const density = metrics.keyword_density || 0;
  if (density >= 1 && density <= 2.5) score += 25;
  else if (density >= 0.5 && density <= 3.5) score += 15;

  return Math.min(100, score);
}

function calculateLinksScore(metrics: any): number {
  if (!metrics) return 0;
  let score = 0;

  // Internal links
  const internalLinks = metrics.internal_links_count || 0;
  if (internalLinks >= 5) score += 50;
  else if (internalLinks >= 3) score += 35;
  else if (internalLinks >= 1) score += 20;

  // External links
  const externalLinks = metrics.external_links_count || 0;
  if (externalLinks >= 3) score += 50;
  else if (externalLinks >= 2) score += 35;
  else if (externalLinks >= 1) score += 20;

  return Math.min(100, score);
}
