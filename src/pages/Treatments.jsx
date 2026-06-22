import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Search, Activity, Calendar, Filter, X } from 'lucide-react'
import {
  getTodayAppointments, getAppointmentsByDate,
  getTreatmentsByAppointment, addTreatment, deleteTreatment,
  getTreatmentsFiltered, getAllTreatmentMasters,
} from '../services/api'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import { clinicDateString, fmtDate } from '../utils/date'

const FALLBACK_TREATMENT_TYPES = [
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

const FILTER_PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'custom', label: 'Custom' },
]

const EMPTY_FORM = {
  treatment_type: '', tooth_numbers: [],
  description: '', doctor_notes: '',
}

function getDateRange(preset) {
  const today = clinicDateString()
  const d = new Date(today + 'T00:00:00')
  switch (preset) {
    case 'today':
      return { startDate: today, endDate: today }
    case 'week': {
      const day = d.getDay()
      const mondayOffset = day === 0 ? -6 : 1 - day
      const monday = new Date(d)
      monday.setDate(d.getDate() + mondayOffset)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      return {
        startDate: clinicDateString(monday),
        endDate: clinicDateString(sunday)
      }
    }
    case 'month': {
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1)
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      return {
        startDate: clinicDateString(startOfMonth),
        endDate: clinicDateString(endOfMonth)
      }
    }
    default:
      return { startDate: today, endDate: today }
  }
}

export default function Treatments() {
  const { notify, fmt } = useApp()
  const navigate = useNavigate()

  // Appointment-based view (default)
  const [date, setDate] = useState(clinicDateString())
  const [appointments, setAppointments] = useState([])
  const [selectedAppt, setSelectedAppt] = useState(null)
  const [treatments, setTreatments] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Treatment Master (dynamic types from admin)
  const [treatmentMasters, setTreatmentMasters] = useState([])
  const [treatmentTypes, setTreatmentTypes] = useState(FALLBACK_TREATMENT_TYPES)

  // Filter mode
  const [filterPreset, setFilterPreset] = useState(null)  // null = appointment view, 'today'|'week'|'month'|'custom'
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [filteredTreatments, setFilteredTreatments] = useState([])
  const [filterLoading, setFilterLoading] = useState(false)

  // Load treatment masters for the type dropdown
  useEffect(() => {
    getAllTreatmentMasters()
      .then(masters => {
        if (masters && masters.length > 0) {
          setTreatmentMasters(masters)
          setTreatmentTypes(masters.map(m => m.treatment_name))
        }
      })
      .catch(() => {})  // Fallback to hardcoded types
  }, [])

  const loadAppointments = useCallback(async () => {
    try {
      const data = await getAppointmentsByDate(date)
      const list = data || []
      setAppointments(list.filter(a => a.status !== 'cancelled'))
      if (list.length > 0 && !selectedAppt) {
        setSelectedAppt(list[0])
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

  useEffect(() => {
    if (!filterPreset) loadAppointments()
  }, [loadAppointments, filterPreset])
  useEffect(() => { loadTreatments() }, [loadTreatments])

  // Filter-based loading
  const loadFilteredTreatments = useCallback(async (preset) => {
    setFilterLoading(true)
    try {
      let range
      if (preset === 'custom') {
        range = { startDate: customStart, endDate: customEnd }
      } else {
        range = getDateRange(preset)
      }
      if (!range.startDate || !range.endDate) { setFilterLoading(false); return }
      const data = await getTreatmentsFiltered(range)
      setFilteredTreatments(data || [])
    } catch (e) {
      console.error(e)
      setFilteredTreatments([])
    } finally { setFilterLoading(false) }
  }, [customStart, customEnd])

  useEffect(() => {
    if (filterPreset && filterPreset !== 'custom') {
      loadFilteredTreatments(filterPreset)
    }
  }, [filterPreset, loadFilteredTreatments])

  function toggleToothNumber(tooth) {
    setForm(f => {
      const nums = [...(f.tooth_numbers || [])]
      const idx = nums.indexOf(tooth)
      if (idx >= 0) {
        nums.splice(idx, 1)
      } else {
        nums.push(tooth)
      }
      return { ...f, tooth_numbers: nums }
    })
  }

  async function handleAdd() {
    if (!selectedAppt) { notify('Select an appointment first', 'error'); return }
    if (!form.treatment_type) { notify('Select treatment type', 'error'); return }
    setSaving(true)
    try {
      const selectedMaster = treatmentMasters.find(m => m.treatment_name === form.treatment_type)
      const toothCount = form.tooth_numbers && form.tooth_numbers.length > 0 ? form.tooth_numbers.length : 1
      const calculatedCost = (selectedMaster?.standard_cost || 0) * toothCount

      await addTreatment({
        patient_id: selectedAppt.patient_id,
        appointment_id: selectedAppt.id,
        treatment_type: form.treatment_type,
        tooth_numbers: form.tooth_numbers,
        description: form.description,
        cost: calculatedCost,
        doctor_notes: form.doctor_notes,
        status: 'completed'
      })
      notify('Treatment recorded')
      setShowAdd(false)
      setForm(EMPTY_FORM)
      loadTreatments()
    } catch (e) {
      console.error(e)
      notify(e.message || 'Failed to record treatment', 'error')
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this treatment?')) return
    try {
      await deleteTreatment(id)
      notify('Treatment deleted')
      loadTreatments()
    } catch (e) {
      console.error(e)
      notify(e.message || 'Failed to delete treatment', 'error')
    }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const isFilterMode = filterPreset !== null

  const displayTeeth = (t) => {
    const nums = t.tooth_numbers && t.tooth_numbers.length > 0
      ? t.tooth_numbers
      : (t.tooth_number ? t.tooth_number.split(',').map(s => s.trim()).filter(Boolean) : [])
    if (nums.length === 0) return null
    return nums.map(n => `#${n}`).join(', ')
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Filter bar */}
      <div className="card flex items-center gap-3 flex-wrap">
        <Filter size={16} className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-600 mr-1">View:</span>

        {/* Appointment view (default) */}
        <button
          onClick={() => { setFilterPreset(null); setSelectedAppt(null) }}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            !isFilterMode ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Calendar size={13} className="inline mr-1" />
          By Appointment
        </button>

        <div className="w-px h-6 bg-slate-200" />

        {FILTER_PRESETS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterPreset(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              filterPreset === key ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}

        {filterPreset === 'custom' && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="input w-auto text-sm py-1"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="input w-auto text-sm py-1"
            />
            <button
              onClick={() => loadFilteredTreatments('custom')}
              className="btn-primary py-1 px-3 text-sm"
              disabled={!customStart || !customEnd}
            >
              <Search size={13} /> Apply
            </button>
          </div>
        )}

        {isFilterMode && (
          <button
            onClick={() => { setFilterPreset(null); setSelectedAppt(null) }}
            className="ml-auto btn-ghost text-xs text-slate-400 flex items-center gap-1"
          >
            <X size={13} /> Clear Filter
          </button>
        )}
      </div>

      {/* ───────────── FILTERED VIEW ───────────── */}
      {isFilterMode && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">
              {filterPreset === 'today' ? "Today's Treatments" :
               filterPreset === 'week' ? "This Week's Treatments" :
               filterPreset === 'month' ? "This Month's Treatments" :
               "Custom Date Range"}
            </h3>
            <span className="text-sm text-slate-400">
              {filterLoading ? 'Loading…' : `${filteredTreatments.length} treatment(s)`}
            </span>
          </div>

          {filteredTreatments.length === 0 && !filterLoading ? (
            <div className="card empty-state py-16">
              <Activity size={40} className="mb-3 opacity-20" />
              <p className="font-semibold">No treatments found</p>
              <p className="text-sm mt-1">Try a different date range</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTreatments.map(t => (
                <div key={t.id} className="card flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-primary-100 text-primary-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                        {t.treatment_type}
                      </span>
                      {displayTeeth(t) && (
                        <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded-lg">
                          Teeth {displayTeeth(t)}
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        t.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        t.status === 'planned' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {t.status}
                      </span>
                      {t.cost > 0 && (
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-lg border border-emerald-100 ml-auto">
                          {fmt(t.cost)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <button
                        onClick={() => t.patient_id && navigate(`/patients/${t.patient_id}`)}
                        className="text-sm font-semibold text-primary-600 hover:underline"
                      >
                        {t.patient_name || 'Unknown Patient'}
                      </button>
                      {t.appointment_date && (
                        <span className="text-xs text-slate-400">{fmtDate(t.appointment_date)}</span>
                      )}
                    </div>
                    {t.description && (
                      <p className="text-sm text-slate-600 mt-1">{t.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────── APPOINTMENT VIEW (default) ───────────── */}
      {!isFilterMode && (
        <>
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
                      <button
                        id="btn-add-treatment"
                        onClick={() => { setForm(EMPTY_FORM); setShowAdd(true) }}
                        className="btn-primary"
                      >
                        <Plus size={16} /> Add Treatment
                      </button>
                      <button
                        onClick={() => navigate('/billing')}
                        className="btn-secondary border-primary-600 text-primary-700 hover:bg-primary-50"
                      >
                        Go to Billing →
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
                              {displayTeeth(t) && (
                                <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded-lg">
                                  Teeth {displayTeeth(t)}
                                </span>
                              )}
                              {t.cost > 0 && (
                                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg border border-emerald-100">
                                  {fmt(t.cost)}
                                </span>
                              )}
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
        </>
      )}

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
              <option value="">-- Select Treatment --</option>
              {treatmentTypes.map(t => <option key={t}>{t}</option>)}
            </select>
            {/* Live cost preview from TreatmentMaster */}
            {(() => {
              const master = treatmentMasters.find(m => m.treatment_name === form.treatment_type)
              if (!master) return null
              const count = form.tooth_numbers?.length > 0 ? form.tooth_numbers.length : 1
              const preview = master.standard_cost * count
              return (
                <p className="text-xs text-emerald-600 font-semibold mt-1">
                  Cost: {fmt(preview)}
                  {count > 1 && ` (${fmt(master.standard_cost)} × ${count} teeth)`}
                </p>
              )
            })()}
          </div>

          {/* Multi-tooth selector */}
          <div>
            <label className="label">Tooth Numbers (optional — select multiple)</label>
            <div className="space-y-2">
              {TEETH.map(({ label, teeth }) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 mb-1">{label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {teeth.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleToothNumber(t)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-all
                          ${(form.tooth_numbers || []).includes(t)
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
            {form.tooth_numbers && form.tooth_numbers.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-primary-600 font-semibold">
                  Selected: {form.tooth_numbers.map(n => `#${n}`).join(', ')}
                </p>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, tooth_numbers: [] }))}
                  className="text-xs text-slate-400 hover:text-red-500"
                >
                  Clear
                </button>
              </div>
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
          <div>
            <label className="label">Doctor's Notes</label>
            <input className="input" placeholder="Internal notes…" value={form.doctor_notes} onChange={set('doctor_notes')} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
