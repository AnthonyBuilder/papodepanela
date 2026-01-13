const OPENAI_API_KEY = (import.meta.env.VITE_OPENAI_API_KEY as string) || ''

interface RecipeParams {
  ingredients: string[]
  cuisine?: string
  dietaryRestrictions?: string
  mealType?: string
  servings: number
  language: string
}

// Função genérica para traduzir textos usando IA
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!OPENAI_API_KEY || targetLanguage === 'en' || !text) {
    return text
  }

  const languageNames: Record<string, string> = {
    pt: 'Portuguese (Brazil)',
    es: 'Spanish',
    en: 'English'
  }

  const targetLang = languageNames[targetLanguage] || 'English'

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator specialized in cooking and culinary content. Translate to ${targetLang}. Return ONLY the translated text, nothing else.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text())
      return text
    }

    const data = await response.json()
    const translatedText = data.choices[0]?.message?.content?.trim()

    return translatedText || text
  } catch (error) {
    console.error('Error translating text with AI:', error)
    return text
  }
}

// Função para traduzir ingredientes usando IA (batch)
export async function translateIngredients(ingredients: string[], targetLanguage: string): Promise<string[]> {
  if (!OPENAI_API_KEY || targetLanguage === 'en') {
    return ingredients
  }

  const languageNames: Record<string, string> = {
    pt: 'Portuguese (Brazil)',
    es: 'Spanish',
    en: 'English'
  }

  const targetLang = languageNames[targetLanguage] || 'English'

  try {
    const prompt = `Translate the following cooking ingredients to ${targetLang}. Keep the format and measurements. Return ONLY a JSON array of translated strings, nothing else.

Ingredients:
${ingredients.map((ing, i) => `${i + 1}. ${ing}`).join('\n')}

Return format: ["translated ingredient 1", "translated ingredient 2", ...]`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator specialized in cooking and culinary terms. Always return valid JSON arrays.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text())
      return ingredients
    }

    const data = await response.json()
    const translatedText = data.choices[0]?.message?.content?.trim()

    if (!translatedText) {
      return ingredients
    }

    // Parse JSON response
    const translated = JSON.parse(translatedText)
    
    if (Array.isArray(translated) && translated.length === ingredients.length) {
      return translated
    }

    return ingredients
  } catch (error) {
    console.error('Error translating ingredients with AI:', error)
    return ingredients
  }
}

// Função para traduzir arrays de textos
export async function translateArray(texts: string[], targetLanguage: string): Promise<string[]> {
  if (!OPENAI_API_KEY || targetLanguage === 'en' || texts.length === 0) {
    return texts
  }

  return Promise.all(texts.map(text => translateText(text, targetLanguage)))
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
