import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { createCommunityRecipe } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import SEO from '@/components/SEO'

export default function CreateRecipePage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [instructions, setInstructions] = useState('')
  const [image, setImage] = useState('')
  const [prepTime, setPrepTime] = useState('')
  const [servings, setServings] = useState('')
  const [category, setCategory] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    navigate('/login')
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!title || !description || !ingredients || !instructions || !prepTime || !servings) {
      setError(t('createRecipe.fillRequired'))
      return
    }

    setLoading(true)
    try {
      const ingredientsList = ingredients.split('\n').filter(i => i.trim())
      const instructionsList = instructions.split('\n').filter(i => i.trim())
      
      const recipeData: any = {
        title,
        description,
        ingredients: ingredientsList,
        instructions: instructionsList,
        prepTime: parseInt(prepTime),
        servings: parseInt(servings),
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Anônimo',
      }
      
      // Adicionar campos opcionais apenas se tiverem valor
      if (image) recipeData.image = image
      if (category) recipeData.category = category
      if (cuisine) recipeData.cuisine = cuisine
      
      await createCommunityRecipe(recipeData)
      
      navigate('/community')
    } catch (err) {
      console.error('Error creating recipe:', err)
      setError(t('createRecipe.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEO 
        title={`${t('createRecipe.title')} | Papo de Panela`}
        description={t('createRecipe.description')}
      />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('createRecipe.title')}</h1>
          <p className="text-gray-600">{t('createRecipe.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              {t('createRecipe.titleField')} *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder={t('createRecipe.titlePlaceholder')}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              {t('createRecipe.descriptionField')} *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder={t('createRecipe.descriptionPlaceholder')}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700 mb-2">
                {t('createRecipe.prepTime')} (min) *
              </label>
              <input
                type="number"
                id="prepTime"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-2">
                {t('createRecipe.servingsField')} *
              </label>
              <input
                type="number"
                id="servings"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                {t('createRecipe.category')}
              </label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={t('createRecipe.categoryPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-2">
                {t('createRecipe.cuisine')}
              </label>
              <input
                type="text"
                id="cuisine"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={t('createRecipe.cuisinePlaceholder')}
              />
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              {t('createRecipe.imageUrl')}
            </label>
            <input
              type="url"
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          <div>
            <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
              {t('createRecipe.ingredientsField')} * <span className="text-sm text-gray-500">({t('createRecipe.onePerLine')})</span>
            </label>
            <textarea
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
              placeholder={t('createRecipe.ingredientsPlaceholder')}
              required
            />
          </div>

          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
              {t('createRecipe.instructionsField')} * <span className="text-sm text-gray-500">({t('createRecipe.onePerLine')})</span>
            </label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
              placeholder={t('createRecipe.instructionsPlaceholder')}
              required
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t('createRecipe.creating') : t('createRecipe.createButton')}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/community')}>
              {t('cancel')}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
