import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/**
 * Component that injects Google and Bing verification meta tags
 * from site settings stored in the database.
 */
export function SEOVerification() {
  const { data: seoSettings } = useSiteSettings("seo");

  const googleCode = seoSettings?.find((s) => s.key === "google_verification")?.value;
  const bingCode = seoSettings?.find((s) => s.key === "bing_verification")?.value;

  // Only render if there are verification codes to inject
  if (!googleCode && !bingCode) {
    return null;
  }

  return (
    <Helmet>
      {googleCode && (
        <meta name="google-site-verification" content={googleCode} />
      )}
      {bingCode && (
        <meta name="msvalidate.01" content={bingCode} />
      )}
    </Helmet>
  );
}
