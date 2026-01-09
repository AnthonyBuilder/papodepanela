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
    back: 'Back',
    servings: 'Servings',
    readyIn: 'Ready in',
    minutes: 'min',
    ingredients: 'Ingredients',
    instructions: 'Instructions',
    invalidId: 'Invalid ID.',
    loadError: 'Error loading recipe',
    searchError: 'Error searching recipes',
    invalidQuery: 'Invalid query.',
    noRecipesFound: 'No recipes found.',
    results: 'Results for',
    details: 'View details',
    about: 'About: Papo de Panela is a recipe repository.',
    contact: 'Contact: contato@papodepanela.local',
    language: 'Language',
    portuguese: 'Português',
    english: 'English',
    spanish: 'Español',
    randomRecipes: 'Featured recipes',
    randomRecipesDesc: 'Randomly selected recipes from our repository.',
    searching: 'Searching...',
    searchingFor: 'Searching for',
    translationFailed: 'Could not translate the term; searching with the original term.',
    recipes: 'Recipes',
    favorites: 'Favorites',
    categories: 'Categories',
    aboutMenu: 'About',
  },
  pt: {
    login: 'Entrar',
    enter: 'Entrar',
    searchPlaceholder: 'Pesquisar receitas...',
    featured: 'Receitas em destaque',
    back: 'Voltar',
    servings: 'Porções',
    readyIn: 'Pronto em',
    minutes: 'min',
    ingredients: 'Ingredientes',
    instructions: 'Modo de preparo',
    invalidId: 'ID inválido.',
    loadError: 'Erro ao carregar receita',
    searchError: 'Erro ao buscar receitas',
    invalidQuery: 'Query inválida.',
    noRecipesFound: 'Nenhuma receita encontrada.',
    results: 'Resultados para',
    details: 'Ver detalhes',
    about: 'Sobre: Papo de Panela é um repositório de receitas.',
    contact: 'Contato: contato@papodepanela.local',
    language: 'Idioma',
    portuguese: 'Português',
    english: 'English',
    spanish: 'Español',
    randomRecipes: 'Receitas em destaque',
    randomRecipesDesc: 'Receitas selecionadas aleatoriamente do nosso repositório.',
    searching: 'Buscando...',
    searchingFor: 'Buscando por',
    translationFailed: 'Não foi possível traduzir o termo; buscando com o termo original.',
    recipes: 'Receitas',
    favorites: 'Favoritos',
    categories: 'Categorias',
    aboutMenu: 'Sobre',
  },
  es: {
    login: 'Iniciar sesión',
    enter: 'Entrar',
    searchPlaceholder: 'Buscar recetas...',
    featured: 'Recetas destacadas',
    back: 'Volver',
    servings: 'Porciones',
    readyIn: 'Listo en',
    minutes: 'min',
    ingredients: 'Ingredientes',
    instructions: 'Instrucciones',
    invalidId: 'ID inválido.',
    loadError: 'Error al cargar la receta',
    searchError: 'Error al buscar recetas',
    invalidQuery: 'Consulta inválida.',
    noRecipesFound: 'No se encontraron recetas.',
    results: 'Resultados para',
    details: 'Ver detalles',
    about: 'Acerca de: Papo de Panela es un repositorio de recetas.',
    contact: 'Contacto: contato@papodepanela.local',
    language: 'Idioma',
    portuguese: 'Português',
    english: 'English',
    spanish: 'Español',
    randomRecipes: 'Recetas destacadas',
    randomRecipesDesc: 'Recetas seleccionadas al azar de nuestro repositorio.',
    searching: 'Buscando...',
    searchingFor: 'Buscando por',
    translationFailed: 'No se pudo traducir el término; buscando con el término original.',
    recipes: 'Recetas',
    favorites: 'Favoritos',
    categories: 'Categorías',
    aboutMenu: 'Acerca de',
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
