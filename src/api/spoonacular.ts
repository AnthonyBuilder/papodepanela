import axios from 'axios'
import { translateText } from './translate'

const API_KEY = (import.meta.env.VITE_SPOONACULAR_API_KEY as string) || ''

const client = axios.create({
  baseURL: 'https://api.spoonacular.com',
  params: {
    apiKey: API_KEY,
  },
})

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
  }

  return { ...data, translationFailed, enQuery, enQueryEncoded }
}

export async function getRecipeInformation(id: number) {
  const res = await client.get(`/recipes/${id}/information`)
  return res.data
}

export async function getRandomRecipes(number = 6) {
  const res = await client.get('/recipes/random', {
    params: { number },
  })
  return res.data?.recipes ?? []
}

export default client
