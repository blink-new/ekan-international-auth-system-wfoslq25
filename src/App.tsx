import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { useAuth } from '@/hooks/useAuth'
import { LoginForm } from '@/components/auth/LoginForm'
import { AccountRequestForm } from '@/components/auth/AccountRequestForm'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import ExecutiveDashboard from '@/components/dashboard/ExecutiveDashboard'
import { UserManagement } from '@/pages/UserManagement'
import { AccountApprovals } from '@/pages/AccountApprovals'
import { SystemSettings } from '@/pages/SystemSettings'
import { CustomReports } from '@/pages/CustomReports'
import { StrategicOverview } from '@/pages/StrategicOverview'
import { StrategicApprovals } from '@/pages/StrategicApprovals'
import { MyProfile } from '@/pages/MyProfile'
import { Toaster } from '@/components/ui/toaster'

function AppContent() {
  const { user, loading } = useAuth()
  const [showRequestForm, setShowRequestForm] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading EKAN International System...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (showRequestForm) {
      return <AccountRequestForm onBackToLogin={() => setShowRequestForm(false)} />
    }
    
    return <LoginForm onRequestAccess={() => setShowRequestForm(true)} />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar className="fixed left-0 top-16 h-[calc(100vh-4rem)] border-r bg-white" />
          <main className="flex-1 ml-64 p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route 
                path="/dashboard" 
                element={
                  user.role === 'admin' ? <AdminDashboard /> :
                  user.role === 'executive' ? <ExecutiveDashboard /> :
                  <AdminDashboard />
                } 
              />
              
              {/* Admin Routes */}
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/approvals" element={<AccountApprovals />} />
              <Route path="/admin/settings" element={<SystemSettings />} />
              
              {/* Executive Routes */}
              <Route path="/executive/dashboard" element={<ExecutiveDashboard />} />
              <Route path="/executive/reports" element={<CustomReports />} />
              <Route path="/executive/strategic" element={<StrategicOverview />} />
              
              {/* Strategic Approvals */}
              <Route path="/strategic/approvals" element={<StrategicApprovals />} />
              
              {/* Common Routes */}
              <Route path="/profile" element={<MyProfile />} />
              
              {/* Fallback Routes */}
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/executive/*" element={<ExecutiveDashboard />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  )
}

export default App