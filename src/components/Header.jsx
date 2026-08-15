import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Clock, Menu, Wifi, WifiOff, Bell, Activity } from 'lucide-react'
import { useApp } from '../context/AppContext'

const PAGE_TITLES = {
  '/dashboard':    { title: 'Dashboard',         sub: 'Overview of your clinic today',         icon: '🏥' },
  '/patients':     { title: 'Patients',          sub: 'Search, add and manage patients',        icon: '👥' },
  '/appointments': { title: 'Appointments',      sub: 'Schedule and manage appointments',       icon: '📅' },
  '/treatments':   { title: 'Treatments',        sub: 'Record and track dental treatments',     icon: '🦷' },
  '/billing':      { title: 'Billing',           sub: 'Generate bills and track payments',      icon: '💳' },
  '/revenue':      { title: 'Revenue Insights',  sub: 'Financial performance & analytics',      icon: '📊' },
  '/consultants':  { title: 'Consultant Pay',    sub: 'Manage consultant payments',             icon: '👨‍⚕️' },
  '/treatments-master': { title: 'Treatment Master', sub: 'Manage treatment catalogue',         icon: '📋' },
  '/enquiries':    { title: 'Enquiries',         sub: 'Manage patient enquiries',               icon: '📬' },
  '/queue':        { title: 'Queue Board',       sub: 'Live patient queue',                     icon: '🔢' },
  '/settings':     { title: 'Settings',          sub: 'Clinic configuration & preferences',     icon: '⚙️' },
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
  const info = PAGE_TITLES[base] || {
    title: settings?.clinic_name || "Dr. Mahe's Dentistry",
    sub: 'Clinic Management Portal',
    icon: '🏥'
  }

  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })

  return (
    <header
      className="bg-white px-4 md:px-6 py-0 flex items-center justify-between flex-shrink-0 gap-3"
      style={{
        minHeight: '58px',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* ── Left: Menu + Title ────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu size={19} />
        </button>

        {/* Page title block */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-800 leading-tight tracking-tight truncate">
              {info.title}
            </h1>
          </div>
          {info.sub && (
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block leading-none">{info.sub}</p>
          )}
        </div>
      </div>

      {/* ── Right: Status + Time ──────────────────────── */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">

        {/* Online/Offline indicator */}
        <div className={`hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full transition-all ${
          online
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            : 'bg-rose-50 text-rose-600 border border-rose-100'
        }`}>
          {online
            ? <><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live</>
            : <><WifiOff size={11} />Offline</>
          }
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
          <Clock size={13} className="text-primary-500 flex-shrink-0" />
          <span className="font-semibold text-slate-700 tabular-nums text-xs">{timeStr}</span>
          <span className="hidden lg:inline text-slate-300">·</span>
          <span className="hidden lg:inline text-xs text-slate-500">{dateStr}</span>
        </div>

        {/* Notification bell placeholder */}
        <button
          className="hidden md:flex p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all relative"
          title="Notifications"
          id="btn-notifications"
        >
          <Bell size={17} />
        </button>
      </div>
    </header>
  )
}
