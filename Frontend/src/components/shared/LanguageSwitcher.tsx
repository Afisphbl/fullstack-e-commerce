import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

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
        <SelectItem value="en" className="text-xs">
          English (En)
        </SelectItem>
        <SelectItem value="am" className="text-xs font-sans">
          አማርኛ (አማ)
        </SelectItem>
        <SelectItem value="om" className="text-xs">
          Afaan Oromo (Or)
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
