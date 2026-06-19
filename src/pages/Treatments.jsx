import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Search, Activity } from 'lucide-react'
import {
  getTodayAppointments, getAppointmentsByDate,
  getTreatmentsByAppointment, addTreatment, deleteTreatment,
} from '../services/api'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import { clinicDateString } from '../utils/date'

const TREATMENT_TYPES = [
  'Checkup', 'Cleaning', 'Scaling', 'Filling', 'Extraction',
  'Root Canal (RCT)', 'Crown', 'Bridge', 'Denture', 'Implant',
  'Orthodontic', 'Whitening', 'X-Ray', 'Fluoride', 'Other',
]

const TEETH = [
  { label: 'Upper Right', teeth: ['18','17','16','15','14','13','12','11'] },
  { label: 'Upper Left',  teeth: ['21','22','23','24','25','26','27','28'] },
  { label: 'Lower Left',  teeth: ['31','32','33','34','35','36','37','38'] },
  { label: 'Lower Right', teeth: ['48','47','46','45','44','43','42','41'] },
]

const EMPTY_FORM = {
  treatment_type: 'Checkup', tooth_number: '',
  description: '', cost: '', doctor_notes: '',
}

export default function Treatments() {
  const { notify, fmt } = useApp()
  const navigate = useNavigate()
  const [date, setDate] = useState(clinicDateString())
  const [appointments, setAppointments] = useState([])
  const [selectedAppt, setSelectedAppt] = useState(null)
  const [treatments, setTreatments] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const loadAppointments = useCallback(async () => {
    try {
      const data = await getAppointmentsByDate(date)
      const list = data || []
      setAppointments(list.filter(a => a.status !== 'cancelled'))
      if (list.length > 0 && !selectedAppt) {
        const first = list[0]
        setSelectedAppt(first)
      }
    } catch (e) {
      console.error(e)
      setAppointments([])
    }
  }, [date, selectedAppt])

  const loadTreatments = useCallback(async () => {
    if (!selectedAppt) { setTreatments([]); return }
    try {
      const data = await getTreatmentsByAppointment(selectedAppt.id)
      setTreatments(data || [])
    } catch (e) {
      console.error(e)
      setTreatments([])
    }
  }, [selectedAppt])

  useEffect(() => { loadAppointments() }, [loadAppointments])
  useEffect(() => { loadTreatments() }, [loadTreatments])

  async function handleAdd() {
    if (!selectedAppt) { notify('Select an appointment first', 'error'); return }
    if (!form.treatment_type) { notify('Select treatment type', 'error'); return }
    setSaving(true)
    try {
      await addTreatment({
        patient_id: selectedAppt.patient_id,
        appointment_id: selectedAppt.id,
        treatment_type: form.treatment_type,
        tooth_number: form.tooth_number,
        description: form.description,
        cost: parseFloat(form.cost) || 0,
        doctor_notes: form.doctor_notes,
      })
      notify('Treatment recorded')
      setShowAdd(false)
      setForm(EMPTY_FORM)
      loadTreatments()
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this treatment?')) return
    await deleteTreatment(id)
    notify('Treatment deleted')
    loadTreatments()
  }

  const total = treatments.reduce((s, t) => s + (t.cost || 0), 0)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Date selector */}
      <div className="flex items-center gap-3">
        <label className="label mb-0 flex-shrink-0">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => { setDate(e.target.value); setSelectedAppt(null) }}
          className="input w-auto"
          id="tx-date-picker"
        />
        <span className="text-sm text-slate-400">{appointments.length} appointment(s)</span>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Appointment list */}
        <div className="col-span-4 space-y-2">
          <h3 className="font-semibold text-slate-700 text-sm">Appointments</h3>
          {appointments.length === 0 ? (
            <div className="card text-center py-8 text-slate-400 text-sm">No appointments for this day</div>
          ) : (
            appointments.map(a => (
              <button
                key={a.id}
                onClick={() => setSelectedAppt(a)}
                id={`appt-btn-${a.id}`}
                className={`w-full text-left card-hover transition-all ${
                  selectedAppt?.id === a.id
                    ? 'ring-2 ring-primary-400 shadow-md border-primary-200'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                    {a.queue_number}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{a.patient_name}</p>
                    <p className="text-xs text-slate-400">{a.scheduled_time || 'Walk-in'} · {a.status}</p>
                    {a.reason && <p className="text-xs text-slate-500 truncate">{a.reason}</p>}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Treatment records */}
        <div className="col-span-8 space-y-4">
          {selectedAppt ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">{selectedAppt.patient_name}</h3>
                  <button
                    onClick={() => navigate(`/patients/${selectedAppt.patient_id}`)}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    View full profile →
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {treatments.length > 0 && (
                    <span className="font-bold text-slate-800">{fmt(total)}</span>
                  )}
                  <button
                    id="btn-add-treatment"
                    onClick={() => { setForm(EMPTY_FORM); setShowAdd(true) }}
                    className="btn-primary"
                  >
                    <Plus size={16} /> Add Treatment
                  </button>
                </div>
              </div>

              {treatments.length === 0 ? (
                <div className="card empty-state py-16">
                  <Activity size={40} className="mb-3 opacity-20" />
                  <p className="font-semibold">No treatments yet</p>
                  <button onClick={() => setShowAdd(true)} className="btn-primary mt-4">
                    <Plus size={16} /> Add First Treatment
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {treatments.map(t => (
                    <div key={t.id} className="card flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-primary-100 text-primary-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                            {t.treatment_type}
                          </span>
                          {t.tooth_number && (
                            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded-lg">
                              Tooth #{t.tooth_number}
                            </span>
                          )}
                          <span className="ml-auto font-bold text-slate-800">{fmt(t.cost)}</span>
                        </div>
                        {t.description && (
                          <p className="text-sm text-slate-600 mt-1.5">{t.description}</p>
                        )}
                        {t.doctor_notes && (
                          <p className="text-xs text-slate-400 mt-1 italic">{t.doctor_notes}</p>
                        )}
                      </div>
                      <button
                        id={`btn-del-tx-${t.id}`}
                        onClick={() => handleDelete(t.id)}
                        className="btn-icon text-slate-300 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="card bg-slate-800 text-white flex items-center justify-between">
                    <span className="font-semibold">Total Treatment Cost</span>
                    <span className="text-2xl font-bold">{fmt(total)}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card empty-state py-24">
              <Activity size={40} className="mb-3 opacity-20" />
              <p className="font-semibold">Select an appointment</p>
              <p className="text-sm mt-1">Choose an appointment from the left to view or add treatments</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Treatment Modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Treatment"
        size="md"
        footer={
          <>
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            <button id="btn-save-tx" onClick={handleAdd} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save Treatment'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Treatment Type *</label>
            <select className="select" value={form.treatment_type} onChange={set('treatment_type')}>
              {TREATMENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Tooth selector */}
          <div>
            <label className="label">Tooth Number (optional)</label>
            <div className="space-y-2">
              {TEETH.map(({ label, teeth }) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 mb-1">{label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {teeth.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, tooth_number: f.tooth_number === t ? '' : t }))}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-all
                          ${form.tooth_number === t
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {form.tooth_number && (
              <p className="text-xs text-primary-600 mt-2 font-semibold">Selected: Tooth #{form.tooth_number}</p>
            )}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="textarea"
              rows={2}
              placeholder="Procedure details…"
              value={form.description}
              onChange={set('description')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Cost (₹)</label>
              <input
                className="input"
                type="number"
                min="0"
                step="50"
                placeholder="0"
                value={form.cost}
                onChange={set('cost')}
              />
            </div>
            <div>
              <label className="label">Doctor's Notes</label>
              <input className="input" placeholder="Internal notes…" value={form.doctor_notes} onChange={set('doctor_notes')} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
