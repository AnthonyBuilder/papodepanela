import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'
import { getCommunityRecipes, type CommunityRecipe } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import SpinnerEmpty from '@/components/SpinnerEmpty'
import SEO from '@/components/SEO'

export default function CommunityRecipesPage() {
  const { t } = useLanguage()
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('community.title')}</h1>
            <p className="text-gray-600">{t('community.subtitle')}</p>
          </div>
          <Button onClick={() => navigate('/create-recipe')}>
            {t('community.createRecipe')}
          </Button>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">{t('community.noRecipes')}</p>
            <Button onClick={() => navigate('/create-recipe')}>
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
        <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
          {recipe.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-4">
            <span>⏱️ {recipe.prepTime} {t('minutes')}</span>
            <span>🍽️ {recipe.servings}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm border-t pt-3">
          <span className="text-gray-600">
            {t('community.by')} <span className="font-medium">{recipe.authorName}</span>
          </span>
          {recipe.likes !== undefined && recipe.likes > 0 && (
            <span className="text-red-500">❤️ {recipe.likes}</span>
          )}
        </div>
      </div>
    </div>
  )
}
