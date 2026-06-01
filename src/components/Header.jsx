import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Clock, Menu, Wifi, WifiOff } from 'lucide-react'
import { useApp } from '../context/AppContext'

const PAGE_TITLES = {
  '/dashboard':    { title: 'Dashboard',      sub: 'Good to see you' },
  '/patients':     { title: 'Patients',       sub: 'Search, add and manage patients' },
  '/appointments': { title: 'Appointments',   sub: 'Schedule and manage appointments' },
  '/treatments':   { title: 'Treatments',     sub: 'Record dental treatments' },
  '/billing':      { title: 'Billing',        sub: 'Generate bills and track payments' },
  '/queue':        { title: 'Queue Board',    sub: 'Live patient queue' },
  '/kiosk':        { title: 'Kiosk',          sub: 'Patient self check-in' },
  '/settings':     { title: 'Settings',       sub: 'Clinic configuration' },
}

function useNow() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])
  return now
}

function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on  = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return online
}

export default function Header({ onMenuClick }) {
  const location = useLocation()
  const now = useNow()
  const online = useOnlineStatus()
  const { settings } = useApp()

  const base = '/' + location.pathname.split('/')[1]
  const info = PAGE_TITLES[base] || { title: settings?.clinic_name || "Dr. Mahe's Dentistry", sub: '' }

  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })

  return (
    <header className="bg-white border-b border-slate-100 px-4 md:px-6 py-3.5 flex items-center justify-between flex-shrink-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu size={19} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-bold text-slate-800 leading-tight tracking-tight truncate">
            {info.title}
          </h1>
          {info.sub && (
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">{info.sub}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Online/Offline indicator */}
        <div className={`hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
          online
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-red-50 text-red-500'
        }`}>
          {online
            ? <><Wifi size={11} /> Online</>
            : <><WifiOff size={11} /> Offline</>
          }
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock size={14} className="text-slate-400 flex-shrink-0" />
          <span className="font-semibold text-slate-700 tabular-nums">{timeStr}</span>
          <span className="hidden lg:inline text-slate-300">·</span>
          <span className="hidden lg:inline text-xs">{dateStr}</span>
        </div>
      </div>
    </header>
  )
}
