import { useEffect, useState } from 'react'
import './index.css'
import Header from './components/Header'
import Card from './components/Card'
import FeaturedSlider from './components/FeaturedSlider'
import SEO from './components/SEO'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import RecipesPage from './pages/RecipesPage'
import LoginPage from './pages/LoginPage'
import RecipePage from './pages/RecipePage'
import SavedRecipesPage from './pages/SavedRecipesPage'
import CommunityRecipesPage from './pages/CommunityRecipesPage'
import CommunityRecipeDetailPage from './pages/CommunityRecipeDetailPage'
import CreateRecipePage from './pages/CreateRecipePage'
import { getRandomRecipes, getRecipesByCuisine, getDrinkRecipes } from './api/spoonacular'
import { useLanguage, translateForLocale } from './context/LanguageContext'
import { useAuth } from './context/AuthContext'
import SpinnerEmpty from '@/components/SpinnerEmpty'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Analytics } from "@vercel/analytics/next"

function HomePage({ selected }: { selected: string | null }) {
  const { locale, t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [items, setItems] = useState<Array<{ title: string; description: string; image: string; id: string }>>([])
  const [loading, setLoading] = useState(false)
  const [featuredRecipes, setFeaturedRecipes] = useState<Array<{ title: string; description: string; image: string; id: string }>>([])
  const [categorySections, setCategorySections] = useState<Array<{ label: string; items: Array<{ title: string; description: string; image: string; id: string }> }>>([])
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [drinkRecipes, setDrinkRecipes] = useState<Array<{ title: string; description: string; image: string; id: string }>>([]);
  const [drinkLoading, setDrinkLoading] = useState(false)
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
        // Mapa de locale para language code Spoonacular
        const languageMap: Record<string, string> = {
          pt: 'pt',
          en: 'en',
          es: 'es',
        }
        const spoonacularLanguage = languageMap[locale] || 'en'
        
        let recipes = await getRandomRecipes(9, spoonacularLanguage)
        
        // Traduzir títulos e descrições se não estiver em inglês
        if (locale !== 'en') {
          recipes = await Promise.all(
            recipes.map(async (r: any) => ({
              ...r,
              title: r.title ? await translateForLocale(r.title, locale as 'pt' | 'en' | 'es') : '',
              summary: r.summary ? await translateForLocale(stripHtml(r.summary).slice(0, 120), locale as 'pt' | 'en' | 'es') : '',
            }))
          )
        }
        
        const mapped = recipes.map((r: any) => ({
          title: r.title || '',
          description: stripHtml(r.summary || '').slice(0, 120),
          image: r.image || '',
          id: r.id || '',
        }))
        
        setItems(mapped)
        // Use primeiras 5 receitas para o slider de destaques
        setFeaturedRecipes(mapped.slice(0, 5))
      } catch (e) {
        console.error('Failed to load random recipes', e)
      } finally {
        setLoading(false)
      }
    }

    loadRandom()
  }, [locale])

  useEffect(() => {
    const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '')
    const labelFor = (key: string) => {
      const map: Record<string, { pt: string; en: string; es: string }> = {
        italian: { pt: 'Italiano', en: 'Italian', es: 'Italiano' },
        mexican: { pt: 'Mexicano', en: 'Mexican', es: 'Mexicano' },
        vegetarian: { pt: 'Vegetariano', en: 'Vegetarian', es: 'Vegetariano' },
      }
      const entry = map[key]
      if (!entry) return key
      if (locale === 'pt') return entry.pt
      if (locale === 'es') return entry.es
      return entry.en
    }

    const categories = ['italian', 'mexican', 'vegetarian']

    const loadCategories = async () => {
      setCategoryLoading(true)
      try {
        // Mapa de locale para language code Spoonacular
        const languageMap: Record<string, string> = {
          pt: 'pt',
          en: 'en',
          es: 'es',
        }
        const spoonacularLanguage = languageMap[locale] || 'en'
        
        const sections = await Promise.all(
          categories.map(async (cuisine) => {
            try {
              let recipes = await getRecipesByCuisine(cuisine, 4, spoonacularLanguage)
              
              // Traduzir títulos e descrições se não estiver em inglês
              if (locale !== 'en') {
                recipes = await Promise.all(
                  recipes.map(async (r: any) => ({
                    ...r,
                    title: r.title ? await translateForLocale(r.title, locale as 'pt' | 'en' | 'es') : '',
                    summary: r.summary ? await translateForLocale(stripHtml(r.summary).slice(0, 120), locale as 'pt' | 'en' | 'es') : '',
                  }))
                )
              }
              
              const mapped = recipes.map((r: any) => ({
                title: r.title || '',
                description: stripHtml(r.summary || '').slice(0, 120),
                image: r.image || '',
                id: r.id || '',
              }))

              return { label: labelFor(cuisine), items: mapped }
            } catch (e) {
              console.error('Failed to load category', cuisine, e)
              return { label: labelFor(cuisine), items: [] }
            }
          })
        )
        setCategorySections(sections)
      } finally {
        setCategoryLoading(false)
      }
    }

    loadCategories()
  }, [locale])

  useEffect(() => {
    const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '')

    const loadDrinks = async () => {
      setDrinkLoading(true)
      try {
        const languageMap: Record<string, string> = {
          pt: 'pt',
          en: 'en',
          es: 'es',
        }
        const spoonacularLanguage = languageMap[locale] || 'en'
        
        let recipes = await getDrinkRecipes(6, spoonacularLanguage)
        
        if (locale !== 'en') {
          recipes = await Promise.all(
            recipes.map(async (r: any) => ({
              ...r,
              title: r.title ? await translateForLocale(r.title, locale as 'pt' | 'en' | 'es') : '',
              summary: r.summary ? await translateForLocale(stripHtml(r.summary).slice(0, 120), locale as 'pt' | 'en' | 'es') : '',
            }))
          )
        }
        
        const mapped = recipes.map((r: any) => ({
          title: r.title || '',
          description: stripHtml(r.summary || '').slice(0, 120),
          image: r.image || '',
          id: r.id || '',
        }))
        
        setDrinkRecipes(mapped)
      } catch (e) {
        console.error('Failed to load drink recipes', e)
      } finally {
        setDrinkLoading(false)
      }
    }

    loadDrinks()
  }, [locale])

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="max-w-6xl mx-auto px-4 py-10">
                {/* Seção Receitas (padrão) */}
                {(!selected || selected === 'Receitas') && (
                  <>
                    {/* Slider de Receitas em Destaque */}
                    {featuredRecipes.length > 0 && (
                      <FeaturedSlider recipes={featuredRecipes} />
                    )}

                    {/* Título Principal */}
                    <div className="text-center my-12">
                      <div className="inline-flex items-center justify-center gap-3 mb-4">
                        <div className="font-noto-serif w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                          P
                        </div>
                      </div>
                      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 font-noto-serif">
                        Papo de Panela
                      </h1>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {t('home.subtitle') || 'Descubra, crie e compartilhe receitas deliciosas de todo o mundo'}
                      </p>
                    </div>

                    {/* Seção Call-to-Action: Criar Receita */}
                    <div className="my-8 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-8 border border-orange-100 shadow-sm">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {t('createRecipe.callToActionTitle') || '👨‍🍳 Compartilhe suas receitas!'}
                          </h2>
                          <p className="text-gray-600">
                            {t('createRecipe.callToActionDesc') || 'Tem uma receita especial? Compartilhe com a comunidade e inspire outros cozinheiros!'}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => navigate('/community')}
                            variant="outline"
                            className="whitespace-nowrap"
                          >
                            {t('community.browseRecipes') || 'Ver Receitas'}
                          </Button>
                          <Button 
                            onClick={() => user ? navigate('/create-recipe') : navigate('/login')}
                            className="bg-orange-500 hover:bg-orange-600 whitespace-nowrap"
                          >
                            {t('createRecipe.createButton')}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-3xl font-bold font-noto-serif">{t('randomRecipes')}</h1>
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

                    {/* Seção Bebidas */}
                    <div className="mt-12">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold font-noto-serif">
                          {locale === 'pt' ? '🍹 Bebidas' : locale === 'es' ? '🍹 Bebidas' : '🍹 Drinks'}
                        </h2>
                      </div>
                      <p className="text-sm text-gray-500 mb-6">
                        {locale === 'pt' ? 'Descubra receitas deliciosas de bebidas' : locale === 'es' ? 'Descubre deliciosas recetas de bebidas' : 'Discover delicious drink recipes'}
                      </p>
                      {drinkLoading ? (
                        <SpinnerEmpty />
                      ) : drinkRecipes.length === 0 ? (
                        <p className="text-sm text-gray-500">{t('noRecipesFound') || 'Nenhuma receita encontrada.'}</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                          {drinkRecipes.map((it) => (
                            <Card key={`drink-${it.id}`} title={it.title} description={it.description} image={it.image} query={it.id} />
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Seção Categorias */}
                {selected === 'Categorias' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-3xl font-bold font-noto-serif">{t('categories') || 'Categorias'}</h1>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">Explore receitas por categorias culinárias</p>

                    {categoryLoading ? (
                      <SpinnerEmpty />
                    ) : (
                      categorySections.map((section) => (
                        <div key={section.label} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-noto-serif text-xl font-semibold text-gray-800">{section.label}</h3>
                          </div>
                          {section.items.length === 0 ? (
                            <p className="text-sm text-gray-500">{t('noRecipesFound') || 'Nenhuma receita encontrada.'}</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                              {section.items.map((it) => (
                                <Card key={`${section.label}-${it.id}`} title={it.title} description={it.description} image={it.image} query={it.id} />
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Seção Sobre */}
                {selected === 'Sobre' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-3xl font-bold font-noto-serif">Sobre o Papo de Panela</h1>
                    </div>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 mb-4">
                        O <strong>Papo de Panela</strong> é sua plataforma favorita para descobrir receitas deliciosas de todo o mundo.
                        Compartilhamos o amor pela culinária e queremos tornar mais fácil encontrar a receita perfeita para cada ocasião.
                      </p>
                      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Nossa Missão</h3>
                      <p className="text-gray-700 mb-4">
                        Conectar pessoas através da comida, fornecendo acesso a milhares de receitas traduzidas e adaptadas para o seu idioma.
                      </p>
                      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Recursos</h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>🔍 Busca inteligente de receitas</li>
                        <li>🌍 Tradução automática para múltiplos idiomas</li>
                        <li>❤️ Salve suas receitas favoritas</li>
                        <li>🏷️ Explore por categorias culinárias</li>
                        <li>📱 Interface responsiva para todos os dispositivos</li>
                      </ul>
                      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Contato</h3>
                      <p className="text-gray-700">
                        Tem sugestões ou feedback? Entre em contato conosco em: <a href="mailto:contato@papodepanela.com" className="text-orange-600 hover:underline">contato@papodepanela.com</a>
                      </p>
                    </div>
                  </div>
                )}
              </main>
            </div>
  )
}

function App() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <Router>
      <SEO />
      <Header onSelect={(o) => setSelected(o)} />
      <div className="pt-20">
        <Routes>
        <Route path="/" element={<HomePage selected={selected} />} />
        <Route path="/recipes/:query" element={<RecipesPage />} />
        <Route path="/recipe/:id" element={<RecipePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/saved" element={<SavedRecipesPage />} />
        <Route path="/community" element={<CommunityRecipesPage />} />
        <Route path="/community/:id" element={<CommunityRecipeDetailPage />} />
        <Route path="/create-recipe" element={<CreateRecipePage />} />
        </Routes>
      </div>
      <Footer />
      <Analytics />
    </Router>
  )
}

export default App
