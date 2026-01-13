import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRecipeInformation } from '../api/spoonacular'
import SpinnerEmpty from '@/components/SpinnerEmpty'
import Breadcrumbs from '@/components/Breadcrumbs'
import SEO from '@/components/SEO'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'
import { translateIngredients, translateText, translateArray } from '@/api/freeTranslate'
import { useSavedRecipes } from '@/context/SavedRecipesContext'
import { useAuth } from '@/context/AuthContext'
import AdBanner from '@/components/AdBanner'

export default function RecipePage() {
  const { id } = useParams<{ id: string }>()
  const [recipe, setRecipe] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { locale, t } = useLanguage()
  const { user } = useAuth()
  const { isSaved, toggleRecipe } = useSavedRecipes()
  const [savingRecipe, setSavingRecipe] = useState(false)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        let data = await getRecipeInformation(Number(id))
        
        // Traduzir conteúdo se não estiver em inglês
        if (locale !== 'en') {
          data = { ...data }
          
          // Traduzir título com IA
          if (data.title) {
            data.title = await translateText(data.title, locale)
          }
          
          // Traduzir summary com IA
          if (data.summary) {
            const plainSummary = data.summary.replace(/<[^>]*>/g, '')
            const translated = await translateText(plainSummary, locale)
            data.summary = `<p>${translated}</p>`
          }
          
          // Traduzir cuisines com IA
          if (data.cuisines && Array.isArray(data.cuisines)) {
            data.cuisines = await translateArray(data.cuisines, locale)
          }
          
          // Traduzir diets com IA
          if (data.diets && Array.isArray(data.diets)) {
            data.diets = await translateArray(data.diets, locale)
          }
          
          // Traduzir ingredientes com IA (batch)
          if (data.extendedIngredients && Array.isArray(data.extendedIngredients)) {
            const ingredientTexts = data.extendedIngredients.map((ing: any) => ing.original || '')
            const translatedTexts = await translateIngredients(ingredientTexts, locale)
            data.extendedIngredients = data.extendedIngredients.map((ing: any, index: number) => ({
              ...ing,
              original: translatedTexts[index] || ing.original
            }))
          }
          
          // Traduzir instruções com IA
          if (data.analyzedInstructions && Array.isArray(data.analyzedInstructions)) {
            data.analyzedInstructions = await Promise.all(
              data.analyzedInstructions.map(async (instr: any) => ({
                ...instr,
                steps: instr.steps ? await Promise.all(
                  instr.steps.map(async (step: any) => ({
                    ...step,
                    step: await translateText(step.step, locale)
                  }))
                ) : instr.steps
              }))
            )
          }
          
          // Traduzir plain instructions com IA
          if (data.instructions) {
            const plainInstructions = data.instructions.replace(/<[^>]*>/g, '')
            data.instructions = await translateText(plainInstructions, locale)
          }
        }
        
        setRecipe(data)
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

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '')
  const description = recipe.summary ? stripHtml(recipe.summary).slice(0, 160) : 'Receita deliciosa do Papo de Panela'

  const handleToggleSave = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setSavingRecipe(true)
    try {
      await toggleRecipe({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        imageType: recipe.imageType,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        summary: recipe.summary,
        cuisines: recipe.cuisines,
        diets: recipe.diets,
        savedAt: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Error toggling recipe:', err)
    } finally {
      setSavingRecipe(false)
    }
  }

  const isRecipeSaved = isSaved(recipe.id)

  return (
    <>
      <SEO 
        title={`${recipe.title} - Papo de Panela`}
        description={description}
        keywords={`${recipe.title}, receita, ${recipe.cuisines?.join(', ')}, ${recipe.diets?.join(', ')}`}
        ogImage={recipe.image}
        canonicalUrl={`https://papodepanela.site/recipe/${recipe.id}`}
      />
      <div className="max-w-4xl mx-auto px-4 py-10 text-gray-500">
        <Breadcrumbs items={[
          { label: t('home') || 'Início', onClick: () => navigate('/') },
          { label: t('recipes') || 'Receitas', onClick: () => navigate('/') },
          { label: recipe.title }
        ]} />
        
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800 font-noto-serif">{recipe.title}</h1>
          <div className="flex items-center gap-2">
          {user && (
            <Button
              variant={isRecipeSaved ? "default" : "outline"}
              size="sm"
              onClick={handleToggleSave}
              disabled={savingRecipe}
              className="flex items-center gap-2"
            >
              {savingRecipe ? '...' : (
                <>
                  <svg className={`w-4 h-4 ${isRecipeSaved ? 'fill-current' : ''}`} fill={isRecipeSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {isRecipeSaved ? 'Salva' : 'Salvar'}
                </>
              )}
            </Button>
          )}
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
            <h3 className="text-xl font-semibold mb-3 text-gray-800">{t('cuisines')}</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.cuisines.map((cuisine: string) => (
                <span key={cuisine} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">{cuisine}</span>
              ))}
            </div>
          </div>
        )}

        {recipe.diets && recipe.diets.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">{t('diets')}</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.diets.map((diet: string) => (
                <span key={diet} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">{diet}</span>
              ))}
            </div>
          </div>
        )}

        {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">{t('instructions')}</h3>
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
    <AdBanner />
    </>
  )
}
