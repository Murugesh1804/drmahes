import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Calendar, CheckCircle2, Clock, TrendingUp,
  AlertCircle, Plus, Banknote, UserPlus, CalendarPlus, FileText, Monitor
} from 'lucide-react'
import { getDashboardStats, getTodayAppointments, updateAppointmentStatus } from '../services/api'
import { useApp } from '../context/AppContext'

const STATUS_COLORS = {
  waiting:     'badge-waiting',
  'in-progress': 'badge-progress',
  done:        'badge-done',
  cancelled:   'badge-cancelled',
}
const STATUS_LABELS = {
  waiting:     'Waiting',
  'in-progress': 'In Progress',
  done:        'Done',
  cancelled:   'Cancelled',
}

const DEFAULT_STATS = {
  totalPatients: 0,
  todayTotal: 0,
  todayWaiting: 0,
  todayInProgress: 0,
  todayDone: 0,
  todayRevenue: 0,
  pendingBalance: 0
}

export default function Dashboard() {
  const { fmt, notify } = useApp()
  const navigate = useNavigate()
  const [period, setPeriod] = useState('today') // 'today' | 'yesterday' | 'week'
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (p = period) => {
    try {
      const s = await getDashboardStats(`?period=${p}`)
      setStats(s || DEFAULT_STATS)

      const a = await getTodayAppointments()
      const activeAppts = (a || []).filter(item => item.status !== 'cancelled').slice(0, 8)
      setAppointments(activeAppts)
    } catch (e) {
      console.error(e)
      setStats(DEFAULT_STATS)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { load(period) }, [load, period])

  // Auto-refresh stats every 60 seconds
  useEffect(() => {
    const t = setInterval(() => load(period), 60000)
    return () => clearInterval(t)
  }, [load, period])

  async function handleStatus(id, status) {
    try {
      await updateAppointmentStatus(id, status)
      notify(`Status updated to ${STATUS_LABELS[status]}`)
      load(period)
    } catch (e) {
      notify('Failed to update status', 'error')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card flex items-center gap-4">
              <div className="skeleton w-11 h-11 rounded-xl flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="skeleton h-6 w-16 rounded-lg" />
                <div className="skeleton h-3 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-8 w-12 rounded-lg mb-2" />
              <div className="skeleton h-3 w-20 rounded-md" />
            </div>
          ))}
        </div>
        <div className="card">
          <div className="skeleton h-5 w-40 rounded-lg mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dashboard Top Header & Period Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Clinic Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          {[
            { key: 'today', label: 'Today' },
            { key: 'yesterday', label: 'Yesterday' },
            { key: 'week', label: 'This Week' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === key
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={22} />}
          color="bg-blue-50 text-blue-600"
          value={stats.totalPatients}
          label="Total Patients"
        />
        <StatCard
          icon={<Calendar size={22} />}
          color="bg-violet-50 text-violet-600"
          value={stats.todayTotal}
          label={period === 'today' ? "Today's Appointments" : period === 'yesterday' ? "Yesterday's Appointments" : "Week's Appointments"}
        />
        <StatCard
          icon={<CheckCircle2 size={22} />}
          color="bg-emerald-50 text-emerald-600"
          value={stats.todayDone}
          label={period === 'today' ? "Completed Today" : "Completed"}
        />
        <StatCard
          icon={<Banknote size={22} />}
          color="bg-teal-50 text-teal-600"
          value={fmt(stats.todayRevenue)}
          label={period === 'today' ? "Today's Revenue" : period === 'yesterday' ? "Yesterday's Revenue" : "Week's Revenue"}
          large
        />
      </div>

      {/* Queue Status */}
      <div className="grid grid-cols-3 gap-4">
        <QueueBadge
          count={stats.todayWaiting}
          label="Waiting"
          color="bg-amber-50 border-amber-200 text-amber-700"
          dot="bg-amber-400"
        />
        <QueueBadge
          count={stats.todayInProgress}
          label="In Progress"
          color="bg-blue-50 border-blue-200 text-blue-700"
          dot="bg-blue-400"
        />
        <QueueBadge
          count={stats.pendingBalance > 0 ? fmt(stats.pendingBalance) : '₹0'}
          label="Pending Balance"
          color="bg-red-50 border-red-200 text-red-700"
          dot="bg-red-400"
          large
        />
      </div>

      {/* Today's Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-800 text-base">Today's Schedule</h2>
            <p className="text-xs text-slate-400 mt-0.5">Active queue &amp; ongoing patient consultations</p>
          </div>
          <button
            id="btn-add-appt"
            onClick={() => navigate('/appointments')}
            className="btn-primary text-xs"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="empty-state">
            <Calendar size={40} className="mb-3 opacity-30" />
            <p className="font-medium">No appointments today</p>
            <p className="text-sm mt-1">Add an appointment to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient</th>
                  <th>Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {a.queue_number}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/patients/${a.patient_id}`)}
                        className="font-semibold text-slate-800 hover:text-primary-600 transition-colors text-left"
                      >
                        {a.patient_name}
                      </button>
                      <p className="text-xs text-slate-400">{a.patient_phone}</p>
                    </td>
                    <td className="text-slate-500">{a.scheduled_time || '—'}</td>
                    <td className="text-slate-500 text-xs max-w-[140px] truncate">{a.reason || '—'}</td>
                    <td>
                      <span className={STATUS_COLORS[a.status]}>{STATUS_LABELS[a.status]}</span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {a.status === 'waiting' && (
                          <button
                            id={`btn-start-${a.id}`}
                            onClick={() => handleStatus(a.id, 'in-progress')}
                            className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded-lg font-semibold transition-colors"
                          >
                            Start
                          </button>
                        )}
                        {a.status === 'in-progress' && (
                          <button
                            id={`btn-done-${a.id}`}
                            onClick={() => handleStatus(a.id, 'done')}
                            className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg font-semibold transition-colors"
                          >
                            Done
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Add Patient',      icon: UserPlus,     to: '/patients',     color: 'bg-blue-50 text-blue-600', id: 'quick-add-patient' },
          { label: 'New Appointment',  icon: CalendarPlus, to: '/appointments', color: 'bg-violet-50 text-violet-600', id: 'quick-new-appt' },
          { label: 'Create Bill',      icon: FileText,     to: '/billing',      color: 'bg-emerald-50 text-emerald-600', id: 'quick-billing' },
          { label: 'Open Kiosk',       icon: Monitor,      to: '/kiosk',        color: 'bg-teal-50 text-teal-600', id: 'quick-kiosk' },
        ].map(({ label, icon: Icon, to, color, id }) => (
          <button
            key={to}
            id={id}
            onClick={() => navigate(to)}
            className="card-hover flex items-center gap-3 text-left"
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} />
            </div>
            <p className="font-semibold text-sm text-slate-700">{label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

function StatCard({ icon, color, value, label, large }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <div className={`font-bold text-slate-800 leading-none ${large ? 'text-2xl' : 'stat-value'}`}>
          {value}
        </div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}

function QueueBadge({ count, label, color, dot, large }) {
  return (
    <div className={`card border flex items-center gap-3 ${color}`}>
      <div className={`w-2.5 h-2.5 rounded-full ${dot} flex-shrink-0`} />
      <div>
        <p className={`font-bold ${large ? 'text-xl' : 'text-2xl'}`}>{count}</p>
        <p className="text-xs font-semibold opacity-70 mt-0.5">{label}</p>
      </div>
    </div>
  )
}
