import { useTranslation } from 'react-i18next';

type MultilingualField = {
  am?: string;
  en?: string;
  om?: string;
} | string | undefined | null;

/**
 * Custom hook to extract the appropriate language from a multilingual field
 * @param field - Multilingual field object or plain string
 * @returns Localized string based on current language
 */
export const useLocalizedField = (field: MultilingualField): string => {
  const { i18n } = useTranslation();
  
  if (!field) return '';
  if (typeof field === 'string') return field;
  
  const lang = i18n.language as 'am' | 'en' | 'om';
  
  // Return current language, fallback to English, then Amharic, then Afaan Oromo
  return field[lang] || field.en || field.am || field.om || '';
};

/**
 * Utility function (non-hook) to extract localized field
 * Use this in contexts where hooks cannot be used
 */
export const extractLocalizedField = (
  field: MultilingualField,
  lang: 'am' | 'en' | 'om' = 'en'
): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  
  return field[lang] || field.en || field.am || field.om || '';
};
