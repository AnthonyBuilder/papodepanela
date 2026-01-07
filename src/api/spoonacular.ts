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
const infoCache = new Map<number, any>()
const searchCache = new Map<string, any>()
const searchPromiseCache = new Map<string, Promise<any>>()

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

export async function searchRecipes(query: string, number = 10, uiLocale = 'pt') {
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
  const cacheKey = `search:${enQueryEncoded}:${uiLocale}:${number}`

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
    const res = await client.get('/recipes/complexSearch', {
      params: { query: enQueryEncoded, number },
    })
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

export async function getRecipeInformation(id: number) {
  if (infoCache.has(id)) return infoCache.get(id)
  const res = await client.get(`/recipes/${id}/information`)
  infoCache.set(id, res.data)
  return res.data
}

export async function getRandomRecipes(number = 6) {
  // in-memory cache
  if (randomCache.has(number)) return randomCache.get(number)!

  // check localStorage with TTL
  const lsKey = `random:${number}`
  const lsVal = localStorageGet(lsKey)
  if (lsVal && lsVal.ts && Date.now() - lsVal.ts < RANDOM_TTL) {
    randomCache.set(number, lsVal.data)
    return lsVal.data
  }

  // dedupe concurrent requests
  if (randomPromiseCache.has(number)) return randomPromiseCache.get(number)!

  const promise = (async () => {
    const res = await client.get('/recipes/random', {
      params: { number },
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

export default client
