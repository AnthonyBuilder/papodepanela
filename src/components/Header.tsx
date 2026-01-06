import React from 'react'

type HeaderProps = {
  onSelect?: (opt: string) => void
}

const Header: React.FC<HeaderProps> = ({ onSelect }) => {
  const options = ['Receitas', 'Favoritos', 'Categorias', 'Sobre']
  return (
    <header className="w-full max-w-6xl mx-auto bg-white/5 text-black border-b border-solid border-gray-100" >
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
              placeholder="Pesquisar receitas..."
              className="px-3 py-1 rounded-xl bg-white w-52"
            />
          </div>
          <button className="bg-white text-gray-600 px-3 py-1 rounded-md">Entrar</button>
        </div>
      </div>
    </header>
  )
}

export default Header
