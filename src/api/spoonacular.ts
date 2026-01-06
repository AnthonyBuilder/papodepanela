import axios from 'axios'

const API_KEY = (import.meta.env.VITE_SPOONACULAR_API_KEY as string) || ''

const client = axios.create({
  baseURL: 'https://api.spoonacular.com',
  params: {
    apiKey: API_KEY,
  },
})

export async function searchRecipes(query: string, number = 10) {
  const res = await client.get('/recipes/complexSearch', {
    params: { query, number },
  })
  return res.data
}

export async function getRecipeInformation(id: number) {
  const res = await client.get(`/recipes/${id}/information`)
  return res.data
}

export default client
