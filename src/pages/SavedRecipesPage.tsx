import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSavedRecipes } from '@/context/SavedRecipesContext'
import { useAuth } from '@/context/AuthContext'
import SpinnerEmpty from '@/components/SpinnerEmpty'
import Breadcrumbs from '@/components/Breadcrumbs'
import { Button } from '@/components/ui/button'
import { Search, X, Filter, Trash2 } from 'lucide-react'

export default function SavedRecipesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { savedRecipes, loading, removeRecipe } = useSavedRecipes()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDiet, setSelectedDiet] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // Filtrar receitas
  const filteredRecipes = savedRecipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDiet = !selectedDiet || recipe.diets?.includes(selectedDiet)
    return matchesSearch && matchesDiet
  })

  // Obter todas as dietas únicas
  const allDiets = Array.from(
    new Set(savedRecipes.flatMap((recipe) => recipe.diets || []))
  ).sort()

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
      <Breadcrumbs items={[
        { label: 'Início', onClick: () => navigate('/') },
        { label: 'Minhas Receitas Salvas' }
      ]} />
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 font-noto-serif mb-2">
          Minhas Receitas Salvas
        </h1>
        <p className="text-gray-600">
          {savedRecipes.length === 0
            ? 'Você ainda não salvou nenhuma receita'
            : `${filteredRecipes.length} de ${savedRecipes.length} receita${savedRecipes.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {savedRecipes.length > 0 && (
        <div className="mb-6 space-y-4">
          {/* Barra de Pesquisa */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar receitas salvas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 h-[42px] whitespace-nowrap rounded-xl"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>

          {/* Filtros Expandidos */}
          {showFilters && allDiets.length > 0 && (
            <div className="bg-white/95 rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center justify-between">
                Tipo de Dieta
                {selectedDiet && (
                  <button
                    onClick={() => setSelectedDiet('')}
                    className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Limpar
                  </button>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {allDiets.map((diet) => (
                  <button
                    key={diet}
                    onClick={() => setSelectedDiet(selectedDiet === diet ? '' : diet)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedDiet === diet
                        ? 'bg-green-500 text-white'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {savedRecipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Explore receitas e salve suas favoritas!</p>
          <Button onClick={() => navigate('/recipes')}>Buscar Receitas</Button>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Nenhuma receita encontrada com os filtros aplicados.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('')
              setSelectedDiet('')
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
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
                    <Trash2 className="w-4 h-4" />
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
