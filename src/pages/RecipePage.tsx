import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRecipeInformation } from '../api/spoonacular'
import SpinnerEmpty from '@/components/SpinnerEmpty'
import { Button } from '@/components/ui/button'

export default function RecipePage() {
  const { id } = useParams<{ id: string }>()
  const [recipe, setRecipe] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getRecipeInformation(Number(id))
        setRecipe(data)
      } catch (e) {
        console.error('getRecipeInformation failed', e)
        setError('Erro ao carregar receita')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (!id) return <div className="p-6">ID inválido.</div>
  if (loading) return <SpinnerEmpty />
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!recipe) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-600">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{recipe.title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Voltar</Button>
        </div>
      </div>

      {recipe.image && (
        <img src={recipe.image} alt={recipe.title} className="w-full max-h-96 object-cover rounded-lg mb-6" />
      )}

      <div className="prose max-w-none">
        {recipe.summary && (
          <div dangerouslySetInnerHTML={{ __html: recipe.summary }} />
        )}

        <div className="mt-4">
          <strong>Servings:</strong> {recipe.servings} • <strong>Ready in:</strong> {recipe.readyInMinutes} min
        </div>

        {recipe.extendedIngredients && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Ingredientes</h3>
            <ul className="list-disc pl-6">
              {recipe.extendedIngredients.map((ing: any) => (
                <li key={ing.id || ing.original}>{ing.original}</li>
              ))}
            </ul>
          </div>
        )}

        {recipe.instructions && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Modo de preparo</h3>
            <div dangerouslySetInnerHTML={{ __html: recipe.instructions }} />
          </div>
        )}
      </div>
    </div>
  )
}
