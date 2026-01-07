import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'
import SpinnerEmpty from '@/components/SpinnerEmpty'
import { searchRecipes } from '../api/spoonacular';

const RecipesPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate()

  useEffect(() => {
    if (!query) return;
    const q = decodeURIComponent(query);
    setLoading(true);
    setError(null);
    searchRecipes(q, 12)
      .then(data => {
        setRecipes(data.results || []);
      })
      .catch(() => setError('Erro ao buscar receitas'))
      .finally(() => setLoading(false));
  }, [query]);

  if (!query) return <div className="p-6">Query inválida.</div>;
  if (loading) return <SpinnerEmpty />;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          Resultados para "{decodeURIComponent(query)}"
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>Voltar</Button>
        </div>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recipes.length === 0 && (
          <li className="p-4 rounded text-center text-gray-700">Nenhuma receita encontrada.</li>
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
                <p className="text-sm text-muted-foreground mt-2">{r.sourceName || r.servings ? `${r.sourceName ?? ''} • ${r.servings ?? ''} porções` : ''}</p>
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/recipe/${r.id}`)}>Ver detalhes</Button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecipesPage;