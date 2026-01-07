import axios from 'axios'

const TRANSLATE_URL = 'https://libretranslate.de/translate'

export type TranslationResult = {
  text: string
  ok: boolean
  usedFallback?: boolean
}

// Simple in-memory cache to avoid repeated translation requests.
// Key format: `${source}:${target}:${text}`
const cache = new Map<string, Promise<TranslationResult>>()

export async function translateText(text: string, target = 'en', source = 'auto') {
  const key = `${source}:${target}:${text}`
  if (!text) return { text, ok: false } as TranslationResult

  // If there's an ongoing or finished request for the same key, reuse it.
  if (cache.has(key)) {
    return cache.get(key)!
  }

  const promise = (async (): Promise<TranslationResult> => {
    const result: TranslationResult = { text, ok: false, usedFallback: false }
    try {
      // Try Google Translate unofficial endpoint first
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

      // Fallback to LibreTranslate
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

      return result
    } catch (e) {
      console.error('translateText error', e)
      return result
    }
  })()

  // store promise immediately to dedupe concurrent calls
  cache.set(key, promise)
  try {
    const resolved = await promise
    // keep resolved promise cached
    cache.set(key, Promise.resolve(resolved))
    return resolved
  } catch (e) {
    cache.delete(key)
    throw e
  }
}

export default translateText
