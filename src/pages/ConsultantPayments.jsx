import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, DollarSign, AlertCircle, ChevronDown, Trash2, Edit2, CreditCard, X } from 'lucide-react'
import {
  getConsultantPayments, addConsultantPayment, updateConsultantPayment,
  deleteConsultantPayment, recordConsultantPaymentAmount,
  getConsultantOutstandingDues, getConsultantMonthlyReport,
  searchPatients, getAllPatients,
} from '../services/api'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'

const EMPTY_FORM = {
  consultant_name: '', patient_id: '', treatment_type: '',
  treatment_cost: '', consultant_share: '', amount_paid: '',
  payment_method: 'cash', notes: ''
}

export default function ConsultantPayments() {
  const { notify, fmt } = useApp()
  const [tab, setTab] = useState('all')  // 'all' | 'outstanding' | 'report'
  const [payments, setPayments] = useState({ items: [], total: 0 })
  const [outstanding, setOutstanding] = useState([])
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(false)

  // Filters
  const [consultantFilter, setConsultantFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Modal state
  const [showAdd, setShowAdd] = useState(false)
  const [showPay, setShowPay] = useState(null)  // Payment record to pay against
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('cash')

  // Patient search
  const [patientSearch, setPatientSearch] = useState('')
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)

  // Report filters
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1)
  const [reportYear, setReportYear] = useState(new Date().getFullYear())

  const loadPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (consultantFilter) params.consultant = consultantFilter
      if (statusFilter) params.status = statusFilter
      const data = await getConsultantPayments(params)
      setPayments(data || { items: [], total: 0 })
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }, [consultantFilter, statusFilter])

  const loadOutstanding = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getConsultantOutstandingDues()
      setOutstanding(data || [])
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }, [])

  const loadReport = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getConsultantMonthlyReport(reportMonth, reportYear)
      setReport(data || [])
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }, [reportMonth, reportYear])

  useEffect(() => {
    if (tab === 'all') loadPayments()
    else if (tab === 'outstanding') loadOutstanding()
    else if (tab === 'report') loadReport()
  }, [tab, loadPayments, loadOutstanding, loadReport])

  // Patient search in modal
  useEffect(() => {
    if (!showAdd && !editId) return
    const t = setTimeout(async () => {
      const data = patientSearch.trim()
        ? await searchPatients(patientSearch)
        : await getAllPatients()
      setPatients((data || []).slice(0, 15))
    }, 250)
    return () => clearTimeout(t)
  }, [patientSearch, showAdd, editId])

  function openAdd() {
    setForm(EMPTY_FORM)
    setSelectedPatient(null)
    setPatientSearch('')
    setEditId(null)
    setShowAdd(true)
  }

  function openEdit(item) {
    setForm({
      consultant_name: item.consultant_name,
      patient_id: item.patient_id,
      treatment_type: item.treatment_type || '',
      treatment_cost: item.treatment_cost || '',
      consultant_share: item.consultant_share || '',
      amount_paid: item.amount_paid || '',
      payment_method: item.payment_method || 'cash',
      notes: item.notes || ''
    })
    setSelectedPatient({ id: item.patient_id, name: item.patient_name || '' })
    setEditId(item.id)
    setShowAdd(true)
  }

  async function handleSave() {
    if (!form.consultant_name.trim()) { notify('Consultant name required', 'error'); return }
    if (!selectedPatient) { notify('Select a patient', 'error'); return }
    if (!form.consultant_share || parseFloat(form.consultant_share) <= 0) {
      notify('Consultant share must be > 0', 'error'); return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        patient_id: selectedPatient.id,
        treatment_cost: parseFloat(form.treatment_cost) || 0,
        consultant_share: parseFloat(form.consultant_share) || 0,
        amount_paid: parseFloat(form.amount_paid) || 0
      }
      if (editId) {
        await updateConsultantPayment(editId, payload)
        notify('Payment updated')
      } else {
        await addConsultantPayment(payload)
        notify('Consultant payment added')
      }
      setShowAdd(false)
      setEditId(null)
      loadPayments()
    } catch (e) {
      notify(e.message || 'Failed to save', 'error')
    } finally { setSaving(false) }
  }

  async function handlePay() {
    if (!payAmount || parseFloat(payAmount) <= 0) { notify('Enter a valid amount', 'error'); return }
    setSaving(true)
    try {
      await recordConsultantPaymentAmount(showPay.id, parseFloat(payAmount), payMethod)
      notify('Payment recorded')
      setShowPay(null)
      setPayAmount('')
      if (tab === 'all') loadPayments()
      else if (tab === 'outstanding') loadOutstanding()
    } catch (e) {
      notify(e.message || 'Failed', 'error')
    } finally { setSaving(false) }
  }

  async function handleDeleteConfirm() {
    try {
      await deleteConsultantPayment(deleteId)
      notify('Payment deleted')
      loadPayments()
    } catch (e) {
      notify(e.message || 'Failed', 'error')
    } finally { setDeleteId(null) }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const totalOutstanding = outstanding.reduce((s, g) => s + g.total_due, 0)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Consultant Payments</h2>
          <p className="text-sm text-slate-400">Track and manage consultant share payments</p>
        </div>
        <button id="btn-add-consultant-payment" onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Payment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 w-fit">
        {[
          { key: 'all', label: 'All Payments' },
          { key: 'outstanding', label: 'Outstanding Dues' },
          { key: 'report', label: 'Monthly Report' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ALL PAYMENTS TAB */}
      {tab === 'all' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9 w-56"
                placeholder="Filter by consultant…"
                value={consultantFilter}
                onChange={e => setConsultantFilter(e.target.value)}
              />
            </div>
            <select className="select w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {loading ? (
            <div className="card text-center py-12 text-slate-400">Loading…</div>
          ) : payments.items.length === 0 ? (
            <div className="card empty-state py-16">
              <DollarSign size={40} className="mb-3 opacity-20" />
              <p className="font-semibold">No consultant payments yet</p>
              <button onClick={openAdd} className="btn-primary mt-4"><Plus size={16} /> Add Payment</button>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Consultant</th>
                    <th>Patient</th>
                    <th>Treatment</th>
                    <th>Cost</th>
                    <th>Share</th>
                    <th>Paid</th>
                    <th>Due</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.items.map(p => (
                    <tr key={p.id}>
                      <td className="font-semibold text-slate-800">{p.consultant_name}</td>
                      <td className="text-slate-600">{p.patient_name}</td>
                      <td className="text-slate-500 text-xs">{p.treatment_type || '—'}</td>
                      <td>{fmt(p.treatment_cost)}</td>
                      <td className="font-semibold">{fmt(p.consultant_share)}</td>
                      <td className="text-emerald-600 font-semibold">{fmt(p.amount_paid)}</td>
                      <td className={p.balance_due > 0 ? 'text-red-500 font-semibold' : 'text-slate-400'}>{fmt(p.balance_due)}</td>
                      <td>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                          p.status === 'partial' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {p.status !== 'paid' && (
                            <button
                              onClick={() => { setShowPay(p); setPayAmount(''); setPayMethod('cash') }}
                              className="btn-icon text-emerald-500 hover:bg-emerald-50"
                              title="Record Payment"
                            >
                              <CreditCard size={14} />
                            </button>
                          )}
                          <button onClick={() => openEdit(p)} className="btn-icon text-slate-400 hover:text-primary-600" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeleteId(p.id)} className="btn-icon text-slate-300 hover:text-red-500" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* OUTSTANDING TAB */}
      {tab === 'outstanding' && (
        <div className="space-y-4">
          {totalOutstanding > 0 && (
            <div className="card bg-red-50 border border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-red-500" />
                <span className="font-semibold text-red-800">Total Outstanding</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{fmt(totalOutstanding)}</span>
            </div>
          )}

          {outstanding.length === 0 ? (
            <div className="card empty-state py-16">
              <DollarSign size={40} className="mb-3 text-emerald-400 opacity-50" />
              <p className="font-semibold text-emerald-700">All dues cleared!</p>
              <p className="text-sm text-slate-400 mt-1">No outstanding consultant payments</p>
            </div>
          ) : (
            outstanding.map(group => (
              <div key={group.consultant} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800">{group.consultant}</h4>
                    <p className="text-xs text-slate-400">{group.count} pending payment(s)</p>
                  </div>
                  <span className="text-xl font-bold text-red-600">{fmt(group.total_due)}</span>
                </div>
                <div className="space-y-2">
                  {group.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{item.patient_name}</p>
                        <p className="text-xs text-slate-400">{item.treatment_type || 'General'} · Due: {fmt(item.balance_due)}</p>
                      </div>
                      <button
                        onClick={() => { setShowPay(item); setPayAmount(''); setPayMethod('cash') }}
                        className="btn-secondary text-xs bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 px-3 py-1.5 h-auto min-h-0"
                      >
                        <CreditCard size={12} /> Pay
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MONTHLY REPORT TAB */}
      {tab === 'report' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select className="select w-36" value={reportMonth} onChange={e => setReportMonth(parseInt(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
            <select className="select w-28" value={reportYear} onChange={e => setReportYear(parseInt(e.target.value))}>
              {Array.from({ length: 5 }, (_, i) => {
                const y = new Date().getFullYear() - i
                return <option key={y} value={y}>{y}</option>
              })}
            </select>
          </div>

          {report.length === 0 ? (
            <div className="card empty-state py-16">
              <DollarSign size={40} className="mb-3 opacity-20" />
              <p className="font-semibold">No data for this month</p>
            </div>
          ) : (
            report.map(group => (
              <div key={group.consultant} className="card">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-800 text-lg">{group.consultant}</h4>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-slate-800">{fmt(group.total_share)}</p>
                      <p className="text-xs text-slate-400">Total Share</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-emerald-600">{fmt(group.total_paid)}</p>
                      <p className="text-xs text-slate-400">Paid</p>
                    </div>
                    <div className="text-center">
                      <p className={`font-bold ${group.total_due > 0 ? 'text-red-500' : 'text-slate-400'}`}>{fmt(group.total_due)}</p>
                      <p className="text-xs text-slate-400">Due</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400">{group.count} record(s) this month</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={showAdd}
        onClose={() => { setShowAdd(false); setEditId(null) }}
        title={editId ? 'Edit Consultant Payment' : 'Add Consultant Payment'}
        size="md"
        footer={
          <>
            <button onClick={() => { setShowAdd(false); setEditId(null) }} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : editId ? 'Update' : 'Add Payment'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Consultant Name *</label>
            <input className="input" placeholder="Dr. Name…" value={form.consultant_name} onChange={set('consultant_name')} />
          </div>

          {/* Patient selector */}
          {selectedPatient ? (
            <div className="flex items-center justify-between bg-primary-50 rounded-xl px-4 py-3">
              <div>
                <p className="font-semibold text-primary-800">{selectedPatient.name}</p>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="text-primary-400 hover:text-primary-700">✕</button>
            </div>
          ) : (
            <div>
              <label className="label">Select Patient *</label>
              <div className="relative mb-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="input pl-9"
                  placeholder="Search patient…"
                  value={patientSearch}
                  onChange={e => setPatientSearch(e.target.value)}
                />
              </div>
              <div className="max-h-36 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50">
                {patients.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-semibold text-slate-800 text-sm">{p.name}</span>
                    {p.phone && <span className="text-slate-400 text-xs ml-2">{p.phone}</span>}
                  </button>
                ))}
                {patients.length === 0 && <p className="px-4 py-2.5 text-sm text-slate-400">No patients found</p>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Treatment Type</label>
              <input className="input" placeholder="e.g. Root Canal" value={form.treatment_type} onChange={set('treatment_type')} />
            </div>
            <div>
              <label className="label">Treatment Cost (₹)</label>
              <input className="input" type="number" min="0" placeholder="0" value={form.treatment_cost} onChange={set('treatment_cost')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Consultant Share (₹) *</label>
              <input className="input" type="number" min="0" placeholder="Amount owed" value={form.consultant_share} onChange={set('consultant_share')} />
            </div>
            <div>
              <label className="label">Amount Paid (₹)</label>
              <input className="input" type="number" min="0" placeholder="0" value={form.amount_paid} onChange={set('amount_paid')} />
            </div>
          </div>

          {form.amount_paid > 0 && (
            <div>
              <label className="label">Payment Method</label>
              <select className="select" value={form.payment_method} onChange={set('payment_method')}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          <div>
            <label className="label">Notes</label>
            <textarea className="textarea" rows={2} placeholder="Optional notes…" value={form.notes} onChange={set('notes')} />
          </div>
        </div>
      </Modal>

      {/* Pay Modal */}
      <Modal
        open={!!showPay}
        onClose={() => setShowPay(null)}
        title="Record Payment"
        size="sm"
        footer={
          <>
            <button onClick={() => setShowPay(null)} className="btn-secondary">Cancel</button>
            <button onClick={handlePay} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Record Payment'}
            </button>
          </>
        }
      >
        {showPay && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-sm text-slate-500">Consultant: <strong>{showPay.consultant_name}</strong></p>
              <p className="text-sm text-slate-500">Balance Due: <strong className="text-red-600">{fmt(showPay.balance_due)}</strong></p>
            </div>
            <div>
              <label className="label">Payment Amount (₹)</label>
              <input
                className="input"
                type="number"
                min="0"
                max={showPay.balance_due}
                placeholder="0"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="label">Method</label>
              <select className="select" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Consultant Payment"
        message="Are you sure you want to delete this payment record? This cannot be undone."
        confirmText="Delete"
      />
    </div>
  )
}
