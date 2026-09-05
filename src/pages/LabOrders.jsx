import { useState, useEffect, useCallback } from 'react'
import {
  FlaskConical, Plus, Search, Calendar, Clock, CheckCircle2,
  AlertTriangle, RefreshCw, Trash2, Filter, X, ChevronRight, User
} from 'lucide-react'
import {
  getAllLabWorkOrders, createLabWorkOrder, updateLabWorkOrder,
  deleteLabWorkOrder, searchPatients, getAllPatients
} from '../services/api'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'
import { clinicDateString, fmtDate } from '../utils/date'

const COMMON_LABS = ['DentCare Dental Lab', 'Apex Dental Studio', 'Confident Dental Ceramics', 'Libident', 'Illusion Aligners']
const COMMON_WORK_TYPES = [
  'Zirconia Crown (Monolithic)', 'Layered Zirconia Crown', 'PFM (Porcelain-Fused-to-Metal)',
  'E-Max All-Ceramic Veneer', 'Complete Denture (High Impact)', 'Cast Partial Denture (CPD)',
  'Custom Titanium Implant Abutment', 'Clear Aligners (Per Arch)', 'Night Guard / Occlusal Splint',
  'Orthodontic Retainer (Hawley)', 'Temporary PMMA Bridge'
]

const STATUS_CONFIG = {
  sent: { label: 'In Lab', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  in_progress: { label: 'In Fabrication', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  received: { label: 'Received in Clinic', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  fitted: { label: 'Fitted & Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  remake_needed: { label: 'Remake Required', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-600 border-slate-200' }
}

export default function LabOrders() {
  const { notify, fmt } = useApp()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchLab, setSearchLab] = useState('')
  const [totalCount, setTotalCount] = useState(0)

  // Add / Edit Modal
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  // Patient selector state
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)

  // Form State
  const [form, setForm] = useState({
    lab_name: '',
    work_type: '',
    tooth_numbers: '',
    shade: '',
    impression_type: 'physical_impression',
    sent_date: clinicDateString(),
    expected_date: '',
    lab_cost: '',
    doctor_notes: '',
    is_remake: false,
    remake_reason: ''
  })

  // Quick Action Modals
  const [remakeOrder, setRemakeOrder] = useState(null)
  const [remakeReasonText, setRemakeReasonText] = useState('')

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllLabWorkOrders({
        status: statusFilter || undefined,
        labName: searchLab || undefined
      })
      setOrders(data.items || [])
      setTotalCount(data.total || 0)
    } catch (e) {
      notify(e.message || 'Failed to load lab work orders', 'error')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchLab, notify])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Patient search handler
  useEffect(() => {
    if (!patientSearch.trim()) {
      setPatientResults([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const results = await searchPatients(patientSearch.trim())
        setPatientResults(results || [])
      } catch (e) {
        setPatientResults([])
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [patientSearch])

  function openCreate() {
    setSelectedPatient(null)
    setPatientSearch('')
    setForm({
      lab_name: '',
      work_type: '',
      tooth_numbers: '',
      shade: '',
      impression_type: 'physical_impression',
      sent_date: clinicDateString(),
      expected_date: '',
      lab_cost: '',
      doctor_notes: '',
      is_remake: false,
      remake_reason: ''
    })
    setShowAdd(true)
  }

  async function handleSave() {
    if (!selectedPatient) { notify('Please select a patient', 'error'); return }
    if (!form.lab_name.trim()) { notify('Please enter or select a lab name', 'error'); return }
    if (!form.work_type.trim()) { notify('Please enter work type (e.g. Zirconia Crown)', 'error'); return }

    setSaving(true)
    try {
      const toothArr = form.tooth_numbers.split(',').map(s => s.trim()).filter(Boolean)
      await createLabWorkOrder({
        patient_id: selectedPatient.id,
        lab_name: form.lab_name.trim(),
        work_type: form.work_type.trim(),
        tooth_numbers: toothArr,
        shade: form.shade.trim(),
        impression_type: form.impression_type,
        sent_date: form.sent_date,
        expected_date: form.expected_date || undefined,
        lab_cost: parseFloat(form.lab_cost) || 0,
        doctor_notes: form.doctor_notes.trim(),
        is_remake: form.is_remake,
        remake_reason: form.remake_reason.trim()
      })
      notify('Dental Lab Work Order registered')
      setShowAdd(false)
      loadOrders()
    } catch (e) {
      notify(e.message || 'Failed to create lab work order', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    try {
      await updateLabWorkOrder(orderId, { status: newStatus })
      notify(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`)
      loadOrders()
    } catch (e) {
      notify(e.message || 'Failed to update status', 'error')
    }
  }

  async function handleConfirmRemake() {
    if (!remakeReasonText.trim()) { notify('Enter reason for remake', 'error'); return }
    try {
      await updateLabWorkOrder(remakeOrder.id, {
        status: 'remake_needed',
        is_remake: true,
        remake_reason: remakeReasonText.trim()
      })
      notify('Order flagged for Lab Remake')
      setRemakeOrder(null)
      setRemakeReasonText('')
      loadOrders()
    } catch (e) {
      notify(e.message || 'Failed to flag remake', 'error')
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteLabWorkOrder(deleteId)
      notify('Lab work order deleted')
      setDeleteId(null)
      loadOrders()
    } catch (e) {
      notify(e.message || 'Failed to delete order', 'error')
    }
  }

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      {/* ── Top Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FlaskConical className="text-amber-600" size={24} />
            Dental Lab Orders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track prosthetic work orders, crowns, aligners, turnaround dates & shades
          </p>
        </div>

        <button
          onClick={openCreate}
          className="btn-primary flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={16} /> New Lab Order
        </button>
      </div>

      {/* ── Filters Bar ──────────────────────────────────── */}
      <div className="card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {['', 'sent', 'in_progress', 'received', 'fitted', 'remake_needed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === '' ? 'All Orders' : STATUS_CONFIG[st]?.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input py-1.5 pl-8 text-xs"
            placeholder="Search by Lab name…"
            value={searchLab}
            onChange={e => setSearchLab(e.target.value)}
          />
        </div>
      </div>

      {/* ── Orders Table ─────────────────────────────────── */}
      {loading ? (
        <div className="card py-16 text-center text-slate-400 text-sm">Loading lab work orders…</div>
      ) : orders.length === 0 ? (
        <div className="card empty-state py-20 text-center">
          <FlaskConical size={42} className="mx-auto mb-3 opacity-25 text-amber-600" />
          <p className="font-semibold text-slate-700">No lab work orders found</p>
          <p className="text-xs text-slate-400 mt-1">Create your first prosthetic order to track turnaround with dental labs.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Patient</th>
                  <th>Lab & Work Type</th>
                  <th>Teeth & Shade</th>
                  <th>Dates (Sent / Due)</th>
                  <th>Status</th>
                  <th>Lab Cost</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => {
                  const statusInfo = STATUS_CONFIG[o.status] || STATUS_CONFIG.sent
                  const isOverdue = o.status === 'sent' && o.expected_date && new Date(o.expected_date) < new Date()

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="font-mono text-xs font-bold text-slate-800">
                        {o.work_order_number}
                        {o.is_remake && (
                          <span className="block text-[10px] text-rose-600 font-bold tracking-wide">REMAKE</span>
                        )}
                      </td>
                      <td>
                        <p className="font-semibold text-slate-800 text-xs">{o.patient_name}</p>
                        <p className="text-[11px] text-slate-400">{o.patient_phone || o.patient_pid}</p>
                      </td>
                      <td>
                        <p className="font-bold text-slate-800 text-xs">{o.work_type}</p>
                        <p className="text-[11px] text-amber-700 font-medium">{o.lab_name}</p>
                      </td>
                      <td>
                        <div className="text-xs text-slate-700">
                          {o.tooth_numbers && o.tooth_numbers.length > 0 ? (
                            <span>Tooth: <strong>{o.tooth_numbers.join(', ')}</strong></span>
                          ) : '—'}
                        </div>
                        {o.shade && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-bold">
                            Shade: {o.shade}
                          </span>
                        )}
                      </td>
                      <td>
                        <p className="text-xs text-slate-600">Sent: {fmtDate(o.sent_date)}</p>
                        <p className={`text-xs font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                          Due: {fmtDate(o.expected_date)} {isOverdue && '⚠️ Overdue'}
                        </p>
                      </td>
                      <td>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="font-semibold text-xs text-slate-700">
                        {o.lab_cost > 0 ? fmt(o.lab_cost) : '—'}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {o.status === 'sent' && (
                            <button
                              onClick={() => handleStatusChange(o.id, 'received')}
                              className="btn-secondary text-[11px] py-1 px-2 text-purple-700 border-purple-200 hover:bg-purple-50"
                              title="Mark Received in Clinic"
                            >
                              ✓ Received
                            </button>
                          )}
                          {o.status === 'received' && (
                            <button
                              onClick={() => handleStatusChange(o.id, 'fitted')}
                              className="btn-secondary text-[11px] py-1 px-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              title="Mark Fitted in Patient Mouth"
                            >
                              ✓ Fitted
                            </button>
                          )}
                          {o.status !== 'remake_needed' && o.status !== 'cancelled' && (
                            <button
                              onClick={() => { setRemakeOrder(o); setRemakeReasonText('') }}
                              className="btn-icon text-slate-400 hover:text-rose-600"
                              title="Flag Remake Needed"
                            >
                              <RefreshCw size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteId(o.id)}
                            className="btn-icon text-slate-300 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CREATE LAB WORK ORDER MODAL ───────────────────── */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Create Dental Lab Work Order"
        size="md"
        footer={
          <>
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Creating…' : 'Create Lab Order'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Patient Search & Select */}
          <div>
            <label className="label">Patient *</label>
            {selectedPatient ? (
              <div className="flex items-center justify-between p-2.5 bg-primary-50 rounded-xl border border-primary-200">
                <div>
                  <p className="font-bold text-sm text-primary-900">{selectedPatient.name}</p>
                  <p className="text-xs text-primary-700">{selectedPatient.phone || selectedPatient.pid}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="text-xs text-primary-700 font-semibold hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  className="input text-sm"
                  placeholder="Type patient name or phone to search…"
                  value={patientSearch}
                  onChange={e => setPatientSearch(e.target.value)}
                  autoFocus
                />
                {patientResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {patientResults.map(p => (
                      <div
                        key={p.id}
                        onClick={() => { setSelectedPatient(p); setPatientSearch(''); setPatientResults([]) }}
                        className="p-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 flex justify-between items-center"
                      >
                        <span className="font-semibold text-xs text-slate-800">{p.name}</span>
                        <span className="text-xs text-slate-400 font-mono">{p.phone}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lab & Work Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Dental Lab Name *</label>
              <input
                type="text"
                list="lab-list"
                className="input text-xs"
                placeholder="e.g. DentCare Lab"
                value={form.lab_name}
                onChange={e => setForm({ ...form, lab_name: e.target.value })}
              />
              <datalist id="lab-list">
                {COMMON_LABS.map(l => <option key={l} value={l} />)}
              </datalist>
            </div>

            <div>
              <label className="label">Work Type *</label>
              <input
                type="text"
                list="work-type-list"
                className="input text-xs"
                placeholder="e.g. Zirconia Crown"
                value={form.work_type}
                onChange={e => setForm({ ...form, work_type: e.target.value })}
              />
              <datalist id="work-type-list">
                {COMMON_WORK_TYPES.map(w => <option key={w} value={w} />)}
              </datalist>
            </div>
          </div>

          {/* Tooth # & Shade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">Tooth / Teeth #</label>
              <input
                type="text"
                className="input text-xs"
                placeholder="e.g. 16, 21"
                value={form.tooth_numbers}
                onChange={e => setForm({ ...form, tooth_numbers: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Shade Guide</label>
              <input
                type="text"
                className="input text-xs"
                placeholder="e.g. A2, 3D Master 2M2"
                value={form.shade}
                onChange={e => setForm({ ...form, shade: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Impression Type</label>
              <select
                className="select text-xs"
                value={form.impression_type}
                onChange={e => setForm({ ...form, impression_type: e.target.value })}
              >
                <option value="physical_impression">Physical Impression</option>
                <option value="digital_scan">Intraoral 3D Scan</option>
                <option value="cast_model">Cast Plaster Model</option>
              </select>
            </div>
          </div>

          {/* Dates & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">Sent Date</label>
              <input
                type="date"
                className="input text-xs"
                value={form.sent_date}
                onChange={e => setForm({ ...form, sent_date: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Expected Return Date</label>
              <input
                type="date"
                className="input text-xs"
                value={form.expected_date}
                onChange={e => setForm({ ...form, expected_date: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Lab Cost / Bill (₹)</label>
              <input
                type="number"
                className="input text-xs"
                placeholder="0"
                value={form.lab_cost}
                onChange={e => setForm({ ...form, lab_cost: e.target.value })}
              />
            </div>
          </div>

          {/* Doctor Instructions */}
          <div>
            <label className="label">Technician Instructions / Notes</label>
            <textarea
              className="textarea text-xs"
              rows={2}
              placeholder="e.g. Keep buccal margin ceramic, light occlusal contacts, high translucency..."
              value={form.doctor_notes}
              onChange={e => setForm({ ...form, doctor_notes: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* ── REMAKE MODAL ──────────────────────────────────── */}
      <Modal
        open={Boolean(remakeOrder)}
        onClose={() => setRemakeOrder(null)}
        title="Flag for Lab Remake"
        size="sm"
        footer={
          <>
            <button onClick={() => setRemakeOrder(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleConfirmRemake} className="btn-primary bg-rose-600 border-rose-600 hover:bg-rose-700">
              Flag Remake
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Specify the reason for requesting a lab remake for order <strong>{remakeOrder?.work_order_number}</strong>:
          </p>
          <textarea
            className="textarea text-xs"
            rows={3}
            placeholder="e.g. Tight contact on distal, shade mismatch with tooth #15, loose margin..."
            value={remakeReasonText}
            onChange={e => setRemakeReasonText(e.target.value)}
            autoFocus
          />
        </div>
      </Modal>

      {/* ── DELETE CONFIRM MODAL ──────────────────────────── */}
      <ConfirmModal
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Lab Work Order"
        message="Are you sure you want to delete this lab work order record?"
        confirmText="Delete Order"
      />
    </div>
  )
}
