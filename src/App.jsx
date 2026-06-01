import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientDetail from './pages/PatientDetail'
import Appointments from './pages/Appointments'
import Treatments from './pages/Treatments'
import Billing from './pages/Billing'
import Queue from './pages/Queue'
import Kiosk from './pages/Kiosk'
import Settings from './pages/Settings'
import Login from './pages/Login'

function AppLayout() {
  const { loadSettings, isAuthenticated } = useApp()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { loadSettings() }, [loadSettings])

  // Close sidebar on navigate (on mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  if (!isAuthenticated && location.pathname !== '/kiosk') {
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
          <Routes>
            <Route path="/"              element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/patients"      element={<Patients />} />
            <Route path="/patients/:id"  element={<PatientDetail />} />
            <Route path="/appointments"  element={<Appointments />} />
            <Route path="/treatments"    element={<Treatments />} />
            <Route path="/billing"       element={<Billing />} />
            <Route path="/queue"         element={<Queue />} />
            <Route path="/kiosk"         element={<Kiosk />} />
            <Route path="/settings"      element={<Settings />} />
          </Routes>
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
