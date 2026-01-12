import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { collection, doc, getDoc } from 'firebase/firestore'
import { db, toggleLikeRecipe, type CommunityRecipe } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import SpinnerEmpty from '@/components/SpinnerEmpty'
import SEO from '@/components/SEO'

export default function CommunityRecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState<CommunityRecipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [likingRecipe, setLikingRecipe] = useState(false)

  useEffect(() => {
    const loadRecipe = async () => {
      if (!id) return
      
      try {
        const docRef = doc(db, 'communityRecipes', id)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setRecipe({ id: docSnap.id, ...docSnap.data() } as CommunityRecipe)
        } else {
          setError(t('community.recipeNotFound'))
        }
      } catch (err) {
        console.error('Error loading recipe:', err)
        setError(t('loadError'))
      } finally {
        setLoading(false)
      }
    }
    loadRecipe()
  }, [id, t])

  const handleToggleLike = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    
    if (!recipe?.id) return
    
    setLikingRecipe(true)
    try {
      await toggleLikeRecipe(recipe.id)
      // Recarregar a receita para atualizar os likes
      const docRef = doc(db, 'communityRecipes', recipe.id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setRecipe({ id: docSnap.id, ...docSnap.data() } as CommunityRecipe)
      }
    } catch (err) {
      console.error('Error toggling like:', err)
    } finally {
      setLikingRecipe(false)
    }
  }

  if (loading) return <SpinnerEmpty />
  
  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-red-600 text-center">{error}</div>
    </div>
  )

  if (!recipe) return null

  const hasLiked = user && recipe.likedBy?.includes(user.uid)

  return (
    <>
      <SEO 
        title={`${recipe.title} | ${t('community.title')} | Papo de Panela`}
        description={recipe.description}
        ogImage={recipe.image}
      />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/community')}>
            ← {t('back')}
          </Button>
          {user && (
            <Button
              variant={hasLiked ? "default" : "outline"}
              onClick={handleToggleLike}
              disabled={likingRecipe}
              className="flex items-center gap-2"
            >
              {hasLiked ? '❤️' : '🤍'} {recipe.likes || 0}
            </Button>
          )}
        </div>

        {recipe.image && (
          <img 
            src={recipe.image} 
            alt={recipe.title}
            className="w-full h-96 object-cover rounded-lg mb-6"
          />
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">{recipe.title}</h1>
          <p className="text-gray-600 mb-4">{recipe.description}</p>
          
          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4 pb-4 border-b">
            <span>⏱️ {recipe.prepTime} {t('minutes')}</span>
            <span>🍽️ {recipe.servings} {t('servings')}</span>
            {recipe.category && <span>📂 {recipe.category}</span>}
            {recipe.cuisine && <span>🌍 {recipe.cuisine}</span>}
          </div>

          <div className="text-sm text-gray-600">
            {t('community.createdBy')} <span className="font-medium">{recipe.authorName}</span>
            {recipe.createdAt?.toDate && (
              <span className="ml-2">• {new Date(recipe.createdAt.toDate()).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('ingredients')}</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span className="text-gray-700">{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('instructions')}</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                  {index + 1}
                </span>
                <p className="text-gray-700 pt-1">{instruction}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  )
}
