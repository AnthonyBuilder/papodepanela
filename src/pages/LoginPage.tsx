import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import SpinnerEmpty from '@/components/SpinnerEmpty'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, signup, error: authError } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Preencha e-mail e senha')
      return
    }

    if (isSignup && !displayName) {
      setError('Preencha o nome')
      return
    }

    setLoading(true)
    try {
      if (isSignup) {
        await signup(email, password, displayName)
      } else {
        await login(email, password)
      }
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Erro ao processar requisição')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <SpinnerEmpty />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center">
        <div className="font-noto-serif w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg mb-4">
          P
        </div>
        <h1 className="font-noto-serif text-4xl font-bold text-gray-800">Papo de Panela</h1>
      </div>
      
      <p className="text-gray-500 mb-10 text-center max-w-md">
        {isSignup ? 'Crie uma conta para começar' : 'Bem-vindo de volta! Por favor, entre com suas credenciais.'}
      </p>
      <div className="w-full max-w-md bg-gray-100 rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-4 text-black">{isSignup ? 'Cadastrar' : 'Entrar'}</h2>
        <p className="text-gray-600 mb-4">
          {isSignup ? 'Crie uma conta para acessar suas receitas.' : 'Faça login para acessar suas receitas.'}
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-sm text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border px-3 py-2 rounded-xl bg-white text-black"
                placeholder="Seu nome"
              />
            </div>
          )}

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

          {(error || authError) && (
            <div className="text-sm text-red-600">{error || authError}</div>
          )}

          <div className="flex items-center justify-between">
            <Button variant="link" onClick={() => navigate('/')}>
              Voltar
            </Button>
            <Button type="submit" disabled={loading}>
              {isSignup ? 'Cadastrar' : 'Entrar'}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-300">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="w-full text-center text-sm text-blue-600 hover:underline"
          >
            {isSignup ? 'Já tem conta? Entre aqui' : 'Não tem conta? Cadastre-se aqui'}
          </button>
        </div>
      </div>
    </div>
  )
}
