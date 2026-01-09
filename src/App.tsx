import { useEffect, useState } from 'react'
import './index.css'
import Header from './components/Header'
import Card from './components/Card'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RecipesPage from './pages/RecipesPage'
import LoginPage from './pages/LoginPage'
import RecipePage from './pages/RecipePage'
import { getRandomRecipes } from './api/spoonacular'
import { useLanguage, translateForLocale } from './context/LanguageContext'
import SpinnerEmpty from '@/components/SpinnerEmpty'
import Footer from '@/components/Footer'
import { Analytics } from "@vercel/analytics/next"

function App() {
  const [selected, setSelected] = useState<string | null>(null)
  const { locale, t } = useLanguage()

  const [items, setItems] = useState<Array<{ title: string; description: string; image: string; id: string }>>([])
  const [loading, setLoading] = useState(false)

  // Set document language for browser translation
  useEffect(() => {
    const langMap: Record<string, string> = {
      pt: 'pt-BR',
      en: 'en-US',
      es: 'es-ES',
    }
    document.documentElement.lang = langMap[locale] || locale
  }, [locale])

  useEffect(() => {
    const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '')

    const loadRandom = async () => {
      setLoading(true)
      try {
        const recipes = await getRandomRecipes(9)
        const mapped = recipes.map((r: any) => ({
          title: r.title || '',
          description: stripHtml(r.summary || '').slice(0, 120),
          image: r.image || '',
          id: r.id || '',
        }))
        // translate if UI locale is not English
        if (locale !== 'en') {
          const translated = await Promise.all(
            mapped.map(async (m: { title: string; description: string; image: string; id: string }) => ({
              ...m,
              title: await translateForLocale(m.title, locale),
              description: await translateForLocale(m.description, locale),
            }))
          )
          setItems(translated)
        } else {
          setItems(mapped)
        }
      } catch (e) {
        console.error('Failed to load random recipes', e)
      } finally {
        setLoading(false)
      }
    }

    loadRandom()
  }, [locale])

  return (
    <Router>
      <Header onSelect={(o) => setSelected(o)} />
      <div className="pt-20">
        <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-white text-black">
              <main className="max-w-6xl mx-auto px-4 py-10">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold font-noto-serif">{selected ?? t('randomRecipes')}</h1>
                  <div className="text-md font-medium text-gray-200 uppercase">{items.length}</div>
                </div>
                <div className='flex mb-6'>
                  <p className="text-sm text-gray-500 mb-4">{t('randomRecipesDesc')}</p>
                </div>
                {loading ? (
                  <SpinnerEmpty />
                ) : (
                  <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {items.map((it) => (
                      <Card key={it.title} title={it.title} description={it.description} image={it.image} query={it.id} />
                    ))}
                  </section>
                )}
              </main>
            </div>
          }
        />
        <Route path="/recipes/:query" element={<RecipesPage />} />
        <Route path="/recipe/:id" element={<RecipePage />} />
        <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
      <Footer />
      <Analytics />
    </Router>
  )
}

export default App
