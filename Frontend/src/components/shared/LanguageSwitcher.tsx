import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  useLanguage,
  type SupportedLanguage,
} from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export const LanguageSwitcher = ({ className }: { className?: string }) => {
  const { lang, setLang, languages, currentLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-1.5 px-2 text-sm font-medium", className)}
          aria-label="Select language"
          title={`Current language: ${currentLanguage.label}`}
        >
          <Globe className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
          <span className="hidden md:inline">{currentLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLang(language.code as SupportedLanguage)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              lang === language.code &&
                "bg-accent text-accent-foreground font-semibold"
            )}
          >
            <span className="text-base">{language.flag}</span>
            <span>{language.name}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {language.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
