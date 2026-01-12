const OPENAI_API_KEY = (import.meta.env.VITE_OPENAI_API_KEY as string) || ''

interface RecipeParams {
  ingredients: string[]
  cuisine?: string
  dietaryRestrictions?: string
  mealType?: string
  servings: number
  language: string
}

export async function generateRecipeWithAI(params: RecipeParams) {
  // Usar Spoonacular ao invés de Hugging Face (sem problemas de CORS)
  const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY
  
  if (!apiKey) {
    return generateFallbackRecipe(params)
  }

  try {
    const ingredientsQuery = params.ingredients.join(',')
    const searchUrl = `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${encodeURIComponent(ingredientsQuery)}&number=1&addRecipeInformation=true&fillIngredients=true&apiKey=${apiKey}`
    
    const response = await fetch(searchUrl)
    
    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    
    if (!data.results || data.results.length === 0) {
      return generateFallbackRecipe(params)
    }

    const recipe = data.results[0]

    return {
      title: recipe.title,
      description: recipe.summary?.replace(/<[^>]*>/g, '').substring(0, 200) || 'Receita deliciosa',
      prepTime: recipe.readyInMinutes || 30,
      servings: recipe.servings || params.servings,
      cuisine: recipe.cuisines?.[0] || 'Internacional',
      ingredients: recipe.extendedIngredients?.map((ing: any) => ing.original) || [],
      instructions: recipe.analyzedInstructions?.[0]?.steps?.map((s: any) => s.step) || [
        'Prepare os ingredientes',
        'Siga o modo de preparo',
        'Sirva quente'
      ],
      tips: 'Ajuste os temperos ao seu gosto!'
    }
  } catch (error) {
    console.error('Recipe generation error:', error)
    return generateFallbackRecipe(params)
  }
}

function generateFallbackRecipe(params: RecipeParams) {
  return {
    title: `Receita com ${params.ingredients[0]}`,
    description: `Deliciosa receita usando ${params.ingredients.join(', ')}`,
    prepTime: 30,
    servings: params.servings,
    cuisine: params.cuisine || 'Caseira',
    ingredients: params.ingredients.map(ing => `${ing} (a gosto)`),
    instructions: [
      'Prepare todos os ingredientes',
      'Refogue em azeite',
      'Tempere a gosto',
      'Cozinhe até ficar pronto',
      'Sirva quente'
    ],
    tips: 'Ajuste conforme sua preferência!'
  }
}
