import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calendar, Activity,
  Receipt, ListOrdered, Monitor, Settings, X, LogOut
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/patients',     icon: Users,           label: 'Patients'     },
  { to: '/appointments', icon: Calendar,        label: 'Appointments' },
  { to: '/treatments',   icon: Activity,        label: 'Treatments'   },
  { to: '/billing',      icon: Receipt,         label: 'Billing'      },
  { to: '/queue',        icon: ListOrdered,     label: 'Queue'        },
  { to: '/kiosk',        icon: Monitor,         label: 'Kiosk'        },
]

export default function Sidebar({ isOpen, onClose }) {
  const { settings, logout } = useApp()

  return (
    <aside
      className={`fixed md:relative inset-y-0 left-0 z-50 flex flex-col w-60 flex-shrink-0 h-full transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
      style={{ background: '#0f172a' }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            className="w-10 h-10 object-contain rounded-xl bg-white/10 p-1 flex-shrink-0"
            alt="Logo"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <div>
            <p className="text-white font-bold text-sm leading-tight line-clamp-1">
              {settings?.clinic_name || 'Dental Clinic'}
            </p>
            <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">
              {settings?.doctor_name || 'Management'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden text-slate-400 hover:text-white p-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 border-t border-white/10 pt-3 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={18} strokeWidth={2} />
          <span>Settings</span>
        </NavLink>
        <button
          id="btn-logout"
          onClick={() => {
            if (confirm('Are you sure you want to log out of the CMS portal?')) {
              logout()
            }
          }}
          className="nav-item w-full text-left bg-transparent border-0 cursor-pointer text-slate-400 hover:text-white flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-150 hover:bg-white/10 select-none"
        >
          <LogOut size={18} strokeWidth={2} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
