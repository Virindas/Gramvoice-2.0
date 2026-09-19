import { useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export function useTranslation() {
  const { t, language, setLanguage } = useLanguage();
  
  return useMemo(() => ({
    t,
    i18n: { language, changeLanguage: setLanguage }
  }), [t, language, setLanguage]);
}
