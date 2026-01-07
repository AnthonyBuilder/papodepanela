import React, { createContext, useContext, useState } from 'react'
import translateText from '@/api/translate'
import type { TranslationResult } from '@/api/translate'

type Locale = 'en' | 'pt' | 'es'

type LangContextType = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
  translateUI: (key: string) => string
}

const translations: Record<Locale, Record<string, string>> = {
  en: {
    login: 'Login',
    enter: 'Enter',
    searchPlaceholder: 'Search recipes...',
    featured: 'Featured recipes',
  },
  pt: {
    login: 'Entrar',
    enter: 'Entrar',
    searchPlaceholder: 'Pesquisar receitas...',
    featured: 'Receitas em destaque',
  },
  es: {
    login: 'Iniciar sesión',
    enter: 'Entrar',
    searchPlaceholder: 'Buscar recetas...',
    featured: 'Recetas destacadas',
  },
}

const LangContext = createContext<LangContextType | undefined>(undefined)

export const LanguageProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('pt')

  const t = (key: string) => translations[locale]?.[key] ?? key

  const value: LangContextType = {
    locale,
    setLocale: (l: Locale) => setLocale(l),
    t,
    translateUI: t,
  }

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

export async function translateForLocale(text: string, target: Locale) {
  if (!text) return text
  if (target === 'en') return text
  try {
    const res: TranslationResult = await translateText(text, target, 'auto')
    return res.text
  } catch (e) {
    return text
  }
}

export type { Locale }
