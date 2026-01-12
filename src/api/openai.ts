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
  const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY
  
  if (!apiKey) {
    console.warn('Hugging Face API key not configured, using fallback')
    return generateFallbackRecipe(params)
  }

  const prompt = `Você é um chef experiente. Crie uma receita detalhada em português brasileiro usando os seguintes parâmetros:

Ingredientes disponíveis: ${params.ingredients.join(', ')}
${params.cuisine ? `Tipo de culinária: ${params.cuisine}` : ''}
${params.dietaryRestrictions ? `Restrições alimentares: ${params.dietaryRestrictions}` : ''}
${params.mealType ? `Tipo de refeição: ${params.mealType}` : ''}
Número de porções: ${params.servings}

IMPORTANTE: Responda APENAS com um objeto JSON válido seguindo exatamente esta estrutura:
{
  "title": "Nome atrativo da receita",
  "description": "Descrição breve e apetitosa da receita",
  "prepTime": 30,
  "servings": ${params.servings},
  "cuisine": "Tipo de culinária",
  "ingredients": [
    "quantidade e ingrediente 1",
    "quantidade e ingrediente 2",
    "quantidade e ingrediente 3"
  ],
  "instructions": [
    "Primeiro passo detalhado",
    "Segundo passo detalhado",
    "Terceiro passo detalhado"
  ],
  "tips": "Dica útil para preparar esta receita"
}

Não adicione texto antes ou depois do JSON. Retorne apenas o objeto JSON válido.`

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 1500,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false
          },
          options: {
            wait_for_model: true
          }
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Hugging Face API error:', errorText)
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    let generatedText = ''
    
    if (Array.isArray(data) && data[0]?.generated_text) {
      generatedText = data[0].generated_text
    } else if (data.generated_text) {
      generatedText = data.generated_text
    } else {
      throw new Error('Unexpected API response format')
    }
    
    // Extrair JSON do texto gerado
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const recipe = JSON.parse(jsonMatch[0])
      
      // Validar campos obrigatórios
      if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
        throw new Error('Invalid recipe format')
      }
      
      return recipe
    }

    throw new Error('Could not extract JSON from response')
  } catch (error) {
    console.error('Error generating recipe with Hugging Face:', error)
    console.log('Falling back to local recipe generation')
    return generateFallbackRecipe(params)
  }
}

function generateFallbackRecipe(params: RecipeParams): any {
  const mainIngredient = params.ingredients[0]?.toLowerCase() || 'ingredientes'
  
  const recipeTemplates: Record<string, any> = {
    'frango': {
      title: 'Frango Grelhado com Ervas',
      instructions: [
        'Tempere o frango com sal, pimenta-do-reino, alho amassado e ervas frescas',
        'Deixe marinar na geladeira por pelo menos 30 minutos',
        'Aqueça uma grelha ou frigideira em fogo médio-alto',
        'Grelhe o frango por 6-8 minutos de cada lado até dourar',
        'Verifique se está bem cozido por dentro antes de servir'
      ]
    },
    'carne': {
      title: 'Carne Acebolada Tradicional',
      instructions: [
        'Corte a carne em tiras finas e tempere com sal e pimenta',
        'Corte as cebolas em rodelas grossas',
        'Em uma panela, refogue a cebola até ficar transparente',
        'Adicione a carne e deixe dourar em fogo alto',
        'Abaixe o fogo e deixe cozinhar até o ponto desejado'
      ]
    },
    'peixe': {
      title: 'Peixe Assado com Limão',
      instructions: [
        'Tempere o peixe com sal, pimenta e suco de limão',
        'Deixe marinar por 15 minutos',
        'Preaqueça o forno a 200°C',
        'Coloque o peixe em uma assadeira com um fio de azeite',
        'Asse por 20-25 minutos até ficar dourado e cozido'
      ]
    },
    'massa': {
      title: 'Massa ao Molho Caseiro',
      instructions: [
        'Cozinhe a massa em água fervente com sal até ficar al dente',
        'Prepare um molho com tomates frescos, alho e manjericão',
        'Refogue o molho em azeite até engrossar',
        'Escorra a massa e misture com o molho',
        'Sirva quente com queijo ralado'
      ]
    }
  }

  const template = recipeTemplates[mainIngredient] || {
    title: `Receita Especial com ${params.ingredients.join(' e ')}`,
    instructions: [
      'Prepare e higienize todos os ingredientes',
      `Refogue ${params.ingredients.slice(0, 2).join(' e ')} em fogo médio`,
      'Adicione os temperos e misture bem',
      'Cozinhe até ficar no ponto desejado',
      'Ajuste o sal e sirva quente'
    ]
  }

  return {
    title: template.title,
    description: `Uma deliciosa receita preparada com ${params.ingredients.join(', ')}. Perfeita para ${params.mealType || 'qualquer ocasião'}.`,
    prepTime: 30,
    servings: params.servings,
    cuisine: params.cuisine || 'Caseira',
    ingredients: params.ingredients.map(ing => `${ing} (quantidade a gosto)`),
    instructions: template.instructions,
    tips: 'Experimente adicionar seus temperos favoritos para personalizar o sabor. Bom apetite!'
  }
}
