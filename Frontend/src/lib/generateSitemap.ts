/**
 * generateSitemap.ts
 *
 * Sitemap generation utility for the multilingual e-commerce storefront.
 * Produces a standards-compliant XML sitemap with <xhtml:link> hreflang
 * alternate tags for all three supported languages (am, en, om).
 *
 * Usage:
 *   node -e "require('./src/lib/generateSitemap').printSitemap()"
 *
 * Or call generateSitemapXml() and write the result to /public/sitemap.xml
 * as part of your CI/CD pipeline.
 */

const LANGUAGES = ["am", "en", "om"] as const;
type Language = (typeof LANGUAGES)[number];

interface SitemapUrl {
  /** Path relative to the site root, e.g. "/shop" */
  path: string;
  /** ISO 8601 last-modified date, e.g. "2026-05-15" */
  lastmod?: string;
  /** Google priority hint (0.0 – 1.0) */
  priority?: number;
  /** Google change frequency hint */
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
}

/**
 * Static storefront routes included in the sitemap.
 * Dynamic routes (products, blog posts, etc.) must be fetched at build time
 * and merged in via generateSitemapXml().
 */
export const STATIC_ROUTES: SitemapUrl[] = [
  { path: "/", priority: 1.0, changefreq: "daily" },
  { path: "/shop", priority: 0.9, changefreq: "daily" },
  { path: "/about", priority: 0.7, changefreq: "monthly" },
  { path: "/contact", priority: 0.7, changefreq: "monthly" },
  { path: "/faq", priority: 0.6, changefreq: "monthly" },
  { path: "/blog", priority: 0.7, changefreq: "weekly" },
];

/**
 * Generates a complete XML sitemap string with hreflang alternate links.
 *
 * @param baseUrl        - Site origin, e.g. "https://www.seid-electronics.com"
 * @param staticRoutes   - Static routes (defaults to STATIC_ROUTES)
 * @param dynamicRoutes  - Optional dynamically fetched routes (e.g. product pages)
 * @returns              - Valid XML sitemap string
 */
export const generateSitemapXml = (
  baseUrl: string,
  staticRoutes: SitemapUrl[] = STATIC_ROUTES,
  dynamicRoutes: SitemapUrl[] = []
): string => {
  const allRoutes = [...staticRoutes, ...dynamicRoutes];
  const today = new Date().toISOString().split("T")[0];

  const urlEntries = allRoutes
    .map((route) => {
      const lastmod = route.lastmod || today;
      const priority = route.priority ?? 0.5;
      const changefreq = route.changefreq || "weekly";

      // Build hreflang alternate links for all languages
      const alternates = LANGUAGES.map(
        (lang) =>
          `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}${route.path}?lang=${lang}"/>`
      ).join("\n");

      // x-default → points to Amharic (default language)
      const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${route.path}?lang=am"/>`;

      return `  <url>\n    <loc>${baseUrl}${route.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n${alternates}\n${xDefault}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;
};

/**
 * Prints the sitemap to stdout — useful for CLI-based generation.
 * Example: node -r ts-node/register src/lib/generateSitemap.ts
 */
export const printSitemap = (baseUrl = "https://www.seid-electronics.com") => {
  console.log(generateSitemapXml(baseUrl));
};
