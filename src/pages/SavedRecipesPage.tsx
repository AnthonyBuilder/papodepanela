import { useNavigate } from 'react-router-dom'
import { useSavedRecipes } from '@/context/SavedRecipesContext'
import { useAuth } from '@/context/AuthContext'
import SpinnerEmpty from '@/components/SpinnerEmpty'
import { Button } from '@/components/ui/button'

export default function SavedRecipesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { savedRecipes, loading, removeRecipe } = useSavedRecipes()

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Faça login para ver suas receitas salvas</h2>
        <Button onClick={() => navigate('/login')}>Fazer Login</Button>
      </div>
    )
  }

  if (loading) return <SpinnerEmpty />

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 font-noto-serif mb-2">
          Minhas Receitas Salvas
        </h1>
        <p className="text-gray-600">
          {savedRecipes.length === 0
            ? 'Você ainda não salvou nenhuma receita'
            : `${savedRecipes.length} receita${savedRecipes.length > 1 ? 's' : ''} salva${savedRecipes.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {savedRecipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Explore receitas e salve suas favoritas!</p>
          <Button onClick={() => navigate('/recipes')}>Buscar Receitas</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {recipe.image && (
                <div
                  className="h-48 bg-cover bg-center cursor-pointer"
                  style={{ backgroundImage: `url(${recipe.image})` }}
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                />
              )}
              <div className="p-4">
                <h3
                  className="text-xl font-semibold text-gray-800 mb-2 cursor-pointer hover:text-orange-600"
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                >
                  {recipe.title}
                </h3>
                
                <div className="flex gap-4 text-sm text-gray-600 mb-3">
                  {recipe.readyInMinutes && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {recipe.readyInMinutes} min
                    </span>
                  )}
                  {recipe.servings && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {recipe.servings} porções
                    </span>
                  )}
                </div>

                {recipe.diets && recipe.diets.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {recipe.diets.slice(0, 3).map((diet) => (
                      <span
                        key={diet}
                        className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs"
                      >
                        {diet}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                  >
                    Ver Receita
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      try {
                        await removeRecipe(recipe.id)
                      } catch (err) {
                        console.error('Error removing recipe:', err)
                      }
                    }}
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
