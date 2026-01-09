import { useState } from 'react'
import { searchRecipes } from '../api/spoonacular'
import { useLanguage } from '@/context/LanguageContext'

export default function RecipeSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [translationWarning, setTranslationWarning] = useState<string | null>(null)
  const [translatedQuery, setTranslatedQuery] = useState<string | null>(null)
  const { locale } = useLanguage() // Added to get the locale

  const onSearch = async () => {
    if (!query) return
    setLoading(true)
    setError(null)
    setTranslationWarning(null)
    setTranslatedQuery(null)
    try {
      const data = await searchRecipes(query, 12, locale) // Updated to include locale
      setResults(data.results || [])
      setTranslatedQuery((data as any).enQuery || null)
      if (data.translationFailed) {
        setTranslationWarning(t('translationFailed') || 'Não foi possível traduzir o termo; buscando com o termo original.')
      }
    } catch (e) {
      setError(t('searchError'))
    } finally {
      setLoading(false)
    }
  }

  const { t } = useLanguage()

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <input
          className="border rounded px-2 py-1 flex-1"
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-3 rounded" onClick={onSearch}>
          {loading ? t('searching') || 'Buscando...' : t('enter')}
        </button>
      </div>

      {error && <div className="text-red-600 mb-2">{error}</div>}
      {translationWarning && <div className="text-yellow-600 mb-2">{translationWarning}</div>}
      {translatedQuery && (
        <div className="text-sm text-gray-600 mb-2">{t('searchingFor') || 'Buscando por'}: {translatedQuery}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {results.map((r) => (
          <div key={r.id} className="border rounded overflow-hidden">
            {r.image && <img src={r.image} alt={r.title} className="w-full h-40 object-cover" />}
            <div className="p-2">
              <div className="font-semibold">{r.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
