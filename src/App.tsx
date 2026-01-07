import { useEffect, useState } from 'react'
import './index.css'
import Header from './components/Header'
import Card from './components/Card'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RecipesPage from './pages/RecipesPage'
import { getRandomRecipes } from './api/spoonacular'

function App() {
  const [selected, setSelected] = useState<string | null>(null)

  const [items, setItems] = useState<Array<{ title: string; description: string; image: string }>>([])

  useEffect(() => {
    const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '')

    const loadRandom = async () => {
      try {
        const recipes = await getRandomRecipes(6)
        const mapped = recipes.map((r: any) => ({
          title: r.title || '',
          description: stripHtml(r.summary || '').slice(0, 120),
          image: r.image || '',
        }))
        setItems(mapped)
      } catch (e) {
        console.error('Failed to load random recipes', e)
      }
    }

    loadRandom()
  }, [])

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-white text-black">
              <Header onSelect={(o) => setSelected(o)} />

              <main className="max-w-6xl mx-auto px-4 py-10">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold font-noto-serif">{selected ?? 'Receitas em destaque'}</h1>
                  <div className="text-sm font-medium text-gray-300 uppercase">{items.length}</div>
                </div>

                <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {items.map((it) => (
                    <Card key={it.title} title={it.title} description={it.description} image={it.image} query={it.title} />
                  ))}
                </section>
              </main>
            </div>
          }
        />
        <Route path="/recipes/:query" element={<RecipesPage />} />
      </Routes>
    </Router>
  )
}

export default App
