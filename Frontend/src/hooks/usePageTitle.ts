import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Custom hook to set the page title dynamically.
 * Language-aware: updates title when the active language changes.
 * @param title - The translated title string to set for the page
 * @param siteName - Optional site name override (defaults to "Seid-Electronics")
 */
export const usePageTitle = (
  title: string,
  siteName: string = "Seid-Electronics"
) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | ${siteName}` : siteName;

    return () => {
      document.title = previousTitle;
    };
    // Re-run when title or language changes
  }, [title, siteName, i18n.language]);
};
