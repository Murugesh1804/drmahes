const mongoose = require('mongoose')
const { Patient, Appointment, Treatment, Bill, BillItem, Payment, Counter, Setting, BlockedSlot, getDbPath } = require('./db')

const CLINIC_TIME_ZONE = process.env.CLINIC_TIME_ZONE || 'Asia/Kolkata'
const APPOINTMENT_STATUSES = ['waiting', 'in-progress', 'done', 'cancelled']
const CALL_STATUSES = ['pending', 'called', 'not_required']

let db = null

function init(database) {
  db = database
}

// Helper: Ensure valid ObjectId before querying
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id)
}

function badRequest(message) {
  const err = new Error(message)
  err.statusCode = 400
  throw err
}

function toMoney(value, fallback = 0, label = 'Amount') {
  if (value === undefined || value === null || value === '') return fallback
  const num = Number(value)
  if (!Number.isFinite(num) || num < 0) badRequest(`${label} must be a valid non-negative amount`)
  return Math.round(num * 100) / 100
}

function toPercent(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.min(100, Math.max(0, num))
}

function normalizePaymentMethod(method, fallback = 'cash') {
  return ['cash', 'upi', 'card', 'other'].includes(method) ? method : fallback
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeAge(value) {
  if (value === undefined || value === null || value === '') return null
  const age = Number(value)
  if (!Number.isInteger(age) || age < 0 || age > 120) badRequest('Age must be a whole number between 0 and 120')
  return age
}

function normalizeGender(value) {
  if (!value) return null
  if (!['Male', 'Female', 'Other'].includes(value)) badRequest('Gender must be Male, Female or Other')
  return value
}

function clinicDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date)
  const byType = Object.fromEntries(parts.map(p => [p.type, p.value]))
  return `${byType.year}-${byType.month}-${byType.day}`
}

function clinicDayRange(dateString = clinicDateString()) {
  const [year, month, day] = dateString.split('-').map(Number)
  const utcStart = Date.UTC(year, month - 1, day) - (5.5 * 60 * 60 * 1000)
  return {
    start: new Date(utcStart),
    end: new Date(utcStart + 24 * 60 * 60 * 1000 - 1)
  }
}

function normalizeDateString(value) {
  const date = normalizeText(value)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) badRequest('Date must be in YYYY-MM-DD format')
  return date
}

function normalizeAppointmentStatus(status) {
  if (!APPOINTMENT_STATUSES.includes(status)) badRequest('Invalid appointment status')
  return status
}

function normalizeCallStatus(status) {
  if (!CALL_STATUSES.includes(status)) badRequest('Invalid call status')
  return status
}

function mapAppointment(a) {
  return {
    id: a._id.toString(),
    patient_id: a.patient_id ? a.patient_id._id.toString() : null,
    patient_name: a.patient_id ? a.patient_id.name : '',
    patient_phone: a.patient_id ? a.patient_id.phone : '',
    patient_age: a.patient_id ? a.patient_id.age : null,
    scheduled_date: a.scheduled_date,
    scheduled_time: a.scheduled_time || '',
    reason: a.reason || '',
    status: a.status || 'waiting',
    call_status: a.call_status || 'not_required',
    queue_number: a.queue_number || 0,
    notes: a.notes || '',
    created_at: a.created_at
  }
}

function sortAppointments(list) {
  const statusOrder = { 'in-progress': 0, waiting: 1, done: 2, cancelled: 3 }
  list.sort((x, y) => {
    const ox = statusOrder[x.status] ?? 4
    const oy = statusOrder[y.status] ?? 4
    if (ox !== oy) return ox - oy
    if ((x.scheduled_time || '') !== (y.scheduled_time || '')) {
      if (!x.scheduled_time) return 1
      if (!y.scheduled_time) return -1
      return x.scheduled_time.localeCompare(y.scheduled_time)
    }
    return new Date(x.created_at || 0) - new Date(y.created_at || 0)
  })
  return list
}

// ═══════════════════════════════════════════════════════════
// PATIENTS
// ═══════════════════════════════════════════════════════════
async function getAllPatients(limit = 20) {
  const result = await Patient.aggregate([
    {
      $lookup: {
        from: 'appointments',
        localField: '_id',
        foreignField: 'patient_id',
        as: 'appts'
      }
    },
    {
      $project: {
        name: 1,
        phone: 1,
        age: 1,
        gender: 1,
        address: 1,
        complaint: 1,
        notes: 1,
        consentFormSaved: 1,
        consentFormPath: 1,
        consentSignedAt: 1,
        created_at: 1,
        updated_at: 1,
        appointment_count: { $size: '$appts' },
        last_visit: { $max: '$appts.scheduled_date' }
      }
    },
    { $sort: { updated_at: -1 } },
    { $limit: limit }
  ])

  // Convert mongoose _id to virtual id for compatibility with the React app
  return result.map(p => ({ ...p, id: p._id.toString() }))
}

async function searchPatients(query) {
  const matchFilter = query.trim() ? {
    $or: [
      { name:      { $regex: query, $options: 'i' } },
      { phone:     { $regex: query, $options: 'i' } },
      { complaint: { $regex: query, $options: 'i' } },
      { notes:     { $regex: query, $options: 'i' } },
    ]
  } : {}

  const result = await Patient.aggregate([
    { $match: matchFilter },
    {
      $lookup: {
        from: 'appointments',
        localField: '_id',
        foreignField: 'patient_id',
        as: 'appts'
      }
    },
    {
      $project: {
        name: 1,
        phone: 1,
        age: 1,
        gender: 1,
        address: 1,
        complaint: 1,
        notes: 1,
        consentFormSaved: 1,
        consentFormPath: 1,
        consentSignedAt: 1,
        created_at: 1,
        updated_at: 1,
        appointment_count: { $size: '$appts' },
        last_visit: { $max: '$appts.scheduled_date' }
      }
    },
    { $sort: { name: 1 } },
    { $limit: 50 }
  ])

  return result.map(p => ({ ...p, id: p._id.toString() }))
}

async function getPatientById(id) {
  if (!isValidObjectId(id)) return null
  const patient = await Patient.findById(id).lean()
  if (patient) patient.id = patient._id.toString()
  return patient
}

function normalizeEmail(value) {
  const email = normalizeText(value)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) badRequest('Invalid email format')
  return email.toLowerCase()
}

async function addPatient(data) {
  const name = normalizeText(data.name)
  if (!name) badRequest('Patient name is required')

  const patient = new Patient({
    name,
    phone: normalizeText(data.phone),
    email: normalizeEmail(data.email),
    age: normalizeAge(data.age),
    gender: normalizeGender(data.gender),
    address: normalizeText(data.address),
    complaint: normalizeText(data.complaint),
    notes: normalizeText(data.notes),
    consentFormSaved: data.consentFormSaved || false,
    consentFormPath: data.consentFormPath || '',
    consentSignedAt: data.consentSignedAt || null
  })
  await patient.save()
  const doc = patient.toObject()
  doc.id = doc._id.toString()
  return doc
}

async function updatePatient(id, data) {
  if (!isValidObjectId(id)) return null
  const name = normalizeText(data.name)
  if (!name) badRequest('Patient name is required')

  const patient = await Patient.findByIdAndUpdate(id, {
    $set: {
      name,
      phone: normalizeText(data.phone),
      email: normalizeEmail(data.email),
      age: normalizeAge(data.age),
      gender: normalizeGender(data.gender),
      address: normalizeText(data.address),
      complaint: normalizeText(data.complaint),
      notes: normalizeText(data.notes)
    }
  }, { new: true, runValidators: true }).lean()

  if (patient) patient.id = patient._id.toString()
  return patient
}

// ═══════════════════════════════════════════════════════════
// APPOINTMENTS
// ═══════════════════════════════════════════════════════════
async function getTodayAppointments() {
  return getAppointmentsByDate(clinicDateString())
}

async function getAppointmentsByDate(date) {
  const scheduledDate = normalizeDateString(date)
  const appts = await Appointment.find({ scheduled_date: scheduledDate })
    .populate('patient_id')
    .lean()

  return sortAppointments(appts.map(mapAppointment))
}

async function getPatientAppointments(patientId) {
  if (!isValidObjectId(patientId)) return []
  
  const result = await Appointment.aggregate([
    { $match: { patient_id: new mongoose.Types.ObjectId(patientId) } },
    {
      $lookup: {
        from: 'treatments',
        localField: '_id',
        foreignField: 'appointment_id',
        as: 'treatments'
      }
    },
    {
      $addFields: {
        id: { $toString: '$_id' },
        patient_id: { $toString: '$patient_id' },
        treatment_count: { $size: '$treatments' },
        treatment_total: { $sum: '$treatments.cost' }
      }
    },
    { $sort: { scheduled_date: -1 } }
  ])

  return result.map(a => ({
    ...a,
    call_status: a.call_status || 'not_required',
    queue_number: a.queue_number || 0
  }))
}

async function getNextInvoiceNumber() {
  const year = new Date().getFullYear()
  const key  = `invoice_${year}`
  const doc  = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  )
  const seq = String(doc.seq).padStart(4, '0')
  return `INV-${year}-${seq}`
}

async function addAppointment(data) {
  if (!isValidObjectId(data.patient_id)) badRequest('Valid patient is required')
  const patient = await Patient.findById(data.patient_id).select('_id').lean()
  if (!patient) badRequest('Patient not found')

  const date = normalizeDateString(data.scheduled_date)
  const scheduledTime = normalizeText(data.scheduled_time)

  if (scheduledTime) {
    const blocked = await BlockedSlot.exists({ date, slot: scheduledTime })
    if (blocked) badRequest('This appointment slot is blocked')

    const existing = await Appointment.exists({
      scheduled_date: date,
      scheduled_time: scheduledTime,
      status: { $ne: 'cancelled' }
    })
    if (existing) badRequest('This appointment slot is already booked')
  }

  const queueCounter = await Counter.findOneAndUpdate(
    { key: `queue_${date}` },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  )
  const queueNumber = queueCounter.seq

  const appt = new Appointment({
    patient_id: data.patient_id,
    scheduled_date: date,
    scheduled_time: scheduledTime,
    reason: normalizeText(data.reason),
    status: 'waiting',
    call_status: data.call_status ? normalizeCallStatus(data.call_status) : 'not_required',
    queue_number: queueNumber,
    notes: normalizeText(data.notes)
  })
  try {
    await appt.save()
  } catch (err) {
    if (err.code === 11000) badRequest('This appointment slot is already booked')
    throw err
  }

  const doc = appt.toObject()
  doc.id = doc._id.toString()
  return doc
}

async function updateAppointment(id, data) {
  if (!isValidObjectId(id)) return null
  const scheduledDate = normalizeDateString(data.scheduled_date)
  const scheduledTime = normalizeText(data.scheduled_time)

  if (scheduledTime) {
    const blocked = await BlockedSlot.exists({ date: scheduledDate, slot: scheduledTime })
    if (blocked) badRequest('This appointment slot is blocked')

    const existing = await Appointment.exists({
      _id: { $ne: id },
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      status: { $ne: 'cancelled' }
    })
    if (existing) badRequest('This appointment slot is already booked')
  }

  const appt = await Appointment.findByIdAndUpdate(id, {
    $set: {
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      reason: normalizeText(data.reason),
      notes: normalizeText(data.notes)
    }
  }, { new: true, runValidators: true }).lean()

  if (appt) appt.id = appt._id.toString()
  return appt
}

async function updateAppointmentStatus(id, status) {
  if (!isValidObjectId(id)) return null
  const normalizedStatus = normalizeAppointmentStatus(status)
  await Appointment.findByIdAndUpdate(id, { $set: { status: normalizedStatus } }, { runValidators: true })
  return { id, status: normalizedStatus }
}

async function deleteAppointment(id) {
  if (!isValidObjectId(id)) return { success: false }
  await Appointment.findByIdAndUpdate(id, { $set: { status: 'cancelled' } }, { runValidators: true })
  return { success: true }
}

async function updateAppointmentCallStatus(id, call_status) {
  if (!isValidObjectId(id)) return null
  const normalizedStatus = normalizeCallStatus(call_status)
  await Appointment.findByIdAndUpdate(id, { $set: { call_status: normalizedStatus } }, { runValidators: true })
  return { id, call_status: normalizedStatus }
}

async function getPendingCalls() {
  const appts = await Appointment.find({ call_status: 'pending' })
    .populate('patient_id')
    .sort({ scheduled_date: 1, created_at: 1 })
    .lean()

  return appts.map(mapAppointment)
}

// ═══════════════════════════════════════════════════════════
// BLOCKED SLOTS
// ═══════════════════════════════════════════════════════════
async function getBlockedSlots(date) {
  const records = await BlockedSlot.find({ date }).lean()
  return records.map(r => ({
    id: r._id.toString(),
    date: r.date,
    slot: r.slot,
    blocked_by: r.blocked_by,
    reason: r.reason,
    created_at: r.created_at
  }))
}

async function blockSlot(date, slot, reason = '') {
  try {
    await BlockedSlot.findOneAndUpdate(
      { date, slot },
      { $set: { blocked_by: 'admin', reason } },
      { upsert: true, new: true }
    )
    return { success: true, date, slot }
  } catch (err) {
    if (err.code === 11000) return { success: true, date, slot } // Already blocked
    throw err
  }
}

async function unblockSlot(date, slot) {
  await BlockedSlot.deleteOne({ date, slot })
  return { success: true, date, slot }
}

// ═══════════════════════════════════════════════════════════
// TREATMENTS
// ═══════════════════════════════════════════════════════════
async function getTreatmentsByAppointment(appointmentId) {
  if (!isValidObjectId(appointmentId)) return []
  const txs = await Treatment.find({ appointment_id: appointmentId }).sort({ created_at: 1 }).lean()
  return txs.map(t => ({
    ...t,
    id: t._id.toString(),
    patient_id: t.patient_id.toString(),
    appointment_id: t.appointment_id ? t.appointment_id.toString() : null,
    bill_id: t.bill_id ? t.bill_id.toString() : null
  }))
}

async function getTreatmentsByBill(billId) {
  if (!isValidObjectId(billId)) return []
  const txs = await Treatment.find({ bill_id: billId }).sort({ created_at: 1 }).lean()
  return txs.map(t => ({
    ...t,
    id: t._id.toString(),
    patient_id: t.patient_id.toString(),
    appointment_id: t.appointment_id ? t.appointment_id.toString() : null,
    bill_id: t.bill_id ? t.bill_id.toString() : null
  }))
}

async function getTreatmentsByPatient(patientId) {
  if (!isValidObjectId(patientId)) return []
  const txs = await Treatment.find({ patient_id: patientId })
    .populate('appointment_id')
    .sort({ created_at: -1 })
    .lean()

  return txs.map(t => ({
    ...t,
    id: t._id.toString(),
    patient_id: t.patient_id.toString(),
    appointment_id: t.appointment_id ? t.appointment_id._id.toString() : null,
    appointment_date: t.appointment_id ? t.appointment_id.scheduled_date : null,
    appointment_status: t.appointment_id ? t.appointment_id.status : null
  }))
}

async function addTreatment(data) {
  if (!isValidObjectId(data.patient_id)) badRequest('Valid patient is required')
  if (data.appointment_id && !isValidObjectId(data.appointment_id)) badRequest('Valid appointment is required')
  if (data.appointment_id) {
    const appt = await Appointment.findById(data.appointment_id).select('patient_id').lean()
    if (!appt) badRequest('Appointment not found')
    if (appt.patient_id.toString() !== data.patient_id) badRequest('Appointment does not belong to this patient')
  }
  const treatmentType = normalizeText(data.treatment_type)
  if (!treatmentType) badRequest('Treatment type is required')

  const tx = new Treatment({
    patient_id: data.patient_id,
    appointment_id: data.appointment_id || null,
    treatment_type: treatmentType,
    tooth_number: normalizeText(data.tooth_number),
    description: normalizeText(data.description),
    cost: toMoney(data.cost, 0, 'Treatment cost'),
    doctor_notes: normalizeText(data.doctor_notes)
  })
  await tx.save()
  const doc = tx.toObject()
  doc.id = doc._id.toString()
  return doc
}

async function updateTreatment(id, data) {
  if (!isValidObjectId(id)) return null
  const treatmentType = normalizeText(data.treatment_type)
  if (!treatmentType) badRequest('Treatment type is required')

  const tx = await Treatment.findByIdAndUpdate(id, {
    $set: {
      treatment_type: treatmentType,
      tooth_number: normalizeText(data.tooth_number),
      description: normalizeText(data.description),
      cost: toMoney(data.cost, 0, 'Treatment cost'),
      doctor_notes: normalizeText(data.doctor_notes)
    }
  }, { new: true, runValidators: true }).lean()

  if (tx) tx.id = tx._id.toString()
  return tx
}

async function deleteTreatment(id) {
  if (!isValidObjectId(id)) return { success: false }
  await Treatment.findByIdAndDelete(id)
  return { success: true }
}

// ═══════════════════════════════════════════════════════════
// BILLS
// ═══════════════════════════════════════════════════════════
async function getBillsByPatient(patientId) {
  if (!isValidObjectId(patientId)) return []
  const bills = await Bill.find({ patient_id: patientId })
    .populate('appointment_id')
    .populate('patient_id')
    .sort({ created_at: -1 })
    .lean()

  return bills.map(b => ({
    ...b,
    id: b._id.toString(),
    patient_id: b.patient_id ? b.patient_id._id.toString() : null,
    patient_name: b.patient_id ? b.patient_id.name : '',
    appointment_id: b.appointment_id ? b.appointment_id._id.toString() : null,
    appointment_date: b.appointment_id ? b.appointment_id.scheduled_date : null
  }))
}

async function getBillById(id) {
  if (!isValidObjectId(id)) return null
  const b = await Bill.findById(id).populate('patient_id').lean()
  if (!b) return null

  return {
    ...b,
    id: b._id.toString(),
    patient_id: b.patient_id ? b.patient_id._id.toString() : null,
    patient_name: b.patient_id ? b.patient_id.name : '',
    patient_phone: b.patient_id ? b.patient_id.phone : ''
  }
}

async function createBill(data) {
  if (!isValidObjectId(data.patient_id)) badRequest('Valid patient is required')
  if (data.appointment_id && !isValidObjectId(data.appointment_id)) badRequest('Valid appointment is required')

  const subTotal = toMoney(data.total_amount, 0, 'Bill total')
  if (subTotal <= 0) badRequest('Bill total must be greater than zero')

  const paid = toMoney(data.paid_amount, 0, 'Paid amount')
  const discount = toPercent(data.discount)
  const taxPct = toPercent(data.tax_percent)
  const discounted = subTotal * (1 - discount / 100)
  const taxAmount  = Math.round(discounted * (taxPct / 100) * 100) / 100
  const total      = Math.round((discounted + taxAmount) * 100) / 100
  if (paid > total) badRequest('Paid amount cannot exceed the final bill total')

  const balance    = Math.max(0, total - paid)
  const status     = paid >= total ? 'paid' : paid > 0 ? 'partial' : 'pending'
  const invoiceNumber = await getNextInvoiceNumber()
  const paymentMethod = normalizePaymentMethod(data.payment_method)

  const bill = new Bill({
    patient_id: data.patient_id,
    appointment_id: data.appointment_id || null,
    total_amount: total,
    paid_amount: paid,
    balance,
    payment_method: paymentMethod,
    status,
    notes: data.notes || '',
    invoice_number: invoiceNumber,
    discount,
    tax_percent: taxPct,
    tax_amount: taxAmount,
    refunded_amount: 0
  })
  await bill.save()

  // Record initial payment if paid > 0
  if (paid > 0) {
    await Payment.create({
      bill_id: bill._id,
      patient_id: data.patient_id,
      amount: paid,
      method: paymentMethod,
      notes: 'Initial payment'
    })
  }

  // Save nested treatments if provided, linking them to the bill
  if (Array.isArray(data.treatments) && data.treatments.length > 0) {
    const treatmentsToInsert = data.treatments
      .map(t => ({
        patient_id: data.patient_id,
        appointment_id: data.appointment_id || null,
        bill_id: bill._id,
        treatment_type: normalizeText(t.treatment_type),
        tooth_number: normalizeText(t.tooth_number),
        description: normalizeText(t.description),
        cost: toMoney(t.cost, 0, 'Treatment cost'),
        doctor_notes: normalizeText(t.doctor_notes)
      }))
      .filter(t => t.treatment_type)
    if (treatmentsToInsert.length > 0) {
      await Treatment.insertMany(treatmentsToInsert)
    }
  }

  return getBillById(bill._id.toString())
}

async function updateBillPayment(id, data) {
  if (!isValidObjectId(id)) return null
  const bill = await Bill.findById(id)
  if (!bill) return null

  const amount = toMoney(data.amount)
  if (amount <= 0) badRequest('Payment amount must be greater than zero')
  if (amount > (bill.balance || 0)) badRequest('Payment amount cannot exceed the current balance')

  const method = normalizePaymentMethod(data.payment_method, bill.payment_method)
  const newPaid    = Math.round(((bill.paid_amount || 0) + amount) * 100) / 100
  const newBalance = Math.max(0, bill.total_amount - newPaid)
  const newStatus  = newPaid >= bill.total_amount ? 'paid' : newPaid > 0 ? 'partial' : 'pending'

  bill.paid_amount = newPaid
  bill.balance     = newBalance
  bill.status      = newStatus
  bill.payment_method = method
  await bill.save()

  // Record in payment history
  await Payment.create({
    bill_id:    bill._id,
    patient_id: bill.patient_id,
    amount,
    method,
    notes:      data.notes || ''
  })

  return getBillById(id)
}

async function refundBillPayment(id, amount) {
  if (!isValidObjectId(id)) return null
  const bill = await Bill.findById(id)
  if (!bill) return null

  const refundAmount = toMoney(amount)
  if (refundAmount <= 0) badRequest('Refund amount must be greater than zero')
  if (refundAmount > (bill.paid_amount || 0)) badRequest('Refund amount cannot exceed paid amount')

  const refund     = refundAmount
  const newPaid    = bill.paid_amount - refund
  const newBalance = Math.max(0, bill.total_amount - newPaid)
  const newStatus  = newPaid >= bill.total_amount ? 'paid' : newPaid > 0 ? 'partial' : 'pending'

  bill.paid_amount      = newPaid
  bill.balance          = newBalance
  bill.status           = newStatus
  bill.refunded_amount  = (bill.refunded_amount || 0) + refund
  await bill.save()

  await Payment.create({
    bill_id:    bill._id,
    patient_id: bill.patient_id,
    amount:     -refund,
    method:     'refund',
    notes:      'Refund'
  })

  return getBillById(id)
}

async function getPaymentsByBill(billId) {
  if (!isValidObjectId(billId)) return []
  const payments = await Payment.find({ bill_id: billId }).sort({ paid_at: 1 }).lean()
  return payments.map(p => ({ ...p, id: p._id.toString() }))
}

async function getAllBills(page = 1, limit = 50) {
  const skip = (page - 1) * limit
  const bills = await Bill.find()
    .populate('patient_id')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .lean()

  const total = await Bill.countDocuments()
  const items = bills.map(b => ({
    ...b,
    id: b._id.toString(),
    patient_id: b.patient_id ? b.patient_id._id.toString() : null,
    patient_name: b.patient_id ? b.patient_id.name : ''
  }))
  return { items, total, page, limit, hasMore: skip + items.length < total }
}

// ═══════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════
async function getSettings() {
  const list = await Setting.find().lean()
  return list.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {})
}

async function setSetting(key, value) {
  await Setting.findOneAndUpdate({ key }, { value }, { upsert: true })
  return { key, value }
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════════════════════
async function getDashboardStats() {
  const today = clinicDateString()
  const range = clinicDayRange(today)

  const [
    totalPatients,
    todayTotal,
    todayWaiting,
    todayInProgress,
    todayDone,
    billsToday,
    pendingBills
  ] = await Promise.all([
    Patient.countDocuments(),
    Appointment.countDocuments({ scheduled_date: today }),
    Appointment.countDocuments({ scheduled_date: today, status: 'waiting' }),
    Appointment.countDocuments({ scheduled_date: today, status: 'in-progress' }),
    Appointment.countDocuments({ scheduled_date: today, status: 'done' }),
    Bill.find({ created_at: { $gte: range.start, $lte: range.end } }).select('paid_amount').lean(),
    Bill.find({ status: { $ne: 'paid' } }).select('balance').lean()
  ])

  const todayRevenue = billsToday.reduce((sum, b) => sum + (b.paid_amount || 0), 0)
  const pendingBalance = pendingBills.reduce((sum, b) => sum + (b.balance || 0), 0)

  return {
    totalPatients,
    todayTotal,
    todayWaiting,
    todayInProgress,
    todayDone,
    todayRevenue,
    pendingBalance
  }
}

module.exports = {
  init,
  getDbPath,
  getAllPatients, searchPatients, getPatientById, addPatient, updatePatient,
  getTodayAppointments, getAppointmentsByDate, getPatientAppointments,
  addAppointment, updateAppointment, updateAppointmentStatus, deleteAppointment,
  updateAppointmentCallStatus, getPendingCalls,
  getBlockedSlots, blockSlot, unblockSlot,
  getTreatmentsByAppointment, getTreatmentsByPatient, getTreatmentsByBill, addTreatment, updateTreatment, deleteTreatment,
  getBillsByPatient, getBillById, createBill, updateBillPayment, refundBillPayment, getPaymentsByBill, getAllBills,
  getSettings, setSetting,
  getDashboardStats,
}
