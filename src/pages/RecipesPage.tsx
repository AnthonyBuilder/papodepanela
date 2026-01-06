import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { searchRecipes } from '../api/spoonacular';

const RecipesPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  if (loading) return <div className="p-6">Carregando...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          Resultados para "{decodeURIComponent(query)}"
        </h2>
        <Link to="/" className="text-sm text-blue-600">
          Voltar
        </Link>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recipes.length === 0 && (
          <li className="p-4 bg-gray-50 rounded">
            Nenhuma receita encontrada.
          </li>
        )}
        {recipes.map(r => (
          <li
            key={r.id}
            className="p-4 bg-white rounded shadow-sm flex items-center gap-4"
          >
            {r.image && (
              <img
                src={r.image}
                alt={r.title}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div>
              <div className="font-semibold">{r.title}</div>
              <div className="text-sm text-gray-500">ID: {r.id}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecipesPage;