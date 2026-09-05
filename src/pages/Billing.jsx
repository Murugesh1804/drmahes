import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X, Printer, CreditCard, ShoppingBag, Trash2, Mail, Edit2, RotateCcw, Wallet, FileCheck, Ban } from 'lucide-react'
import {
  getAllBills, getBillsByPatient, createBill, updateBillPayment, updateBill, getBillEditHistory,
  getAllPatients, searchPatients,
  getTreatmentsByPatient, getTreatmentsByAppointment, getTreatmentsByBill, getPatientAppointments,
  getPaymentsByBill, searchBills, emailBillInvoice,
  getUnbilledTreatments, getAllTreatmentMasters, getAllMedicineMasters,
  reversePayment, getPatientAdvance
} from '../services/api'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'
import { generateReceiptHTML, generateMoneyReceiptHTML, generateCreditNoteHTML } from '../utils/printer'
import { clinicDateString, fmtDate } from '../utils/date'

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
  const [cartMedQty, setCartMedQty] = useState('1')

  const [billForm, setBillForm] = useState({
    paid_amount: '', payment_method: 'cash', payment_date: '', notes: '', discount: '', tax_percent: ''
  })
  const [discountMode, setDiscountMode] = useState('flat') // 'flat' | 'percent'

  // --- Edit Bill State ---
  const [editForm, setEditForm] = useState({
    discount: '', tax_percent: '', notes: '', change_description: ''
  })
  const [editDiscountMode, setEditDiscountMode] = useState('flat') // 'flat' | 'percent'
  const [editHistory, setEditHistory] = useState([])

  const [showCloseWarning, setShowCloseWarning] = useState(false)

  // --- Payment / Other State ---
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('cash')
  const [payDate, setPayDate] = useState('')
  const [payNotes, setPayNotes] = useState('')
  const [historyItems, setHistoryItems] = useState([])
  const [emailAddr, setEmailAddr] = useState('')

  // Patient Advance & Escrow State
  const [patientAdvance, setPatientAdvance] = useState(0)
  const [applyAdvance, setApplyAdvance] = useState(false)
  const [advanceToApply, setAdvanceToApply] = useState('')

  // Payment Reversal / Credit Note State
  const [reversingPayment, setReversingPayment] = useState(null)
  const [showReversalModal, setShowReversalModal] = useState(false)
  const [reversalReason, setReversalReason] = useState('')
  const [refundMethod, setRefundMethod] = useState('to_advance_wallet')

  function printHtmlDoc(html) {
    if (typeof window !== 'undefined' && window.electronAPI !== undefined) {
      window.electronAPI.printReceipt(html)
    } else {
      const w = window.open('', '_blank')
      w.document.write(html)
      w.document.close()
      w.onload = () => { w.focus(); w.print() }
      setTimeout(() => {
        if (w.document.readyState === 'complete') {
          w.focus()
          w.print()
        }
      }, 1000)
    }
  }

  function printMoneyReceipt(payment) {
    const html = generateMoneyReceiptHTML(payment, activeBill, settings)
    printHtmlDoc(html)
  }

  function printCreditNote(payment) {
    const html = generateCreditNoteHTML(payment, activeBill, settings)
    printHtmlDoc(html)
  }

  function openReversal(payment) {
    setReversingPayment(payment)
    setReversalReason('')
    setRefundMethod('to_advance_wallet')
    setShowReversalModal(true)
  }

  async function handleConfirmReversal() {
    if (!reversalReason.trim()) {
      notify('Please enter a reason for reversal / credit note', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await reversePayment(reversingPayment.id, {
        reason: reversalReason.trim(),
        refund_method: refundMethod
      })
      notify(`Payment reversed. Credit Note ${res?.payment?.credit_note_number || ''} issued!`)
      setShowReversalModal(false)
      setReversingPayment(null)
      if (activeBill) {
        const updated = await getPaymentsByBill(activeBill.id)
        setHistoryItems(updated || [])
      }
      load(billPage)
    } catch (e) {
      notify(e.message || 'Failed to reverse payment', 'error')
    } finally {
      setSaving(false)
    }
  }

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

  function handleAttemptCloseCreate() {
    const hasCart = billItems.length > 0 || selPatient !== null || Boolean(billForm.paid_amount)
    if (hasCart) {
      setShowCloseWarning(true)
    } else {
      setShowCreate(false)
    }
  }

  function handleConfirmCloseCreate() {
    setShowCloseWarning(false)
    setShowCreate(false)
    setBillItems([])
    setSelPatient(null)
    setUnbilledTreatments([])
    setSelectedUnbilled(new Set())
    setBillForm({ paid_amount: '', payment_method: 'cash', notes: '', discount: '', tax_percent: '' })
  }

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

  // Load patient's unbilled treatments and advance balance when selected
  useEffect(() => {
    if (!selPatient) { 
      setUnbilledTreatments([])
      setSelectedUnbilled(new Set())
      setPatientAdvance(0)
      setApplyAdvance(false)
      setAdvanceToApply('')
      return 
    }
    getUnbilledTreatments(selPatient.id).then(txs => {
      setUnbilledTreatments(txs || [])
      setSelectedUnbilled(new Set())
    }).catch(console.error)

    getPatientAdvance(selPatient.id).then(data => {
      const adv = data?.advance_balance || 0
      setPatientAdvance(adv)
      if (adv > 0) {
        setApplyAdvance(true)
        setAdvanceToApply(adv.toString())
      } else {
        setApplyAdvance(false)
        setAdvanceToApply('')
      }
    }).catch(err => {
      console.error(err)
      setPatientAdvance(0)
    })
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
    const qtyNum = parseInt(cartMedQty) || 1

    const newItem = {
      treatment_type: `Medicine: ${cartMedSelect} (Qty: ${qtyNum})`,
      cost: costNum * qtyNum,
      tooth_numbers: [],
      description: cartMedDesc.trim(),
      isUnbilled: false
    }

    setBillItems([...billItems, newItem])
    setCartMedSelect(''); setCartMedCost(''); setCartMedDesc(''); setCartMedQty('1')
  }

  function openCreate() {
    setPatSearch(''); setSelPatient(null); setBillItems([])
    setUnbilledTreatments([]); setSelectedUnbilled(new Set())
    setCartSelect(''); setCartCost(''); setCartTooth(''); setCartDesc('')
    setCartMedSelect(''); setCartMedCost(''); setCartMedDesc(''); setCartMedQty('1')
    setBillForm({ paid_amount: '', payment_method: 'cash', payment_date: clinicDateString(), notes: '', discount: '', tax_percent: '', manual_charges: '', medicine_charges: '' })
    setDiscountMode('flat')
    setPatientAdvance(0); setApplyAdvance(false); setAdvanceToApply('')
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
    setEditDiscountMode('flat')
    setShowEdit(true)
    getBillEditHistory(bill.id).then(h => setEditHistory(h || [])).catch(console.error)
  }

  const calculatedTotal = billItems.reduce((sum, item) => sum + item.cost, 0)
  const manualCharges = parseFloat(billForm.manual_charges) || 0
  const medicineCharges = parseFloat(billForm.medicine_charges) || 0
  const preDiscountTotal = calculatedTotal + manualCharges + medicineCharges
  const discountInput = parseFloat(billForm.discount) || 0
  const discountAmount = discountMode === 'percent'
    ? Math.round(preDiscountTotal * (Math.min(100, discountInput) / 100) * 100) / 100
    : discountInput
  const taxPercent = Math.min(100, Math.max(0, parseFloat(billForm.tax_percent) || 0))
  const baseTotal = preDiscountTotal - discountAmount
  const taxAmount = Math.round(baseTotal * (taxPercent / 100) * 100) / 100
  const finalTotal = Math.round((baseTotal + taxAmount) * 100) / 100
  const advanceDeduction = applyAdvance ? Math.min(patientAdvance, parseFloat(advanceToApply) || 0) : 0
  const afterAdvanceTotal = Math.max(0, finalTotal - advanceDeduction)
  const paidNow = parseFloat(billForm.paid_amount) || 0
  const balancePreview = Math.max(0, afterAdvanceTotal - paidNow)

  async function handleCreate() {
    if (!selPatient) { notify('Select a patient', 'error'); return }
    if (billItems.length === 0) { notify('Add at least one treatment item', 'error'); return }
    
    // Validate that all items have cost > 0
    const zeroCostItems = billItems.filter(item => item.cost <= 0)
    if (zeroCostItems.length > 0) {
      notify('Some treatments have no configured cost. Please remove them or configure cost in Treatment Masters.', 'error')
      return
    }
    
    if (advanceDeduction > patientAdvance) {
      notify(`Applied advance cannot exceed available balance of ${fmt(patientAdvance)}`, 'error')
      return
    }
    if (advanceDeduction > finalTotal) {
      notify(`Applied advance cannot exceed final total of ${fmt(finalTotal)}`, 'error')
      return
    }
    if (paidNow > afterAdvanceTotal) {
      notify(`Paid amount cannot exceed remaining total of ${fmt(afterAdvanceTotal)}`, 'error')
      return
    }

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
        apply_advance: advanceDeduction,
        payment_method: billForm.payment_method,
        payment_date: billForm.payment_date || clinicDateString(),
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
    if (!payDate) { notify('Please enter a payment date', 'error'); return }
    if (payMethod === 'advance' && amount > patientAdvance) {
      notify(`Amount exceeds available advance balance of ${fmt(patientAdvance)}`, 'error')
      return
    }
    setSaving(true)
    try {
      await updateBillPayment(activeBill.id, {
        amount,
        payment_method: payMethod,
        payment_date: payDate,
        notes: payNotes
      })
      notify('Payment recorded')
      setShowPayment(false)
      load(billPage)
    } catch (e) {
      notify(e.message || 'Failed to record payment', 'error')
    } finally { setSaving(false) }
  }

  async function openPayment(bill) {
    setActiveBill(bill)
    setPayAmount(bill.balance.toString())
    setPayMethod('cash')
    setPayDate(clinicDateString())
    setPayNotes('')
    setShowPayment(true)
    try {
      const adv = await getPatientAdvance(bill.patient_id)
      setPatientAdvance(adv?.advance_balance || 0)
    } catch (err) {
      console.warn(err)
      setPatientAdvance(0)
    }
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
    setEmailAddr(bill.patient_email || '')
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

        {bills.length === 0 ? (
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
                {bills.map(b => (
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
      <Modal open={showCreate} onClose={handleAttemptCloseCreate} title="Create Patient Invoice" size="lg"
        footer={
          <div className="flex gap-3">
            <button onClick={handleAttemptCloseCreate} className="btn-secondary">Cancel</button>
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
              {/* Advance Wallet Available Deposit */}
              {patientAdvance > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                      <Wallet size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-800">Advance Wallet Balance</p>
                      <p className="text-sm font-bold text-emerald-900">{fmt(patientAdvance)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-emerald-300 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 shadow-sm">
                      <input
                        type="checkbox"
                        checked={applyAdvance}
                        onChange={e => {
                          const checked = e.target.checked
                          setApplyAdvance(checked)
                          setAdvanceToApply(checked ? Math.min(patientAdvance, finalTotal).toString() : '')
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      Apply to Invoice
                    </label>
                    {applyAdvance && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-emerald-700">₹</span>
                        <input
                          type="number"
                          max={Math.min(patientAdvance, finalTotal)}
                          min="1"
                          className="input py-1 px-2 text-xs w-24 text-right font-bold bg-white border-emerald-300"
                          value={advanceToApply}
                          onChange={e => setAdvanceToApply(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Unbilled Treatments Selection */}
              {unbilledTreatments.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
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
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 mb-3">Add Custom Items</p>
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
                  <div className="col-span-2">
                    <input type="number" className="input text-xs h-9" placeholder="Qty" value={cartMedQty} min="1" onChange={e => setCartMedQty(e.target.value)} />
                  </div>
                  <div className="col-span-2">
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
              <div className="grid grid-cols-2 gap-6 bg-primary-50/30 p-5 rounded-xl border border-primary-100">
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="label mb-0">Discount</label>
                        <span className="inline-flex rounded-lg border border-slate-200 overflow-hidden text-[11px] font-bold">
                          <button type="button"
                            onClick={() => setDiscountMode('flat')}
                            className={`px-2 py-0.5 transition-colors ${discountMode === 'flat' ? 'bg-primary-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                          >₹</button>
                          <button type="button"
                            onClick={() => setDiscountMode('percent')}
                            className={`px-2 py-0.5 transition-colors ${discountMode === 'percent' ? 'bg-primary-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                          >%</button>
                        </span>
                      </div>
                      <div className="relative">
                        <input type="number" className="input pr-8" placeholder="0"
                          min="0" max={discountMode === 'percent' ? 100 : undefined}
                          value={billForm.discount}
                          onChange={e => setBillForm({ ...billForm, discount: e.target.value })} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">
                          {discountMode === 'percent' ? '%' : '₹'}
                        </span>
                      </div>
                      {discountMode === 'percent' && discountInput > 0 && (
                        <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">= {fmt(discountAmount)} off</p>
                      )}
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

                  {advanceDeduction > 0 && (
                    <div className="flex justify-between text-sm text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                      <span>Advance Applied:</span>
                      <span>- {fmt(advanceDeduction)}</span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div>
                      <label className="label">Paying Now (₹)</label>
                      <input type="number" className="input bg-emerald-50 border-emerald-200" value={billForm.paid_amount} onChange={e => setBillForm({ ...billForm, paid_amount: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label">Method</label>
                        <select className="select" value={billForm.payment_method} onChange={e => setBillForm({ ...billForm, payment_method: e.target.value })}>
                          <option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Payment Date</label>
                        <input
                          type="date"
                          className="input"
                          value={billForm.payment_date || clinicDateString()}
                          onChange={e => setBillForm({ ...billForm, payment_date: e.target.value })}
                        />
                      </div>
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
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Discount</label>
                <span className="inline-flex rounded-lg border border-slate-200 overflow-hidden text-[11px] font-bold">
                  <button type="button"
                    onClick={() => setEditDiscountMode('flat')}
                    className={`px-2 py-0.5 transition-colors ${editDiscountMode === 'flat' ? 'bg-primary-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                  >₹</button>
                  <button type="button"
                    onClick={() => setEditDiscountMode('percent')}
                    className={`px-2 py-0.5 transition-colors ${editDiscountMode === 'percent' ? 'bg-primary-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                  >%</button>
                </span>
              </div>
              <div className="relative">
                <input type="number" className="input pr-8"
                  min="0" max={editDiscountMode === 'percent' ? 100 : undefined}
                  value={editForm.discount}
                  onChange={e => {
                    const raw = parseFloat(e.target.value) || 0
                    if (editDiscountMode === 'percent') {
                      // Store the flat equivalent in editForm.discount for submission
                      const editSubtotal = (activeBill?.total_amount || 0) + (activeBill?.discount || 0) - (activeBill?.tax_amount || 0)
                      const flatAmt = Math.round(editSubtotal * (Math.min(100, raw) / 100) * 100) / 100
                      setEditForm({...editForm, discount: flatAmt, _discountPct: raw})
                    } else {
                      setEditForm({...editForm, discount: e.target.value, _discountPct: ''})
                    }
                  }} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">
                  {editDiscountMode === 'percent' ? '%' : '₹'}
                </span>
              </div>
              {editDiscountMode === 'percent' && editForm._discountPct > 0 && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">= {fmt(editForm.discount)} off</p>
              )}
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
            {patientAdvance > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                <Wallet size={15} className="text-emerald-600 flex-shrink-0" />
                <span>Patient Advance Wallet Available: <strong>{fmt(patientAdvance)}</strong></span>
              </div>
            )}
            <div>
              <label className="label">Amount (₹)</label>
              <input className="input text-lg font-bold h-12" type="number" max={activeBill.balance} value={payAmount} onChange={e => setPayAmount(e.target.value)} autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Payment Method</label>
                <select className="select" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  {patientAdvance > 0 && (
                    <option value="advance">Advance Wallet (Avail: {fmt(patientAdvance)})</option>
                  )}
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Payment Date</label>
                <input
                  type="date"
                  className="input"
                  value={payDate}
                  onChange={e => setPayDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label">Notes / Ref # <span className="text-slate-400 text-xs font-normal">(Optional UTR / Cheque / Note)</span></label>
              <input
                type="text"
                className="input"
                placeholder="e.g. UTR123456 / Cheque # / Front desk note"
                value={payNotes}
                onChange={e => setPayNotes(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* HISTORY MODAL */}
      <Modal open={showHistory} onClose={() => setShowHistory(false)} title="Payment Installment History" size="md" footer={<button onClick={() => setShowHistory(false)} className="btn-secondary">Close</button>}>
        <div className="space-y-3">
          {historyItems.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No payments found</p>
          ) : (
            historyItems.map(p => (
              <div key={p.id} className={`p-3.5 rounded-xl border transition-all ${p.status === 'reversed' ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-slate-800">{fmt(p.amount)}</span>
                      {p.receipt_number && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold tracking-wide">
                          {p.receipt_number}
                        </span>
                      )}
                      {p.status === 'reversed' && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                          REVERSED
                        </span>
                      )}
                      {p.credit_note_number && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                          CN: {p.credit_note_number}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 font-semibold text-slate-600 bg-white border border-slate-200 rounded-md">
                        {p.payment_method || p.method || 'cash'}
                      </span>
                      {p.notes && <span className="text-xs text-slate-500 truncate max-w-xs">{p.notes}</span>}
                      {p.reference_id && <span className="text-[11px] font-mono text-slate-400">Ref: {p.reference_id}</span>}
                    </div>

                    {p.status === 'reversed' && (
                      <div className="mt-2 text-xs text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100 space-y-0.5">
                        {p.reversal_reason && <p><span className="font-semibold">Reason:</span> {p.reversal_reason}</p>}
                        {p.refund_method && (
                          <p className="text-[11px] text-rose-600 font-medium">
                            Refund Route: {p.refund_method === 'to_advance_wallet' ? 'Credited to Patient Advance Wallet' : p.refund_method.toUpperCase()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex flex-col items-end gap-2 flex-shrink-0">
                    <div>
                      <p className="text-xs font-medium text-slate-700">
                        {fmtDate(p.payment_date || p.paid_at || p.created_at)}
                      </p>
                      {(p.payment_date || p.paid_at) && !isNaN(new Date(p.payment_date || p.paid_at).getTime()) && (
                        <p className="text-[10px] text-slate-400">
                          {new Date(p.payment_date || p.paid_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons: Print Receipt / Credit Note, Reverse */}
                    <div className="flex items-center gap-1.5">
                      {p.status !== 'reversed' ? (
                        <>
                          <button
                            onClick={() => printMoneyReceipt(p)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 flex items-center gap-1 shadow-sm transition-colors"
                            title="Print Money Receipt Voucher"
                          >
                            <Printer size={12} /> Receipt
                          </button>
                          <button
                            onClick={() => openReversal(p)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 flex items-center gap-1 shadow-sm transition-colors"
                            title="Reverse / Issue Credit Note"
                          >
                            <RotateCcw size={12} /> Reverse
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => printCreditNote(p)}
                          className="px-2 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-white border border-rose-300 hover:bg-rose-50 flex items-center gap-1 shadow-sm transition-colors"
                          title="Print Credit Note Voucher"
                        >
                          <Printer size={12} /> Credit Note
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* REVERSAL / CREDIT NOTE MODAL */}
      <Modal
        open={showReversalModal}
        onClose={() => setShowReversalModal(false)}
        title="Reverse Payment & Issue Credit Note"
        size="sm"
        footer={
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowReversalModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleConfirmReversal} disabled={saving || !reversalReason.trim()} className="btn-primary bg-rose-600 hover:bg-rose-700 border-rose-700">
              {saving ? 'Processing…' : 'Issue Credit Note ✓'}
            </button>
          </div>
        }
      >
        {reversingPayment && (
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-center">
              <p className="text-xs text-rose-600 font-semibold uppercase tracking-wider">Reversing Payment Installment</p>
              <p className="text-3xl font-bold text-rose-700 mt-1">{fmt(reversingPayment.amount)}</p>
              {reversingPayment.receipt_number && (
                <p className="text-xs font-mono text-rose-500 mt-1">Receipt #{reversingPayment.receipt_number}</p>
              )}
            </div>

            <div>
              <label className="label">Refund Method / Route *</label>
              <select
                className="select"
                value={refundMethod}
                onChange={e => setRefundMethod(e.target.value)}
              >
                <option value="to_advance_wallet">Credit to Patient Advance Wallet (Escrow)</option>
                <option value="cash">Cash Refund</option>
                <option value="upi">UPI Refund</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                {refundMethod === 'to_advance_wallet'
                  ? 'Amount will be deposited into patient’s advance ledger for future treatments.'
                  : 'Full payout reversal to patient.'}
              </p>
            </div>

            <div>
              <label className="label">Reason for Reversal / Cancellation *</label>
              <textarea
                className="textarea"
                rows={3}
                placeholder="e.g. Patient cancelled procedure, payment recorded under wrong invoice, excess charge correction"
                value={reversalReason}
                onChange={e => setReversalReason(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}
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

      {/* Discard Unsaved Changes Warning */}
      <ConfirmModal
        open={showCloseWarning}
        onClose={() => setShowCloseWarning(false)}
        onConfirm={handleConfirmCloseCreate}
        title="Discard Unsaved Invoice?"
        message="You have added items or patient information to this bill. Closing now will discard these items. Are you sure?"
        confirmText="Discard Invoice"
      />
    </div>
  )
}
