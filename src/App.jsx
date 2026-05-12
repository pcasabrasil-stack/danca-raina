import { useAuth, AuthProvider } from './AuthContext'
import Login from './Login'
import AdminDashboard from './AdminDashboard'
import AlunaView from './AlunaView'
import './index.css'

function AppContent() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#666', fontSize: 14 }}>Carregando...</div>
      </div>
    )
  }

  if (!user) return <Login />
  if (profile?.role === 'admin') return <AdminDashboard />
  if (profile?.role === 'aluna') return <AlunaView />

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#666' }}>Perfil não configurado. Contate a professora.</div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
