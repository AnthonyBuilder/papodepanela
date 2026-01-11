import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import {
  saveRecipeToProfile,
  removeRecipeFromProfile,
  subscribeSavedRecipes,
  type SavedRecipe,
} from '@/lib/firebase'

interface SavedRecipesContextType {
  savedRecipes: SavedRecipe[]
  loading: boolean
  error: string | null
  isSaved: (recipeId: string | number) => boolean
  saveRecipe: (recipe: SavedRecipe) => Promise<void>
  removeRecipe: (recipeId: string | number) => Promise<void>
  toggleRecipe: (recipe: SavedRecipe) => Promise<void>
}

const SavedRecipesContext = createContext<SavedRecipesContextType | undefined>(undefined)

export const SavedRecipesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user } = useAuth()
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Subscribe to saved recipes in real-time
  useEffect(() => {
    if (!user) {
      setSavedRecipes([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = subscribeSavedRecipes(
      (recipes) => {
        setSavedRecipes(recipes)
        setLoading(false)
      },
      (err) => {
        console.error('Error subscribing to saved recipes:', err)
        setError('Erro ao carregar receitas salvas')
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user])

  const isSaved = useCallback(
    (recipeId: string | number) => {
      return savedRecipes.some((r) => String(r.id) === String(recipeId))
    },
    [savedRecipes]
  )

  const saveRecipe = async (recipe: SavedRecipe) => {
    try {
      setError(null)
      await saveRecipeToProfile(recipe)
    } catch (err: any) {
      const message = err.message || 'Erro ao salvar receita'
      setError(message)
      throw err
    }
  }

  const removeRecipe = async (recipeId: string | number) => {
    try {
      setError(null)
      await removeRecipeFromProfile(recipeId)
    } catch (err: any) {
      const message = err.message || 'Erro ao remover receita'
      setError(message)
      throw err
    }
  }

  const toggleRecipe = async (recipe: SavedRecipe) => {
    if (isSaved(recipe.id)) {
      await removeRecipe(recipe.id)
    } else {
      await saveRecipe(recipe)
    }
  }

  const value: SavedRecipesContextType = {
    savedRecipes,
    loading,
    error,
    isSaved,
    saveRecipe,
    removeRecipe,
    toggleRecipe,
  }

  return <SavedRecipesContext.Provider value={value}>{children}</SavedRecipesContext.Provider>
}

export const useSavedRecipes = () => {
  const context = useContext(SavedRecipesContext)
  if (!context) {
    throw new Error('useSavedRecipes must be used within a SavedRecipesProvider')
  }
  return context
}
