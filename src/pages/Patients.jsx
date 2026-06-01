import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, User, Phone, Calendar, ChevronRight, X } from 'lucide-react'
import { getAllPatients, searchPatients, addPatient } from '../services/api'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'

const GENDERS = ['Male', 'Female', 'Other']

const EMPTY_FORM = {
  name: '', phone: '', age: '', gender: 'Male',
  address: '', complaint: '', notes: '',
}

export default function Patients() {
  const navigate = useNavigate()
  const { notify } = useApp()
  const [patients, setPatients] = useState([])
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const searchRef = useRef()

  const load = useCallback(async (q = '') => {
    const data = q.trim().length >= 1
      ? await searchPatients(q)
      : await getAllPatients()
    setPatients(data || [])
  }, [])

  useEffect(() => { load() }, [load])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => load(query), 250)
    return () => clearTimeout(t)
  }, [query, load])

  function openAdd() {
    setForm(EMPTY_FORM)
    setShowAdd(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { notify('Patient name is required', 'error'); return }
    setSaving(true)
    try {
      const p = await addPatient({ ...form, age: form.age ? Number(form.age) : null })
      notify(`${p.name} added successfully`)
      setShowAdd(false)
      load(query)
    } finally {
      setSaving(false)
    }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            id="patient-search"
            ref={searchRef}
            className="search-input"
            placeholder="Search by name or phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button id="btn-add-patient" onClick={openAdd} className="btn-primary flex-shrink-0">
          <Plus size={16} /> Add Patient
        </button>
      </div>

      {/* Count */}
      <p className="text-sm text-slate-500">
        {patients.length} patient{patients.length !== 1 ? 's' : ''} found
      </p>

      {/* List */}
      {patients.length === 0 ? (
        <div className="empty-state">
          <User size={48} className="mb-3 opacity-20" />
          <p className="font-semibold text-lg">No patients found</p>
          <p className="text-sm mt-1">
            {query ? `No results for "${query}"` : 'Add your first patient to get started'}
          </p>
          {!query && (
            <button onClick={openAdd} className="btn-primary mt-4">
              <Plus size={16} /> Add Patient
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {patients.map((p) => (
            <PatientCard key={p.id} patient={p} onClick={() => navigate(`/patients/${p.id}`)} />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add New Patient"
        size="md"
        footer={
          <>
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            <button id="btn-save-patient" onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save Patient'}
            </button>
          </>
        }
      >
        <PatientForm form={form} set={set} />
      </Modal>
    </div>
  )
}

function PatientCard({ patient, onClick }) {
  const initials = patient.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const colors = ['bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700',
                  'bg-teal-100 text-teal-700', 'bg-orange-100 text-orange-700']
  const idHash = (patient.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const color = colors[idHash % colors.length]

  return (
    <div className="card-hover" onClick={onClick} id={`patient-card-${patient.id}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center font-bold text-lg flex-shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">{patient.name}</p>
          <div className="flex items-center gap-3 mt-1">
            {patient.phone && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Phone size={11} /> {patient.phone}
              </span>
            )}
            {patient.age && (
              <span className="text-xs text-slate-500">
                {patient.age}y • {patient.gender}
              </span>
            )}
          </div>
          {patient.complaint && (
            <p className="text-xs text-slate-400 mt-1 truncate">{patient.complaint}</p>
          )}
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
            {patient.appointment_count || 0} visits
          </span>
          {patient.last_visit && (
            <span className="text-xs text-slate-400">
              {new Date(patient.last_visit).toLocaleDateString('en-IN')}
            </span>
          )}
          <ChevronRight size={14} className="text-slate-300 mt-1" />
        </div>
      </div>
    </div>
  )
}

export function PatientForm({ form, set }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Full Name *</label>
          <input className="input" placeholder="Patient full name" value={form.name} onChange={set('name')} autoFocus />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" placeholder="10-digit number" value={form.phone} onChange={set('phone')} />
        </div>
        <div>
          <label className="label">Age</label>
          <input className="input" type="number" placeholder="Years" min="1" max="120" value={form.age} onChange={set('age')} />
        </div>
        <div>
          <label className="label">Gender</label>
          <select className="select" value={form.gender} onChange={set('gender')}>
            {GENDERS.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Address</label>
          <input className="input" placeholder="City / Area" value={form.address} onChange={set('address')} />
        </div>
        <div className="col-span-2">
          <label className="label">Chief Complaint</label>
          <input className="input" placeholder="e.g. Toothache, Cleaning required…" value={form.complaint} onChange={set('complaint')} />
        </div>
        <div className="col-span-2">
          <label className="label">Notes</label>
          <textarea className="textarea" rows={2} placeholder="Any medical history or allergies…" value={form.notes} onChange={set('notes')} />
        </div>
      </div>
    </div>
  )
}
