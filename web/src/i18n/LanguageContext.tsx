import * as React from 'react';
import { AppStore } from '../services/store';
import { en } from './translations/en';
import { hi } from './translations/hi';
import { ta } from './translations/ta';

export type LanguageCode = 'en' | 'hi' | 'ta';

const translations: Record<LanguageCode, Record<string, string>> = {
  en,
  hi,
  ta,
};

interface LanguageContextType {
  language: LanguageCode;
  changeLanguage: (lang: LanguageCode) => void;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<LanguageCode>(() => AppStore.getLang());

  const changeLanguage = React.useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    AppStore.setLang(lang);
  }, []);

  const setLanguage = React.useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    AppStore.setLang(lang);
  }, []);

  const t = React.useCallback((key: string, variables?: Record<string, string | number>): string => {
    const dict = translations[language] || translations['en'];
    let text = dict[key] || translations['en'][key] || key;

    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }

    // Safety fallback for unreplaced ward tokens
    text = text.replace(/\{ward\}/g, '1');

    return text;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
