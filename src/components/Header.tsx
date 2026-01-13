import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/context/LanguageContext'
import { auth } from '@/lib/firebase'
import { LogOut, Heart, Menu, X, Search, ArrowRight, Users, Sparkles, ChefHat, Cake, Lightbulb, User } from 'lucide-react'

type HeaderProps = {
  onSelect?: (opt: string) => void
}

type MenuOption = {
  label: string
  icon: React.ReactNode
  action: () => void
}

const Header: React.FC<HeaderProps> = ({ onSelect }) => {
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

  const menuOptions: MenuOption[] = [
    {
      label: 'Pratos Principais',
      icon: <ChefHat className="w-4 h-4" />,
      action: () => {
        navigate('/')
        onSelect?.('Pratos Principais')
      }
    },
    {
      label: 'Sobremesas',
      icon: <Cake className="w-4 h-4" />,
      action: () => {
        navigate('/')
        onSelect?.('Sobremesas')
      }
    },
    {
      label: 'Dicas e Bebidas',
      icon: <Lightbulb className="w-4 h-4" />,
      action: () => {
        navigate('/')
        onSelect?.('Dicas')
      }
    },
    {
      label: 'Comunidade',
      icon: <Users className="w-4 h-4" />,
      action: () => {
        navigate('/community')
      }
    }
  ]

  const handleOptionClick = (option: MenuOption) => {
    option.action()
    setMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 w-full bg-white/70 backdrop-blur-sm text-black border-b border-solid border-black/20 z-50 box-shadow-md shadow box-border-bottom">
      <div className="max-w-6xl mx-auto px-2 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              navigate('/')
              onSelect?.('Receitas')
            }}
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
            {menuOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => handleOptionClick(option)}
                className="px-3 py-1.5 opacity-80 rounded-xl hover:bg-white/20 flex items-center gap-1.5 transition-all hover:opacity-100"
              >
                {option.icon}
                <span>{option.label}</span>
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
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="bg-white/90 text-gray-600 text-md rounded-xl flex items-center gap-2 h-auto px-3 py-1.5"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden md:inline">{auth.currentUser.displayName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white">
                    <DropdownMenuLabel className="text-gray-800">
                      {auth.currentUser.displayName || auth.currentUser.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => navigate('/saved')}
                      className="cursor-pointer text-gray-700 focus:bg-gray-100"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      {t('savedRecipes') || 'Receitas Salvas'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => auth.signOut().then(() => navigate('/'))}
                      className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
          <div className="flex gap-2 w-full sm:max-w-md">
            <input
              autoFocus
              aria-label="Pesquisar"
              placeholder={t('searchPlaceholder')}
              className="px-3 py-2 rounded-xl bg-white/95 w-full text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-200 hover:shadow-md focus:shadow-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitSearch() }}
            />
            <Button  variant="ghost" size="sm" onClick={submitSearch}>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="sm:hidden px-4 pb-4 space-y-3">
          <div className="flex flex-col gap-2">
            {menuOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => handleOptionClick(option)}
                className="w-full text-left px-3 py-3 rounded-lg bg-white/70 text-gray-800 border flex items-center gap-2 hover:bg-white/90 transition-all"
              >
                {option.icon}
                <span className="font-medium">{option.label}</span>
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
