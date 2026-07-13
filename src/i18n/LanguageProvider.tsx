'use client';

import * as React from 'react';
import { dictionaries, type Dictionary, type Lang } from './dictionaries';

interface LanguageContextValue {
  lang: Lang;
  t: Dictionary;
  setLang: (lang: Lang) => void;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always render 'pl' on the server and first client paint; the saved
  // preference is applied after hydration to avoid a markup mismatch.
  const [lang, setLangState] = React.useState<Lang>('pl');

  React.useEffect(() => {
    const saved = window.localStorage.getItem('liquidflow-lang');
    if (saved === 'en' || saved === 'pl') setLangState(saved);
  }, []);

  const setLang = React.useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem('liquidflow-lang', next);
    document.documentElement.lang = next;
  }, []);

  const value = React.useMemo(
    () => ({ lang, t: dictionaries[lang], setLang }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): LanguageContextValue {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
