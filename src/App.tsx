import { useEffect, useState } from 'react'
import './index.css'
import Header from './components/Header'
import Card from './components/Card'
import FeaturedSlider from './components/FeaturedSlider'
import SEO from './components/SEO'
import Breadcrumbs from './components/Breadcrumbs'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import RecipesPage from './pages/RecipesPage'
import LoginPage from './pages/LoginPage'
import RecipePage from './pages/RecipePage'
import SavedRecipesPage from './pages/SavedRecipesPage'
import CommunityRecipesPage from './pages/CommunityRecipesPage'
import CommunityRecipeDetailPage from './pages/CommunityRecipeDetailPage'
import CreateRecipePage from './pages/CreateRecipePage'
import AIRecipePage from './pages/AIRecipePage'
import { getRandomRecipes, getRecipesByCuisine, getDrinkRecipes, getDessertRecipes, getMainCourseRecipes } from './api/spoonacular'
import { useLanguage, translateForLocale } from './context/LanguageContext'
import { useAuth } from './context/AuthContext'
import SpinnerEmpty from '@/components/SpinnerEmpty'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Analytics } from "@vercel/analytics/next"
import HighPerformanceAd from '@/components/HighPerformanceAd'

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
  const [drinkLoading, setDrinkLoading] = useState(false);
  const [dessertRecipes, setDessertRecipes] = useState<Array<{ title: string; description: string; image: string; id: string }>>([])
  const [dessertLoading, setDessertLoading] = useState(false)
  const [mainCourseRecipes, setMainCourseRecipes] = useState<Array<{ title: string; description: string; image: string; id: string }>>([])
  const [mainCourseLoading, setMainCourseLoading] = useState(false)
  
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
    
    // Função para obter URL de imagem em alta qualidade
    const getHighQualityImage = (imageUrl: string) => {
      if (!imageUrl) return imageUrl
      // Substitui qualquer tamanho existente por 636x393 (maior qualidade disponível)
      return imageUrl
        .replace(/312x231/g, '636x393')
        .replace(/556x370/g, '636x393')
        .replace(/90x90/g, '636x393')
    }

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
        
        let recipes = await getRandomRecipes(6, spoonacularLanguage)
        
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
          image: getHighQualityImage(r.image || ''),
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
        asian: { pt: 'Asiático', en: 'Asian', es: 'Asiático' },
      }
      const entry = map[key]
      if (!entry) return key
      if (locale === 'pt') return entry.pt
      if (locale === 'es') return entry.es
      return entry.en
    }

    const categories = ['italian', 'mexican', 'vegetarian', 'asian']

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

  useEffect(() => {
    const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '')

    const loadDesserts = async () => {
      setDessertLoading(true)
      try {
        const languageMap: Record<string, string> = {
          pt: 'pt',
          en: 'en',
          es: 'es',
        }
        const spoonacularLanguage = languageMap[locale] || 'en'
        
        let recipes = await getDessertRecipes(6, spoonacularLanguage)
        
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
        
        setDessertRecipes(mapped)
      } catch (e) {
        console.error('Failed to load dessert recipes', e)
      } finally {
        setDessertLoading(false)
      }
    }

    loadDesserts()
  }, [locale])

  useEffect(() => {
    const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '')

    const loadMainCourse = async () => {
      setMainCourseLoading(true)
      try {
        const languageMap: Record<string, string> = {
          pt: 'pt',
          en: 'en',
          es: 'es',
        }
        const spoonacularLanguage = languageMap[locale] || 'en'
        
        let recipes = await getMainCourseRecipes(9, spoonacularLanguage)
        
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
        
        setMainCourseRecipes(mapped)
      } catch (e) {
        console.error('Failed to load main course recipes', e)
      } finally {
        setMainCourseLoading(false)
      }
    }

    loadMainCourse()
  }, [locale])

  // Função para obter breadcrumbs baseado na seção selecionada
  const getBreadcrumbs = () => {
    const breadcrumbs: Array<{ label: string; onClick?: () => void }> = [
      { 
        label: t('home') || 'Início', 
        onClick: () => navigate('/') 
      }
    ]

    if (selected === 'Pratos Principais') {
      breadcrumbs.push({ label: t('mainCourses') || 'Pratos Principais' })
    } else if (selected === 'Sobremesas') {
      breadcrumbs.push({ label: t('desserts') || 'Sobremesas' })
    } else if (selected === 'Dicas') {
      breadcrumbs.push({ label: t('tips') || 'Dicas e Bebidas' })
    } else if (selected === 'Categorias') {
      breadcrumbs.push({ label: t('categories') || 'Categorias' })
    } else if (selected === 'Sobre') {
      breadcrumbs.push({ label: t('about') || 'Sobre' })
    } else if (selected) {
      breadcrumbs.push({ label: selected })
    }

    return breadcrumbs
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="max-w-6xl mx-auto px-4 py-10">
                {/* Breadcrumbs */}
                {selected && <Breadcrumbs items={getBreadcrumbs()} />}
                
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
                          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {t('createRecipe.callToActionTitle')?.replace(/👨‍🍳/g, '').trim() || 'Compartilhe suas receitas!'}
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
                        <h2 className="text-2xl font-bold font-noto-serif flex items-center gap-2">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {locale === 'pt' ? 'Bebidas' : locale === 'es' ? 'Bebidas' : 'Drinks'}
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

                    {/* Ad Banner */}
                    <div className="my-12 flex justify-center">
                      <HighPerformanceAd 
                        adKey="15586333f6ad04e735de6b63942e67f2" 
                        height={90} 
                        width={728} 
                      />
                    </div>

                    {/* Seção Sobremesas */}
                    <div className="mt-12">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold font-noto-serif flex items-center gap-2">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                          </svg>
                          {locale === 'pt' ? 'Sobremesas' : locale === 'es' ? 'Postres' : 'Desserts'}
                        </h2>
                      </div>
                      <p className="text-sm text-gray-500 mb-6">
                        {locale === 'pt' ? 'Doces e sobremesas irresistíveis' : locale === 'es' ? 'Dulces y postres irresistibles' : 'Irresistible sweets and desserts'}
                      </p>
                      {dessertLoading ? (
                        <SpinnerEmpty />
                      ) : dessertRecipes.length === 0 ? (
                        <p className="text-sm text-gray-500">{t('noRecipesFound') || 'Nenhuma receita encontrada.'}</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                          {dessertRecipes.map((it) => (
                            <Card key={`dessert-${it.id}`} title={it.title} description={it.description} image={it.image} query={it.id} />
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Seção Pratos Principais */}
                {selected === 'Pratos Principais' && (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center gap-3 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-4xl shadow-lg">
                          🍽️
                        </div>
                      </div>
                      <h1 className="text-4xl font-bold text-gray-800 mb-3 font-noto-serif">
                        {locale === 'pt' ? 'Pratos Principais' : locale === 'es' ? 'Platos Principales' : 'Main Courses'}
                      </h1>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {locale === 'pt' ? 'Receitas deliciosas e completas para suas refeições principais' : locale === 'es' ? 'Deliciosas recetas completas para tus comidas principales' : 'Delicious and complete recipes for your main meals'}
                      </p>
                    </div>

                    {mainCourseLoading ? (
                      <SpinnerEmpty />
                    ) : mainCourseRecipes.length === 0 ? (
                      <p className="text-center text-gray-500">{t('noRecipesFound') || 'Nenhuma receita encontrada.'}</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {mainCourseRecipes.map((it) => (
                          <Card key={`main-${it.id}`} title={it.title} description={it.description} image={it.image} query={it.id} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Seção Sobremesas */}
                {selected === 'Sobremesas' && (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center gap-3 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl shadow-lg">
                          🍰
                        </div>
                      </div>
                      <h1 className="text-4xl font-bold text-gray-800 mb-3 font-noto-serif">
                        {locale === 'pt' ? 'Sobremesas' : locale === 'es' ? 'Postres' : 'Desserts'}
                      </h1>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {locale === 'pt' ? 'Doces e sobremesas irresistíveis para adoçar seu dia' : locale === 'es' ? 'Dulces y postres irresistibles para endulzar tu día' : 'Irresistible sweets and desserts to sweeten your day'}
                      </p>
                    </div>

                    {dessertLoading ? (
                      <SpinnerEmpty />
                    ) : dessertRecipes.length === 0 ? (
                      <p className="text-center text-gray-500">{t('noRecipesFound') || 'Nenhuma receita encontrada.'}</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {dessertRecipes.map((it) => (
                          <Card key={`dessert-${it.id}`} title={it.title} description={it.description} image={it.image} query={it.id} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Seção Dicas e Bebidas */}
                {selected === 'Dicas' && (
                  <div className="space-y-8">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center gap-3 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-4xl shadow-lg">
                          🍹
                        </div>
                      </div>
                      <h1 className="text-4xl font-bold text-gray-800 mb-3 font-noto-serif">
                        {locale === 'pt' ? 'Dicas e Bebidas' : locale === 'es' ? 'Consejos y Bebidas' : 'Tips & Drinks'}
                      </h1>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {locale === 'pt' ? 'Receitas refrescantes e dicas especiais para sua cozinha' : locale === 'es' ? 'Recetas refrescantes y consejos especiales para tu cocina' : 'Refreshing recipes and special tips for your kitchen'}
                      </p>
                    </div>

                    {/* Seção Bebidas */}
                    <div>
                      <div className="flex items-center mb-4">
                        <h2 className="text-2xl font-bold font-noto-serif flex items-center gap-2">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {locale === 'pt' ? 'Bebidas' : locale === 'es' ? 'Bebidas' : 'Drinks'}
                        </h2>
                      </div>
                      {drinkLoading ? (
                        <SpinnerEmpty />
                      ) : drinkRecipes.length === 0 ? (
                        <p className="text-gray-500">{t('noRecipesFound') || 'Nenhuma receita encontrada.'}</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                          {drinkRecipes.map((it) => (
                            <Card key={`drink-${it.id}`} title={it.title} description={it.description} image={it.image} query={it.id} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dicas de Culinária */}
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-8 border border-orange-100">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        {locale === 'pt' ? 'Dicas de Culinária' : locale === 'es' ? 'Consejos de Cocina' : 'Cooking Tips'}
                      </h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <h3 className="font-semibold text-gray-800 mb-2">💡 {locale === 'pt' ? 'Dica do Chef' : 'Chef Tip'}</h3>
                          <p className="text-gray-600 text-sm">
                            {locale === 'pt' ? 'Sempre prove os temperos durante o preparo. Ajustar o sal e as especiarias no meio do processo garante um resultado perfeito.' : 'Always taste seasonings during preparation. Adjusting salt and spices mid-process ensures a perfect result.'}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <h3 className="font-semibold text-gray-800 mb-2">🔥 {locale === 'pt' ? 'Temperatura Ideal' : 'Ideal Temperature'}</h3>
                          <p className="text-gray-600 text-sm">
                            {locale === 'pt' ? 'Para carnes suculentas, retire-as da geladeira 30 minutos antes de cozinhar. Isso garante cozimento uniforme.' : 'For juicy meats, remove them from the fridge 30 minutes before cooking. This ensures even cooking.'}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <h3 className="font-semibold text-gray-800 mb-2">🥘 {locale === 'pt' ? 'Organização' : 'Organization'}</h3>
                          <p className="text-gray-600 text-sm">
                            {locale === 'pt' ? 'Prepare todos os ingredientes antes de começar (mise en place). Isso economiza tempo e evita erros.' : 'Prepare all ingredients before starting (mise en place). This saves time and prevents mistakes.'}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <h3 className="font-semibold text-gray-800 mb-2">🌿 {locale === 'pt' ? 'Frescor' : 'Freshness'}</h3>
                          <p className="text-gray-600 text-sm">
                            {locale === 'pt' ? 'Adicione ervas frescas no final do preparo para manter seu aroma e sabor intensos.' : 'Add fresh herbs at the end of cooking to maintain their intense aroma and flavor.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
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
                      <ul className="list-none pl-0 space-y-2 text-gray-700">
                        <li className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Busca inteligente de receitas
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Tradução automática para múltiplos idiomas
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-orange-500 fill-current" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          Salve suas receitas favoritas
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Explore por categorias culinárias
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Interface responsiva para todos os dispositivos
                        </li>
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
        <Route path="/edit-recipe/:id" element={<CreateRecipePage />} />
        <Route path="/ai-recipe" element={<AIRecipePage />} />
        </Routes>
      </div>
      <Footer />
      <Analytics />
    </Router>
  )
}

export default App
