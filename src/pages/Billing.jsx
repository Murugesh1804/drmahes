import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X, Printer, CreditCard, ShoppingBag, Trash2, Mail, Edit2 } from 'lucide-react'
import {
  getAllBills, getBillsByPatient, createBill, updateBillPayment, updateBill, getBillEditHistory,
  getAllPatients, searchPatients,
  getTreatmentsByPatient, getTreatmentsByAppointment, getTreatmentsByBill, getPatientAppointments,
  getPaymentsByBill, searchBills, emailBillInvoice,
  getUnbilledTreatments, getAllTreatmentMasters, getAllMedicineMasters
} from '../services/api'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import { generateReceiptHTML } from '../utils/printer'

const BILL_COLORS = { paid: 'badge-paid', partial: 'badge-partial', pending: 'badge-pending' }

export default function Billing() {
  const { notify, fmt, settings } = useApp()
  const navigate = useNavigate()
  
  const [bills, setBills] = useState([])
  const [billPage, setBillPage] = useState(1)
  const [billsHasMore, setBillsHasMore] = useState(false)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  // Master Data
  const [treatmentMasters, setTreatmentMasters] = useState([])
  const [medicineMasters, setMedicineMasters] = useState([])

  // Modals visibility
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showEmail, setShowEmail] = useState(false)

  const [activeBill, setActiveBill] = useState(null)

  // --- Create Bill State ---
  const [patSearch, setPatSearch] = useState('')
  const [patients, setPatients] = useState([])
  const [selPatient, setSelPatient] = useState(null)
  
  // Unbilled Treatments Section
  const [unbilledTreatments, setUnbilledTreatments] = useState([])
  const [selectedUnbilled, setSelectedUnbilled] = useState(new Set())
  
  // Cart Builder State (Treatments)
  const [billItems, setBillItems] = useState([])
  const [cartSelect, setCartSelect] = useState('')
  const [cartCost, setCartCost] = useState('')
  const [cartTooth, setCartTooth] = useState('')
  const [cartDesc, setCartDesc] = useState('')

  // Cart Builder State (Medicines)
  const [cartMedSelect, setCartMedSelect] = useState('')
  const [cartMedCost, setCartMedCost] = useState('')
  const [cartMedDesc, setCartMedDesc] = useState('')

  const [billForm, setBillForm] = useState({
    paid_amount: '', payment_method: 'cash', notes: '', discount: '', tax_percent: ''
  })

  // --- Edit Bill State ---
  const [editForm, setEditForm] = useState({
    discount: '', tax_percent: '', notes: '', change_description: ''
  })
  const [editHistory, setEditHistory] = useState([])

  // --- Payment / Other State ---
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('cash')
  const [historyItems, setHistoryItems] = useState([])
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

  // Load masters
  useEffect(() => {
    getAllTreatmentMasters().then(data => setTreatmentMasters(data || [])).catch(console.error)
    getAllMedicineMasters().then(data => setMedicineMasters(data || [])).catch(console.error)
  }, [])

  // Patient search in create modal
  useEffect(() => {
    if (!showCreate) return
    const t = setTimeout(async () => {
      const data = patSearch.trim() ? await searchPatients(patSearch) : await getAllPatients('?limit=20')
      setPatients((data || []).slice(0, 20))
    }, 250)
    return () => clearTimeout(t)
  }, [patSearch, showCreate])

  // Load patient's unbilled treatments when selected
  useEffect(() => {
    if (!selPatient) { 
      setUnbilledTreatments([])
      setSelectedUnbilled(new Set())
      return 
    }
    getUnbilledTreatments(selPatient.id).then(txs => {
      setUnbilledTreatments(txs || [])
      // Default to empty selection - user must explicitly choose treatments
      setSelectedUnbilled(new Set())
    }).catch(console.error)
  }, [selPatient])

  // Sync selected unbilled treatments to bill items
  useEffect(() => {
    if (!selPatient) return
    const unbilledItems = unbilledTreatments
      .filter(t => selectedUnbilled.has(t.id))
      .map(t => ({
        id: t.id,
        treatment_type: t.treatment_type,
        cost: t.cost || 0,
        tooth_numbers: t.tooth_numbers || [],
        description: t.description || '',
        isUnbilled: true
      }))

    // Keep existing manual items, replace unbilled items
    setBillItems(prev => {
      const manualItems = prev.filter(item => !item.isUnbilled)
      return [...unbilledItems, ...manualItems]
    })
  }, [selectedUnbilled, unbilledTreatments, selPatient])

  function toggleUnbilled(id) {
    const next = new Set(selectedUnbilled)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedUnbilled(next)
  }

  // Populate cost automatically when predefined treatment is picked
  const calculateCartCost = useCallback((treatmentName, toothStr) => {
    const matched = treatmentMasters.find(t => t.treatment_name === treatmentName)
    if (!matched) return ''
    const teeth = toothStr ? toothStr.split(',').map(s => s.trim()).filter(Boolean) : []
    const count = teeth.length > 0 ? teeth.length : 1
    return (matched.standard_cost * count).toString()
  }, [treatmentMasters])

  function handlePredefinedChange(name) {
    setCartSelect(name)
    setCartCost(calculateCartCost(name, cartTooth))
  }

  function handleToothChange(toothStr) {
    setCartTooth(toothStr)
    setCartCost(calculateCartCost(cartSelect, toothStr))
  }

  function addItemToCart() {
    if (!cartSelect) { notify('Select a treatment type', 'error'); return }
    const costNum = parseFloat(cartCost) || 0
    if (costNum <= 0) { notify('Selected treatment has no configured cost', 'error'); return }

    const newItem = {
      treatment_type: cartSelect,
      cost: costNum,
      tooth_numbers: cartTooth ? cartTooth.split(',').map(s => s.trim()).filter(Boolean) : [],
      description: cartDesc.trim(),
      isUnbilled: false
    }

    setBillItems([...billItems, newItem])
    setCartSelect(''); setCartCost(''); setCartTooth(''); setCartDesc('')
  }

  function removeItemFromCart(index) {
    const list = [...billItems]
    const item = list[index]
    if (item.isUnbilled) {
      // If it's an unbilled item, just uncheck it
      const next = new Set(selectedUnbilled)
      next.delete(item.id)
      setSelectedUnbilled(next)
    } else {
      list.splice(index, 1)
      setBillItems(list)
    }
  }

  function handlePredefinedMedChange(name) {
    setCartMedSelect(name)
    const matched = medicineMasters.find(m => m.item_name === name)
    setCartMedCost(matched ? matched.standard_cost.toString() : '')
  }

  function addMedToCart() {
    if (!cartMedSelect) { notify('Select a medicine or product', 'error'); return }
    const costNum = parseFloat(cartMedCost) || 0
    if (costNum <= 0) { notify('Selected item has no configured cost', 'error'); return }

    const newItem = {
      treatment_type: `Medicine: ${cartMedSelect}`,
      cost: costNum,
      tooth_numbers: [],
      description: cartMedDesc.trim(),
      isUnbilled: false
    }

    setBillItems([...billItems, newItem])
    setCartMedSelect(''); setCartMedCost(''); setCartMedDesc('')
  }

  function openCreate() {
    setPatSearch(''); setSelPatient(null); setBillItems([])
    setUnbilledTreatments([]); setSelectedUnbilled(new Set())
    setCartSelect(''); setCartCost(''); setCartTooth(''); setCartDesc('')
    setCartMedSelect(''); setCartMedCost(''); setCartMedDesc('')
    setBillForm({ paid_amount: '', payment_method: 'cash', notes: '', discount: '', tax_percent: '', manual_charges: '', medicine_charges: '' })
    setShowCreate(true)
  }

  function openEdit(bill) {
    setActiveBill(bill)
    setEditForm({
      discount: bill.discount || 0,
      tax_percent: bill.tax_percent || 0,
      notes: bill.notes || '',
      change_description: '',
      manual_charges: bill.manual_charges || 0,
      medicine_charges: bill.medicine_charges || 0
    })
    setShowEdit(true)
    getBillEditHistory(bill.id).then(h => setEditHistory(h || [])).catch(console.error)
  }

  const calculatedTotal = billItems.reduce((sum, item) => sum + item.cost, 0)
  const manualCharges = parseFloat(billForm.manual_charges) || 0
  const medicineCharges = parseFloat(billForm.medicine_charges) || 0
  const discountAmount = parseFloat(billForm.discount) || 0
  const taxPercent = Math.min(100, Math.max(0, parseFloat(billForm.tax_percent) || 0))
  const baseTotal = calculatedTotal + manualCharges + medicineCharges - discountAmount
  const taxAmount = Math.round(baseTotal * (taxPercent / 100) * 100) / 100
  const finalTotal = Math.round((baseTotal + taxAmount) * 100) / 100
  const paidNow = parseFloat(billForm.paid_amount) || 0
  const balancePreview = Math.max(0, finalTotal - paidNow)

  async function handleCreate() {
    if (!selPatient) { notify('Select a patient', 'error'); return }
    if (billItems.length === 0) { notify('Add at least one treatment item', 'error'); return }
    
    // Validate that all items have cost > 0
    const zeroCostItems = billItems.filter(item => item.cost <= 0)
    if (zeroCostItems.length > 0) {
      notify('Some treatments have no configured cost. Please remove them or configure cost in Treatment Masters.', 'error')
      return
    }
    
    if (paidNow > finalTotal) { notify(`Paid amount cannot exceed final total of ${fmt(finalTotal)}`, 'error'); return }

    setSaving(true)
    try {
      const existingTreatmentIds = billItems.filter(i => i.isUnbilled).map(i => i.id)
      const newTreatments = billItems.filter(i => !i.isUnbilled).map(item => ({
        treatment_type: item.treatment_type,
        cost: item.cost,
        tooth_numbers: item.tooth_numbers || [],
        description: item.description || ''
      }))

      await createBill({
        patient_id: selPatient.id,
        existingTreatmentIds,
        treatments: newTreatments,
        paid_amount: paidNow,
        payment_method: billForm.payment_method,
        discount: discountAmount,
        tax_percent: taxPercent,
        notes: billForm.notes,
        manual_charges: manualCharges,
        medicine_charges: medicineCharges
      })
      notify('Invoice created successfully')
      setShowCreate(false)
      load(1)
    } catch (e) {
      notify(e.message || 'Failed to create bill', 'error')
    } finally { setSaving(false) }
  }

  async function handleEditBill() {
    if (!editForm.change_description.trim()) { notify('Please provide a reason for the edit', 'error'); return }
    setSaving(true)
    try {
      await updateBill(activeBill.id, {
        discount: parseFloat(editForm.discount) || 0,
        tax_percent: parseFloat(editForm.tax_percent) || 0,
        notes: editForm.notes,
        change_description: editForm.change_description,
        manual_charges: parseFloat(editForm.manual_charges) || 0,
        medicine_charges: parseFloat(editForm.medicine_charges) || 0
      })
      notify('Bill updated')
      setShowEdit(false)
      load(1)
    } catch (e) {
      notify(e.message || 'Failed to update bill', 'error')
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
    setActiveBill(bill)
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
    setActiveBill(bill)
    setEmailAddr('')
    setShowEmail(true)
  }

  async function handleEmail() {
    if (!emailAddr || !emailAddr.includes('@')) { notify('Enter a valid email address', 'error'); return }
    setSaving(true)
    try {
      await emailBillInvoice(activeBill.id, emailAddr)
      notify('Invoice sent successfully to ' + emailAddr)
      setShowEmail(false)
    } catch (e) {
      notify(e.message || 'Failed to send email', 'error')
    } finally { setSaving(false) }
  }

  async function printBill(bill) {
    let txs = []
    try { txs = await getTreatmentsByBill(bill.id) } catch (e) { console.warn(e) }
    const html = generateReceiptHTML(bill, txs, settings)
    if (typeof window !== 'undefined' && window.electronAPI !== undefined) {
      window.electronAPI.printReceipt(html)
    } else {
      const w = window.open('', '_blank')
      w.document.write(html)
      w.document.close()
      w.onload = () => {
        w.focus()
        w.print()
      }
      // Fallback in case onload doesn't fire
      setTimeout(() => {
        if (w.document.readyState === 'complete') {
          w.focus()
          w.print()
        }
      }, 1000)
    }
  }

  const filtered = bills.filter(b => b && (!search || (b.patient_name || '').toLowerCase().includes(search.toLowerCase())))

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      {/* Header bar */}
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Billing &amp; Invoices</h1>
          <p className="page-sub">Create bills, collect payments and generate invoices</p>
        </div>
        <button id="btn-create-bill" onClick={openCreate} className="btn-primary flex-shrink-0">
          <Plus size={16} /> Create New Bill
        </button>
      </div>

      <div className="card">
        <div className="relative w-72 mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by patient name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state py-16">
            <p className="font-semibold text-slate-500">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td className="text-slate-500 font-mono text-xs">{b.invoice_number || `...${b.id.slice(-6)}`}</td>
                    <td>
                      <button onClick={() => navigate(`/patients/${b.patient_id}`)} className="font-bold text-slate-800 hover:text-primary-600">
                        {b.patient_name}
                      </button>
                    </td>
                    <td className="text-slate-500 text-xs">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                    <td className="font-semibold">{fmt(b.total_amount)}</td>
                    <td className="text-emerald-600 font-semibold">{fmt(b.paid_amount)}</td>
                    <td className={b.balance > 0 ? 'text-red-500 font-bold' : 'text-slate-400 font-semibold'}>
                      {b.balance > 0 ? fmt(b.balance) : 'Settled'}
                    </td>
                    <td><span className={BILL_COLORS[b.status]}>{b.status}</span></td>
                    <td className="text-right">
                      <div className="flex gap-1 justify-end">
                        {b.status !== 'paid' && (
                          <button onClick={() => openPayment(b)} className="btn-icon text-emerald-600 hover:bg-emerald-50" title="Record Payment">
                            <CreditCard size={14} />
                          </button>
                        )}
                        <button onClick={() => openEdit(b)} className="btn-icon text-slate-400 hover:text-primary-600" title="Edit Bill">
                          <Edit2 size={14} />
                        </button>
                        {b.paid_amount > 0 && (
                          <button onClick={() => handleViewHistory(b)} className="btn-icon text-slate-400 hover:text-primary-600" title="Payment History">
                            <ShoppingBag size={14} />
                          </button>
                        )}
                        <button onClick={() => openEmail(b)} className="btn-icon text-blue-400 hover:text-blue-600" title="Email Invoice">
                          <Mail size={14} />
                        </button>
                        <button onClick={() => printBill(b)} className="btn-icon text-slate-400 hover:text-primary-600" title="Print PDF">
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
        
        {billsHasMore && (
          <div className="text-center mt-4">
            <button onClick={() => load(billPage + 1)} className="btn-secondary text-sm">Load More</button>
          </div>
        )}
      </div>

      {/* CREATE BILL MODAL */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Patient Invoice" size="lg"
        footer={
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button id="btn-save-bill" onClick={handleCreate} disabled={saving || !selPatient || billItems.length === 0} className="btn-primary">
              {saving ? 'Saving…' : 'Generate Invoice ✓'}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Patient Selection */}
          {!selPatient ? (
            <div>
              <label className="label">Search Patient *</label>
              <div className="relative mb-2">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input pl-10" placeholder="Type patient name..." value={patSearch} onChange={e => setPatSearch(e.target.value)} />
              </div>
              {patients.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl divide-y">
                  {patients.map(p => (
                    <button key={p.id} onClick={() => setSelPatient(p)} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex justify-between items-center">
                      <span className="font-bold text-sm">{p.name}</span>
                      {p.phone && <span className="text-slate-400 text-xs">{p.phone}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-primary-50 rounded-xl px-4 py-3">
              <div><p className="font-bold text-primary-800">{selPatient.name}</p></div>
              <button onClick={() => setSelPatient(null)} className="text-primary-400 hover:text-primary-700"><X size={16} /></button>
            </div>
          )}

          {selPatient && (
            <>
              {/* Unbilled Treatments Selection */}
              {unbilledTreatments.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <ShoppingBag size={14} /> Unbilled Completed Treatments
                  </p>
                  <div className="space-y-2">
                    {unbilledTreatments.map(t => (
                      <label key={t.id} className="flex items-start gap-3 p-2 bg-white rounded-lg border border-amber-100 cursor-pointer hover:bg-amber-50">
                        <input type="checkbox" className="mt-1 text-amber-600" checked={selectedUnbilled.has(t.id)} onChange={() => toggleUnbilled(t.id)} />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-slate-800">{t.treatment_type}</p>
                          {(t.tooth_numbers?.length > 0 || t.description) && (
                            <p className="text-xs text-slate-500">
                              {t.tooth_numbers?.length > 0 && `Teeth: ${t.tooth_numbers.join(', ')} `}
                              {t.description}
                            </p>
                          )}
                        </div>
                        <p className="font-bold text-slate-800">{fmt(t.cost || 0)}</p>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Cart Builder */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Add Custom Items</p>
                <div className="grid grid-cols-12 gap-3 mb-4">
                  <div className="col-span-4">
                    <select className="select text-xs h-9" value={cartSelect} onChange={e => handlePredefinedChange(e.target.value)}>
                      <option value="">— Select Treatment Master —</option>
                      {treatmentMasters.map(t => <option key={t.id} value={t.treatment_name}>{t.treatment_name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input type="number" className="input text-xs h-9 bg-slate-100" placeholder="Cost" value={cartCost} readOnly />
                  </div>
                  <div className="col-span-2">
                    <input type="text" className="input text-xs h-9" placeholder="Tooth #" value={cartTooth} onChange={e => handleToothChange(e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input type="text" className="input text-xs h-9" placeholder="Desc" value={cartDesc} onChange={e => setCartDesc(e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <button type="button" onClick={addItemToCart} className="w-full btn-primary h-9 text-xs py-0">+ Add</button>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3 mb-4">
                  <div className="col-span-4">
                    <select className="select text-xs h-9" value={cartMedSelect} onChange={e => handlePredefinedMedChange(e.target.value)}>
                      <option value="">— Select Medicine/Product —</option>
                      {medicineMasters.map(m => <option key={m.id} value={m.item_name}>{m.item_name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input type="number" className="input text-xs h-9 bg-slate-100" placeholder="Cost" value={cartMedCost} readOnly />
                  </div>
                  <div className="col-span-4">
                    <input type="text" className="input text-xs h-9" placeholder="Desc/Dosage" value={cartMedDesc} onChange={e => setCartMedDesc(e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <button type="button" onClick={addMedToCart} className="w-full btn-primary h-9 text-xs py-0 bg-emerald-600 hover:bg-emerald-700 border-emerald-700">+ Add Med</button>
                  </div>
                </div>

                {billItems.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 divide-y">
                    {billItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3">
                        <div>
                          <p className="font-semibold text-sm">{item.treatment_type} {item.isUnbilled && <span className="text-[10px] bg-amber-100 text-amber-700 px-1 rounded ml-1">UNBILLED</span>}</p>
                          <p className="text-xs text-slate-400">
                            {item.tooth_numbers?.length > 0 && `Tooth: ${item.tooth_numbers.join(', ')} `}
                            {item.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-bold text-slate-800">{fmt(item.cost)}</p>
                          <button onClick={() => removeItemFromCart(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals & Payment */}
              <div className="grid grid-cols-2 gap-6 bg-primary-50/30 p-5 rounded-2xl border border-primary-100">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Manual Charges (₹)</label>
                      <input type="number" className="input" placeholder="0" value={billForm.manual_charges} onChange={e => setBillForm({ ...billForm, manual_charges: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Medicine Charges (₹)</label>
                      <input type="number" className="input" placeholder="0" value={billForm.medicine_charges} onChange={e => setBillForm({ ...billForm, medicine_charges: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Discount (₹)</label>
                      <input type="number" className="input" placeholder="0" value={billForm.discount} onChange={e => setBillForm({ ...billForm, discount: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Tax/GST (%)</label>
                      <input type="number" className="input" placeholder="0" value={billForm.tax_percent} onChange={e => setBillForm({ ...billForm, tax_percent: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Internal Notes</label>
                    <input type="text" className="input" placeholder="..." value={billForm.notes} onChange={e => setBillForm({ ...billForm, notes: e.target.value })} />
                  </div>
                </div>
                
                <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Treatments Subtotal:</span>
                    <span>{fmt(calculatedTotal)}</span>
                  </div>
                  {manualCharges > 0 && (
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Manual Charges:</span>
                      <span>+ {fmt(manualCharges)}</span>
                    </div>
                  )}
                  {medicineCharges > 0 && (
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Medicine Charges:</span>
                      <span>+ {fmt(medicineCharges)}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                      <span>Discount:</span>
                      <span>- {fmt(discountAmount)}</span>
                    </div>
                  )}
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Tax:</span>
                      <span>+ {fmt(taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg text-slate-800 pt-2 border-t border-slate-100">
                    <span>Final Total:</span>
                    <span>{fmt(finalTotal)}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div>
                      <label className="label">Paying Now (₹)</label>
                      <input type="number" className="input bg-emerald-50 border-emerald-200" value={billForm.paid_amount} onChange={e => setBillForm({ ...billForm, paid_amount: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Method</label>
                      <select className="select" value={billForm.payment_method} onChange={e => setBillForm({ ...billForm, payment_method: e.target.value })}>
                        <option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="other">Other</option>
                      </select>
                    </div>
                    <div className="flex justify-between text-red-600 font-bold text-sm bg-red-50 p-2 rounded-lg">
                      <span>Remaining Balance:</span>
                      <span>{fmt(balancePreview)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* EDIT BILL MODAL */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Bill &amp; Audit Trail" size="md"
        footer={
          <div className="flex gap-3">
            <button onClick={() => setShowEdit(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleEditBill} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
            Note: Changing the discount or tax will recalculate the bill totals automatically.
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Manual Charges (₹)</label>
              <input type="number" className="input" value={editForm.manual_charges} onChange={e => setEditForm({...editForm, manual_charges: e.target.value})} />
            </div>
            <div>
              <label className="label">Medicine Charges (₹)</label>
              <input type="number" className="input" value={editForm.medicine_charges} onChange={e => setEditForm({...editForm, medicine_charges: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Discount (₹)</label>
              <input type="number" className="input" value={editForm.discount} onChange={e => setEditForm({...editForm, discount: e.target.value})} />
            </div>
            <div>
              <label className="label">Tax (%)</label>
              <input type="number" className="input" value={editForm.tax_percent} onChange={e => setEditForm({...editForm, tax_percent: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="textarea" rows={2} value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} />
          </div>
          <div>
            <label className="label">Reason for Edit * (Required for audit)</label>
            <input className="input" placeholder="e.g. Corrected discount amount" value={editForm.change_description} onChange={e => setEditForm({...editForm, change_description: e.target.value})} />
          </div>

          {/* Audit Trail */}
          {editHistory.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <h4 className="font-semibold text-sm mb-3">Edit History</h4>
              <div className="space-y-3">
                {editHistory.map((h, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-lg text-xs">
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>{h.edited_by}</span>
                      <span>{new Date(h.edited_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-500 mb-1">Reason: {h.change_description}</p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Previous: Total {fmt(h.previous_values?.total_amount)} | Disc {fmt(h.previous_values?.discount)} | Tax {h.previous_values?.tax_percent}% | Manual {fmt(h.previous_values?.manual_charges || 0)} | Meds {fmt(h.previous_values?.medicine_charges || 0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* PAYMENT MODAL */}
      <Modal open={showPayment} onClose={() => setShowPayment(false)} title="Record Payment" size="sm"
        footer={<><button onClick={() => setShowPayment(false)} className="btn-secondary">Cancel</button><button onClick={handlePayment} disabled={saving} className="btn-primary">{saving ? 'Processing…' : 'Record Payment'}</button></>}
      >
        {activeBill && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl text-center">
              <p className="text-sm text-slate-500">Balance Due</p>
              <p className="text-3xl font-bold text-red-600">{fmt(activeBill.balance)}</p>
            </div>
            <div>
              <label className="label">Amount (₹)</label>
              <input className="input text-lg font-bold h-12" type="number" max={activeBill.balance} value={payAmount} onChange={e => setPayAmount(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select className="select" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                <option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="other">Other</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* HISTORY MODAL */}
      <Modal open={showHistory} onClose={() => setShowHistory(false)} title="Payment History" size="md" footer={<button onClick={() => setShowHistory(false)} className="btn-secondary">Close</button>}>
        <div className="space-y-3">
          {historyItems.length === 0 ? <p className="text-center py-8 text-slate-500">No payments found</p> : historyItems.map(p => (
            <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <div><p className="font-bold text-slate-800">{fmt(p.amount)}</p><p className="text-xs text-slate-400 capitalize">{p.payment_method}</p></div>
              <div className="text-right text-xs text-slate-500">{new Date(p.payment_date).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </Modal>

      {/* EMAIL MODAL */}
      <Modal open={showEmail} onClose={() => setShowEmail(false)} title="Email Invoice" size="sm"
        footer={<><button onClick={() => setShowEmail(false)} className="btn-secondary">Cancel</button><button onClick={handleEmail} disabled={saving} className="btn-primary">{saving ? 'Sending…' : 'Send Email'}</button></>}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Send an electronic copy of this invoice to the patient.</p>
          <div>
            <label className="label">Email Address</label>
            <input className="input" type="email" placeholder="patient@example.com" value={emailAddr} onChange={e => setEmailAddr(e.target.value)} autoFocus />
          </div>
        </div>
      </Modal>
    </div>
  )
}
