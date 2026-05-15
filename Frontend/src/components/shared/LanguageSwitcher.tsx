import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  
  const handleLanguageChange = (newLang: string) => {
    i18n.changeLanguage(newLang);
  };
  
  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'am':
        return 'አማርኛ';
      case 'en':
        return 'English';
      case 'om':
        return 'Afaan Oromo';
      default:
        return 'English';
    }
  };
  
  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[160px] h-9">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue>{getLanguageLabel(i18n.language)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="am">
          <span className="font-sans">አማርኛ</span>
        </SelectItem>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="om">Afaan Oromo</SelectItem>
      </SelectContent>
    </Select>
  );
};
