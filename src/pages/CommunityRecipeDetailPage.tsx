import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db, toggleLikeRecipe, deleteCommunityRecipe, type CommunityRecipe } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import SpinnerEmpty from '@/components/SpinnerEmpty'
import Breadcrumbs from '@/components/Breadcrumbs'
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
  const [deleting, setDeleting] = useState(false)

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

  const handleDelete = async () => {
    if (!recipe?.id || !user) return
    
    if (!window.confirm(t('community.confirmDelete') || 'Tem certeza que deseja deletar esta receita?')) {
      return
    }
    
    setDeleting(true)
    try {
      await deleteCommunityRecipe(recipe.id)
      navigate('/community')
    } catch (err) {
      console.error('Error deleting recipe:', err)
      alert(t('community.deleteError') || 'Erro ao deletar receita')
    } finally {
      setDeleting(false)
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
  const isAuthor = user && recipe.authorId === user.uid

  return (
    <>
      <SEO 
        title={`${recipe.title} | ${t('community.title')} | Papo de Panela`}
        description={recipe.description}
        ogImage={recipe.image}
      />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumbs items={[
          { label: t('home') || 'Início', onClick: () => navigate('/') },
          { label: t('community.title') || 'Comunidade', onClick: () => navigate('/community') },
          { label: recipe.title }
        ]} />
        
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/community')}>
            ← {t('back')}
          </Button>
          <div className="flex items-center gap-2">
            {isAuthor && (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t('edit')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deleting ? (t('deleting') || 'Deletando...') : (t('delete') || 'Deletar')}
                </Button>
              </>
            )}
            {user && (
              <Button
                variant={hasLiked ? "default" : "outline"}
                onClick={handleToggleLike}
                disabled={likingRecipe}
                className="flex items-center gap-2"
              >
                <svg className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} fill={hasLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {recipe.likes || 0}
              </Button>
            )}
          </div>
        </div>

        {recipe.image && (
          <img 
            src={recipe.image} 
            alt={recipe.title}
            className="w-full h-96 object-cover rounded-lg mb-6"
          />
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="font-noto-serif text-3xl font-bold text-gray-800 mb-3">{recipe.title}</h1>
          <p className="text-gray-600 mb-4">{recipe.description}</p>
          
          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4 pb-4 border-b">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {recipe.prepTime} {t('minutes')}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {recipe.servings} {t('servings')}
            </span>
            {recipe.category && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {recipe.category}
              </span>
            )}
            {recipe.cuisine && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {recipe.cuisine}
              </span>
            )}
          </div>

          <div className="text-sm text-gray-600">
            {t('community.createdBy')} <span className="font-medium">{recipe.authorName}</span>
            {recipe.createdAt?.toDate && (
              <span className="ml-2">• {new Date(recipe.createdAt.toDate()).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 mb-6">
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

        <div className="bg-white rounded-lg p-6">
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
