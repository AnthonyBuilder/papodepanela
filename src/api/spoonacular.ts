import axios from 'axios'
import { translateText } from './translate'

const API_KEY = (import.meta.env.VITE_SPOONACULAR_API_KEY as string) || ''

const client = axios.create({
  baseURL: 'https://api.spoonacular.com',
  params: {
    apiKey: API_KEY,
  },
})

// Simple in-memory caches to reduce redundant API calls during a session
const randomCache = new Map<number, any[]>()
const randomPromiseCache = new Map<number, Promise<any[]>>()
const RANDOM_TTL = 1000 * 60 * 60 // 1 hour
const infoCache = new Map<string, any>()
const searchCache = new Map<string, any>()
const searchPromiseCache = new Map<string, Promise<any>>()
const categoryCache = new Map<string, any[]>()
const categoryPromiseCache = new Map<string, Promise<any[]>>()

function localStorageGet(key: string) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : null
  } catch (e) {
    return null
  }
}

function localStorageSet(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    // ignore
  }
}

export interface SearchFilters {
  diet?: string
  type?: string
  cuisine?: string
  maxReadyTime?: number
  intolerances?: string
}

export async function searchRecipes(query: string, number = 8, uiLocale = 'pt', filters?: SearchFilters) {
  const originalQuery = query
  let enQuery = originalQuery
  let translationFailed = false

  try {
    const t = await translateText(originalQuery, 'en', 'auto')
    enQuery = t.text || originalQuery
    translationFailed = !t.ok
    console.log('[searchRecipes] originalQuery -> enQuery', originalQuery, '->', enQuery, 'ok=', t.ok)
  } catch (e) {
    console.error('translate original to en failed', e)
    enQuery = originalQuery
    translationFailed = true
  }

  const enQueryEncoded = encodeURIComponent(enQuery)
  console.log('[searchRecipes] enQueryEncoded=', enQueryEncoded)
  const filterKey = filters ? JSON.stringify(filters) : ''
  const cacheKey = `search:${enQueryEncoded}:${uiLocale}:${number}:${filterKey}`

  // try local memory cache
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)
  }

  // try localStorage cache
  const ls = localStorageGet(cacheKey)
  if (ls) {
    searchCache.set(cacheKey, ls)
    return ls
  }

  // dedupe concurrent requests
  if (searchPromiseCache.has(cacheKey)) return searchPromiseCache.get(cacheKey)!

  const promise = (async () => {
    const params: any = { query: enQueryEncoded, number }
    if (filters?.diet) params.diet = filters.diet
    if (filters?.type) params.type = filters.type
    if (filters?.cuisine) params.cuisine = filters.cuisine
    if (filters?.maxReadyTime) params.maxReadyTime = filters.maxReadyTime
    if (filters?.intolerances) params.intolerances = filters.intolerances
    
    const res = await client.get('/recipes/complexSearch', { params })
    const data = res.data

    if (data && Array.isArray(data.results) && data.results.length > 0) {
      const translated = await Promise.all(
        data.results.map(async (r: any) => {
          try {
            const tTitle = await translateText(r.title || '', uiLocale, 'en')
            const titleLocale = tTitle.text || r.title
            if ((r.title || '') === titleLocale) {
              console.log('[searchRecipes] title not changed', r.title)
            } else {
              console.log('[searchRecipes] translated title', r.title, '->', titleLocale)
            }
            return { ...r, title: titleLocale }
          } catch (e) {
            console.error('translate title failed', e)
            return r
          }
        })
      )
      data.results = translated
      const final = { ...data, translationFailed, enQuery, enQueryEncoded }
      // cache in memory and localStorage
      searchCache.set(cacheKey, final)
      localStorageSet(cacheKey, final)
      return final
    }
  })()

  searchPromiseCache.set(cacheKey, promise)
  try {
    const result = await promise
    searchPromiseCache.delete(cacheKey)
    return result
  } catch (e) {
    searchPromiseCache.delete(cacheKey)
    throw e
  }
}

export async function getRecipeInformation(id: number, language = 'en') {
  const key = `${id}:${language}`
  if (infoCache.has(key)) return infoCache.get(key)
  
  const res = await client.get(`/recipes/${id}/information`, {
    params: { language },
  })
  infoCache.set(key, res.data)
  return res.data
}

export async function getRandomRecipes(number = 6, language = 'en') {
  // in-memory cache
  const cacheKey = `random:${number}:${language}`
  if (randomCache.has(number)) return randomCache.get(number)!

  // check localStorage with TTL
  const lsKey = cacheKey
  const lsVal = localStorageGet(lsKey)
  if (lsVal && lsVal.ts && Date.now() - lsVal.ts < RANDOM_TTL) {
    randomCache.set(number, lsVal.data)
    return lsVal.data
  }

  // dedupe concurrent requests
  if (randomPromiseCache.has(number)) return randomPromiseCache.get(number)!

  const promise = (async () => {
    const res = await client.get('/recipes/random', {
      params: { number, language },
    })
    const recipes = res.data?.recipes ?? []
    randomCache.set(number, recipes)
    localStorageSet(lsKey, { ts: Date.now(), data: recipes })
    return recipes
  })()

  randomPromiseCache.set(number, promise)
  try {
    const result = await promise
    randomPromiseCache.delete(number)
    return result
  } catch (e) {
    randomPromiseCache.delete(number)
    throw e
  }
}

export async function getRecipesByCuisine(cuisine: string, number = 6, language = 'en') {
  const key = `${cuisine}:${number}:${language}`

  if (categoryCache.has(key)) return categoryCache.get(key)!

  if (categoryPromiseCache.has(key)) return categoryPromiseCache.get(key)!

  const promise = (async () => {
    const res = await client.get('/recipes/complexSearch', {
      params: {
        number,
        cuisine,
        addRecipeInformation: true,
        language,
      },
    })
    const recipes = res.data?.results ?? []
    categoryCache.set(key, recipes)
    return recipes
  })()

  categoryPromiseCache.set(key, promise)
  try {
    const result = await promise
    categoryPromiseCache.delete(key)
    return result
  } catch (e) {
    categoryPromiseCache.delete(key)
    throw e
  }
}

export async function getDrinkRecipes(number = 6, language = 'en') {
  const key = `drinks:${number}:${language}`

  if (categoryCache.has(key)) return categoryCache.get(key)!

  if (categoryPromiseCache.has(key)) return categoryPromiseCache.get(key)!

  const promise = (async () => {
    const res = await client.get('/recipes/complexSearch', {
      params: {
        number,
        type: 'drink',
        addRecipeInformation: true,
        language,
      },
    })
    const recipes = res.data?.results ?? []
    categoryCache.set(key, recipes)
    return recipes
  })()

  categoryPromiseCache.set(key, promise)
  try {
    const result = await promise
    categoryPromiseCache.delete(key)
    return result
  } catch (e) {
    categoryPromiseCache.delete(key)
    throw e
  }
}

export async function getDessertRecipes(number = 6, language = 'en') {
  const key = `desserts:${number}:${language}`

  if (categoryCache.has(key)) return categoryCache.get(key)!

  if (categoryPromiseCache.has(key)) return categoryPromiseCache.get(key)!

  const promise = (async () => {
    const res = await client.get('/recipes/complexSearch', {
      params: {
        number,
        type: 'dessert',
        addRecipeInformation: true,
        language,
      },
    })
    const recipes = res.data?.results ?? []
    categoryCache.set(key, recipes)
    return recipes
  })()

  categoryPromiseCache.set(key, promise)
  try {
    const result = await promise
    categoryPromiseCache.delete(key)
    return result
  } catch (e) {
    categoryPromiseCache.delete(key)
    throw e
  }
}

export default client
