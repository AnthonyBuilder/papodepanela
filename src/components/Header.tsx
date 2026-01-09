import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'

type HeaderProps = {
  onSelect?: (opt: string) => void
}

const Header: React.FC<HeaderProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { t } = useLanguage()

  const options = [
    { key: 'recipes', label: t('recipes') || 'Receitas' },
    { key: 'favorites', label: t('favorites') || 'Favoritos' },
    { key: 'categories', label: t('categories') || 'Categorias' },
    { key: 'about', label: t('aboutMenu') || 'Sobre' },
  ]

  const submitSearch = () => {
    const q = query.trim()
    if (!q) return
    navigate(`/recipes/${encodeURIComponent(q)}`)
  }

  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-sm text-black border-b border-solid border-gray-100 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-noto-serif text-3xl text-orange-500">Papo de Panela</h1>
          
          <nav className="hidden md:flex gap-2">
            {options.map((o) => (
              <button
                key={o.key}
                onClick={() => onSelect && onSelect(o.label)}
                className="px-3 py-1 opacity-80 rounded-xl hover:bg-white/20"
              >
                {o.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <input
              aria-label="Pesquisar"
              placeholder={t('searchPlaceholder')}
              className="px-3 py-1 rounded-xl bg-white w-52 opacity-80 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitSearch() }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="bg-white/90 text-gray-600 text-md rounded-xl" onClick={() => navigate('/login')}>
              {t('login')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
