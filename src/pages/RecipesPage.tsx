import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'
import SpinnerEmpty from '@/components/SpinnerEmpty'
import SEO from '@/components/SEO'
import Breadcrumbs from '@/components/Breadcrumbs'
import { searchRecipes, type SearchFilters } from '../api/spoonacular';
import { Filter, X } from 'lucide-react'

const RecipesPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const navigate = useNavigate()
  const { locale, t } = useLanguage()

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
    if (!query) return;
    const q = decodeURIComponent(query);
    setLoading(true);
    setError(null);
    searchRecipes(q, 15, locale, filters)
      .then(data => {
        setRecipes(data.results || []);
      })
      .catch(() => setError(t('searchError')))
      .finally(() => setLoading(false));
  }, [query, locale, t, filters]);

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  if (!query) return <div className="p-6">{t('invalidQuery')}</div>;
  if (loading) return <SpinnerEmpty />;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <>
      <SEO 
        title={`${t('results')} "${decodeURIComponent(query)}" - Papo de Panela`}
        description={`Encontre receitas deliciosas para "${decodeURIComponent(query)}". Descubra novas opções e inspire-se!`}
        canonicalUrl={`https://papodepanela.site/recipes/${query}`}
      />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumbs items={[
          { label: t('home') || 'Início', onClick: () => navigate('/') },
          { label: t('search') || 'Pesquisa' },
          { label: decodeURIComponent(query) }
        ]} />
        
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {t('results')} "{decodeURIComponent(query)}"
          </h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>{t('back')}</Button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white/95 rounded-lg border border-gray-200 shadow-md transition-all duration-300 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Filtros de Pesquisa</h3>
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dieta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dieta
                </label>
                <select
                  value={filters.diet || ''}
                  onChange={(e) => handleFilterChange('diet', e.target.value)}
                  className="w-full px-3 py-2 bg-white/90 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-200 hover:shadow-md focus:shadow-lg"
                >
                  <option value="">Todas</option>
                  <option value="vegetarian">Vegetariana</option>
                  <option value="vegan">Vegana</option>
                  <option value="ketogenic">Cetogênica</option>
                  <option value="paleo">Paleo</option>
                  <option value="gluten free">Sem Glúten</option>
                </select>
              </div>

              {/* Tipo de Prato */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Prato
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-white/90 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-200 hover:shadow-md focus:shadow-lg"
                >
                  <option value="">Todos</option>
                  <option value="main course">Prato Principal</option>
                  <option value="side dish">Acompanhamento</option>
                  <option value="dessert">Sobremesa</option>
                  <option value="appetizer">Entrada</option>
                  <option value="salad">Salada</option>
                  <option value="breakfast">Café da Manhã</option>
                  <option value="soup">Sopa</option>
                  <option value="beverage">Bebida</option>
                  <option value="sauce">Molho</option>
                  <option value="snack">Lanche</option>
                </select>
              </div>

              {/* Cozinha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cozinha
                </label>
                <select
                  value={filters.cuisine || ''}
                  onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                  className="w-full px-3 py-2 bg-white/90 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-200 hover:shadow-md focus:shadow-lg"
                >
                  <option value="">Todas</option>
                  <option value="italian">Italiana</option>
                  <option value="mexican">Mexicana</option>
                  <option value="chinese">Chinesa</option>
                  <option value="japanese">Japonesa</option>
                  <option value="thai">Tailandesa</option>
                  <option value="indian">Indiana</option>
                  <option value="french">Francesa</option>
                  <option value="greek">Grega</option>
                  <option value="spanish">Espanhola</option>
                  <option value="mediterranean">Mediterrânea</option>
                  <option value="american">Americana</option>
                  <option value="brazilian">Brasileira</option>
                </select>
              </div>

              {/* Tempo de Preparo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo Máximo (minutos)
                </label>
                <select
                  value={filters.maxReadyTime || ''}
                  onChange={(e) => handleFilterChange('maxReadyTime', e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-white/90 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-200 hover:shadow-md focus:shadow-lg"
                >
                  <option value="">Qualquer tempo</option>
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="120">2 horas</option>
                </select>
              </div>

              {/* Intolerâncias */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intolerâncias/Alergias
                </label>
                <select
                  value={filters.intolerances || ''}
                  onChange={(e) => handleFilterChange('intolerances', e.target.value)}
                  className="w-full px-3 py-2 bg-white/90 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-200 hover:shadow-md focus:shadow-lg"
                >
                  <option value="">Nenhuma</option>
                  <option value="dairy">Laticínios</option>
                  <option value="egg">Ovo</option>
                  <option value="gluten">Glúten</option>
                  <option value="peanut">Amendoim</option>
                  <option value="sesame">Gergelim</option>
                  <option value="seafood">Frutos do Mar</option>
                  <option value="shellfish">Crustáceos</option>
                  <option value="soy">Soja</option>
                  <option value="tree nut">Nozes</option>
                  <option value="wheat">Trigo</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recipes.length === 0 && (
            <li className="p-4 rounded text-center text-gray-700">{t('noRecipesFound')}</li>
          )}

          {recipes.map(r => (
          <li key={r.id} className="bg-card p-4 rounded-lg shadow-sm">
            <div className="flex gap-4 items-start">
              {r.image && (
                <img src={r.image} alt={r.title} className="w-24 h-24 object-cover rounded-md" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">{r.title}</div>
                  <div className="text-sm text-gray-500">#{r.id}</div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{r.sourceName || r.servings ? `${r.sourceName ?? ''} • ${r.servings ?? ''} ${t('servings').toLowerCase()}` : ''}</p>
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/recipe/${r.id}`)}>{t('details')}</Button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
};

export default RecipesPage;