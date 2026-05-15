import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

interface UseSEOOptions {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: "website" | "product" | "article";
  /** JSON-LD structured data (Product, BreadcrumbList, etc.) */
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * useSEO
 *
 * A page-level hook that injects SEO meta tags, updates the document title,
 * sets HTML attributes, and (optionally) injects JSON-LD structured data.
 *
 * Works in conjunction with the <SEOHead /> component mounted in the layout.
 * Use this hook inside individual page components to pass page-specific data.
 *
 * @example
 * // Product detail page
 * useSEO({
 *   title: 'iPhone 15 Pro',
 *   description: 'Buy iPhone 15 Pro at the best price.',
 *   type: 'product',
 *   structuredData: {
 *     '@context': 'https://schema.org',
 *     '@type': 'Product',
 *     name: 'iPhone 15 Pro',
 *     ...
 *   }
 * });
 */
export const useSEO = (_options: UseSEOOptions = {}) => {
  const { i18n } = useTranslation();
  const { settings } = useSiteSettings();
  const currentLang = i18n.language as "am" | "en" | "om";

  useEffect(() => {
    // Keep HTML attributes in sync
    document.documentElement.lang = currentLang;
    document.documentElement.dir = "ltr";
  }, [currentLang]);

  return {
    currentLang,
    isAmharic: currentLang === "am",
    isEnglish: currentLang === "en",
    isOromo: currentLang === "om",
    settings,
  };
};

/**
 * buildProductStructuredData
 *
 * Helper that creates a schema.org Product JSON-LD object from a product.
 * Pass the result to useSEO({ structuredData: ... }) or <SEOHead structuredData={...} />.
 */
export const buildProductStructuredData = (product: {
  name: string;
  description?: string;
  images?: string[];
  price: number;
  currency?: string;
  brand?: string;
  sku?: string;
  ratingsAverage?: number;
  ratingsCount?: number;
  stock?: number;
  slug?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  description: product.description,
  image: product.images?.[0],
  brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
  sku: product.sku,
  offers: {
    "@type": "Offer",
    priceCurrency: product.currency || "ETB",
    price: product.price,
    availability:
      (product.stock ?? 1) > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    url: product.slug
      ? `${window.location.origin}/product/${product.slug}`
      : window.location.href,
  },
  ...(product.ratingsAverage && product.ratingsCount
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.ratingsAverage,
          reviewCount: product.ratingsCount,
        },
      }
    : {}),
});

/**
 * buildBreadcrumbStructuredData
 *
 * Helper that creates a schema.org BreadcrumbList JSON-LD object.
 */
export const buildBreadcrumbStructuredData = (
  items: { name: string; url: string }[]
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: item.name,
    item: item.url,
  })),
});
