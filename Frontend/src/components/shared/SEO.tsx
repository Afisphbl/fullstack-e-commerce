import React from "react";
import { Helmet } from "react-helmet-async";
import { useSettings } from "@/contexts/SettingsContext";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description, keywords }) => {
  const { settings } = useSettings();

  const defaultTitle = settings?.seo?.title || settings?.siteName || "VoltEdge";
  const defaultDescription = settings?.seo?.description || "Your favorite e-commerce store";
  const defaultKeywords = settings?.seo?.keywords || "ecommerce, shop, online";

  const finalTitle = title ? `${title} | ${settings?.siteName || "VoltEdge"}` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
    </Helmet>
  );
};
