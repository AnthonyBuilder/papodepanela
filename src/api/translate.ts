import axios from 'axios'

const TRANSLATE_URL = 'https://libretranslate.de/translate'

export type TranslationResult = {
  text: string
  ok: boolean
  usedFallback?: boolean
}

export async function translateText(text: string, target = 'en', source = 'auto') {
  const result: TranslationResult = { text, ok: false, usedFallback: false }
  if (!text) return result
  try {
    // Try Google Translate unofficial endpoint first (more reliable in many cases)
    try {
      const g = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(
          text
        )}`
      )
      const maybe = g.data?.[0]?.[0]?.[0]
      if (maybe && maybe !== text) {
        result.text = maybe
        result.ok = true
        result.usedFallback = false
        return result
      }
    } catch (ge) {
      console.debug('google translate primary attempt failed', ge)
    }

    // Fallback to LibreTranslate if Google didn't return a helpful translation
    try {
      const res = await axios.post(
        TRANSLATE_URL,
        { q: text, source, target, format: 'text' },
        { headers: { 'accept': 'application/json', 'Content-Type': 'application/json' } }
      )
      const translated = res.data.translatedText ?? res.data.translated ?? text
      if (translated && translated !== text) {
        result.text = translated
        result.ok = true
        result.usedFallback = true
        return result
      }
    } catch (le) {
      console.debug('libretranslate fallback failed', le)
    }

    // no translation available, return original with ok=false
    return result
  } catch (e) {
    console.error('translateText error', e)
    return result
  }
}

export default translateText
