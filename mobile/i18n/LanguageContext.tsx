import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveUser, getUser } from '../lib/auth';
import { en } from './translations/en';
import { hi } from './translations/hi';
import { ta } from './translations/ta';

export type LanguageCode = 'en' | 'hi' | 'ta';

export const translations: Record<LanguageCode, Record<string, string>> = {
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

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  changeLanguage: () => {},
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    getUser().then((u) => {
      if (u?.language) {
        const mapped = u.language.toLowerCase();
        if (mapped === 'hi' || mapped === 'hindi') setLanguageState('hi');
        else if (mapped === 'ta' || mapped === 'tamil') setLanguageState('ta');
        else setLanguageState('en');
      }
    });
  }, []);

  const changeLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    getUser().then((u) => {
      if (u) {
        saveUser({ ...u, language: lang });
      }
    });
  };

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations.en;
    let text = langDict[key] || translations.en[key] || key;

    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }

    // Safety fallback for unreplaced ward tokens
    text = text.replace(/\{ward\}/g, '1');

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
