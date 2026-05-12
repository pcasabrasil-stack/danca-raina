import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Topbar from './Topbar'

const AVATAR_COLORS = [
  { bg: '#EFF6FF', color: '#1D4ED8' },
  { bg: '#E1F5EE', color: '#0F6E56' },
  { bg: '#FAEEDA', color: '#854F0B' },
  { bg: '#E6F1FB', color: '#185FA5' },
  { bg: '#EAF3DE', color: '#3B6D11' },
]

function initials(nome) {
  return nome?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?'
}

function avatarColor(nome) {
  const idx = (nome?.charCodeAt(0) || 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

function statusBadge(aluna) {
  if (aluna.tipo === 'avulsa') return <span className="badge badge-pink">Avulsa</span>
  if (aluna.pagamento_status === 'pago') return <span className="badge badge-green">Pago</span>
  if (aluna.pagamento_status === 'pendente') return <span className="badge badge-amber">Pendente</span>
  return <span className="badge badge-gray">—</span>
}

function mesAtual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function AdminDashboard() {
  const [alunas, setAlunas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAluna, setSelectedAluna] = useState(null)
  const [presencas, setPresencas] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showPresencaModal, setShowPresencaModal] = useState(false)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ nome: '', email: '', tipo: 'mensalista', senha: '' })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const mes = mesAtual()

  useEffect(() => { fetchAlunas() }, [])

  async function fetchAlunas() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'aluna')
      .order('nome')
    setAlunas(data || [])
    setLoading(false)
  }

  async function selectAluna(aluna) {
    if (selectedAluna?.id === aluna.id) { setSelectedAluna(null); return }
    setSelectedAluna(aluna)
    const { data } = await supabase
      .from('presencas')
      .select('*')
      .eq('aluna_id', aluna.id)
      .gte('data', mes + '-01')
      .order('data')
    setPresencas(data || [])
  }

  async function confirmarPagamento(aluna) {
    await supabase
      .from('profiles')
      .update({ pagamento_status: 'pago', pagamento_mes: mes })
      .eq('id', aluna.id)
    showToast('Pagamento confirmado! ✓')
    fetchAlunas()
    if (selectedAluna?.id === aluna.id) setSelectedAluna({ ...aluna, pagamento_status: 'pago', pagamento_mes: mes })
  }

  async function marcarPresenca(alunaId) {
    const hoje = new Date().toISOString().split('T')[0]
    const { error } = await supabase.from('presencas').upsert(
      { aluna_id: alunaId, data: hoje },
      { onConflict: 'aluna_id,data' }
    )
    if (!error) {
      showToast('Presença marcada! ✓')
      if (selectedAluna?.id === alunaId) {
        const { data } = await supabase.from('presencas').select('*').eq('aluna_id', alunaId).gte('data', mes + '-01').order('data')
        setPresencas(data || [])
      }
    }
  }

  async function adicionarAluna(e) {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: form.email,
      password: form.senha,
      email_confirm: true,
    })
    if (authError) {
      // Fallback: use signUp if admin API not available
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.senha,
      })
      if (signUpError) { setFormError(signUpError.message); setFormLoading(false); return }
      const userId = signUpData.user?.id
      if (userId) {
        await supabase.from('profiles').upsert({
          id: userId,
          nome: form.nome,
          email: form.email,
          role: 'aluna',
          tipo: form.tipo,
          pagamento_status: 'pendente',
        })
      }
    } else {
      const userId = authData.user?.id
      if (userId) {
        await supabase.from('profiles').upsert({
          id: userId,
          nome: form.nome,
          email: form.email,
          role: 'aluna',
          tipo: form.tipo,
          pagamento_status: 'pendente',
        })
      }
    }
    showToast('Aluna adicionada! ✓')
    setShowModal(false)
    setForm({ nome: '', email: '', tipo: 'mensalista', senha: '' })
    fetchAlunas()
    setFormLoading(false)
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  async function aprovarAluna(aluna) {
    await supabase.from('profiles').update({ aprovada: true }).eq('id', aluna.id)
    showToast('Aluna aprovada! ✓')
    fetchAlunas()
  }

  async function recusarAluna(aluna) {
    await supabase.from('profiles').delete().eq('id', aluna.id)
    showToast('Cadastro removido.')
    fetchAlunas()
  }

  const novas = alunas.filter(a => a.aprovada === false)
  const ativas = alunas.filter(a => a.aprovada !== false)
  const pagas = ativas.filter(a => a.pagamento_status === 'pago').length
  const totalRecebido = pagas * 50 + ativas.filter(a => a.tipo === 'avulsa').length * 20

  return (
    <div>
      <Topbar />

      {toast && (
        <div style={{
          position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--green-light)', color: 'var(--green-dark)',
          border: '1px solid #9FE1CB', borderRadius: 'var(--radius-sm)',
          padding: '10px 20px', fontWeight: 500, fontSize: 14, zIndex: 300,
          whiteSpace: 'nowrap', boxShadow: 'var(--shadow-md)'
        }}>
          {toast}
        </div>
      )}

      <div className="page">
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Painel do Admin</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{alunas.length}</div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Pagaram</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--green-dark)' }}>{pagas}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>/{alunas.length}</span></div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Recebido</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>${totalRecebido}</div>
          </div>
        </div>

        {/* Novas alunas aguardando aprovacao */}
        {novas.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: '#FAEEDA', color: '#854F0B', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{novas.length}</span>
              Aguardando aprovação
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {novas.map(aluna => {
                const av = avatarColor(aluna.nome)
                return (
                  <div key={aluna.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1px solid #F0C978', background: '#FFFBF0' }}>
                    <div className="avatar" style={{ background: av.bg, color: av.color }}>{initials(aluna.nome)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{aluna.nome}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{aluna.email} · se cadastrou agora</div>
                    </div>
                    <button className="btn btn-green" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => aprovarAluna(aluna)}>
                      ✓ Aprovar
                    </button>
                    <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => recusarAluna(aluna)}>
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Alunas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>Alunas</h2>
          <button className="btn btn-primary" style={{ padding: '7px 14px', fontSize: 13 }} onClick={() => setShowModal(true)}>
            + Adicionar aluna
          </button>
        </div>

        {loading ? (
          <div className="loading">Carregando...</div>
        ) : ativas.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
            Nenhuma aluna cadastrada ainda.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ativas.map(aluna => {
              const av = avatarColor(aluna.nome)
              const isSelected = selectedAluna?.id === aluna.id
              return (
                <div key={aluna.id}>
                  <div
                    className="card"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      cursor: 'pointer', padding: '14px 16px',
                      border: isSelected ? '1px solid var(--pink-mid)' : '1px solid var(--border)',
                      background: isSelected ? 'var(--pink-light)' : 'var(--white)',
                      transition: 'all 0.15s'
                    }}
                    onClick={() => selectAluna(aluna)}
                  >
                    <div className="avatar" style={{ background: av.bg, color: av.color }}>
                      {initials(aluna.nome)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{aluna.nome}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{aluna.email}</div>
                    </div>
                    {statusBadge(aluna)}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-green"
                        style={{ padding: '5px 10px', fontSize: 12 }}
                        onClick={ev => { ev.stopPropagation(); marcarPresenca(aluna.id) }}
                        title="Marcar presença hoje"
                      >
                        ✓ Presença
                      </button>
                      {aluna.pagamento_status !== 'pago' && (
                        <button
                          className="btn btn-outline"
                          style={{ padding: '5px 10px', fontSize: 12, borderColor: '#9FE1CB', color: 'var(--green-dark)' }}
                          onClick={ev => { ev.stopPropagation(); confirmarPagamento(aluna) }}
                          title="Confirmar pagamento"
                        >
                          $ Pago
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Detalhe expandido */}
                  {isSelected && (
                    <div style={{ background: '#fafafa', border: '1px solid var(--pink-mid)', borderTop: 'none', borderRadius: '0 0 var(--radius) var(--radius)', padding: '16px 18px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: 14 }}>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Plano</div>
                          <div style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>{aluna.tipo}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Status pagamento</div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: aluna.pagamento_status === 'pago' ? 'var(--green-dark)' : 'var(--amber-dark)' }}>
                            {aluna.pagamento_status === 'pago' ? `Pago — ${aluna.pagamento_mes}` : 'Pendente'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Presenças no mês</div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{presencas.length} aulas</div>
                        </div>
                      </div>

                      {presencas.length > 0 && (
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Datas presentes</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {presencas.map(p => (
                              <span key={p.id} style={{ fontSize: 12, background: 'var(--green-light)', color: 'var(--green-dark)', padding: '3px 10px', borderRadius: 20 }}>
                                {new Date(p.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {aluna.pagamento_status !== 'pago' && (
                        <button
                          className="btn btn-green"
                          style={{ width: '100%', marginTop: 14, padding: 10 }}
                          onClick={() => confirmarPagamento(aluna)}
                        >
                          ✓ Confirmar pagamento de {aluna.tipo === 'avulsa' ? '$20' : '$50'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal adicionar aluna */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Adicionar aluna</div>
            {formError && <div className="error-msg" style={{ marginBottom: 12 }}>{formError}</div>}
            <form onSubmit={adicionarAluna}>
              <div className="form-group">
                <label className="form-label">Nome completo</label>
                <input className="input" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required placeholder="Nome da aluna" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="email@exemplo.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Senha inicial</label>
                <input className="input" type="password" value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} required placeholder="Mínimo 6 caracteres" minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo de plano</label>
                <select className="input" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                  <option value="mensalista">Mensalista ($50/mês)</option>
                  <option value="avulsa">Avulsa ($20/aula)</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
