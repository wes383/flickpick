"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Language } from "@/types";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";
import { getSettings, saveSettings } from "@/lib/storage";

interface I18nContextValue {
  language: Language;
  t: Dictionary;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    setLanguageState(settings.language);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = language;
    const settings = getSettings();
    saveSettings({ ...settings, language });
  }, [language, mounted]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const value: I18nContextValue = {
    language,
    t: getDictionary(language),
    setLanguage,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return ctx;
}
