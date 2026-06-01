import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronLeft, ChevronRight, Search, Trash2, Clock } from 'lucide-react'
import {
  getAppointmentsByDate, addAppointment,
  updateAppointmentStatus, deleteAppointment,
  getAllPatients, searchPatients,
} from '../services/api'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'

const STATUSES = ['waiting', 'in-progress', 'done', 'cancelled']
const STATUS_LABELS = { waiting: 'Waiting', 'in-progress': 'In Progress', done: 'Done', cancelled: 'Cancelled' }
const STATUS_COLORS = { waiting: 'badge-waiting', 'in-progress': 'badge-progress', done: 'badge-done', cancelled: 'badge-cancelled' }
const STATUS_BG = {
  waiting:       'bg-amber-50 border-l-4 border-amber-400',
  'in-progress': 'bg-blue-50 border-l-4 border-blue-500',
  done:          'bg-emerald-50 border-l-4 border-emerald-400',
  cancelled:     'bg-slate-50 border-l-4 border-slate-300',
}

function dateStr(d) { return d.toISOString().split('T')[0] }
function fmtDate(s) {
  return new Date(s + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}
const TIMES = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
               '12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30',
               '16:00','16:30','17:00','17:30','18:00','18:30','19:00']

export default function Appointments() {
  const { notify } = useApp()
  const navigate = useNavigate()
  const [date, setDate] = useState(dateStr(new Date()))
  const [appointments, setAppointments] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [form, setForm] = useState({ scheduled_time: '', reason: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const data = await getAppointmentsByDate(date)
    setAppointments(data)
  }, [date])

  useEffect(() => { load() }, [load])

  // Patient search within modal
  useEffect(() => {
    if (!showAdd) return
    const t = setTimeout(async () => {
      const data = patientSearch.trim()
        ? await searchPatients(patientSearch)
        : await getAllPatients()
      setPatients(data.slice(0, 20))
    }, 250)
    return () => clearTimeout(t)
  }, [patientSearch, showAdd])

  function prevDay() { const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate()-1); setDate(dateStr(d)) }
  function nextDay() { const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate()+1); setDate(dateStr(d)) }
  function today()   { setDate(dateStr(new Date())) }

  function openAdd() {
    setPatientSearch('')
    setSelectedPatient(null)
    setForm({ scheduled_time: '', reason: '', notes: '' })
    setShowAdd(true)
  }

  async function handleAdd() {
    if (!selectedPatient) { notify('Select a patient', 'error'); return }
    setSaving(true)
    try {
      await addAppointment({
        patient_id: selectedPatient.id,
        scheduled_date: date,
        scheduled_time: form.scheduled_time,
        reason: form.reason,
        notes: form.notes,
      })
      notify(`Appointment added for ${selectedPatient.name}`)
      setShowAdd(false)
      load()
    } finally { setSaving(false) }
  }

  async function handleStatus(id, status) {
    await updateAppointmentStatus(id, status)
    notify(`Updated to ${STATUS_LABELS[status]}`)
    load()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this appointment?')) return
    await deleteAppointment(id)
    notify('Appointment deleted')
    load()
  }

  const isToday = date === dateStr(new Date())

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Date Nav */}
      <div className="card flex items-center gap-4">
        <button onClick={prevDay} className="btn-icon"><ChevronLeft size={18} /></button>
        <div className="flex-1 text-center">
          <p className="font-bold text-slate-800">{fmtDate(date)}</p>
          {isToday && <span className="text-xs text-primary-600 font-semibold">Today</span>}
        </div>
        <button onClick={nextDay} className="btn-icon"><ChevronRight size={18} /></button>
        {!isToday && (
          <button onClick={today} className="btn-secondary text-xs">Today</button>
        )}
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="input w-auto text-sm"
          id="date-picker"
        />
        <button id="btn-add-appt" onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 text-sm">
        {STATUSES.map(s => {
          const count = appointments.filter(a => a.status === s).length
          if (count === 0) return null
          return (
            <span key={s} className={`${STATUS_COLORS[s]} px-3 py-1`}>
              {count} {STATUS_LABELS[s]}
            </span>
          )
        })}
      </div>

      {/* List */}
      {appointments.length === 0 ? (
        <div className="empty-state">
          <Clock size={48} className="mb-3 opacity-20" />
          <p className="font-semibold">No appointments for this day</p>
          <button onClick={openAdd} className="btn-primary mt-4"><Plus size={16} /> Add Appointment</button>
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map((a) => (
            <div key={a.id} className={`card ${STATUS_BG[a.status]} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Queue number */}
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center font-bold text-lg text-slate-700 flex-shrink-0">
                  {a.queue_number}
                </div>

                {/* Patient info */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => navigate(`/patients/${a.patient_id}`)}
                    className="font-bold text-slate-800 hover:text-primary-600 transition-colors text-left"
                  >
                    {a.patient_name}
                  </button>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {a.scheduled_time && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={11} /> {a.scheduled_time}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{a.patient_phone}</span>
                    {a.patient_age && <span className="text-xs text-slate-400">{a.patient_age}y</span>}
                  </div>
                  {a.reason && <p className="text-xs text-slate-500 mt-1">{a.reason}</p>}
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-slate-100/50 pt-3 sm:border-t-0 sm:pt-0">
                <span className={STATUS_COLORS[a.status]}>{STATUS_LABELS[a.status]}</span>

                <div className="flex gap-2 flex-shrink-0">
                  {a.status === 'waiting' && (
                    <button
                      id={`btn-start-${a.id}`}
                      onClick={() => handleStatus(a.id, 'in-progress')}
                      className="btn-secondary text-xs bg-blue-600 text-white border-blue-600 hover:bg-blue-700 px-3 py-1.5 h-auto min-h-0"
                    >
                      Start
                    </button>
                  )}
                  {a.status === 'in-progress' && (
                    <button
                      id={`btn-done-${a.id}`}
                      onClick={() => handleStatus(a.id, 'done')}
                      className="btn-secondary text-xs bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 px-3 py-1.5 h-auto min-h-0"
                    >
                      ✓ Done
                    </button>
                  )}
                  {a.status !== 'done' && a.status !== 'cancelled' && (
                    <button
                      onClick={() => handleStatus(a.id, 'cancelled')}
                      className="btn-ghost text-xs text-slate-400 px-2 py-1 h-auto min-h-0"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    id={`btn-del-appt-${a.id}`}
                    onClick={() => handleDelete(a.id)}
                    className="btn-icon text-slate-300 hover:text-red-500 p-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="New Appointment"
        size="md"
        footer={
          <>
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            <button id="btn-save-appt" onClick={handleAdd} disabled={saving || !selectedPatient} className="btn-primary">
              {saving ? 'Saving…' : 'Book Appointment'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-primary-50 rounded-2xl px-4 py-3 text-sm text-primary-700 font-semibold">
            📅 {fmtDate(date)}
          </div>

          {/* Patient selector */}
          {selectedPatient ? (
            <div className="flex items-center justify-between bg-primary-50 rounded-xl px-4 py-3">
              <div>
                <p className="font-semibold text-primary-800">{selectedPatient.name}</p>
                <p className="text-xs text-primary-600">{selectedPatient.phone}</p>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="text-primary-400 hover:text-primary-700">
                ✕
              </button>
            </div>
          ) : (
            <div>
              <label className="label">Select Patient *</label>
              <div className="relative mb-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="input pl-9"
                  placeholder="Search patient by name or phone…"
                  value={patientSearch}
                  onChange={e => setPatientSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="max-h-44 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50">
                {patients.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-semibold text-slate-800 text-sm">{p.name}</span>
                    {p.phone && <span className="text-slate-400 text-xs ml-2">{p.phone}</span>}
                  </button>
                ))}
                {patients.length === 0 && (
                  <p className="px-4 py-3 text-sm text-slate-400">No patients found</p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Time</label>
              <select
                className="select"
                value={form.scheduled_time}
                onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))}
              >
                <option value="">— Walk-in —</option>
                {TIMES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Reason</label>
              <input
                className="input"
                placeholder="e.g. Checkup, Filling…"
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="textarea"
              rows={2}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
