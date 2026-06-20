import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronLeft, ChevronRight, Search, Trash2, Clock, Lock, Unlock, CalendarX, PhoneCall, CheckCircle } from 'lucide-react'
import {
  getAppointmentsByDate, addAppointment,
  updateAppointmentStatus, deleteAppointment,
  getAllPatients, searchPatients,
  getBlockedSlots, blockSlot, unblockSlot,
  getPendingCalls, updateCallStatus
} from '../services/api'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'
import { clinicDateString, fmtDate } from '../utils/date'

const STATUSES = ['waiting', 'in-progress', 'done', 'cancelled']
const STATUS_LABELS = { waiting: 'Waiting', 'in-progress': 'In Progress', done: 'Done', cancelled: 'Cancelled' }
const STATUS_COLORS = { waiting: 'badge-waiting', 'in-progress': 'badge-progress', done: 'badge-done', cancelled: 'badge-cancelled' }
const STATUS_BG = {
  waiting:       'bg-amber-50 border-l-4 border-amber-400',
  'in-progress': 'bg-blue-50 border-l-4 border-blue-500',
  done:          'bg-emerald-50 border-l-4 border-emerald-400',
  cancelled:     'bg-slate-50 border-l-4 border-slate-300',
}

// All standard appointment slots (shown in the Slot Manager)
const ALL_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM',
  '07:00 PM', '08:00 PM', '09:00 PM',
]

const TIMES = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
               '12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30',
               '16:00','16:30','17:00','17:30','18:00','18:30','19:00']

// ── Slot Manager Component ────────────────────────────────────────────────────
function SlotManager({ date, appointments }) {
  const { notify } = useApp()
  const [blockedSlots, setBlockedSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState(null) // slot being toggled

  const loadBlocked = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getBlockedSlots(date)
      setBlockedSlots((data || []).map(r => r.slot))
    } catch (e) {
      console.error('Failed to load blocked slots:', e)
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => { loadBlocked() }, [loadBlocked])

  // Build slot statuses from both real appointments and blocked list
  const bookedSlotSet = new Set(
    appointments
      .filter(a => a.status !== 'cancelled')
      .map(a => a.scheduled_time)
      .filter(Boolean)
  )
  const blockedSet = new Set(blockedSlots)

  async function toggleSlot(slot) {
    if (bookedSlotSet.has(slot)) return // read-only if real appointment exists
    setToggling(slot)
    try {
      if (blockedSet.has(slot)) {
        await unblockSlot(date, slot)
        notify(`Slot ${slot} unblocked — now available on website`)
      } else {
        await blockSlot(date, slot, 'Walk-in / manually blocked')
        notify(`Slot ${slot} blocked — hidden from website booking`)
      }
      await loadBlocked()
    } catch (e) {
      notify(e.message || 'Failed to toggle slot', 'error')
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="card border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CalendarX size={16} className="text-primary-600" />
            Slot Manager
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Block/unblock slots for <span className="font-semibold text-slate-600">{fmtDate(date)}</span>
          </p>
        </div>
        {loading && (
          <span className="text-xs text-slate-400 animate-pulse">Loading…</span>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-3 mb-4 text-xs font-medium">
        <span className="flex items-center gap-1.5 text-emerald-600">
          <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>Available
        </span>
        <span className="flex items-center gap-1.5 text-slate-500">
          <span className="w-3 h-3 rounded-full bg-slate-400 inline-block"></span>Booked
        </span>
        <span className="flex items-center gap-1.5 text-red-500">
          <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>Blocked
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {ALL_SLOTS.map(slot => {
          const isBooked = bookedSlotSet.has(slot)
          const isBlocked = blockedSet.has(slot)
          const isToggling = toggling === slot

          let statusClass = ''
          let icon = null
          let label = 'Available'

          if (isBooked) {
            statusClass = 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
            icon = <Clock size={12} />
            label = 'Booked'
          } else if (isBlocked) {
            statusClass = 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 cursor-pointer'
            icon = <Lock size={12} />
            label = 'Blocked'
          } else {
            statusClass = 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
            icon = <Unlock size={12} />
            label = 'Available'
          }

          return (
            <button
              key={slot}
              type="button"
              disabled={isBooked || isToggling}
              onClick={() => toggleSlot(slot)}
              className={`rounded-xl border px-3 py-2.5 text-center transition-all flex flex-col items-center gap-1 ${statusClass} ${isToggling ? 'opacity-50' : ''}`}
              title={isBooked ? 'Has a real appointment' : isBlocked ? 'Click to unblock' : 'Click to block'}
            >
              <span className="font-bold text-sm">{slot}</span>
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider opacity-70">
                {isToggling ? '…' : icon}
                {isToggling ? 'Saving' : label}
              </span>
            </button>
          )
        })}
      </div>

      <p className="text-[11px] text-slate-400 mt-3 italic">
        💡 Booked slots (with real appointments) cannot be toggled here. Blocked slots are hidden from the website booking page.
      </p>
    </div>
  )
}

// ── Main Appointments Page ────────────────────────────────────────────────────
export default function Appointments() {
  const { notify } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('schedule') // 'schedule' | 'tocall'
  const [date, setDate] = useState(clinicDateString())
  const [appointments, setAppointments] = useState([])
  const [pendingCalls, setPendingCalls] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [showSlotManager, setShowSlotManager] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [form, setForm] = useState({ scheduled_time: '', reason: '', notes: '' })
  const [saving, setSaving] = useState(false)
  
  const [deleteId, setDeleteId] = useState(null)

  const load = useCallback(async () => {
    const data = await getAppointmentsByDate(date)
    setAppointments(data || [])
  }, [date])

  const loadPending = useCallback(async () => {
    const data = await getPendingCalls()
    setPendingCalls(data || [])
  }, [])

  useEffect(() => {
    if (activeTab === 'schedule') {
      load()
    } else {
      loadPending()
    }
  }, [activeTab, date, load, loadPending])

  // Patient search within modal
  useEffect(() => {
    if (!showAdd) return
    const t = setTimeout(async () => {
      const data = patientSearch.trim()
        ? await searchPatients(patientSearch)
        : await getAllPatients()
      setPatients((data || []).slice(0, 20))
    }, 250)
    return () => clearTimeout(t)
  }, [patientSearch, showAdd])

  function prevDay() { const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate()-1); setDate(clinicDateString(d)) }
  function nextDay() { const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate()+1); setDate(clinicDateString(d)) }
  function today()   { setDate(clinicDateString()) }

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
    } catch (e) {
      notify(e.message || 'Failed to add appointment', 'error')
    } finally { setSaving(false) }
  }

  async function handleStatus(id, status) {
    try {
      await updateAppointmentStatus(id, status)
      notify(`Updated to ${STATUS_LABELS[status]}`)
      load()
    } catch (e) {
      notify('Failed to update status', 'error')
    }
  }

  async function handleDeleteConfirm() {
    try {
      await deleteAppointment(deleteId)
      notify('Appointment deleted')
      load()
    } catch (e) {
      notify('Failed to delete appointment', 'error')
    } finally { setDeleteId(null) }
  }

  async function handleMarkCalled(id) {
    try {
      await updateCallStatus(id, 'called')
      notify('Appointment marked as called')
      loadPending()
    } catch (e) {
      notify('Failed to update call status', 'error')
    }
  }

  const isToday = date === clinicDateString(new Date())

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          className={`py-3 px-6 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'schedule' ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('schedule')}
        >
          Daily Schedule
        </button>
        <button
          className={`py-3 px-6 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'tocall' ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('tocall')}
        >
          To Call {pendingCalls.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">{pendingCalls.length}</span>}
        </button>
      </div>

      {activeTab === 'schedule' && (
        <div className="space-y-5 animate-fade-in">
          {/* Date Nav */}
      <div className="card flex items-center gap-4">
        <button onClick={prevDay} className="btn-icon"><ChevronLeft size={18} /></button>
        <div className="flex-1 text-center">
          <p className="font-bold text-slate-800">{fmtDate(date)}</p>
          {isToday && <span className="text-xs text-primary-600 font-semibold">Today</span>}
        </div>
        <button onClick={nextDay} className="btn-right"><ChevronRight size={18} /></button>
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
        <button
          id="btn-slot-manager"
          onClick={() => setShowSlotManager(v => !v)}
          className={`btn-secondary text-xs flex items-center gap-1.5 ${showSlotManager ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
          title="Block/unblock appointment slots for this date"
        >
          <Lock size={13} />
          {showSlotManager ? 'Hide Slots' : 'Manage Slots'}
        </button>
        <button id="btn-add-appt" onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Slot Manager Panel — toggleable */}
      {showSlotManager && (
        <SlotManager date={date} appointments={appointments} />
      )}

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
                      onClick={() => setDeleteId(a.id)} 
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
      )}

      {activeTab === 'tocall' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <PhoneCall size={18} className="text-primary-600" />
              Online Bookings - Pending Call
            </h3>
            <p className="text-sm text-slate-500">Call patients to confirm their online bookings.</p>
          </div>

          {pendingCalls.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={48} className="mb-3 text-emerald-400 opacity-50" />
              <p className="font-semibold text-slate-600">All caught up!</p>
              <p className="text-sm text-slate-400 mt-1">No pending calls for online bookings.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCalls.map((a) => (
                <div key={a.id} className="card bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => navigate(`/patients/${a.patient_id}`)}
                      className="font-bold text-slate-800 hover:text-primary-600 transition-colors text-left text-lg"
                    >
                      {a.patient_name}
                    </button>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-sm text-slate-600 font-semibold flex items-center gap-1">
                        <PhoneCall size={14} className="text-slate-400" /> {a.patient_phone}
                      </span>
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <CalendarX size={14} className="text-slate-400" /> {fmtDate(a.scheduled_date)}
                      </span>
                      {a.scheduled_time && (
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock size={14} className="text-slate-400" /> {a.scheduled_time}
                        </span>
                      )}
                    </div>
                    {a.reason && <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">{a.reason}</p>}
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleMarkCalled(a.id)}
                      className="btn-primary py-2 px-4 shadow-md bg-emerald-600 hover:bg-emerald-700 border-none"
                    >
                      <CheckCircle size={16} /> Mark as Called
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  )
}
