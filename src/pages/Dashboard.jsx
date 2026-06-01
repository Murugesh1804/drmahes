import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Calendar, CheckCircle2, Clock, TrendingUp,
  AlertCircle, Plus, ArrowRight, Banknote
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

export default function Dashboard() {
  const { fmt, notify } = useApp()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const [s, a] = await Promise.all([getDashboardStats(), getTodayAppointments()])
      setStats(s)
      setAppointments((a || []).slice(0, 8))
    } catch (e) {
      console.error(e)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleStatus(id, status) {
    await updateAppointmentStatus(id, status)
    notify(`Status updated to ${STATUS_LABELS[status]}`)
    load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Loading...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
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
          label="Today's Appointments"
        />
        <StatCard
          icon={<CheckCircle2 size={22} />}
          color="bg-emerald-50 text-emerald-600"
          value={stats.todayDone}
          label="Completed Today"
        />
        <StatCard
          icon={<Banknote size={22} />}
          color="bg-teal-50 text-teal-600"
          value={fmt(stats.todayRevenue)}
          label="Today's Revenue"
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
            <h2 className="font-bold text-slate-800 text-base">Today's Queue</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              id="btn-view-queue"
              onClick={() => navigate('/queue')}
              className="btn-secondary text-xs"
            >
              Full Queue <ArrowRight size={13} />
            </button>
            <button
              id="btn-add-appt"
              onClick={() => navigate('/appointments')}
              className="btn-primary text-xs"
            >
              <Plus size={14} /> Add
            </button>
          </div>
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
                            Done ✓
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
          { label: 'Add Patient',      icon: '👤', to: '/patients',     color: 'from-blue-500 to-blue-600', id: 'quick-add-patient' },
          { label: 'New Appointment',  icon: '📅', to: '/appointments', color: 'from-violet-500 to-violet-600', id: 'quick-new-appt' },
          { label: 'Create Bill',      icon: '🧾', to: '/billing',      color: 'from-emerald-500 to-emerald-600', id: 'quick-billing' },
          { label: 'Open Kiosk',       icon: '🖥️', to: '/kiosk',       color: 'from-teal-500 to-teal-600', id: 'quick-kiosk' },
        ].map(({ label, icon, to, color, id }) => (
          <button
            key={to}
            id={id}
            onClick={() => navigate(to)}
            className={`bg-gradient-to-br ${color} text-white rounded-2xl p-4 text-left
              hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
              transition-all duration-150 cursor-pointer`}
          >
            <span className="text-2xl">{icon}</span>
            <p className="font-semibold text-sm mt-2">{label}</p>
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
