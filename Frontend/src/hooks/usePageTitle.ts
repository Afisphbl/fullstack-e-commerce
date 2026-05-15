import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

/**
 * usePageTitle
 *
 * Sets the browser tab title dynamically using the localized company name
 * from site settings (with a sensible fallback).
 *
 * @param title  - Page-specific title (e.g. "Shop", "About Us")
 */
export const usePageTitle = (title: string) => {
  const { i18n } = useTranslation("common");
  const { settings } = useSiteSettings();
  const currentLang = i18n.language;

  // Derive localized site name from settings
  const siteName = (() => {
    if (!settings?.companyName) return "Seid-Electronics";
    if (typeof settings.companyName === "string") return settings.companyName;
    const localized =
      settings.companyName[currentLang as keyof typeof settings.companyName];
    return (
      (localized as string) ||
      (settings.companyName as Record<string, string>).en ||
      "Seid-Electronics"
    );
  })();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | ${siteName}` : siteName;

    return () => {
      document.title = previousTitle;
    };
  }, [title, siteName]);
};
