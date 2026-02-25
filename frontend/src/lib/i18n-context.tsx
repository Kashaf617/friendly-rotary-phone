'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

export type Locale = 'en' | 'ar';

type Dict = Record<string, any>;

const dictionaries: Record<Locale, Dict> = {
  en: en as Dict,
  ar: ar as Dict,
};

function getNested(dict: Dict, key: string): string | undefined {
  return key.split('.').reduce<any>((acc, part) => (acc ? acc[part] : undefined), dict);
}

interface I18nContextType {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem('locale')) as Locale | null;
    if (stored === 'en' || stored === 'ar') {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem('locale', next);
  }, []);

  const dir = useMemo(() => (locale === 'ar' ? 'rtl' : 'ltr') as 'rtl' | 'ltr', [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const t = useCallback(
    (key: string) => {
      const dict = dictionaries[locale];
      return getNested(dict, key) ?? key;
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, dir, setLocale, t }), [locale, dir, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
