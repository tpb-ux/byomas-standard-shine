import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { BreadcrumbSchema } from "./SEOHead";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb = ({ items, className = "" }: BreadcrumbProps) => {
  // Preparar items para o Schema
  const schemaItems = [
    { name: "Home", url: "/" },
    ...items.map((item) => ({
      name: item.label,
      url: item.href || "#",
    })),
  ];

  return (
    <>
      <BreadcrumbSchema items={schemaItems} />
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center text-sm text-muted-foreground ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1">
          <li className="flex items-center">
            <Link 
              to="/" 
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1" />
              {item.href && index < items.length - 1 ? (
                <Link 
                  to={item.href} 
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span 
                  className="text-foreground font-medium truncate max-w-[200px] md:max-w-none"
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;
