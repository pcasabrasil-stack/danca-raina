import { useState } from 'react'
import { useAuth } from './AuthContext'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [modo, setModo] = useState('login') // 'login' ou 'cadastro'
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) setError('Email ou senha incorretos.')
    setLoading(false)
  }

  async function handleCadastro(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    const { error } = await signUp(email, password, nome)
    if (error) {
      setError(error.message === 'User already registered' ? 'Este email já está cadastrado.' : 'Erro ao criar conta. Tente novamente.')
    } else {
      setSucesso('Conta criada! Aguarde a confirmação da professora para liberar seu acesso.')
    }
    setLoading(false)
  }

  function trocarModo(m) {
    setModo(m)
    setError('')
    setSucesso('')
    setNome('')
    setEmail('')
    setPassword('')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--pink)' }} />
            <span style={{ fontSize: 20, fontWeight: 700 }}>Projeto Casa Brasil - Dança</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {modo === 'login' ? 'Faça login para continuar' : 'Crie sua conta'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--gray-light)', borderRadius: 'var(--radius-sm)', padding: 4, marginBottom: 16, gap: 4 }}>
          <button
            onClick={() => trocarModo('login')}
            style={{
              flex: 1, padding: '8px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 500,
              background: modo === 'login' ? 'white' : 'transparent',
              color: modo === 'login' ? 'var(--text)' : 'var(--text-muted)',
              boxShadow: modo === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Entrar
          </button>
          <button
            onClick={() => trocarModo('cadastro')}
            style={{
              flex: 1, padding: '8px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 500,
              background: modo === 'cadastro' ? 'white' : 'transparent',
              color: modo === 'cadastro' ? 'var(--text)' : 'var(--text-muted)',
              boxShadow: modo === 'cadastro' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Criar conta
          </button>
        </div>

        <div className="card">
          {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
          {sucesso && <div className="success-msg" style={{ marginBottom: 16 }}>{sucesso}</div>}

          {modo === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Senha</label>
                <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8, padding: 12 }}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCadastro}>
              <div className="form-group">
                <label className="form-label">Nome completo</label>
                <input className="input" type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Senha</label>
                <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8, padding: 12 }}>
                {loading ? 'Criando conta...' : 'Criar minha conta'}
              </button>
            </form>
          )}
        </div>

        {modo === 'cadastro' && !sucesso && (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>
            Após o cadastro, a professora confirma seu acesso. 🩰
          </p>
        )}
      </div>
    </div>
  )
}
