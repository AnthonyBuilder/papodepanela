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
  const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY
  
  if (!apiKey) {
    throw new Error('Spoonacular API key not configured')
  }

  try {
    // Buscar receitas baseadas nos ingredientes
    const ingredientsQuery = params.ingredients.join(',')
    const searchUrl = `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${encodeURIComponent(ingredientsQuery)}&number=1&addRecipeInformation=true&fillIngredients=true&apiKey=${apiKey}`
    
    const searchResponse = await fetch(searchUrl)
    
    if (!searchResponse.ok) {
      throw new Error('Failed to search recipes')
    }

    const searchData = await searchResponse.json()
    
    if (!searchData.results || searchData.results.length === 0) {
      return generateFallbackRecipe(params)
    }

    const recipe = searchData.results[0]

    // Buscar instruções detalhadas
    const instructionsUrl = `https://api.spoonacular.com/recipes/${recipe.id}/analyzedInstructions?apiKey=${apiKey}`
    const instructionsResponse = await fetch(instructionsUrl)
    const instructions = await instructionsResponse.json()

    return {
      title: recipe.title,
      description: recipe.summary?.replace(/<[^>]*>/g, '').substring(0, 200) || 'Receita deliciosa',
      prepTime: recipe.readyInMinutes || 30,
      servings: recipe.servings || params.servings,
      cuisine: recipe.cuisines?.[0] || params.cuisine || 'Internacional',
      ingredients: recipe.extendedIngredients?.map((ing: any) => ing.original) || 
                   params.ingredients.map(ing => `${ing} (quantidade a gosto)`),
      instructions: instructions[0]?.steps?.map((step: any) => step.step) || 
                    ['Prepare os ingredientes', 'Combine e cozinhe', 'Sirva quente'],
      tips: 'Ajuste os temperos ao seu gosto!'
    }
  } catch (error) {
    console.error('Error generating recipe:', error)
    return generateFallbackRecipe(params)
  }
}

function generateFallbackRecipe(params: RecipeParams) {
  const mainIngredient = params.ingredients[0]
  const recipeTypes: Record<string, any> = {
    'frango': {
      title: 'Frango Grelhado Temperado',
      instructions: [
        'Tempere o frango com sal, pimenta e alho',
        'Deixe marinar por 30 minutos',
        'Grelhe em fogo médio por 6-8 minutos de cada lado',
        'Sirva quente com acompanhamentos'
      ]
    },
    'carne': {
      title: 'Carne Acebolada',
      instructions: [
        'Corte a carne em tiras finas',
        'Refogue a cebola até dourar',
        'Adicione a carne e temperos',
        'Cozinhe até o ponto desejado'
      ]
    },
    'default': {
      title: `Receita com ${mainIngredient}`,
      instructions: [
        'Prepare todos os ingredientes',
        `Refogue ${params.ingredients.join(', ')}`,
        'Tempere a gosto',
        'Cozinhe até ficar pronto',
        'Sirva quente'
      ]
    }
  }

  const recipeType = recipeTypes[mainIngredient.toLowerCase()] || recipeTypes.default

  return {
    title: recipeType.title,
    description: `Uma deliciosa receita usando ${params.ingredients.join(', ')}`,
    prepTime: 30,
    servings: params.servings,
    cuisine: params.cuisine || 'Caseira',
    ingredients: params.ingredients.map(ing => `${ing} (quantidade a gosto)`),
    instructions: recipeType.instructions,
    tips: 'Ajuste os temperos conforme sua preferência!'
  }
}
