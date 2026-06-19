import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X, Printer, CreditCard, ShoppingBag, Trash2, Mail, RefreshCw, RotateCcw, ChevronDown } from 'lucide-react'
import {
  getAllBills, getBillsByPatient, createBill, updateBillPayment,
  getAllPatients, searchPatients,
  getTreatmentsByPatient, getTreatmentsByAppointment, getTreatmentsByBill, getPatientAppointments,
  getPaymentsByBill, searchBills, emailBillInvoice
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
  const [billPage, setBillPage] = useState(1)
  const [billsHasMore, setBillsHasMore] = useState(false)
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
    paid_amount: '', payment_method: 'cash', notes: '', discount: '', tax_percent: ''
  })

  // Payment modal state
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('cash')

  // Payment history
  const [showHistory, setShowHistory] = useState(false)
  const [historyBill, setHistoryBill] = useState(null)
  const [historyItems, setHistoryItems] = useState([])

  // Email invoice
  const [showEmail, setShowEmail] = useState(false)
  const [emailBillData, setEmailBillData] = useState(null)
  const [emailAddr, setEmailAddr] = useState('')

  const load = useCallback(async (page = 1) => {
    const data = search.trim()
      ? await searchBills(search, page)
      : await getAllBills(`?page=${page}&limit=50`)
    if (page === 1) {
      setBills(data.items || [])
    } else {
      setBills(prev => [...prev, ...(data.items || [])])
    }
    setBillPage(page)
    setBillsHasMore(data.hasMore || false)
  }, [search])

  useEffect(() => { load(1) }, [load])

  // Patient search in create modal
  useEffect(() => {
    if (!showCreate) return
    const t = setTimeout(async () => {
      const data = patSearch.trim() ? await searchPatients(patSearch) : await getAllPatients('?limit=20')
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
      id: t.id,  // Preserve treatment ID to avoid duplicates
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
    setBillForm({ paid_amount: '', payment_method: 'cash', notes: '', discount: '', tax_percent: '' })
    setShowCreate(true)
  }

  const calculatedTotal = billItems.reduce((sum, item) => sum + item.cost, 0)
  const discountPercent = Math.min(100, Math.max(0, parseFloat(billForm.discount) || 0))
  const taxPercent = Math.min(100, Math.max(0, parseFloat(billForm.tax_percent) || 0))
  const finalTotal = Math.round((calculatedTotal * (1 - discountPercent / 100)) * (1 + taxPercent / 100) * 100) / 100
  const paidNow = parseFloat(billForm.paid_amount) || 0
  const balancePreview = Math.max(0, finalTotal - paidNow)

  async function handleCreate() {
    if (!selPatient) { notify('Select a patient', 'error'); return }
    if (billItems.length === 0) { notify('Add at least one treatment item', 'error'); return }
    if (paidNow > finalTotal) { notify(`Paid amount cannot exceed final total of ${fmt(finalTotal)}`, 'error'); return }

    setSaving(true)
    try {
      // Separate existing treatments (with IDs) from new treatments (without IDs)
      const existingTreatmentIds = billItems
        .filter(item => item.id)  // Has ID = existing treatment
        .map(item => item.id)

      const newTreatments = billItems
        .filter(item => !item.id)  // No ID = new treatment
        .map(item => ({
          treatment_type: item.treatment_type,
          cost: item.cost,
          tooth_number: item.tooth_number || '',
          description: item.description || ''
        }))

      await createBill({
        patient_id: selPatient.id,
        appointment_id: selAppt?.id || null,
        existingTreatmentIds,     // Pass IDs of existing treatments
        treatments: newTreatments, // Pass only new treatments to insert
        paid_amount: paidNow,
        payment_method: billForm.payment_method,
        discount: discountPercent,
        tax_percent: taxPercent,
        notes: billForm.notes
      })
      notify('Bill and treatments saved successfully')
      setShowCreate(false)
      load(1)
    } catch (e) {
      notify(e.message || 'Failed to create bill', 'error')
    } finally { setSaving(false) }
  }

  async function handlePayment() {
    const amount = parseFloat(payAmount)
    if (!amount || amount <= 0) { notify('Enter payment amount', 'error'); return }
    if (amount > activeBill.balance) { notify(`Amount cannot exceed balance of ${fmt(activeBill.balance)}`, 'error'); return }
    setSaving(true)
    try {
      await updateBillPayment(activeBill.id, {
        amount,
        payment_method: payMethod,
      })
      notify('Payment recorded')
      setShowPayment(false)
      load(1)
    } catch (e) {
      notify(e.message || 'Failed to record payment', 'error')
    } finally { setSaving(false) }
  }

  function openPayment(bill) {
    setActiveBill(bill)
    setPayAmount(bill.balance.toString())
    setPayMethod('cash')
    setShowPayment(true)
  }

  async function handleViewHistory(bill) {
    setHistoryBill(bill)
    setShowHistory(true)
    try {
      const data = await getPaymentsByBill(bill.id)
      setHistoryItems(data || [])
    } catch (e) {
      notify('Failed to load payment history', 'error')
      setHistoryItems([])
    }
  }

  function openEmail(bill) {
    setEmailBillData(bill)
    setEmailAddr('') // Ideally fetch from patient details if available
    setShowEmail(true)
  }

  async function handleEmail() {
    if (!emailAddr || !emailAddr.includes('@')) { notify('Enter a valid email address', 'error'); return }
    setSaving(true)
    try {
      await emailBillInvoice(emailBillData.id, emailAddr)
      notify('Invoice sent successfully to ' + emailAddr)
      setShowEmail(false)
    } catch (e) {
      notify(e.message || 'Failed to send email', 'error')
    } finally { setSaving(false) }
  }

  // Modified receipt printer to fetch live treatments details for the bill items printout
  async function printBill(bill) {
    let txs = []
    try {
      txs = await getTreatmentsByBill(bill.id)
      if (txs.length === 0 && bill.appointment_id) {
        txs = await getTreatmentsByAppointment(bill.appointment_id)
      }
    } catch (e) {
      console.warn('Failed fetching treatments for receipt:', e)
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
          <p className="page-sub">Create bills, collect payments and generate invoices</p>
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
                  <td className="text-slate-500 font-mono text-xs pl-6">
                    {b.invoice_number || `...${b.id.slice(-6)}`}
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
                          className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap"
                        >
                          + Payment
                        </button>
                      )}
                      {b.paid_amount > 0 && (
                        <button
                          onClick={() => handleViewHistory(b)}
                          className="btn-icon bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl"
                          title="Payment History"
                        >
                          <CreditCard size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => openEmail(b)}
                        className="btn-icon bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl"
                        title="Email Invoice"
                      >
                        <Mail size={14} />
                      </button>
                      <button
                        id={`btn-print-${b.id}`}
                        onClick={() => printBill(b)}
                        className="btn-icon bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl"
                        title="Print / Save PDF"
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

      {/* Load More */}
      {billsHasMore && (
        <div className="text-center mt-4">
          <button
            onClick={() => load(billPage + 1)}
            className="btn-secondary text-sm"
          >
            Load More Bills
          </button>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="label">Discount (%)</label>
                  <input
                    className="input"
                    type="number" min="0" max="100" placeholder="0"
                    value={billForm.discount}
                    onChange={e => setBillForm(f => ({ ...f, discount: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">GST (%)</label>
                  <input
                    className="input"
                    type="number" min="0" max="100" placeholder="0"
                    value={billForm.tax_percent}
                    onChange={e => setBillForm(f => ({ ...f, tax_percent: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label flex justify-between">
                    Final Total
                    <span className="text-primary-700 font-bold">
                      {fmt(finalTotal)}
                    </span>
                  </label>
                  <input
                    className="input font-bold text-slate-800"
                    type="number" min="0" step="10" placeholder="0"
                    value={billForm.paid_amount}
                    onChange={e => setBillForm(f => ({ ...f, paid_amount: e.target.value }))}
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Amount Paid Now (₹)</span>
                </div>
              </div>
              <div>
                <label className="label">Payment Method</label>
                <div className="grid grid-cols-4 gap-2 h-12">
                  {METHODS.map(m => (
                    <button
                      type="button"
                      key={m.key}
                      onClick={() => setBillForm(f => ({ ...f, payment_method: m.key }))}
                      className={`rounded-xl border font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer h-full ${billForm.payment_method === m.key ? 'bg-primary-950 border-primary-500 text-primary-300 shadow-sm ring-1 ring-primary-500/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <span className="text-base mb-0.5">{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Invoice Notes</label>
                <input
                  className="input"
                  placeholder="Optional billing remarks (e.g. discount applied, outstanding details...)"
                  value={billForm.notes || ''}
                  onChange={e => setBillForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

              {/* Balance preview */}
              <div className={`rounded-xl px-5 py-4 font-bold flex justify-between items-center text-sm shadow-inner ${balancePreview > 0 ? 'bg-orange-50/80 text-orange-700 border border-orange-100' : 'bg-emerald-50/80 text-emerald-700 border border-emerald-100'}`}>
                <span>Remaining Balance Due:</span>
                <span className="text-lg">{fmt(balancePreview)}</span>
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
        {/* History Modal */}
      <Modal
        open={showHistory}
        onClose={() => setShowHistory(false)}
        title={`Payment History: ${historyBill?.patient_name}`}
        size="md"
        footer={<button onClick={() => setShowHistory(false)} className="btn-secondary w-full">Close</button>}
      >
        {historyItems.length > 0 ? (
          <div className="space-y-3">
            {historyItems.map((item, idx) => (
              <div key={item.id || idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800 text-base">{fmt(item.amount)}</p>
                  <p className="text-xs text-slate-500 font-medium capitalize mt-0.5">{item.method} • {new Date(item.paid_at).toLocaleString()}</p>
                </div>
                {item.notes && <p className="text-xs text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">{item.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-6">No payments recorded yet.</p>
        )}
      </Modal>

      {/* Email Modal */}
      <Modal
        open={showEmail}
        onClose={() => setShowEmail(false)}
        title="Email Invoice"
        size="sm"
        footer={
          <div className="flex gap-2 w-full">
            <button onClick={() => setShowEmail(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleEmail} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Sending…' : 'Send Email ✉'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Send invoice receipt to {emailBillData?.patient_name}.</p>
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="patient@example.com"
              value={emailAddr}
              onChange={e => setEmailAddr(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

function generateReceiptHTML(bill, treatments = [], settings) {
  const date = new Date(bill.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  const cur = settings?.currency || '₹'

  const rowsHtml = treatments.length > 0
    ? treatments.map((t, idx) => `
        <tr>
          <td class="td-desc">
            ${idx + 1}.&nbsp; ${t.treatment_type}
            ${t.tooth_number ? `<span class="tooth">Tooth #${t.tooth_number}</span>` : ''}
            ${t.description ? `<br><span class="note">${t.description}</span>` : ''}
          </td>
          <td class="td-amt">${cur}${Number(t.cost).toLocaleString('en-IN')}</td>
        </tr>
      `).join('')
    : `<tr>
        <td class="td-desc">1.&nbsp; Dental Treatment Procedures</td>
        <td class="td-amt">${cur}${Number(bill.total_amount).toLocaleString('en-IN')}</td>
      </tr>`

  const subtotal = treatments.reduce((s, t) => s + (t.cost || 0), 0) || bill.total_amount
  const discountHtml = bill.discount > 0 ? `
    <div class="sum-row">
      <span>Discount (${bill.discount}%)</span>
      <span>- ${cur}${Math.round(subtotal * bill.discount / 100).toLocaleString('en-IN')}</span>
    </div>
  ` : ''
  
  const taxHtml = bill.tax_percent > 0 ? `
    <div class="sum-row">
      <span>GST (${bill.tax_percent}%)</span>
      <span>+ ${cur}${Number(bill.tax_amount || 0).toLocaleString('en-IN')}</span>
    </div>
  ` : ''

  const isPaid = bill.balance <= 0
  const balanceColor = isPaid ? '#276749' : '#c53030'
  const letterheadUrl = '/Letter Head.png'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Invoice – ${bill.patient_name}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page { size: A4; margin: 0; }

    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #ffffff;
      color: #1a202c;
      font-size: 12px;
      line-height: 1.6;
    }

    /* Letterhead pinned behind everything */
    .lh {
      position: fixed;
      inset: 0;
      width: 210mm;
      height: 297mm;
      z-index: 0;
      pointer-events: none;
    }
    .lh img { 
      width: 100%; 
      height: 100%; 
      object-fit: fill; 
      display: block; 
      opacity: 0.03;
    }

    /* Content sits on top */
    .wrap {
      position: relative;
      z-index: 1;
      padding: 58mm 17mm 38mm 17mm;
    }

    /* ── Invoice label ── */
    .inv-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #D8C3A5;
      margin-bottom: 2mm;
    }
    
    .inv-number {
      font-size: 14px;
      font-weight: 800;
      color: #1a202c;
      margin-bottom: 5mm;
    }

    /* ── Patient Info Block ── */
    .patient-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2mm 6mm;
      margin-bottom: 7mm;
      font-size: 12px;
    }
    .patient-info-grid div strong {
      display: inline-block;
      width: 90px;
      color: #718096;
      font-weight: 600;
    }

    /* ── Divider ── */
    .rule { border: none; border-top: 1px solid #e8e0d4; margin: 0 0 5mm 0; }

    /* ── Section heading ── */
    .sec {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #D8C3A5;
      margin-bottom: 2mm;
    }

    /* ── Treatment table ── */
    table { width: 100%; border-collapse: collapse; }
    .th-desc, .th-amt {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #D8C3A5;
      padding: 6px 8px;
      background: #f8f6f2;
      border-bottom: 1px solid #e8e0d4;
    }
    .th-amt { text-align: right; }

    tbody tr:nth-child(even) {
      background: #fafafa;
    }

    .td-desc {
      padding: 8px;
      font-size: 12px;
      font-weight: 600;
      color: #2d3748;
      vertical-align: top;
    }
    .td-amt {
      padding: 8px;
      font-size: 12px;
      font-weight: 700;
      color: #1a202c;
      text-align: right;
      white-space: nowrap;
      vertical-align: top;
    }
    .tooth {
      font-size: 10px;
      font-weight: 500;
      color: #D8C3A5;
      margin-left: 4px;
    }
    .note {
      font-size: 10px;
      font-weight: 400;
      color: #718096;
    }

    /* ── Summary lines ── */
    .sum-wrap {
      width: 50%;
      margin-left: auto;
      margin-top: 4mm;
    }
    .sum-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 8px;
      font-size: 12px;
      color: #4a5568;
    }
    .sum-row.total {
      font-size: 14px;
      font-weight: 800;
      color: #1a202c;
      padding: 6px 8px;
      border-top: 1px solid #e8e0d4;
      margin-top: 1mm;
    }
    .sum-row.total span:last-child { color: #D8C3A5; }
    .c-green { color: #276749; font-weight: 700; }
    .c-bal   { color: ${balanceColor}; font-weight: 800; }

    /* ── Payment method ── */
    .pay-line {
      font-size: 11px;
      color: #718096;
      margin-top: 3mm;
    }
    .pay-line strong {
      color: #2d3748;
      text-transform: capitalize;
    }

    /* ── Status text ── */
    .status-line {
      margin-top: 5mm;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: ${balanceColor};
    }

    /* ── Notes ── */
    .notes {
      margin-top: 5mm;
      font-size: 11px;
      color: #718096;
      font-style: italic;
    }
    .notes strong { color: #2d3748; font-style: normal; }

    /* ── Signature ── */
    .signature {
      margin-top: 40px;
      text-align: right;
    }
    .signature .line {
      width: 180px;
      border-top: 1px solid #999;
      margin-left: auto;
      margin-bottom: 8px;
    }
    .signature p {
      font-size: 12px;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
      line-height: 1.4;
    }
    .signature p:last-child {
      font-size: 11px;
      font-weight: 400;
      color: #718096;
    }

    /* ── Thank you ── */
    .ty {
      margin-top: 7mm;
      font-size: 11px;
      color: #a0aec0;
      font-style: italic;
      text-align: center;
    }

    @media print {
      body { width: 210mm; }
      .lh { position: fixed; }
    }
  </style>
</head>
<body>

  <div class="lh"><img src="${letterheadUrl}" alt="" /></div>

  <div class="wrap">
    <div class="inv-label">Invoice Receipt</div>
    ${bill.invoice_number ? `<div class="inv-number">${bill.invoice_number}</div>` : ''}
    <div class="patient-info-grid">
      <div><strong>Patient Name:</strong> ${bill.patient_name}</div>
      <div><strong>Date:</strong> ${date}</div>
      ${bill.patient_phone ? `<div><strong>Phone:</strong> ${bill.patient_phone}</div>` : ''}
    </div>

    <hr class="rule">

    <p class="sec">Treatment Details</p>
    <table>
      <thead>
        <tr>
          <th class="th-desc">Description</th>
          <th class="th-amt">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="sum-wrap">
      <div class="sum-row">
        <span>Subtotal</span>
        <span>${cur}${Number(subtotal).toLocaleString('en-IN')}</span>
      </div>
      ${discountHtml}
      ${taxHtml}
      <div class="sum-row total">
        <span>Grand Total</span>
        <span>${cur}${Number(bill.total_amount).toLocaleString('en-IN')}</span>
      </div>

      <div style="margin-top:2mm; border-top:1px solid #e8e0d4; padding-top:2mm;">
        <div class="sum-row">
          <span>Amount Paid</span>
          <span class="c-green">${cur}${Number(bill.paid_amount).toLocaleString('en-IN')}</span>
        </div>
        <div class="sum-row">
          <span>Balance Due</span>
          <span class="c-bal">${isPaid ? 'Nil' : cur + Number(bill.balance).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>

    <p class="pay-line">Payment via <strong>${bill.payment_method}</strong></p>

    <p class="status-line">${isPaid ? '✓ Fully Settled' : '⚠ Balance Due'}</p>

    ${bill.notes ? `<p class="notes"><strong>Note:</strong> ${bill.notes}</p>` : ''}

    <div class="signature">
      <div class="line"></div>
      <p>Dr. S Maheswari, BDS</p>
      <p>Dental Surgeon</p>
    </div>

    <p class="ty">Thank you for choosing ${settings?.clinic_name || "Dr. Mahe's Dentistry"} — Wishing you a healthy smile.</p>

  </div>

  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`
}


