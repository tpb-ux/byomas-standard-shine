import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  author?: string;
  publishedAt?: string;
  modifiedAt?: string;
  keywords?: string[];
  noIndex?: boolean;
}

const SITE_NAME = "Byoma Research";
const BASE_URL = "https://byomaresearch.com"; // Atualizar com domínio real

export const SEOHead = ({
  title,
  description,
  image,
  url,
  type = "website",
  author,
  publishedAt,
  modifiedAt,
  keywords,
  noIndex = false,
}: SEOHeadProps) => {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const imageUrl = image || `${BASE_URL}/og-image.png`;
  
  // Truncar description para 160 caracteres
  const truncatedDescription = description.length > 160 
    ? description.substring(0, 157) + "..." 
    : description;

  return (
    <Helmet>
      {/* Meta tags básicas */}
      <title>{fullTitle}</title>
      <meta name="description" content={truncatedDescription} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      {author && <meta name="author" content={author} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={truncatedDescription} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Artigo específico */}
      {type === "article" && publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}
      {type === "article" && modifiedAt && (
        <meta property="article:modified_time" content={modifiedAt} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}
    </Helmet>
  );
};

// JSON-LD Schema para Artigos
interface ArticleSchemaProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  author?: string;
  publishedAt?: string;
  modifiedAt?: string;
}

export const ArticleSchema = ({
  title,
  description,
  image,
  url,
  author,
  publishedAt,
  modifiedAt,
}: ArticleSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    image: image || `${BASE_URL}/og-image.png`,
    url: `${BASE_URL}${url}`,
    datePublished: publishedAt,
    dateModified: modifiedAt || publishedAt,
    author: {
      "@type": author ? "Person" : "Organization",
      name: author || SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}${url}`,
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// JSON-LD Schema para Organization
export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: "Sua fonte de inteligência e insights sobre o mercado de finanças sustentáveis, tokenização verde e economia regenerativa.",
    sameAs: [
      "https://linkedin.com/company/byomaresearch",
      "https://twitter.com/byomaresearch",
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// JSON-LD Schema para Breadcrumb
interface BreadcrumbItem {
  name: string;
  url: string;
}

export const BreadcrumbSchema = ({ items }: { items: BreadcrumbItem[] }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export default SEOHead;
