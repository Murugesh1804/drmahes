import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calendar, Activity,
  Receipt, ListOrdered, Monitor, Settings, X, LogOut,
  ShieldCheck, Inbox, TrendingUp
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/enquiries',    icon: Inbox,           label: 'Enquiries'    },
  { to: '/patients',     icon: Users,           label: 'Patients'     },
  { to: '/appointments', icon: Calendar,        label: 'Appointments' },
  { to: '/treatments',   icon: Activity,        label: 'Treatments'   },
  { to: '/billing',      icon: Receipt,         label: 'Billing'      },
  { to: '/revenue',      icon: TrendingUp,      label: 'Revenue'      },
  { to: '/consultants',  icon: ListOrdered,     label: 'Consultant Pay' },
  { to: '/treatments-master', icon: ShieldCheck, label: 'Tx Master'  },
]

export default function Sidebar({ isOpen, onClose }) {
  const { settings, logout } = useApp()

  const clinicName = settings?.clinic_name || "Dr. Mahe's Dentistry"
  const initials = clinicName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('')

  return (
    <>
      {/* Backdrop overlay (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-50
          flex flex-col w-60 flex-shrink-0 h-full
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          background: 'linear-gradient(180deg, #111111 0%, #1a1a1a 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* ── Logo & Clinic Name ─────────────────────────── */}
        <div className="px-4 py-5 border-b border-white/8 flex items-center justify-between gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center min-w-0">
            <img
              src="/logo_black.webp"
              className="h-15 w-auto object-contain"
              alt="Logo"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="md:hidden text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation ─────────────────────────────────── */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-3"
            style={{ color: '#334155' }}>
            Main Menu
          </p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => onClose?.()}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ── Bottom Actions ──────────────────────────────── */}
        <div className="px-3 pb-5 pt-3 space-y-0.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2"
            style={{ color: '#334155' }}>
            System
          </p>
          <NavLink
            to="/settings"
            onClick={() => onClose?.()}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Settings size={16} strokeWidth={2} />
            <span>Settings</span>
          </NavLink>

          <button
            id="btn-logout"
            onClick={() => {
              if (confirm('Log out of CMS portal?')) logout()
            }}
            className="nav-item w-full text-left border-0 bg-transparent"
            style={{ color: 'rgba(251,113,133,0.7)' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(244,63,94,0.08)'
              e.currentTarget.style.color = '#fda4af'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = ''
              e.currentTarget.style.color = 'rgba(251,113,133,0.7)'
            }}
          >
            <LogOut size={16} strokeWidth={2} />
            <span>Log Out</span>
          </button>

          {/* Security badge */}
          <div className="flex items-center gap-2 px-3 pt-3 mt-1"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={10} className="text-emerald-400" />
            </div>
            <span className="text-[10px] font-medium" style={{ color: '#334155' }}>
              JWT Secured Session
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
