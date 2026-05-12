import { useAuth } from './AuthContext'

export default function Topbar() {
  const { profile, signOut } = useAuth()

  return (
    <div className="topbar">
      <div className="logo">
        <div className="logo-dot" />
        Projeto Casa Brasil - Dança
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {profile && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {profile.nome}
          </span>
        )}
        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 13 }} onClick={signOut}>
          Sair
        </button>
      </div>
    </div>
  )
}
