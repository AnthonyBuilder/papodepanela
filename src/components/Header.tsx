import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'

type HeaderProps = {
  onSelect?: (opt: string) => void
}

const Header: React.FC<HeaderProps> = ({ onSelect }) => {
  const options = ['Receitas', 'Favoritos', 'Categorias', 'Sobre']
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const submitSearch = () => {
    const q = query.trim()
    if (!q) return
    navigate(`/recipes/${encodeURIComponent(q)}`)
  }

  const { locale, setLocale, t } = useLanguage()

  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-sm text-black border-b border-solid border-gray-100 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-noto-serif text-3xl text-orange-500">Papo de Panela</h1>
          
          <nav className="hidden md:flex gap-2">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => onSelect && onSelect(o)}
                className="px-3 py-1 rounded-md hover:bg-white/20"
              >
                {o}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <input
              aria-label="Pesquisar"
              placeholder={t('searchPlaceholder')}
              className="px-3 py-1 rounded-md bg-white w-52 opacity-80 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitSearch() }}
            />
          </div>

          <div className="flex items-center gap-2">
            <select value={locale} onChange={(e) => setLocale(e.target.value as any)} className="rounded-md px-2 py-1 text-sm bg-white border border-gray-300">
              <option value="pt">PT</option>
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
            <Button variant="ghost" size="sm" className="bg-white/90 text-gray-600 text-md" onClick={() => navigate('/login')}>
              {t('login')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
