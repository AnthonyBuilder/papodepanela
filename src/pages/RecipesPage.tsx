import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'
import SpinnerEmpty from '@/components/SpinnerEmpty'
import SEO from '@/components/SEO'
import { searchRecipes } from '../api/spoonacular';

const RecipesPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    searchRecipes(q, 6, locale)
      .then(data => {
        setRecipes(data.results || []);
      })
      .catch(() => setError(t('searchError')))
      .finally(() => setLoading(false));
  }, [query, locale, t]);

  if (!query) return <div className="p-6">{t('invalidQuery')}</div>;
  if (loading) return <SpinnerEmpty />;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <>
      <SEO 
        title={`${t('results')} "${decodeURIComponent(query)}" - Papo de Panela`}
        description={`Encontre receitas deliciosas para "${decodeURIComponent(query)}". Descubra novas opções e inspire-se!`}
        canonicalUrl={`https://papodepanela.vercel.app/recipes/${query}`}
      />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {t('results')} "{decodeURIComponent(query)}"
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>{t('back')}</Button>
          </div>
        </div>

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