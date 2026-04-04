import { useLanguage } from '@/contexts/LanguageContext';
import en from '@/translations/en.json';
import bn from '@/translations/bn.json';

export function useTranslation() {
  const { language } = useLanguage();
  
  const translations = language === 'bn' ? bn : en;

  const t = (key) => {
    // Support nested keys like 'nav.login'
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return value || key;
  };

  return { t, language };
}
