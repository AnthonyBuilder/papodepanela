import axios from 'axios'
import { translateText } from './translate'

const API_KEY = (import.meta.env.VITE_SPOONACULAR_API_KEY as string) || ''

const client = axios.create({
  baseURL: 'https://api.spoonacular.com',
  params: {
    apiKey: API_KEY,
  },
})

export async function searchRecipes(query: string, number = 10) {
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
          const tTitle = await translateText(r.title || '', 'pt', 'en')
          const titlePt = tTitle.text || r.title
          if ((r.title || '') === titlePt) {
            console.log('[searchRecipes] title not changed', r.title)
          } else {
            console.log('[searchRecipes] translated title', r.title, '->', titlePt)
          }
          return { ...r, title: titlePt }
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

export default client
