import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Patients = lazy(() => import('./pages/Patients'))
const PatientDetail = lazy(() => import('./pages/PatientDetail'))
const Appointments = lazy(() => import('./pages/Appointments'))
const Treatments = lazy(() => import('./pages/Treatments'))
const Billing = lazy(() => import('./pages/Billing'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Login'))

function AppLayout() {
  const { loadSettings, isAuthenticated, onTokenExpired } = useApp()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { loadSettings() }, [loadSettings])

  // Listen for JWT expiry events from api.js
  useEffect(() => {
    window.addEventListener('cms:session-expired', onTokenExpired)
    return () => window.removeEventListener('cms:session-expired', onTokenExpired)
  }, [onTokenExpired])

  // Close sidebar on navigate (on mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const navigate = useNavigate()

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault()
            navigate('/patients')
            setTimeout(() => window.dispatchEvent(new Event('cms:open-add-patient')), 50)
            break
          case 'b':
            e.preventDefault()
            navigate('/billing')
            break
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Backdrop for mobile view */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
            <Routes>
              <Route path="/"              element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"     element={<Dashboard />} />
              <Route path="/patients"      element={<Patients />} />
              <Route path="/patients/:id"  element={<PatientDetail />} />
              <Route path="/appointments"  element={<Appointments />} />
              <Route path="/treatments"    element={<Treatments />} />
              <Route path="/billing"       element={<Billing />} />
              <Route path="/settings"      element={<Settings />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </HashRouter>
  )
}
