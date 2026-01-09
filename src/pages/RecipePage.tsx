import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRecipeInformation } from '../api/spoonacular'
import SpinnerEmpty from '@/components/SpinnerEmpty'
import { Button } from '@/components/ui/button'
import { useLanguage, translateForLocale } from '@/context/LanguageContext'

export default function RecipePage() {
  const { id } = useParams<{ id: string }>()
  const [recipe, setRecipe] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { locale, t } = useLanguage()

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getRecipeInformation(Number(id))
        
        // Translate recipe content if locale is not English
        if (locale !== 'en') {
          const translatedData = { ...data }
          
          // Translate title
          if (data.title) {
            translatedData.title = await translateForLocale(data.title, locale)
          }
          
          // Translate summary (strip HTML tags before translating)
          if (data.summary) {
            const plainSummary = data.summary.replace(/<[^>]*>/g, '')
            const translated = await translateForLocale(plainSummary, locale)
            translatedData.summary = `<p>${translated}</p>`
          }
          
          // Translate instructions (strip HTML tags before translating)
          if (data.instructions) {
            const plainInstructions = data.instructions.replace(/<[^>]*>/g, '')
            const translated = await translateForLocale(plainInstructions, locale)
            translatedData.instructions = translated
          }
          
          setRecipe(translatedData)
        } else {
          setRecipe(data)
        }
      } catch (e) {
        console.error('getRecipeInformation failed', e)
        setError(t('loadError'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, locale, t])

  if (!id) return <div className="p-6">{t('invalidId')}</div>
  if (loading) return <SpinnerEmpty />
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!recipe) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-500">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 font-noto-serif">{recipe.title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>{t('back')}</Button>
        </div>
      </div>

      {recipe.image && (
        <img src={recipe.image} alt={recipe.title} className="w-full max-h-96 object-cover rounded-lg mb-6" />
      )}

      <div className="max-w-none text-gray-700 space-y-6">
        {recipe.summary && (
          <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: recipe.summary }} />
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <strong className="text-gray-800">{t('servings')}:</strong> <span className="text-gray-700">{recipe.servings}</span> • <strong className="text-gray-800">{t('readyIn')}:</strong> <span className="text-gray-700">{recipe.readyInMinutes} {t('minutes')}</span>
        </div>

        {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">{t('ingredients')}</h3>
            <ul className="list-disc pl-6 space-y-2">
              {recipe.extendedIngredients.map((ing: any) => (
                <li key={ing.id || ing.original} className="text-gray-700">{ing.original}</li>
              ))}
            </ul>
          </div>
        )}

        {recipe.cuisines && recipe.cuisines.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Cuisines</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.cuisines.map((cuisine: string) => (
                <span key={cuisine} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">{cuisine}</span>
              ))}
            </div>
          </div>
        )}

        {recipe.diets && recipe.diets.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Diets</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.diets.map((diet: string) => (
                <span key={diet} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">{diet}</span>
              ))}
            </div>
          </div>
        )}

        {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Steps</h3>
            {recipe.analyzedInstructions.map((instruction: any, idx: number) => (
              <div key={idx} className="space-y-2">
                {instruction.steps && instruction.steps.map((step: any, stepIdx: number) => (
                  <div key={stepIdx} className="flex gap-4 pb-2 border-b border-gray-200">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-orange-500 text-white text-sm font-semibold">
                        {stepIdx + 1}
                      </span>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-700">{step.step}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
