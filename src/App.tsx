import { useState } from 'react'
import './index.css'
import Header from './components/Header'
import Card from './components/Card'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RecipesPage from './pages/RecipesPage'

function App() {
  const [selected, setSelected] = useState<string | null>(null)

  const items = [
    {
      title: 'Strogonoff de Frango',
      description: 'Rápido e cremoso, perfeito para a semana.',
      image: '',
    },
    {
      title: 'Panquecas Salgadas',
      description: 'Recheie com o que preferir.',
      image: '',
    },
    {
      title: 'Escondidinho de Carne',
      description: 'Sabor caseiro e reconfortante.',
      image: '',
    },
    {
      title: 'Salada Mediterrânea',
      description: 'Leve e fresca para dias quentes.',
      image: '',
    },
    {
      title: 'Bolo de Cenoura',
      description: 'Clássico com cobertura de chocolate.',
      image: '',
    },
    {
      title: 'Risoto de Cogumelos',
      description: 'Aquele toque sofisticado com pouco esforço.',
      image: '',
    },
  ]

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
                  <div className="text-sm font-medium text-gray-300 uppercase">Encontradas: {items.length}</div>
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
