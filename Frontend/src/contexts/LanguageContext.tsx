import React, { createContext, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";

export type SupportedLanguage = "am" | "en" | "om";

export interface Language {
  code: SupportedLanguage;
  name: string; // Name in its own language
  label: string; // Name in English (for aria labels)
  flag: string; // Emoji flag
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "am", name: "አማርኛ", label: "Amharic", flag: "🇪🇹" },
  { code: "en", name: "English", label: "English", flag: "🇬🇧" },
  { code: "om", name: "Afaan Oromo", label: "Afaan Oromo", flag: "🇪🇹" },
];

interface LanguageContextType {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  languages: Language[];
  currentLanguage: Language;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const STORAGE_KEY = "voltedge_lang";

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { i18n } = useTranslation();

  const currentLang =
    (i18n.language?.split("-")[0] as SupportedLanguage) || "am";

  const setLang = (code: SupportedLanguage) => {
    i18n.changeLanguage(code);
    localStorage.setItem(STORAGE_KEY, code);
    // Update the html lang attribute for screen readers and SEO
    document.documentElement.lang = code;
  };

  // Sync html lang on mount and language changes
  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  const currentLanguage = (SUPPORTED_LANGUAGES.find(
    (l) => l.code === currentLang
  ) ?? SUPPORTED_LANGUAGES[0]) as Language;

  return (
    <LanguageContext.Provider
      value={{
        lang: currentLang,
        setLang,
        languages: SUPPORTED_LANGUAGES,
        currentLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
};
