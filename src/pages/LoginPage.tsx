import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError('Preencha e-mail e senha')
      return
    }

    // fake login: store user in localStorage
    try {
      localStorage.setItem('user', JSON.stringify({ email }))
      navigate('/')
    } catch (err) {
      setError('Erro ao salvar sessão')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center  p-4">
    <h1 className="font-noto-serif p-5 mb-2 text-4xl font-bold text-orange-500">Papo de Panela</h1>
    <p className="text-gray-500 mb-10 text-center">Bem-vindo de volta! Por favor, entre com suas credenciais.</p>
      <div className="w-full max-w-md bg-gray-100 rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-4 text-black">Entrar</h2>
        <p className="text-gray-600 mb-4">Faça login para acessar suas receitas.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded-xl bg-white text-black"
              placeholder="seu@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded-xl bg-white text-black"
              placeholder="Senha"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-between">
            <Button variant="link" onClick={() => navigate('/')}>Voltar</Button>
            <Button type="submit">Entrar</Button>
          </div>
          
        </form>
      </div>
      <p className="text-gray-500 m-4">Cadastre-se</p>
    </div>
  )
}
