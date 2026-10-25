"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from './translations';

type I18nContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.ar;
  dir: 'rtl' | 'ltr';
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('sirsend_lang') as Language;
    if (saved && ['ar', 'tr', 'en'].includes(saved)) {
      setLang(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sirsend_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const value: I18nContextType = {
    lang,
    setLang,
    t: translations[lang],
    dir: lang === 'ar' ? 'rtl' : 'ltr',
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within I18nProvider');
  return context;
}