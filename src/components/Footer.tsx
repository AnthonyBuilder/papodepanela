import React from 'react'
import { useLanguage } from '@/context/LanguageContext'

export default function Footer() {
  const { locale, setLocale, t } = useLanguage()

  return (
    <footer className="w-full bg-white/5 border-t border-gray-200 mt-10">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-orange-500">Papo de Panela</h4>
          <p className="text-sm text-gray-500">Receitas, dicas e inspiração — simples e saboroso.</p>
          <p className="text-xs text-gray-400 mt-2">© {new Date().getFullYear()} Papo de Panela</p>
        </div>

        <div className="text-sm text-gray-500">
          <div>Sobre: Papo de Panela é um repositório de receitas.</div>
          <div>Contato: contato@papodepanela.local</div>
        </div>

        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Idioma</label>
          <select value={locale} onChange={(e) => setLocale(e.target.value as any)} className="rounded-md px-2 py-1 text-black text-sm bg-white border border-gray-300">
            <option value="pt">Português</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>
    </footer>
  )
}
