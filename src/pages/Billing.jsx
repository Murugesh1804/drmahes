import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X, Printer, CreditCard, ShoppingBag, Trash2 } from 'lucide-react'
import {
  getAllBills, getBillsByPatient, createBill, updateBillPayment,
  getAllPatients, searchPatients,
  getTreatmentsByPatient, getPatientAppointments,
} from '../services/api'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'

const BILL_COLORS = { paid: 'badge-paid', partial: 'badge-partial', pending: 'badge-pending' }
const METHODS = [
  { key: 'cash', label: 'Cash', icon: '💵' },
  { key: 'upi', label: 'UPI / GPay', icon: '📱' },
  { key: 'card', label: 'Card Payment', icon: '💳' },
  { key: 'other', label: 'Other', icon: '🔄' }
]

const PREDEFINED_TREATMENTS = [
  { name: 'Consultation', price: 100 },
  { name: 'Rvg', price: 200 },
  { name: 'Scaling mild', price: 800 },
  { name: 'Scaling moderate', price: 1000 },
  { name: 'Deep scaling , stains', price: 1500 },
  { name: 'Filling class 1', price: 850 },
  { name: 'Deep filling ( use of dycal )', price: 1150 },
  { name: 'Anterior filling', price: 1200 },
  { name: 'Root canal treatment', price: 3000 },
  { name: 'Extraction grade 3', price: 500 },
  { name: 'Extraction ortho', price: 750 },
  { name: 'Upper wisdom', price: 1800 },
  { name: 'Lower wisdom erupted', price: 2000 },
  { name: 'Crown MLS', price: 3500 },
  { name: 'Crown zirconia', price: 7000 },
  { name: 'Metal crown', price: 2000 },
  { name: 'Post and core', price: 1000 },
  { name: 'Veneers', price: 10000 },
  { name: 'Crown cementation', price: 500 },
  { name: 'Basic braces', price: 25000 },
  { name: 'Metal self ligating', price: 50000 },
  { name: 'Ceramic basic', price: 40000 },
  { name: 'Ceramic self ligating', price: 80000 },
  { name: 'Lower wisdom specialist', price: 4000 },
  { name: 'Upper impaction', price: 3000 },
  { name: 'Retainer', price: 1500 },
  { name: 'Perio laser ( per quadrant )', price: 5000 },
  { name: 'Frenectomy', price: 5000 },
  { name: 'Mucocele', price: 5000 },
  { name: 'Implant', price: 20000 },
  { name: 'Implant MLS', price: 5000 },
  { name: 'IMPLANT ZIRCON', price: 9000 },
  { name: 'Emax', price: 10000 }
]

export default function Billing() {
  const { notify, fmt, settings } = useApp()
  const navigate = useNavigate()
  const [bills, setBills] = useState([])
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [activeBill, setActiveBill] = useState(null)
  const [saving, setSaving] = useState(false)

  // Create bill state
  const [patSearch, setPatSearch] = useState('')
  const [patients, setPatients] = useState([])
  const [selPatient, setSelPatient] = useState(null)
  const [selAppt, setSelAppt] = useState(null)
  const [patAppts, setPatAppts] = useState([])
  const [patTreatments, setPatTreatments] = useState([])
  
  // Cart-based billing state
  const [billItems, setBillItems] = useState([])
  const [cartSelect, setCartSelect] = useState('')
  const [cartCost, setCartCost] = useState('')
  const [cartTooth, setCartTooth] = useState('')
  const [cartDesc, setCartDesc] = useState('')
  
  const [billForm, setBillForm] = useState({
    paid_amount: '', payment_method: 'cash', notes: '',
  })

  // Payment modal state
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('cash')

  const load = useCallback(async () => {
    const data = await getAllBills()
    setBills(data || [])
  }, [])

  useEffect(() => { load() }, [load])

  // Patient search in create modal
  useEffect(() => {
    if (!showCreate) return
    const t = setTimeout(async () => {
      const data = patSearch.trim() ? await searchPatients(patSearch) : await getAllPatients()
      setPatients((data || []).slice(0, 20))
    }, 250)
    return () => clearTimeout(t)
  }, [patSearch, showCreate])

  // Load patient's appointments when selected
  useEffect(() => {
    if (!selPatient) { setPatAppts([]); setPatTreatments([]); return }
    Promise.all([
      getPatientAppointments(selPatient.id),
      getTreatmentsByPatient(selPatient.id),
    ]).then(([appts, txs]) => {
      setPatAppts((appts || []).slice(0, 10))
      setPatTreatments(txs || [])
    })
  }, [selPatient])

  // Auto-calculate items from appointment when linked
  useEffect(() => {
    if (!selAppt) { setBillItems([]); return }
    const txsForAppt = patTreatments.filter(t => t.appointment_id === selAppt.id)
    const items = txsForAppt.map(t => ({
      treatment_type: t.treatment_type,
      cost: t.cost || 0,
      tooth_number: t.tooth_number || '',
      description: t.description || ''
    }))
    setBillItems(items)
  }, [selAppt, patTreatments])

  // Populate cost automatically when predefined treatment is picked
  function handlePredefinedChange(name) {
    setCartSelect(name)
    const matched = PREDEFINED_TREATMENTS.find(t => t.name === name)
    if (matched) {
      setCartCost(matched.price.toString())
    } else {
      setCartCost('')
    }
  }

  function addItemToCart() {
    if (!cartSelect) { notify('Select a treatment type', 'error'); return }
    const costNum = parseFloat(cartCost) || 0
    if (costNum <= 0) { notify('Enter a valid charge amount', 'error'); return }

    const newItem = {
      treatment_type: cartSelect,
      cost: costNum,
      tooth_number: cartTooth.trim(),
      description: cartDesc.trim()
    }

    setBillItems([...billItems, newItem])
    
    // Reset inputs
    setCartSelect('')
    setCartCost('')
    setCartTooth('')
    setCartDesc('')
  }

  function removeItemFromCart(index) {
    const list = [...billItems]
    list.splice(index, 1)
    setBillItems(list)
  }

  function openCreate() {
    setPatSearch(''); setSelPatient(null); setSelAppt(null)
    setPatAppts([]); setPatTreatments([]); setBillItems([])
    setCartSelect(''); setCartCost(''); setCartTooth(''); setCartDesc('')
    setBillForm({ paid_amount: '', payment_method: 'cash', notes: '' })
    setShowCreate(true)
  }

  const calculatedTotal = billItems.reduce((sum, item) => sum + item.cost, 0)

  async function handleCreate() {
    if (!selPatient) { notify('Select a patient', 'error'); return }
    if (billItems.length === 0) { notify('Add at least one treatment item', 'error'); return }
    
    setSaving(true)
    try {
      await createBill({
        patient_id: selPatient.id,
        appointment_id: selAppt?.id || null,
        total_amount: calculatedTotal,
        paid_amount: parseFloat(billForm.paid_amount) || 0,
        payment_method: billForm.payment_method,
        notes: billForm.notes,
        treatments: billItems // Array sent to queries.js batch handler
      })
      notify('Bill and treatments saved successfully')
      setShowCreate(false)
      load()
    } finally { setSaving(false) }
  }

  async function handlePayment() {
    if (!payAmount || parseFloat(payAmount) <= 0) { notify('Enter payment amount', 'error'); return }
    setSaving(true)
    try {
      await updateBillPayment(activeBill.id, {
        amount: parseFloat(payAmount),
        payment_method: payMethod,
      })
      notify('Payment recorded')
      setShowPayment(false)
      load()
    } finally { setSaving(false) }
  }

  function openPayment(bill) {
    setActiveBill(bill)
    setPayAmount(bill.balance.toString())
    setPayMethod('cash')
    setShowPayment(true)
  }

  // Modified receipt printer to fetch live treatments details for the bill items printout
  async function printBill(bill) {
    let txs = []
    try {
      // If linked to appointment, grab treatments
      if (bill.appointment_id) {
        txs = await getTreatmentsByAppointment(bill.appointment_id)
      } else {
        // Fallback: fetch patient treatments and filter
        const allTxs = await getTreatmentsByPatient(bill.patient_id)
        // Match treatments created around same date of bill
        const billDate = new Date(bill.created_at).toDateString()
        txs = allTxs.filter(t => new Date(t.created_at).toDateString() === billDate)
      }
    } catch (e) {
      console.warn("Failed fetching treatments for receipt:", e)
    }

    const html = generateReceiptHTML(bill, txs, settings)
    
    // In Electron context, use the native silent print frame or standard print window
    if (typeof window !== 'undefined' && window.electronAPI !== undefined) {
      window.electronAPI.printReceipt(html)
    } else {
      const w = window.open('', '_blank')
      w.document.write(html)
      w.document.close()
      w.print()
    }
  }

  const filtered = bills.filter(b =>
    b && (!search || (b.patient_name || '').toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      {/* Header bar */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing &amp; Invoices</h1>
          <p className="page-sub">Create bills, collect payments, and generate invoices</p>
        </div>
        <button id="btn-create-bill" onClick={openCreate} className="btn-primary flex-shrink-0 cursor-pointer shadow-lg shadow-teal-900/10">
          <Plus size={16} /> Create New Bill
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            id="bill-search"
            className="search-input bg-slate-50 border-transparent focus:bg-white focus:border-primary-400"
            placeholder="Search by patient name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Bills list */}
      {filtered.length === 0 ? (
        <div className="card empty-state py-24 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <CreditCard size={28} />
          </div>
          <p className="font-bold text-lg text-slate-700">No invoices recorded</p>
          <p className="text-sm text-slate-400 mt-1">Get started by creating your first patient invoice.</p>
          <button onClick={openCreate} className="btn-primary mt-5"><Plus size={16} /> Create Bill</button>
        </div>
      ) : (
        <div className="card overflow-hidden p-0 border border-slate-150 shadow-sm">
          <table className="tbl">
            <thead>
              <tr className="bg-slate-50">
                <th className="w-12 pl-6">ID</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Total Bill</th>
                <th>Paid</th>
                <th>Balance Due</th>
                <th>Method</th>
                <th>Status</th>
                <th className="pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.filter(Boolean).map(b => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="text-slate-400 text-xs font-mono pl-6 truncate max-w-[80px]">
                    ...{b.id.slice(-6)}
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(`/patients/${b.patient_id}`)}
                      className="font-bold text-slate-800 hover:text-primary-600 transition-colors text-left"
                    >
                      {b.patient_name}
                    </button>
                  </td>
                  <td className="text-slate-500 text-xs whitespace-nowrap">
                    {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="font-semibold text-slate-900">{fmt(b.total_amount)}</td>
                  <td className="text-emerald-600 font-semibold">{fmt(b.paid_amount)}</td>
                  <td className={b.balance > 0 ? 'text-red-500 font-bold' : 'text-slate-400 font-semibold'}>
                    {b.balance > 0 ? fmt(b.balance) : 'Settled'}
                  </td>
                  <td className="capitalize text-slate-500 text-xs font-medium">{b.payment_method}</td>
                  <td><span className={BILL_COLORS[b.status]}>{b.status}</span></td>
                  <td className="pr-6 text-right">
                    <div className="flex gap-2 justify-end">
                      {b.status !== 'paid' && (
                        <button
                          id={`btn-pay-${b.id}`}
                          onClick={() => openPayment(b)}
                          className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
                        >
                          + Record Payment
                        </button>
                      )}
                      <button
                        id={`btn-print-${b.id}`}
                        onClick={() => printBill(b)}
                        className="btn-icon bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl"
                        title="Print Invoice"
                      >
                        <Printer size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Bill Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Patient Invoice"
        size="lg"
        footer={
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button id="btn-save-bill" onClick={handleCreate} disabled={saving || !selPatient || billItems.length === 0} className="btn-primary">
              {saving ? 'Saving…' : 'Generate Invoice ✓'}
            </button>
          </div>
        }
      >
        <div className="space-y-5 text-slate-800">
          {/* Patient Selection */}
          {selPatient ? (
            <div className="flex items-center justify-between bg-teal-50/50 border border-teal-100 rounded-2xl px-5 py-3">
              <div>
                <p className="font-bold text-teal-800 text-base">{selPatient.name}</p>
                <p className="text-xs text-teal-600 font-medium">📞 {selPatient.phone || 'No phone number'}</p>
              </div>
              <button
                onClick={() => { setSelPatient(null); setSelAppt(null); setBillItems([]) }}
                className="text-teal-400 hover:text-teal-700 bg-white hover:bg-teal-100 p-1.5 rounded-full transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div>
              <label className="label">Search Patient *</label>
              <div className="relative mb-2">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="input pl-10"
                  placeholder="Type patient name or phone to search..."
                  value={patSearch}
                  onChange={e => setPatSearch(e.target.value)}
                  autoFocus
                />
              </div>
              {patients.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50 bg-white shadow-inner">
                  {patients.map(p => (
                    <button key={p.id} onClick={() => setSelPatient(p)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex justify-between items-center cursor-pointer">
                      <span className="font-bold text-sm text-slate-700">{p.name}</span>
                      {p.phone && <span className="text-slate-400 text-xs font-mono">{p.phone}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Link Appointment */}
          {selPatient && patAppts.length > 0 && (
            <div>
              <label className="label">Link to Visit Appointment (optional)</label>
              <select
                className="select"
                value={selAppt?.id || ''}
                onChange={e => {
                  const a = patAppts.find(x => x.id === e.target.value)
                  setSelAppt(a || null)
                }}
              >
                <option value="">— Standalone Bill (No Appointment) —</option>
                {patAppts.map(a => (
                  <option key={a.id} value={a.id}>
                    {new Date(a.scheduled_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {a.reason || 'Checkup'} · ({a.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cart Builder Panel */}
          {selPatient && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-150 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ShoppingBag size={14} className="text-primary-600" /> Predefined Treatment Cart Builder
              </p>

              {/* Input builder */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Treatment Type</label>
                  <select
                    className="select text-xs py-2 h-10"
                    value={cartSelect}
                    onChange={e => handlePredefinedChange(e.target.value)}
                  >
                    <option value="">— Select Predefined Treatment —</option>
                    {PREDEFINED_TREATMENTS.map(t => (
                      <option key={t.name} value={t.name}>{t.name} (₹{t.price})</option>
                    ))}
                  </select>
                </div>
                
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Charges (₹)</label>
                  <input
                    type="number"
                    className="input text-xs py-2 h-10"
                    placeholder="Rate"
                    value={cartCost}
                    onChange={e => setCartCost(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Tooth #</label>
                  <input
                    type="text"
                    className="input text-xs py-2 h-10"
                    placeholder="e.g. 38, 46"
                    value={cartTooth}
                    onChange={e => setCartTooth(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-3 flex items-end">
                  <button
                    type="button"
                    onClick={addItemToCart}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer h-10"
                  >
                    + Add Item
                  </button>
                </div>
              </div>

              {/* Cart List Table */}
              {billItems.length > 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-3">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-100 text-slate-500 border-b border-slate-250">
                        <th className="px-3 py-2">Treatment</th>
                        <th className="px-3 py-2 w-20">Tooth</th>
                        <th className="px-3 py-2 w-28 text-right">Cost</th>
                        <th className="px-3 py-2 w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {billItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2 font-semibold text-slate-700">{item.treatment_type}</td>
                          <td className="px-3 py-2 font-mono">{item.tooth_number || '—'}</td>
                          <td className="px-3 py-2 text-right font-bold text-slate-800">{fmt(item.cost)}</td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeItemFromCart(idx)}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50/80 font-bold border-t border-slate-200">
                        <td colSpan={2} className="px-3 py-2 text-right text-slate-500">Bill Total</td>
                        <td className="px-3 py-2 text-right text-primary-700 text-sm font-black">{fmt(calculatedTotal)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-400 italic">
                  No treatments selected. Use the builder above to select predefined items.
                </div>
              )}
            </div>
          )}

          {/* Form details for payment */}
          {selPatient && billItems.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Amount Paid Now (₹)</label>
                  <input
                    className="input text-lg font-bold text-slate-800"
                    type="number"
                    min="0"
                    max={calculatedTotal}
                    step="50"
                    placeholder="0"
                    value={billForm.paid_amount}
                    onChange={e => setBillForm(f => ({ ...f, paid_amount: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="label">Payment Method</label>
                  <div className="grid grid-cols-4 gap-2 h-12">
                    {METHODS.map(m => (
                      <button
                        type="button"
                        key={m.key}
                        onClick={() => setBillForm(f => ({ ...f, payment_method: m.key }))}
                        className={`rounded-xl border font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer h-full
                          ${billForm.payment_method === m.key
                            ? 'bg-primary-950 border-primary-500 text-primary-300 shadow-sm ring-1 ring-primary-500/20'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <span className="text-base mb-0.5">{m.icon}</span>
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Invoice Notes</label>
                <input
                  className="input"
                  placeholder="Optional billing remarks (e.g. discount applied, outstanding details...)"
                  value={billForm.notes}
                  onChange={e => setBillForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

              {/* Balance preview */}
              <div className={`rounded-xl px-5 py-4 font-bold flex justify-between items-center text-sm shadow-inner
                ${calculatedTotal - parseFloat(billForm.paid_amount || 0) > 0
                  ? 'bg-orange-50/80 text-orange-700 border border-orange-100'
                  : 'bg-emerald-50/80 text-emerald-700 border border-emerald-100'}`}>
                <span>Remaining Balance Due:</span>
                <span className="text-lg">{fmt(calculatedTotal - parseFloat(billForm.paid_amount || 0))}</span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        title="Record Payment Receipt"
        size="sm"
        footer={
          <div className="flex gap-2">
            <button onClick={() => setShowPayment(false)} className="btn-secondary">Cancel</button>
            <button id="btn-confirm-pay" onClick={handlePayment} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Record Payment ✓'}
            </button>
          </div>
        }
      >
        {activeBill && (
          <div className="space-y-4 text-slate-800">
            <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-sm border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Patient</span>
                <span className="font-bold text-slate-800">{activeBill.patient_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Total Bill</span>
                <span className="font-semibold text-slate-800">{fmt(activeBill.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Already Paid</span>
                <span className="font-semibold text-emerald-600">{fmt(activeBill.paid_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-red-500 pt-2 border-t border-slate-200">
                <span>Balance Due</span>
                <span className="text-base">{fmt(activeBill.balance)}</span>
              </div>
            </div>
            <div>
              <label className="label">Paid Amount (₹)</label>
              <input
                className="input text-2xl font-black text-slate-900 focus:ring-emerald-400"
                type="number"
                min="0"
                max={activeBill.balance}
                step="50"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="label">Payment Method</label>
              <div className="grid grid-cols-4 gap-2">
                {METHODS.map(m => (
                  <button
                    type="button"
                    key={m.key}
                    onClick={() => setPayMethod(m.key)}
                    className={`py-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer
                      ${payMethod === m.key
                        ? 'bg-primary-950 border-primary-500 text-primary-300 shadow-sm ring-1 ring-primary-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <span className="text-base mb-0.5">{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function generateReceiptHTML(bill, treatments = [], settings) {
  const date = new Date(bill.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  
  // Map receipt rows for treatment items
  const rowsHtml = treatments.length > 0 
    ? treatments.map((t, idx) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #475569; font-weight: 600;">${t.treatment_type} ${t.tooth_number ? `(Tooth #${t.tooth_number})` : ''}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right; color: #1e293b; font-weight: bold;">${settings.currency || '₹'}${t.cost}</td>
      </tr>
    `).join('')
    : `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #475569; font-weight: 600;">Dental Treatment Procedures</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right; color: #1e293b; font-weight: bold;">${settings.currency || '₹'}${bill.total_amount}</td>
      </tr>
    `;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - ${bill.patient_name}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 440px; margin: 0 auto; padding: 25px; color: #1e293b; background-color: #ffffff; }
    .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 18px; margin-bottom: 20px; }
    .clinic { font-size: 22px; font-weight: 800; color: #0f766e; letter-spacing: -0.02em; }
    .doctor { font-size: 13px; color: #475569; margin-top: 4px; font-weight: 600; }
    .meta-box { background: #f8fafc; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; border: 1px solid #f1f5f9; }
    .meta-row { display: flex; justify-content: space-between; font-size: 12px; margin: 5px 0; color: #64748b; }
    .meta-value { color: #1e293b; font-weight: 600; }
    .meta-title { font-weight: 500; }
    .table-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
    .total-box { margin-top: 20px; border-top: 2px solid #e2e8f0; padding-top: 15px; }
    .row { display: flex; justify-content: space-between; font-size: 13px; margin: 7px 0; color: #475569; }
    .grand-total { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 10px; }
    .paid { color: #10b981; font-weight: 700; }
    .balance { color: ${bill.balance > 0 ? '#ef4444' : '#10b981'}; font-weight: 700; }
    .footer { text-align: center; margin-top: 35px; font-size: 12px; color: #94a3b8; border-top: 1px dashed #e2e8f0; padding-top: 15px; font-weight: 500; }
    @media print {
      body { padding: 0; max-width: 100%; }
      .meta-box { border: 1px solid #cbd5e1; background: transparent; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="clinic">${settings?.clinic_name || "Dr. Mahe's Dentistry"}</div>
    <div class="doctor">${settings?.doctor_name || "Dr. Mahe"}</div>
    ${settings?.clinic_phone ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">Phone: ${settings.clinic_phone}</div>` : ''}
    ${settings?.clinic_address ? `<div style="font-size: 10px; color: #94a3b8; margin-top: 2px; max-width: 320px; margin-left: auto; margin-right: auto;">${settings.clinic_address}</div>` : ''}
  </div>

  <div class="meta-box">
    <div class="meta-row"><span class="meta-title">Receipt Invoice No.</span><span class="meta-value" style="font-family: monospace;">#${bill.id.slice(-8).toUpperCase()}</span></div>
    <div class="meta-row"><span class="meta-title">Billing Date</span><span class="meta-value">${date}</span></div>
    <div class="meta-row"><span class="meta-title">Patient Name</span><span class="meta-value" style="font-size: 13px; color: #0f766e;">${bill.patient_name}</span></div>
    ${bill.patient_phone ? `<div class="meta-row"><span class="meta-title">Patient Phone</span><span class="meta-value">${bill.patient_phone}</span></div>` : ''}
  </div>

  <div class="table-title">Treatment Details &amp; Charge Statement</div>
  <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 5px;">
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="total-box">
    <div class="row grand-total"><span>Total Charge</span><span>${settings?.currency || '₹'}${bill.total_amount}</span></div>
    <div class="row"><span>Amount Paid</span><span class="paid">${settings?.currency || '₹'}${bill.paid_amount}</span></div>
    <div class="row" style="border-top: 1px solid #f1f5f9; padding-top: 8px;"><span>Balance Due</span><span class="balance">${settings?.currency || '₹'}${bill.balance}</span></div>
    <div class="row"><span>Payment Method</span><span style="text-transform: capitalize; font-weight: 600; color: #1e293b;">${bill.payment_method}</span></div>
  </div>

  ${bill.notes ? `
    <div style="margin-top: 15px; background: #fafafa; border-radius: 8px; padding: 10px; font-size: 11px; color: #64748b; border: 1px solid #f1f5f9;">
      <strong>Remarks / Notes:</strong> ${bill.notes}
    </div>
  ` : ''}

  <div class="footer">
    Thank you for choosing ${settings?.clinic_name || "Dr. Mahe's Dentistry"}!<br>
    Wish you a healthy, beautiful smile.
  </div>
</body>
</html>`
}
