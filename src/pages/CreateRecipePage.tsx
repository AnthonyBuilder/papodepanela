import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { createCommunityRecipe, updateCommunityRecipe, type CommunityRecipe } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import Breadcrumbs from '@/components/Breadcrumbs'
import SEO from '@/components/SEO'
import SpinnerEmpty from '@/components/SpinnerEmpty'

export default function CreateRecipePage() {
  const { id: recipeId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const isEditMode = !!recipeId
  
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
  const [loadingRecipe, setLoadingRecipe] = useState(isEditMode)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEditMode && recipeId) {
      const loadRecipe = async () => {
        try {
          const docRef = doc(db, 'communityRecipes', recipeId)
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
            const recipe = docSnap.data() as CommunityRecipe
            
            // Verificar se o usuário é o autor
            if (recipe.authorId !== user?.uid) {
              setError(t('createRecipe.notAuthor') || 'Você não tem permissão para editar esta receita')
              setLoadingRecipe(false)
              return
            }
            
            setTitle(recipe.title)
            setDescription(recipe.description)
            setIngredients(recipe.ingredients.join('\n'))
            setInstructions(recipe.instructions.join('\n'))
            setImage(recipe.image || '')
            setPrepTime(String(recipe.prepTime))
            setServings(String(recipe.servings))
            setCategory(recipe.category || '')
            setCuisine(recipe.cuisine || '')
          } else {
            setError(t('community.recipeNotFound') || 'Receita não encontrada')
          }
        } catch (err) {
          console.error('Error loading recipe:', err)
          setError(t('loadError') || 'Erro ao carregar receita')
        } finally {
          setLoadingRecipe(false)
        }
      }
      loadRecipe()
    }
  }, [isEditMode, recipeId, user?.uid, t])

  if (!user) {
    navigate('/login')
    return null
  }

  if (loadingRecipe) {
    return <SpinnerEmpty />
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
      }
      
      if (!isEditMode) {
        recipeData.authorId = user!.uid
        recipeData.authorName = user!.displayName || user!.email || 'Anônimo'
      }
      
      // Adicionar campos opcionais apenas se tiverem valor
      if (image) recipeData.image = image
      if (category) recipeData.category = category
      if (cuisine) recipeData.cuisine = cuisine
      
      if (isEditMode && recipeId) {
        await updateCommunityRecipe(recipeId, recipeData)
        navigate(`/community/${recipeId}`)
      } else {
        await createCommunityRecipe(recipeData)
        navigate('/community')
      }
    } catch (err) {
      console.error('Error saving recipe:', err)
      setError(isEditMode ? (t('createRecipe.updateError') || 'Erro ao atualizar receita') : t('createRecipe.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEO 
        title={`${isEditMode ? (t('editRecipe.title') || 'Editar Receita') : t('createRecipe.title')} | Papo de Panela`}
        description={isEditMode ? (t('editRecipe.description') || 'Edite sua receita') : t('createRecipe.description')}
      />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Breadcrumbs items={[
          { label: t('home') || 'Início', onClick: () => navigate('/') },
          { label: t('community.title') || 'Comunidade', onClick: () => navigate('/community') },
          { label: isEditMode ? (t('editRecipe.title') || 'Editar Receita') : (t('createRecipe.title') || 'Criar Receita') }
        ]} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{isEditMode ? (t('editRecipe.title') || 'Editar Receita') : t('createRecipe.title')}</h1>
          <p className="text-gray-600">{isEditMode ? (t('editRecipe.subtitle') || 'Atualize os dados da sua receita') : t('createRecipe.subtitle')}</p>
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
              className="w-full px-4 py-2 bg-white/90 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200 hover:shadow-md focus:shadow-lg"
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
              className="w-full px-4 py-2 bg-white/90 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200 hover:shadow-md focus:shadow-lg"
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
                className="w-full px-4 py-2 bg-white/90 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200 hover:shadow-md focus:shadow-lg"
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
                className="w-full px-4 py-2 bg-white/90 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200 hover:shadow-md focus:shadow-lg"
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
                className="w-full px-4 py-2 bg-white/90 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200 hover:shadow-md focus:shadow-lg"
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
                className="w-full px-4 py-2 bg-white/90 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200 hover:shadow-md focus:shadow-lg"
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
              className="w-full px-4 py-2 bg-white/90 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200 hover:shadow-md focus:shadow-lg"
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
              className="w-full px-4 py-2 bg-white/90 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200 hover:shadow-md focus:shadow-lg font-mono text-sm"
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
              className="w-full px-4 py-2 bg-white/90 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200 hover:shadow-md focus:shadow-lg font-mono text-sm"
              placeholder={t('createRecipe.instructionsPlaceholder')}
              required
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (isEditMode ? (t('editRecipe.updating') || 'Atualizando...') : t('createRecipe.creating')) : (isEditMode ? (t('editRecipe.updateButton') || 'Atualizar Receita') : t('createRecipe.createButton'))}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(isEditMode ? `/community/${recipeId}` : '/community')}>
              {t('cancel')}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
