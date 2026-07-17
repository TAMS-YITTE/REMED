'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'en';

type Dictionary = Record<string, string>;

const dictionaries: Record<Language, Dictionary> = {
  fr: {
    'nav.home': 'Accueil',
    'nav.buy': 'Acheter',
    'nav.blog': 'Blog',
    'nav.quiz': 'Quiz',
    'sim.title': 'Simulateur Rapide',
    'sim.pay': 'Vous payez',
    'sim.receive': 'Vous recevez (estimatif)',
    'sim.buy': 'Acheter maintenant',
  },
  en: {
    'nav.home': 'Home',
    'nav.buy': 'Buy',
    'nav.blog': 'Blog',
    'nav.quiz': 'Quiz',
    'sim.title': 'Quick Simulator',
    'sim.pay': 'You pay',
    'sim.receive': 'You get (estimated)',
    'sim.buy': 'Buy now',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('remedly_language') as Language;
    if (saved === 'fr' || saved === 'en') {
      setLanguage(saved);
    }
    setMounted(true);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('remedly_language', lang);
  };

  const t = (key: string) => {
    if (!mounted) return dictionaries['fr'][key] || key;
    return dictionaries[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
