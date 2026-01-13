import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { generateRecipeWithAI } from '@/api/openai'
import { Button } from '@/components/ui/button'
import Breadcrumbs from '@/components/Breadcrumbs'
import SEO from '@/components/SEO'
import SpinnerEmpty from '@/components/SpinnerEmpty'

export default function AIRecipePage() {
  const { user } = useAuth()
  const { t, locale } = useLanguage()
  const navigate = useNavigate()
  
  const [ingredients, setIngredients] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [dietaryRestrictions, setDietaryRestrictions] = useState('')
  const [mealType, setMealType] = useState('')
  const [servings, setServings] = useState('4')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null)

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!ingredients.trim()) {
      setError(t('aiRecipe.ingredientsRequired') || 'Por favor, informe pelo menos um ingrediente')
      return
    }

    setLoading(true)
    try {
      const recipe = await generateRecipeWithAI({
        ingredients: ingredients.split(',').map(i => i.trim()).filter(Boolean),
        cuisine,
        dietaryRestrictions,
        mealType,
        servings: parseInt(servings) || 4,
        language: locale
      })
      
      setGeneratedRecipe(recipe)
    } catch (err) {
      console.error('Error generating recipe:', err)
      setError(t('aiRecipe.error') || 'Erro ao gerar receita. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setGeneratedRecipe(null)
    setIngredients('')
    setCuisine('')
    setDietaryRestrictions('')
    setMealType('')
    setServings('4')
    setError('')
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <>
      <SEO 
        title={`${t('aiRecipe.title') || 'Gerar Receita com IA'} | Papo de Panela`}
        description={t('aiRecipe.description') || 'Use inteligência artificial para criar receitas personalizadas com seus ingredientes favoritos'}
      />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumbs items={[
          { label: t('home') || 'Início', onClick: () => navigate('/') },
          { label: t('aiRecipe.title') || 'Gerar Receita com IA' }
        ]} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {t('aiRecipe.title') || 'Gerar Receita com IA'}
          </h1>
          <p className="text-gray-600">{t('aiRecipe.subtitle') || 'Informe os ingredientes que você tem e deixe a IA criar uma receita deliciosa para você!'}</p>
        </div>

        {!generatedRecipe ? (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('aiRecipe.ingredientsField') || 'Ingredientes'} *
                </label>
                <textarea
                  id="ingredients"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/90 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200 hover:shadow-md focus:shadow-lg"
                  placeholder={t('aiRecipe.ingredientsPlaceholder') || 'Ex: frango, tomate, cebola, alho (separados por vírgula)'}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('aiRecipe.cuisineField') || 'Tipo de Culinária'}
                  </label>
                  <input
                    type="text"
                    id="cuisine"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    className="w-full px-4 py-2 bg-white/90 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200 hover:shadow-md focus:shadow-lg"
                    placeholder={t('aiRecipe.cuisinePlaceholder') || 'Ex: Italiana, Mexicana, Brasileira'}
                  />
                </div>

                <div>
                  <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('aiRecipe.mealTypeField') || 'Tipo de Refeição'}
                  </label>
                  <input
                    type="text"
                    id="mealType"
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full px-4 py-2 bg-white/90 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200 hover:shadow-md focus:shadow-lg"
                    placeholder={t('aiRecipe.mealTypePlaceholder') || 'Ex: Café da manhã, Almoço, Jantar'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('aiRecipe.dietaryField') || 'Restrições Alimentares'}
                  </label>
                  <input
                    type="text"
                    id="dietaryRestrictions"
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                    className="w-full px-4 py-2 bg-white/90 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200 hover:shadow-md focus:shadow-lg"
                    placeholder={t('aiRecipe.dietaryPlaceholder') || 'Ex: Vegetariano, Sem glúten, Vegano'}
                  />
                </div>

                <div>
                  <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('aiRecipe.servingsField') || 'Porções'}
                  </label>
                  <input
                    type="number"
                    id="servings"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    min="1"
                    max="20"
                    className="w-full px-4 py-2 bg-white/90 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200 hover:shadow-md focus:shadow-lg"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <SpinnerEmpty />
                      {t('aiRecipe.generating') || 'Gerando receita...'}
                    </span>
                  ) : (
                    t('aiRecipe.generateButton') || 'Gerar Receita com IA'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/')}>
                  {t('cancel') || 'Cancelar'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-700 font-medium">
                {t('aiRecipe.success') || 'Receita gerada com sucesso!'}
              </span>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{generatedRecipe.title}</h2>
              
              {generatedRecipe.description && (
                <p className="text-gray-600 mb-6">{generatedRecipe.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {generatedRecipe.prepTime} min
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {generatedRecipe.servings} {t('servings') || 'porções'}
                </div>
                {generatedRecipe.cuisine && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {generatedRecipe.cuisine}
                  </div>
                )}
              </div>

              {generatedRecipe.ingredients && generatedRecipe.ingredients.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">{t('ingredients') || 'Ingredientes'}</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    {generatedRecipe.ingredients.map((ing: string, idx: number) => (
                      <li key={idx} className="text-gray-700">{ing}</li>
                    ))}
                  </ul>
                </div>
              )}

              {generatedRecipe.instructions && generatedRecipe.instructions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">{t('instructions') || 'Modo de Preparo'}</h3>
                  <div className="space-y-3">
                    {generatedRecipe.instructions.map((step: string, idx: number) => (
                      <div key={idx} className="flex gap-4 pb-2 border-b border-gray-200">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-orange-500 text-white text-sm font-semibold">
                            {idx + 1}
                          </span>
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-gray-700">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {generatedRecipe.tips && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('tips') || 'Dicas'}
                  </h4>
                  <p className="text-blue-800 text-sm">{generatedRecipe.tips}</p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button onClick={handleReset} className="flex-1">
                {t('aiRecipe.generateAnother') || 'Gerar Outra Receita'}
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                {t('backToHome') || 'Voltar ao Início'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
