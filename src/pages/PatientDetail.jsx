import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Edit2, Phone, MapPin, Calendar, Activity,
  Receipt, Plus, Trash2, User
} from 'lucide-react'
import {
  getPatientById, updatePatient,
  getPatientAppointments,
  getTreatmentsByPatient,
  getBillsByPatient,
  openConsentForm,
} from '../services/api'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import { PatientForm } from './Patients'

const TABS = [
  { key: 'appointments', label: 'Appointments', icon: Calendar },
  { key: 'treatments',   label: 'Treatments',   icon: Activity },
  { key: 'bills',        label: 'Bills',         icon: Receipt  },
]

const STATUS_COLORS = {
  waiting:       'badge-waiting',
  'in-progress': 'badge-progress',
  done:          'badge-done',
  cancelled:     'badge-cancelled',
}
const BILL_COLORS = {
  paid:    'badge-paid',
  partial: 'badge-partial',
  pending: 'badge-pending',
}

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify, fmt } = useApp()
  const [patient, setPatient] = useState(null)
  const [tab, setTab] = useState('appointments')
  const [appointments, setAppointments] = useState([])
  const [treatments, setTreatments] = useState([])
  const [bills, setBills] = useState([])
  const [showEdit, setShowEdit] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const load = useCallback(async () => {
    try {
      const [p, appts, txs, blls] = await Promise.all([
        getPatientById(id),
        getPatientAppointments(id),
        getTreatmentsByPatient(id),
        getBillsByPatient(id),
      ])
      if (!p) { setNotFound(true); return }
      setPatient(p)
      setForm({
        name: p.name, phone: p.phone || '', age: p.age || '',
        gender: p.gender || 'Male', address: p.address || '',
        complaint: p.complaint || '', notes: p.notes || '',
      })
      setAppointments(appts || [])
      setTreatments(txs || [])
      setBills(blls || [])
    } catch (e) {
      console.error(e)
      setNotFound(true)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleUpdate() {
    if (!form.name.trim()) { notify('Name is required', 'error'); return }
    setSaving(true)
    try {
      await updatePatient(id, { ...form, age: form.age ? Number(form.age) : null })
      notify('Patient updated')
      setShowEdit(false)
      load()
    } catch (e) {
      notify(e.message || 'Failed to update patient', 'error')
    } finally { setSaving(false) }
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
        <p className="font-semibold text-lg">Patient not found</p>
        <button onClick={() => navigate('/patients')} className="btn-primary text-sm">← Back to Patients</button>
      </div>
    )
  }

  if (!patient) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading…</div>
  }

  const initials = patient.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const totalSpent = bills.reduce((s, b) => s + b.paid_amount, 0)
  const totalPending = bills.reduce((s, b) => s + b.balance, 0)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back + Edit */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/patients')} className="btn-ghost p-2">
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm text-slate-400">Patients</span>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-700">{patient.name}</span>
        
        {patient.consentFormSaved && (
          <button
            onClick={() => openConsentForm(patient.id)}
            className="btn-secondary ml-auto text-emerald-700 border-emerald-250 bg-emerald-50/40 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5"
          >
            ✍ View Consent Form
          </button>
        )}
        
        <button
          id="btn-edit-patient"
          onClick={() => setShowEdit(true)}
          className={patient.consentFormSaved ? "btn-secondary" : "btn-secondary ml-auto"}
        >
          <Edit2 size={14} /> Edit
        </button>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-3xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-2xl flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
            <div className="flex flex-wrap gap-4 mt-2">
              {patient.phone && (
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Phone size={13} /> {patient.phone}
                </span>
              )}
              {patient.age && (
                <span className="text-sm text-slate-500">
                  {patient.age} yrs · {patient.gender}
                </span>
              )}
              {patient.address && (
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin size={13} /> {patient.address}
                </span>
              )}
            </div>
            {patient.complaint && (
              <div className="mt-3 px-3 py-2 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs font-semibold text-amber-600 mb-0.5">Chief Complaint</p>
                <p className="text-sm text-amber-800">{patient.complaint}</p>
              </div>
            )}
            {patient.notes && (
              <p className="text-xs text-slate-400 mt-2 italic">{patient.notes}</p>
            )}
          </div>

          {/* Mini stats */}
          <div className="flex gap-4 flex-shrink-0">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800">{appointments.length}</p>
              <p className="text-xs text-slate-400">Visits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{fmt(totalSpent)}</p>
              <p className="text-xs text-slate-400">Paid</p>
            </div>
            {totalPending > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{fmt(totalPending)}</p>
                <p className="text-xs text-slate-400">Due</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            id={`tab-${key}`}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${tab === key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <Icon size={14} />
            {label}
            <span className={`text-xs rounded-full px-1.5 py-0.5 ${tab === key ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-500'}`}>
              {key === 'appointments' ? appointments.length
               : key === 'treatments' ? treatments.length
               : bills.length}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'appointments' && (
        <div className="card">
          {appointments.length === 0 ? (
            <div className="empty-state"><Calendar size={32} className="mb-2 opacity-20" /><p>No appointments yet</p></div>
          ) : (
            <table className="tbl">
              <thead><tr><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Treatments</th><th>Amount</th></tr></thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td className="font-medium">{new Date(a.scheduled_date + 'T00:00:00').toLocaleDateString('en-IN')}</td>
                    <td className="text-slate-500">{a.scheduled_time || '—'}</td>
                    <td className="text-slate-600 max-w-[160px] truncate">{a.reason || '—'}</td>
                    <td><span className={STATUS_COLORS[a.status]}>{a.status}</span></td>
                    <td>{a.treatment_count || 0}</td>
                    <td>{a.treatment_total ? fmt(a.treatment_total) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'treatments' && (
        <div className="card">
          {treatments.length === 0 ? (
            <div className="empty-state"><Activity size={32} className="mb-2 opacity-20" /><p>No treatments recorded</p></div>
          ) : (
            <table className="tbl">
              <thead><tr><th>Date</th><th>Treatment</th><th>Tooth</th><th>Description</th><th>Cost</th></tr></thead>
              <tbody>
                {treatments.map(t => (
                  <tr key={t.id}>
                    <td className="font-medium whitespace-nowrap">
                      {t.appointment_date ? new Date(t.appointment_date).toLocaleDateString('en-IN') : new Date(t.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-lg">
                        {t.treatment_type}
                      </span>
                    </td>
                    <td className="text-slate-500">{t.tooth_number || '—'}</td>
                    <td className="text-slate-600 max-w-[200px] truncate">{t.description || '—'}</td>
                    <td className="font-semibold text-slate-800">{fmt(t.cost)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={4} className="text-right font-bold text-slate-700">Total</td>
                  <td className="font-bold text-primary-700">
                    {fmt(treatments.reduce((s, t) => s + (t.cost || 0), 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'bills' && (
        <div className="card">
          {bills.length === 0 ? (
            <div className="empty-state"><Receipt size={32} className="mb-2 opacity-20" /><p>No bills generated</p></div>
          ) : (
            <table className="tbl">
              <thead><tr><th>Date</th><th>Total</th><th>Paid</th><th>Balance</th><th>Method</th><th>Status</th></tr></thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b.id}>
                    <td className="font-medium whitespace-nowrap">{new Date(b.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="font-semibold">{fmt(b.total_amount)}</td>
                    <td className="text-emerald-600 font-semibold">{fmt(b.paid_amount)}</td>
                    <td className={b.balance > 0 ? 'text-red-500 font-semibold' : 'text-slate-400'}>{fmt(b.balance)}</td>
                    <td className="text-slate-500 capitalize">{b.payment_method}</td>
                    <td><span className={BILL_COLORS[b.status]}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Patient"
        size="md"
        footer={
          <>
            <button onClick={() => setShowEdit(false)} className="btn-secondary">Cancel</button>
            <button id="btn-update-patient" onClick={handleUpdate} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Update Patient'}
            </button>
          </>
        }
      >
        <PatientForm form={form} set={(k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))} />
      </Modal>
    </div>
  )
}
