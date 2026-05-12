import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useAuth } from './AuthContext'
import Topbar from './Topbar'

export default function AlunaView() {
  const { profile } = useAuth()
  const [presencas, setPresencas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) fetchPresencas()
  }, [profile])

  async function fetchPresencas() {
    const { data } = await supabase
      .from('presencas')
      .select('*')
      .eq('aluna_id', profile.id)
      .order('data', { ascending: false })
      .limit(20)
    setPresencas(data || [])
    setLoading(false)
  }

  const mes = new Date()
  const mesNome = mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const mesKey = `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}`
  const presencasMes = presencas.filter(p => p.data?.startsWith(mesKey))

  const isPago = profile?.pagamento_status === 'pago'
  const isMensalista = profile?.tipo === 'mensalista'

  return (
    <div>
      <Topbar />
      <div className="page">

        {/* Status card */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>Olá,</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{profile?.nome?.split(' ')[0]} 👋</div>
            </div>
            {isPago
              ? <span className="badge badge-green">Ativa</span>
              : <span className="badge badge-amber">Pendente</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Plano</div>
              <div style={{ fontSize: 15, fontWeight: 600, textTransform: 'capitalize' }}>{profile?.tipo || '—'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{isMensalista ? '$50/mês' : '$20/aula'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Presenças em {new Date().toLocaleDateString('pt-BR', { month: 'short' })}</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{presencasMes.length} aulas</div>
            </div>
          </div>

          {!isPago && (
            <div style={{ background: 'var(--amber-light)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13, color: 'var(--amber-dark)' }}>
              ⚠️ Pagamento de {mesNome} pendente. Faça o e-transfer abaixo.
            </div>
          )}

          {isPago && (
            <div style={{ background: 'var(--green-light)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13, color: 'var(--green-dark)' }}>
              ✓ Pagamento de {mesNome} confirmado. Bora dançar! 💃
            </div>
          )}
        </div>

        {/* Planos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div className="card" style={{ border: isMensalista ? '2px solid var(--pink-mid)' : '1px solid var(--border)', background: isMensalista ? 'var(--pink-light)' : 'var(--white)' }}>
            {isMensalista && <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--pink-dark)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Seu plano</div>}
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Mensalidade</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: isMensalista ? 'var(--pink-dark)' : 'var(--text)' }}>$50</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>aulas ilimitadas</div>
          </div>
          <div className="card" style={{ border: !isMensalista ? '2px solid var(--pink-mid)' : '1px solid var(--border)', background: !isMensalista ? 'var(--pink-light)' : 'var(--white)' }}>
            {!isMensalista && <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--pink-dark)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Seu plano</div>}
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Avulsa</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: !isMensalista ? 'var(--pink-dark)' : 'var(--text)' }}>$20</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>por aula</div>
          </div>
        </div>

        {/* Pagamento */}
        <div className="card" style={{ background: 'var(--amber-light)', border: '1px solid #F0C978', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--amber-dark)', marginBottom: 10 }}>💳 Como pagar</div>
          <div style={{ fontSize: 13, color: '#633806', marginBottom: 4 }}>
            Via e-transfer para <strong>p.casabrasil@gmail.com</strong>
          </div>
          <div style={{ fontSize: 13, color: '#633806', marginBottom: 8 }}>
            Senha: <strong>dancaraina</strong>
          </div>
          <div style={{ fontSize: 12, color: '#854F0B' }}>
            Após o pagamento, a professora confirma em até 24h.
          </div>
        </div>

        {/* Histórico */}
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Histórico de presenças</div>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Carregando...</div>
          ) : presencas.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              Nenhuma presença registrada ainda.
            </div>
          ) : (
            <div>
              {presencas.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, flex: 1 }}>
                    {new Date(p.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--green-dark)', background: 'var(--green-light)', padding: '2px 8px', borderRadius: 20 }}>presente</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
