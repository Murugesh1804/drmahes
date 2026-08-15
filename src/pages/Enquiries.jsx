import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, User, Phone, X, Check, Trash2, UserPlus } from 'lucide-react'
import { getAllEnquiries, searchEnquiries, addEnquiry, updateEnquiryStatus, deleteEnquiry, convertEnquiryToPatient } from '../services/api'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'
import { PatientForm } from './Patients'

const EMPTY_FORM = {
  name: '', phone: '', age: '', gender: 'Male',
  address: '', complaint: '', notes: '',
}

export default function Enquiries() {
  const navigate = useNavigate()
  const { notify } = useApp()
  const [enquiries, setEnquiries] = useState([])
  const [query, setQuery] = useState('')
  const [processing, setProcessing] = useState(null)
  const [convertingId, setConvertingId] = useState(null)
  const [deleteEnquiryId, setDeleteEnquiryId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const searchRef = useRef()

  const load = useCallback(async (q = '') => {
    const data = q.trim().length >= 2
      ? await searchEnquiries(q)
      : await getAllEnquiries('')
    setEnquiries(data || [])
  }, [])

  useEffect(() => { load() }, [load])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => load(query), 250)
    return () => clearTimeout(t)
  }, [query, load])

  async function handleStatus(id, status, e) {
    e.stopPropagation()
    setProcessing(id)
    try {
      await updateEnquiryStatus(id, status)
      notify(`Enquiry marked as ${status}`)
      load(query)
    } catch (e) {
      notify(e.message || 'Failed to update status', 'error')
    } finally {
      setProcessing(null)
    }
  }

  async function handleConvert(enquiry, e) {
    if (e) e.stopPropagation()
    setConvertingId(enquiry.id)
    try {
      const res = await convertEnquiryToPatient(enquiry.id)
      notify(`${enquiry.name} converted to registered patient!`)
      load(query)
      if (res?.patient?.id) {
        navigate(`/patients/${res.patient.id}`)
      }
    } catch (err) {
      notify(err.message || 'Failed to convert enquiry', 'error')
    } finally {
      setConvertingId(null)
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteEnquiryId) return
    setProcessing(deleteEnquiryId)
    try {
      await deleteEnquiry(deleteEnquiryId)
      notify('Enquiry deleted')
      load(query)
    } catch (e) {
      notify(e.message || 'Failed to delete enquiry', 'error')
    } finally {
      setProcessing(null)
      setDeleteEnquiryId(null)
    }
  }

  function openAdd() {
    setForm(EMPTY_FORM)
    setShowAdd(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { notify('Patient name is required', 'error'); return }
    setSaving(true)
    try {
      const p = await addEnquiry({ ...form, age: form.age ? Number(form.age) : null })
      notify(`${p.name} added as enquiry`)
      setShowAdd(false)
      load(query)
    } catch (e) {
      notify(e.message || 'Failed to add enquiry', 'error')
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
            id="enquiry-search"
            ref={searchRef}
            className="search-input"
            placeholder="Search enquiries by name or phone…"
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
        <button id="btn-add-enquiry" onClick={openAdd} className="btn-primary flex-shrink-0">
          <Plus size={16} /> Add Enquiry
        </button>
      </div>

      {/* Count */}
      <p className="text-sm text-slate-500">
        {enquiries.length} enquiri{enquiries.length !== 1 ? 'es' : 'y'} found
      </p>

      {/* List */}
      {enquiries.length === 0 ? (
        <div className="empty-state">
          <User size={48} className="mb-3 opacity-20" />
          <p className="font-semibold text-lg">No enquiries found</p>
          <p className="text-sm mt-1">
            {query ? `No results for "${query}"` : 'Manual enquiries will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {enquiries.map((p) => (
            <EnquiryCard 
              key={p.id} 
              patient={p} 
              onClick={() => {}}
              onStatus={(status, e) => handleStatus(p.id, status, e)}
              onConvert={(enq, e) => handleConvert(enq, e)}
              onDelete={(e) => {
                e.stopPropagation()
                setDeleteEnquiryId(p.id)
              }}
              isProcessing={processing === p.id}
              isConverting={convertingId === p.id}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add New Enquiry"
        size="md"
        footer={
          <>
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            <button id="btn-save-enquiry" onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save Enquiry'}
            </button>
          </>
        }
      >
        <PatientForm form={form} set={set} />
      </Modal>

      <ConfirmModal
        open={!!deleteEnquiryId}
        onClose={() => setDeleteEnquiryId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Enquiry"
        message="Are you sure you want to delete this enquiry? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  )
}

function EnquiryCard({ patient, onClick, onStatus, onConvert, onDelete, isProcessing, isConverting }) {
  const initials = patient.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const colors = ['bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700',
                  'bg-teal-100 text-teal-700', 'bg-orange-100 text-orange-700']
  const idHash = (patient.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const color = colors[idHash % colors.length]

  const statusColors = {
    'pending': 'bg-slate-100 text-slate-600 border-slate-200',
    'converted': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'non-converted': 'bg-red-100 text-red-700 border-red-200'
  }

  const statusColor = statusColors[patient.status || 'pending']

  return (
    <div className="card-hover cursor-default" onClick={onClick} id={`enquiry-card-${patient.id}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center font-bold text-lg flex-shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <p className="font-semibold text-slate-800 truncate">{patient.name}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border capitalize ${statusColor}`}>
              {patient.status || 'pending'}
            </span>
          </div>
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
      </div>
      
      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          {patient.status !== 'converted' && (
            <button
              onClick={(e) => onConvert(patient, e)}
              disabled={isProcessing || isConverting}
              className="btn-secondary text-xs py-1 px-2.5 rounded-lg text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 font-semibold transition-all"
              title="Convert to Registered Patient"
            >
              <UserPlus size={13} /> {isConverting ? 'Converting…' : 'Convert to Patient'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          {patient.status !== 'converted' && (
            <button
              onClick={(e) => onStatus('converted', e)}
              disabled={isProcessing || isConverting}
              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="Mark as converted"
            >
              <Check size={16} />
            </button>
          )}
          {patient.status !== 'non-converted' && (
            <button
              onClick={(e) => onStatus('non-converted', e)}
              disabled={isProcessing || isConverting}
              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
              title="Mark as non-converted"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onDelete}
            disabled={isProcessing || isConverting}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors ml-1"
            title="Delete enquiry"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
