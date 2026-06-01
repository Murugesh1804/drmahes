import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Clock, Menu } from 'lucide-react'

const PAGE_TITLES = {
  '/dashboard':    { title: 'Dashboard',    sub: 'Welcome back' },
  '/patients':     { title: 'Patients',     sub: 'Search, add and manage patients' },
  '/appointments': { title: 'Appointments', sub: 'Schedule and manage appointments' },
  '/treatments':   { title: 'Treatments',   sub: 'Record dental treatments' },
  '/billing':      { title: 'Billing',      sub: 'Generate bills and track payments' },
  '/queue':        { title: 'Queue Board',  sub: 'Live patient queue' },
  '/kiosk':        { title: 'Kiosk',        sub: 'Patient self-check-in' },
  '/settings':     { title: 'Settings',     sub: 'Clinic configuration' },
}

function useNow() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])
  return now
}

export default function Header({ onMenuClick }) {
  const location = useLocation()
  const now = useNow()

  // Match route with dynamic segments like /patients/:id
  const base = '/' + location.pathname.split('/')[1]
  const info = PAGE_TITLES[base] || { title: "Dr.Mahe's Dental Clinic", sub: '' }

  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })

  return (  
    <header className="bg-white border-b border-slate-100 px-4 md:px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-none">{info.title}</h1>
          {info.sub && <p className="text-xs text-slate-400 mt-1">{info.sub}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Clock size={15} className="text-slate-400" />
        <span className="font-medium">{timeStr}</span>
        <span className="hidden sm:inline text-slate-300 mx-1">·</span>
        <span className="hidden sm:inline">{dateStr}</span>
      </div>
    </header>
  )
}
