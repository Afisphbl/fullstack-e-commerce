import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { settings } = useSiteSettings();

  const handleLanguageChange = (newLang: string) => {
    i18n.changeLanguage(newLang);
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case "am":
        return "አማ";
      case "en":
        return "En";
      case "om":
        return "Or";
      default:
        return "En";
    }
  };

  const supported = settings.supportedLanguages || ["en", "am", "om"];

  // If the current language was disabled, we might want to stay on it or default,
  // but for the switcher, we only show what's allowed.

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[65px] h-8 px-2 bg-transparent border-none hover:bg-accent/50 focus:ring-0 transition-colors">
        <SelectValue>
          <span className="text-xs font-bold uppercase tracking-tight">
            {getLanguageLabel(i18n.language)}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[120px]">
        {supported.includes("en") && (
          <SelectItem value="en" className="text-xs">
            English (En)
          </SelectItem>
        )}
        {supported.includes("am") && (
          <SelectItem value="am" className="text-xs font-sans">
            አማርኛ (አማ)
          </SelectItem>
        )}
        {supported.includes("om") && (
          <SelectItem value="om" className="text-xs">
            Afaan Oromo (Or)
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};
