import { createContext, useContext, useState, useCallback } from 'react'
import { getSettings } from '../services/api'

const AppContext = createContext(null)

const DEFAULT_SETTINGS = {
  clinic_name: "Dr. Mahe's Dentistry",
  doctor_name: 'Dr. Mahe',
  currency: '₹',
}

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [notification, setNotification] = useState(null)

  // Auth state — persisted in sessionStorage (cleared when tab/browser closes)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('cms_auth') === 'true'
  })

  const loadSettings = useCallback(async () => {
    try {
      const s = await getSettings()
      if (s && typeof s === 'object') {
        // Mask cms_password — server returns '••••••••' placeholder
        setSettings(prev => ({ ...prev, ...s }))
      }
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
  }, [])

  /**
   * Login via server API — POST /api/auth/login
   * Returns true on success, false on failure.
   * Stores JWT in sessionStorage for API calls.
   */
  const login = useCallback(async (password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 429) {
          throw new Error('Too many attempts. Please wait 15 minutes.')
        }
        throw new Error(data.error || 'Invalid password')
      }

      const { token } = await res.json()
      sessionStorage.setItem('cms_token', token)
      sessionStorage.setItem('cms_auth', 'true')
      setIsAuthenticated(true)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('cms_token')
    sessionStorage.removeItem('cms_auth')
    setIsAuthenticated(false)
  }, [])

  /** Called by api.js when any request returns 401 (token expired) */
  const onTokenExpired = useCallback(() => {
    sessionStorage.removeItem('cms_token')
    sessionStorage.removeItem('cms_auth')
    setIsAuthenticated(false)
    setNotification({ message: 'Session expired. Please log in again.', type: 'error', id: Date.now() })
    setTimeout(() => setNotification(null), 3500)
  }, [])

  const notify = useCallback((message, type = 'success') => {
    setNotification({ message, type, id: Date.now() })
    setTimeout(() => setNotification(null), 3500)
  }, [])

  const fmt = useCallback(
    (amount) => `${settings?.currency || '₹'}${Number(amount || 0).toLocaleString('en-IN')}`,
    [settings?.currency]
  )

  return (
    <AppContext.Provider value={{
      settings, loadSettings,
      notify, fmt,
      isAuthenticated, login, logout, onTokenExpired,
    }}>
      {children}
      {notification && (
        <div
          key={notification.id}
          className={`fixed bottom-6 right-6 z-[99999] px-5 py-3.5 rounded-2xl shadow-xl
            text-white font-semibold text-sm flex items-center gap-2
            transition-all duration-300 animate-slide-in
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
