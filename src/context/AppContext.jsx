import { createContext, useContext, useState, useCallback } from 'react'
import { getSettings } from '../services/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [settings, setSettings] = useState({
    clinic_name: "Dr. Mahe's Dentistry",
    doctor_name: 'Dr. Mahe',
    currency: '₹',
  })
  const [notification, setNotification] = useState(null)

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('cms_auth') === 'true'
  })

  const loadSettings = useCallback(async () => {
    try {
      const s = await getSettings()
      if (s && typeof s === 'object') {
        setSettings(prev => ({ ...prev, ...s }))
      }
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
  }, [])

  const login = useCallback((password) => {
    const expected = settings?.cms_password || 'admin123'
    if (password === expected) {
      sessionStorage.setItem('cms_auth', 'true')
      setIsAuthenticated(true)
      return true
    }
    return false
  }, [settings?.cms_password])

  const logout = useCallback(() => {
    sessionStorage.removeItem('cms_auth')
    setIsAuthenticated(false)
  }, [])

  const notify = useCallback((message, type = 'success') => {
    setNotification({ message, type, id: Date.now() })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const fmt = useCallback(
    (amount) => `${settings?.currency || '₹'}${Number(amount || 0).toLocaleString('en-IN')}`,
    [settings?.currency]
  )

  return (
    <AppContext.Provider value={{ settings, loadSettings, notify, fmt, isAuthenticated, login, logout }}>
      {children}
      {notification && (
        <div
          key={notification.id}
          className={`fixed bottom-6 right-6 z-[99999] px-5 py-3.5 rounded-2xl shadow-xl
            text-white font-semibold text-sm animate-slide-in flex items-center gap-2
            ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}
        >
          {notification.type === 'success' ? '✓' : '✕'} {notification.message}
        </div>
      )}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
