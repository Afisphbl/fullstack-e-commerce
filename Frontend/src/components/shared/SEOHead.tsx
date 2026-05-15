import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  /** Structured data for JSON-LD (product, breadcrumb, etc.) */
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

// Language configuration
const LANGUAGES = [
  { code: "am", name: "Amharic", locale: "am_ET" },
  { code: "en", name: "English", locale: "en_US" },
  { code: "om", name: "Oromo", locale: "om_ET" },
] as const;

/**
 * SEOHead Component
 *
 * Dynamically updates HTML lang attribute, meta tags, hreflang links,
 * and injects JSON-LD structured data based on current language & page.
 *
 * Features:
 * - Updates <html lang=""> attribute
 * - Updates meta description and keywords
 * - Updates Open Graph tags
 * - Updates Twitter Card tags
 * - Adds hreflang alternate links for multilingual SEO
 * - Injects JSON-LD structured data (WebSite, BreadcrumbList, Product)
 */
export const SEOHead = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  structuredData,
}: SEOHeadProps) => {
  const { i18n, t } = useTranslation("common");
  const { settings } = useSiteSettings();
  const currentLang = i18n.language;

  // Get localized company name
  const getLocalizedCompanyName = (): string => {
    if (settings?.companyName) {
      if (
        typeof settings.companyName === "object" &&
        settings.companyName[currentLang as keyof typeof settings.companyName]
      ) {
        return settings.companyName[
          currentLang as keyof typeof settings.companyName
        ] as string;
      }
      if (typeof settings.companyName === "string") {
        return settings.companyName;
      }
    }
    return "Seid-Electronics";
  };

  // Get localized site description
  const getLocalizedDescription = (): string => {
    if (settings?.description) {
      if (
        typeof settings.description === "object" &&
        settings.description[currentLang as keyof typeof settings.description]
      ) {
        return settings.description[
          currentLang as keyof typeof settings.description
        ] as string;
      }
      if (typeof settings.description === "string") {
        return settings.description;
      }
    }
    return t("siteDescription");
  };

  const companyName = getLocalizedCompanyName();
  const siteDescription = description || getLocalizedDescription();
  const siteTitle = title
    ? `${title} | ${companyName}`
    : `${companyName} | ${t("siteTagline")}`;
  const siteUrl = url || window.location.href;
  const siteImage = image || `${window.location.origin}/og-image.png`;
  const siteKeywords = keywords || t("siteKeywords");
  const currentLocale =
    LANGUAGES.find((l) => l.code === currentLang)?.locale || "en_US";
  const currentLangName =
    LANGUAGES.find((l) => l.code === currentLang)?.name || "English";

  useEffect(() => {
    // ── 1. HTML attributes ───────────────────────────────────────────────
    document.documentElement.lang = currentLang;
    document.documentElement.dir = "ltr"; // all 3 languages are LTR

    // ── 2. Document title ────────────────────────────────────────────────
    document.title = siteTitle;

    // ── 3. Meta tag helpers ──────────────────────────────────────────────
    const setMeta = (
      nameOrProp: string,
      content: string,
      isProperty = false
    ) => {
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(
        `meta[${attr}="${nameOrProp}"]`
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, nameOrProp);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    // ── 4. Primary meta tags ─────────────────────────────────────────────
    setMeta("description", siteDescription);
    setMeta("keywords", siteKeywords);
    setMeta("language", currentLangName);
    setMeta("robots", "index, follow");
    setMeta("author", companyName);

    // ── 5. Open Graph ────────────────────────────────────────────────────
    setMeta("og:title", siteTitle, true);
    setMeta("og:description", siteDescription, true);
    setMeta("og:url", siteUrl, true);
    setMeta("og:image", siteImage, true);
    setMeta("og:image:alt", siteTitle, true);
    setMeta("og:type", type, true);
    setMeta("og:locale", currentLocale, true);
    setMeta("og:site_name", companyName, true);

    // Alternate OG locales
    LANGUAGES.filter((l) => l.code !== currentLang).forEach((lang) => {
      setMeta("og:locale:alternate", lang.locale, true);
    });

    // ── 6. Twitter Card ──────────────────────────────────────────────────
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", siteTitle);
    setMeta("twitter:description", siteDescription);
    setMeta("twitter:image", siteImage);
    setMeta("twitter:image:alt", siteTitle);

    // ── 7. Canonical link ────────────────────────────────────────────────
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    // Strip lang param from canonical (canonical should be the clean URL)
    const canonicalUrl = new URL(siteUrl);
    canonicalUrl.searchParams.delete("lang");
    canonical.href = canonicalUrl.toString();

    // ── 8. Hreflang links ────────────────────────────────────────────────
    document
      .querySelectorAll('link[rel="alternate"][hreflang]')
      .forEach((el) => el.remove());

    const baseUrl = new URL(siteUrl);
    baseUrl.searchParams.delete("lang");

    LANGUAGES.forEach((lang) => {
      const el = document.createElement("link");
      el.rel = "alternate";
      el.hreflang = lang.code;
      const langUrl = new URL(baseUrl.toString());
      langUrl.searchParams.set("lang", lang.code);
      el.href = langUrl.toString();
      document.head.appendChild(el);
    });

    // x-default → points to Amharic (site default)
    const xDefault = document.createElement("link");
    xDefault.rel = "alternate";
    xDefault.hreflang = "x-default";
    const xDefaultUrl = new URL(baseUrl.toString());
    xDefaultUrl.searchParams.set("lang", "am");
    xDefault.href = xDefaultUrl.toString();
    document.head.appendChild(xDefault);

    // ── 9. JSON-LD structured data ───────────────────────────────────────
    // Remove existing JSON-LD injected by this component
    document
      .querySelectorAll("script[data-seo-jsonld]")
      .forEach((el) => el.remove());

    // Base WebSite schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: companyName,
      url: window.location.origin,
      inLanguage: LANGUAGES.map((l) => l.locale),
      potentialAction: {
        "@type": "SearchAction",
        target: `${window.location.origin}/shop?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };

    const schemas: Record<string, unknown>[] = [websiteSchema];

    // Add caller-supplied structured data (product, breadcrumb, etc.)
    if (structuredData) {
      if (Array.isArray(structuredData)) {
        schemas.push(...structuredData);
      } else {
        schemas.push(structuredData);
      }
    }

    schemas.forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "");
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
  }, [
    currentLang,
    currentLangName,
    currentLocale,
    siteTitle,
    siteDescription,
    siteUrl,
    siteImage,
    siteKeywords,
    type,
    companyName,
    structuredData,
  ]);

  // This component renders nothing — all work is done via DOM effects
  return null;
};
