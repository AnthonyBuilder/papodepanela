import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { getCommunityRecipes, type CommunityRecipe } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import SpinnerEmpty from '@/components/SpinnerEmpty'
import Breadcrumbs from '@/components/Breadcrumbs'
import SEO from '@/components/SEO'
import CylindricalAd from '@/components/CylindricalAd'

export default function CommunityRecipesPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState<CommunityRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const data = await getCommunityRecipes()
        setRecipes(data)
      } catch (err) {
        console.error('Error loading community recipes:', err)
        setError(t('community.loadError'))
      } finally {
        setLoading(false)
      }
    }
    loadRecipes()
  }, [t])

  if (loading) return <SpinnerEmpty />
  
  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-red-600 text-center">{error}</div>
    </div>
  )

  return (
    <>
      <SEO 
        title={`${t('community.title')} | Papo de Panela`}
        description={t('community.description')}
      />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Breadcrumbs items={[
          { label: t('home') || 'Início', onClick: () => navigate('/') },
          { label: t('community.title') || 'Comunidade' }
        ]} />
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-noto-serif text-3xl font-bold text-gray-800 mb-2">{t('community.title')}</h1>
            <p className="text-gray-600">{t('community.subtitle')}</p>
          </div>
          <Button onClick={() => user ? navigate('/create-recipe') : navigate('/login')}>
            {t('community.createRecipe')}
          </Button>
        </div>

        <CylindricalAd className="mb-8" />

        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">{t('community.noRecipes')}</p>
            <Button onClick={() => user ? navigate('/create-recipe') : navigate('/login')}>
              {t('community.createFirst')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function RecipeCard({ recipe }: { recipe: CommunityRecipe }) {
  const { t } = useLanguage()
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
         onClick={() => navigate(`/community/${recipe.id}`)}>
      {recipe.image && (
        <img 
          src={recipe.image} 
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="font-noto-serif text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
          {recipe.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-4">
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
              {recipe.servings}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm border-t pt-3">
          <span className="text-gray-600">
            {t('community.by')} <span className="font-medium">{recipe.authorName}</span>
          </span>
          {recipe.likes !== undefined && recipe.likes > 0 && (
            <span className="text-red-500 flex items-center gap-1">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {recipe.likes}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
