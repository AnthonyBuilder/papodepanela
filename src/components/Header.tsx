import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'
import { auth } from '@/lib/firebase'
import { LogOut, Heart, Menu, X, Search, ArrowRight, Users, Sparkles } from 'lucide-react'

type HeaderProps = {
  onSelect?: (opt: string) => void
}

const Header: React.FC<HeaderProps> = ({ onSelect }) => {
  const options = ['Receitas', 'Categorias', 'Sobre']
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const navigate = useNavigate()

  const submitSearch = () => {
    const q = query.trim()
    if (!q) return
    navigate(`/recipes/${encodeURIComponent(q)}`)
    setMenuOpen(false)
    setShowSearch(false)
  }

  const { t } = useLanguage()

  const handleOptionClick = (o: string) => {
    onSelect?.(o)
    if (o === 'Receitas') navigate('/')
    setMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 w-full bg-white/70 backdrop-blur-sm text-black border-b border-solid border-black/20 z-50 box-shadow-md shadow box-border-bottom">
      <div className="max-w-6xl mx-auto px-2 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <div className="md:hidden font-noto-serif w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              P
            </div>
            <span className="font-noto-serif font-bold text-2xl text-gray-800 hidden md:inline-block whitespace-nowrap">
              Papo de Panela
            </span>
          </button>

          <nav className="hidden md:flex gap-2">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => handleOptionClick(o)}
                className="px-3 py-1 opacity-80 rounded-xl hover:bg-white/20"
              >
                {o}
              </button>
            ))}
          </nav>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setShowSearch((v) => !v)}>
            <Search className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            {auth.currentUser ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-md rounded-xl flex items-center gap-1 hover:from-purple-600 hover:to-pink-600" 
                  onClick={() => navigate('/ai-recipe')}
                >
                  <Sparkles className="w-4 h-4" />
                  IA
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="bg-white/90 text-gray-600 text-md rounded-xl flex items-center gap-1" 
                  onClick={() => navigate('/saved')}
                >
                  <Heart className="w-4 h-4" />
                  Salvas
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="bg-white/90 text-gray-600 text-md rounded-xl flex items-center gap-1" 
                  onClick={() => navigate('/community')}
                >
                  <Users className="w-4 h-4" />
                  Comunidade
                </Button>
                <span className="text-sm text-gray-600">{auth.currentUser.displayName}</span>
                <Button variant="ghost" size="sm" className="bg-white/90 text-gray-600 text-md rounded-xl flex items-center gap-1" onClick={() => auth.signOut().then(() => navigate('/'))}>
                  <LogOut className="w-4 h-4" />
                  {t('logout')}
                </Button>
              </>
            ) : 
             <Button variant="ghost" size="sm" className="bg-white/90 text-gray-600 text-md rounded-xl" onClick={() => navigate('/login')}>
              {t('login')}
            </Button>}
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex sm:hidden items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowSearch((v) => !v)}>
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {showSearch && (
        <div className="px-4 pb-3 flex justify-center">
          <div className="flex gap-2 w-full sm:max-w-md items-center">
            <input
              autoFocus
              aria-label="Pesquisar"
              placeholder={t('searchPlaceholder')}
              className="px-3 py-2 rounded-xl bg-white w-full text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitSearch() }}
            />
            <Button variant="ghost" size="sm" onClick={submitSearch} className="h-auto">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="sm:hidden px-4 pb-4 space-y-3">
          <div className="flex flex-col gap-2">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => handleOptionClick(o)}
                className="w-full text-left px-3 py-2 rounded-lg bg-white/70 text-gray-800 border"
              >
                {o}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {auth.currentUser ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600" 
                  onClick={() => { navigate('/ai-recipe'); setMenuOpen(false) }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar com IA
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start bg-white/90 text-gray-700" 
                  onClick={() => { navigate('/saved'); setMenuOpen(false) }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Salvas
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start bg-white/90 text-gray-700" 
                  onClick={() => { navigate('/community'); setMenuOpen(false) }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Comunidade
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start bg-white/90 text-gray-700"
                  onClick={() => auth.signOut().then(() => { setMenuOpen(false); navigate('/') })}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('logout')}
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="justify-start bg-white/90 text-gray-700"
                onClick={() => { setMenuOpen(false); navigate('/login') }}
              >
                {t('login')}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
