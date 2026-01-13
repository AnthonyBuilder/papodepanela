// Tradução gratuita usando Groq API (gratuito) e MyMemory API (sem chave)
const GROQ_API_KEY = (import.meta.env.VITE_GROQ_API_KEY as string) || ''

// Função genérica para traduzir textos
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (targetLanguage === 'en' || !text) {
    return text
  }

  const languageNames: Record<string, string> = {
    pt: 'Portuguese (Brazil)',
    es: 'Spanish',
    en: 'English'
  }

  const targetLang = languageNames[targetLanguage] || 'English'

  // Tentar Groq primeiro (gratuito, mas precisa de chave)
  if (GROQ_API_KEY) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
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

      if (response.ok) {
        const data = await response.json()
        const translatedText = data.choices[0]?.message?.content?.trim()
        if (translatedText) {
          return translatedText
        }
      }
    } catch (error) {
      console.error('Groq translation error:', error)
    }
  }

  // Fallback: MyMemory API (100% gratuito, sem chave necessária)
  try {
    const langMap: Record<string, string> = {
      pt: 'pt-BR',
      es: 'es-ES',
      en: 'en-US'
    }
    
    const targetCode = langMap[targetLanguage] || 'en-US'
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetCode}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.responseData?.translatedText) {
      return data.responseData.translatedText
    }
  } catch (error) {
    console.error('MyMemory translation error:', error)
  }

  return text
}

// Função para traduzir ingredientes em batch
export async function translateIngredients(ingredients: string[], targetLanguage: string): Promise<string[]> {
  if (targetLanguage === 'en' || ingredients.length === 0) {
    return ingredients
  }

  const languageNames: Record<string, string> = {
    pt: 'Portuguese (Brazil)',
    es: 'Spanish',
    en: 'English'
  }

  const targetLang = languageNames[targetLanguage] || 'English'

  // Tentar Groq para batch (mais eficiente)
  if (GROQ_API_KEY) {
    try {
      const prompt = `Translate the following cooking ingredients to ${targetLang}. Keep the format and measurements. Return ONLY a JSON array of translated strings, nothing else.

Ingredients:
${ingredients.map((ing, i) => `${i + 1}. ${ing}`).join('\n')}

Return format: ["translated ingredient 1", "translated ingredient 2", ...]`

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
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

      if (response.ok) {
        const data = await response.json()
        const translatedText = data.choices[0]?.message?.content?.trim()

        if (translatedText) {
          const translated = JSON.parse(translatedText)
          
          if (Array.isArray(translated) && translated.length === ingredients.length) {
            return translated
          }
        }
      }
    } catch (error) {
      console.error('Groq batch translation error:', error)
    }
  }

  // Fallback: MyMemory um por um
  const langMap: Record<string, string> = {
    pt: 'pt-BR',
    es: 'es-ES',
    en: 'en-US'
  }
  
  const targetCode = langMap[targetLanguage] || 'en-US'
  
  const translations = await Promise.all(
    ingredients.map(async (ing) => {
      try {
        // Delay para evitar rate limit (máximo 100 por dia sem conta)
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(ing)}&langpair=en|${targetCode}`
        const response = await fetch(url)
        const data = await response.json()
        return data.responseData?.translatedText || ing
      } catch {
        return ing
      }
    })
  )
  
  return translations
}

// Função para traduzir arrays de textos
export async function translateArray(texts: string[], targetLanguage: string): Promise<string[]> {
  if (targetLanguage === 'en' || texts.length === 0) {
    return texts
  }

  return Promise.all(texts.map(text => translateText(text, targetLanguage)))
}
