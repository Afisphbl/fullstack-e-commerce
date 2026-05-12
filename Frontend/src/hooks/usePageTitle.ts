import { useEffect } from "react";

/**
 * Custom hook to set the page title dynamically
 * @param title - The title to set for the page
 * @param siteName - Optional site name to append (defaults to "TechStore")
 */
export const usePageTitle = (
  title: string,
  siteName: string = "Seid-Electronics",
) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | ${siteName}` : siteName;

    // Cleanup: restore previous title when component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title, siteName]);
};
