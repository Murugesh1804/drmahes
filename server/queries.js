const mongoose = require('mongoose')
const { Patient, Appointment, Treatment, Bill, BillItem, Payment, Counter, Setting, BlockedSlot, Diagnosis, FollowUp, AuditLog, getDbPath } = require('./db')

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
async function getAllPatients(limit = 20, includeArchived = false) {
  const result = await Patient.aggregate([
    // FIX #3.1: Exclude archived patients by default
    { $match: includeArchived ? {} : { is_archived: false } },
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
        is_archived: 1,
        archived_at: 1,
        archived_reason: 1,
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

  const phone = normalizeText(data.phone)
  const email = normalizeEmail(data.email)

  // FIX #1: Check for duplicate phone
  if (phone) {
    const existingPhone = await Patient.findOne({ 
      phone: { $regex: `^${phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } 
    })
    if (existingPhone) {
      badRequest(`Patient with phone ${phone} already exists (ID: ${existingPhone._id})`)
    }
  }

  // FIX #1: Check for duplicate email
  if (email) {
    const existingEmail = await Patient.findOne({ 
      email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } 
    })
    if (existingEmail) {
      badRequest(`Patient with email ${email} already exists (ID: ${existingEmail._id})`)
    }
  }

  const patient = new Patient({
    name,
    phone,
    email,
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

  const patient = await Patient.findById(id)
  if (!patient) return null

  // FIX #5: Log patient updates
  const hasChanges = name !== patient.name || 
                    normalizeText(data.phone) !== patient.phone ||
                    normalizeEmail(data.email) !== patient.email ||
                    normalizeAge(data.age) !== patient.age ||
                    normalizeGender(data.gender) !== patient.gender

  if (hasChanges) {
    await logAudit(
      'update',
      'patient',
      id,
      {
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
        age: patient.age,
        gender: patient.gender
      },
      {
        name,
        phone: normalizeText(data.phone),
        email: normalizeEmail(data.email),
        age: normalizeAge(data.age),
        gender: normalizeGender(data.gender)
      },
      'Patient information updated'
    )
  }

  const updatedPatient = await Patient.findByIdAndUpdate(id, {
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

  if (updatedPatient) updatedPatient.id = updatedPatient._id.toString()
  return updatedPatient
}

// FIX #3.1: Patient archiving system
async function archivePatient(id, reason = '', archivedBy = 'admin') {
  if (!isValidObjectId(id)) return null

  const patient = await Patient.findById(id)
  if (!patient) return null

  if (patient.is_archived) {
    badRequest('Patient is already archived')
  }

  const archived = await Patient.findByIdAndUpdate(
    id,
    {
      $set: {
        is_archived: true,
        archived_at: new Date(),
        archived_by: archivedBy,
        archived_reason: reason
      }
    },
    { new: true }
  ).lean()

  if (archived) {
    archived.id = archived._id.toString()

    // Log archival
    await logAudit(
      'archive',
      'patient',
      id,
      { is_archived: false },
      { is_archived: true, archived_reason: reason },
      `Patient archived. Reason: ${reason}`
    )
  }

  return archived
}

async function unarchivePatient(id) {
  if (!isValidObjectId(id)) return null

  const patient = await Patient.findById(id)
  if (!patient) return null

  if (!patient.is_archived) {
    badRequest('Patient is not archived')
  }

  const unarchived = await Patient.findByIdAndUpdate(
    id,
    {
      $set: {
        is_archived: false,
        archived_at: null,
        archived_by: null,
        archived_reason: ''
      }
    },
    { new: true }
  ).lean()

  if (unarchived) {
    unarchived.id = unarchived._id.toString()

    // Log unarchival
    await logAudit(
      'unarchive',
      'patient',
      id,
      { is_archived: true },
      { is_archived: false },
      'Patient restored from archive'
    )
  }

  return unarchived
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

async function getNextQueueNumber(date) {
  /**
   * PERF FIX 3.2: Dynamic queue number calculation
   * Instead of using Counter collection (which grows infinitely),
   * count appointments for the given date to determine next queue number.
   * This eliminates unbounded collection growth.
   */
  const count = await Appointment.countDocuments({
    scheduled_date: date,
    status: { $ne: 'cancelled' }
  })
  return count + 1
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
  const invoiceNumber = `INV-${year}-${seq}`
  
  // FIX #3.4: Validate uniqueness to prevent collisions
  const exists = await Bill.findOne({ invoice_number: invoiceNumber })
  if (exists) {
    // Collision detected - retry with next sequence
    console.warn(`Invoice number collision detected: ${invoiceNumber}. Retrying...`)
    // Recursively call to get next number
    return getNextInvoiceNumber()
  }
  
  return invoiceNumber
}

async function addAppointment(data) {
  if (!isValidObjectId(data.patient_id)) badRequest('Valid patient is required')
  const patient = await Patient.findById(data.patient_id).select('_id').lean()
  if (!patient) badRequest('Patient not found')

  const date = normalizeDateString(data.scheduled_date)
  const scheduledTime = normalizeText(data.scheduled_time)
  const isWalkIn = data.is_walk_in === true || data.is_walk_in === 'true'

  if (scheduledTime && !isWalkIn) {
    const blocked = await BlockedSlot.exists({ date, slot: scheduledTime })
    if (blocked) badRequest('This appointment slot is blocked')

    const existing = await Appointment.exists({
      scheduled_date: date,
      scheduled_time: scheduledTime,
      status: { $ne: 'cancelled' }
    })
    if (existing) badRequest('This appointment slot is already booked')
  }

  const queueNumber = await getNextQueueNumber(date)

  const appt = new Appointment({
    patient_id: data.patient_id,
    scheduled_date: date,
    scheduled_time: scheduledTime,
    reason: normalizeText(data.reason),
    status: 'waiting',
    call_status: data.call_status ? normalizeCallStatus(data.call_status) : 'not_required',
    queue_number: queueNumber,
    notes: normalizeText(data.notes),
    appointment_type: data.appointment_type || 'consultation',
    is_urgent: data.is_urgent === true || data.is_urgent === 'true',
    is_walk_in: isWalkIn,
    is_time_confirmed: !isWalkIn && !!scheduledTime
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
  const isWalkIn = data.is_walk_in === true || data.is_walk_in === 'true'

  if (scheduledTime && !isWalkIn) {
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
      notes: normalizeText(data.notes),
      appointment_type: data.appointment_type || undefined,
      is_urgent: data.is_urgent !== undefined ? data.is_urgent === true || data.is_urgent === 'true' : undefined,
      is_walk_in: isWalkIn !== undefined ? isWalkIn : undefined,
      is_time_confirmed: scheduledTime && !isWalkIn ? true : undefined
    }
  }, { new: true, runValidators: true }).lean()

  if (appt) appt.id = appt._id.toString()
  return appt
}

async function updateAppointmentStatus(id, status) {
  if (!isValidObjectId(id)) return null
  const normalizedStatus = normalizeAppointmentStatus(status)
  
  const appt = await Appointment.findById(id)
  if (!appt) return null
  
  // FIX #5: Log appointment status change
  if (appt.status !== normalizedStatus) {
    await logAudit(
      'update',
      'appointment',
      id,
      { status: appt.status },
      { status: normalizedStatus },
      `Status changed from ${appt.status} to ${normalizedStatus}`
    )
  }
  
  await Appointment.findByIdAndUpdate(id, { $set: { status: normalizedStatus } }, { runValidators: true })
  return { id, status: normalizedStatus }
}

async function deleteAppointment(id) {
  if (!isValidObjectId(id)) return { success: false }
  await Appointment.findByIdAndUpdate(id, { $set: { status: 'cancelled' } }, { runValidators: true })
  return { success: true }
}

// FIX #3.2: Appointment cancellation with reason tracking
async function cancelAppointment(id, reason = 'other', cancelledBy = 'staff') {
  if (!isValidObjectId(id)) return null

  // Validate reason
  const validReasons = ['patient-requested', 'doctor-requested', 'no-show', 'emergency', 'rescheduled', 'other']
  if (!validReasons.includes(reason)) {
    badRequest('Invalid cancellation reason')
  }

  const appt = await Appointment.findById(id)
  if (!appt) return null

  if (appt.status === 'cancelled') {
    badRequest('Appointment is already cancelled')
  }

  const cancelled = await Appointment.findByIdAndUpdate(
    id,
    {
      $set: {
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date(),
        cancelled_by: cancelledBy
      }
    },
    { new: true }
  ).lean()

  if (cancelled) {
    cancelled.id = cancelled._id.toString()

    // Log cancellation
    await logAudit(
      'cancel',
      'appointment',
      id,
      { status: appt.status },
      { status: 'cancelled', cancellation_reason: reason },
      `Appointment cancelled. Reason: ${reason}. Cancelled by: ${cancelledBy}`
    )
  }

  return cancelled
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
  const txs = await Treatment.find({ 
    patient_id: patientId,
    deleted_at: null // FIX #2: Exclude soft-deleted treatments
  })
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

  const tx = await Treatment.findById(id)
  if (!tx) return null
  
  // FIX #2: Prevent cost modification after billing
  if (tx.bill_id && data.cost !== undefined && toMoney(data.cost) !== tx.cost) {
    badRequest(`Cannot modify cost of billed treatment. Current cost: ₹${tx.cost}`)
  }

  // FIX #5: Log treatment update
  const costChanged = data.cost !== undefined && toMoney(data.cost) !== tx.cost
  if (costChanged || treatmentType !== tx.treatment_type || normalizeText(data.description) !== tx.description) {
    await logAudit(
      'update',
      'treatment',
      id,
      {
        treatment_type: tx.treatment_type,
        cost: tx.cost,
        description: tx.description
      },
      {
        treatment_type: treatmentType,
        cost: data.cost !== undefined ? toMoney(data.cost, tx.cost) : tx.cost,
        description: normalizeText(data.description)
      },
      `Treatment details updated`
    )
  }

  // FIX #2.4: Add to cost history if cost changed
  const updates = {
    treatment_type: treatmentType,
    tooth_number: normalizeText(data.tooth_number),
    description: normalizeText(data.description),
    cost: data.cost !== undefined ? toMoney(data.cost, tx.cost, 'Treatment cost') : tx.cost,
    doctor_notes: normalizeText(data.doctor_notes)
  }

  if (costChanged && !tx.bill_id) {
    // Only track cost history for unbilled treatments
    updates.$push = {
      cost_history: {
        amount: tx.cost,
        changed_at: new Date(),
        changed_by: 'Dr. Mahe',
        reason: data.cost_change_reason || 'Price adjustment'
      }
    }
  }

  const updated = await Treatment.findByIdAndUpdate(id, {
    $set: updates,
    ...(updates.$push && { $push: updates.$push })
  }, { new: true, runValidators: true }).lean()

  if (updated) updated.id = updated._id.toString()
  return updated
}

async function deleteTreatment(id) {
  if (!isValidObjectId(id)) return { success: false }
  
  const tx = await Treatment.findById(id)
  if (!tx) return { success: false }
  
  // FIX #2: Prevent deletion of billed treatments
  if (tx.bill_id) {
    badRequest(`Cannot delete billed treatment. Linked to bill: ${tx.bill_id}`)
  }
  
  if (tx.status === 'completed') {
    badRequest('Cannot delete completed treatments. Archive instead by marking as cancelled.')
  }
  
  // FIX #2: Soft delete instead of hard delete
  await Treatment.findByIdAndUpdate(id, {
    $set: {
      status: 'cancelled',
      cancellation_reason: 'Removed from system',
      deleted_at: new Date()
    }
  })
  
  return { success: true }
}

// FIX #2: Update treatment status
async function updateTreatmentStatus(id, newStatus, sessionCompleted = false) {
  if (!isValidObjectId(id)) return null
  
  if (!['planned', 'in-progress', 'completed', 'cancelled', 'on-hold'].includes(newStatus)) {
    badRequest('Invalid treatment status')
  }
  
  const tx = await Treatment.findById(id)
  if (!tx) return null
  
  // Prevent completing unbilled treatments
  if (newStatus === 'completed' && !tx.bill_id) {
    badRequest('Treatment must be linked to bill before marking complete')
  }
  
  const updates = { status: newStatus }
  
  if (newStatus === 'completed') {
    updates.completed_at = new Date()
    updates.completed_by = 'Dr. Mahe'
    if (sessionCompleted) {
      updates.sessions_completed = Math.min(tx.sessions_completed + 1, tx.sessions_planned)
    }
  }
  
  // FIX #5: Log treatment status change
  if (tx.status !== newStatus) {
    await logAudit(
      'update',
      'treatment',
      id,
      { status: tx.status, sessions_completed: tx.sessions_completed },
      { status: newStatus, sessions_completed: updates.sessions_completed || tx.sessions_completed },
      `Status changed from ${tx.status} to ${newStatus}`
    )
  }
  
  const updated = await Treatment.findByIdAndUpdate(id, { $set: updates }, { new: true })
  
  if (updated) updated.id = updated._id.toString()
  return updated
}

// FIX #5: Audit logging helper
async function logAudit(action, entityType, entityId, before = {}, after = {}, details = '', session = null) {
  const auditEntry = {
    action,
    entity_type: entityType,
    entity_id: entityId,
    changed_by: 'Dr. Mahe',
    before,
    after,
    details
  }
  
  if (session) {
    await AuditLog.create([auditEntry], { session })
  } else {
    await AuditLog.create(auditEntry)
  }
}

// ═══════════════════════════════════════════════════════════
// DIAGNOSIS (FIX #2.2)
// ═══════════════════════════════════════════════════════════

async function recordDiagnosis(data) {
  if (!isValidObjectId(data.patient_id)) badRequest('Valid patient required')
  if (!isValidObjectId(data.appointment_id)) badRequest('Valid appointment required')
  if (!data.findings?.description) badRequest('Diagnosis description is required')
  if (!data.follow_up_type) badRequest('Follow-up type is required')

  // Verify appointment belongs to patient
  const appt = await Appointment.findById(data.appointment_id)
  if (!appt) badRequest('Appointment not found')
  if (appt.patient_id.toString() !== data.patient_id) {
    badRequest('Appointment does not belong to this patient')
  }

  const diagnosis = new Diagnosis({
    patient_id: data.patient_id,
    appointment_id: data.appointment_id,
    findings: {
      affected_teeth: Array.isArray(data.findings?.affected_teeth) ? data.findings.affected_teeth : [],
      conditions: Array.isArray(data.findings?.conditions) ? data.findings.conditions : [],
      description: normalizeText(data.findings?.description)
    },
    recommended_treatments: Array.isArray(data.recommended_treatments) ? data.recommended_treatments : [],
    urgency: data.urgency || 'routine',
    notes: normalizeText(data.notes || '')
  })

  await diagnosis.save()

  // Log diagnosis creation
  await logAudit(
    'create',
    'diagnosis',
    diagnosis._id,
    {},
    {
      conditions: diagnosis.findings.conditions,
      urgency: diagnosis.urgency
    },
    `Diagnosis recorded with conditions: ${diagnosis.findings.conditions.join(', ')}`
  )

  const doc = diagnosis.toObject()
  doc.id = doc._id.toString()
  return doc
}

async function getDiagnosisByAppointment(appointmentId) {
  if (!isValidObjectId(appointmentId)) return null
  const diagnosis = await Diagnosis.findOne({ appointment_id: appointmentId }).lean()
  if (diagnosis) diagnosis.id = diagnosis._id.toString()
  return diagnosis
}

async function getDiagnosisByPatient(patientId) {
  if (!isValidObjectId(patientId)) return []
  const diagnoses = await Diagnosis.find({ patient_id: patientId })
    .sort({ diagnosed_at: -1 })
    .lean()
  return diagnoses.map(d => ({ ...d, id: d._id.toString() }))
}

async function updateDiagnosis(id, data) {
  if (!isValidObjectId(id)) return null

  const diagnosis = await Diagnosis.findById(id)
  if (!diagnosis) return null

  const updated = await Diagnosis.findByIdAndUpdate(id, {
    $set: {
      'findings.affected_teeth': Array.isArray(data.findings?.affected_teeth) ? data.findings.affected_teeth : diagnosis.findings.affected_teeth,
      'findings.conditions': Array.isArray(data.findings?.conditions) ? data.findings.conditions : diagnosis.findings.conditions,
      'findings.description': data.findings?.description ? normalizeText(data.findings.description) : diagnosis.findings.description,
      recommended_treatments: Array.isArray(data.recommended_treatments) ? data.recommended_treatments : diagnosis.recommended_treatments,
      urgency: data.urgency || diagnosis.urgency,
      notes: data.notes ? normalizeText(data.notes) : diagnosis.notes
    }
  }, { new: true, runValidators: true }).lean()

  if (updated) {
    updated.id = updated._id.toString()
    
    // Log diagnosis update
    await logAudit(
      'update',
      'diagnosis',
      id,
      { conditions: diagnosis.findings.conditions },
      { conditions: updated.findings.conditions },
      'Diagnosis updated'
    )
  }

  return updated
}

// ═══════════════════════════════════════════════════════════
// FOLLOW-UPS (FIX #3)
// ═══════════════════════════════════════════════════════════

async function createFollowUp(data) {
  if (!isValidObjectId(data.patient_id)) badRequest('Valid patient required')
  if (!data.scheduled_date) badRequest('Follow-up date required')
  if (!data.follow_up_type) badRequest('Follow-up type required')
  
  const followUp = new FollowUp({
    patient_id: data.patient_id,
    appointment_id: data.appointment_id || null,
    treatment_id: data.treatment_id || null,
    scheduled_date: normalizeDateString(data.scheduled_date),
    follow_up_type: data.follow_up_type,
    description: normalizeText(data.description)
  })
  
  await followUp.save()
  const doc = followUp.toObject()
  doc.id = doc._id.toString()
  return doc
}

async function getPendingFollowUps() {
  const today = clinicDateString()
  
  const followUps = await FollowUp.find({
    scheduled_date: { $lte: today },
    status: { $in: ['pending', 'scheduled'] }
  })
    .populate('patient_id')
    .populate('appointment_id')
    .populate('treatment_id')
    .sort({ scheduled_date: 1 })
    .lean()
  
  return followUps.map(f => ({
    ...f,
    id: f._id.toString(),
    patient_id: f.patient_id ? f.patient_id._id.toString() : null,
    patient_name: f.patient_id ? f.patient_id.name : '',
    appointment_id: f.appointment_id ? f.appointment_id._id.toString() : null,
    treatment_id: f.treatment_id ? f.treatment_id._id.toString() : null
  }))
}

async function getPatientFollowUps(patientId, onlyPending = false) {
  if (!isValidObjectId(patientId)) return []
  
  const filter = { patient_id: patientId }
  if (onlyPending) {
    filter.status = { $in: ['pending', 'scheduled'] }
  }
  
  const followUps = await FollowUp.find(filter)
    .populate('appointment_id')
    .populate('treatment_id')
    .sort({ scheduled_date: 1 })
    .lean()
  
  return followUps.map(f => ({
    ...f,
    id: f._id.toString(),
    patient_id: f.patient_id.toString(),
    appointment_id: f.appointment_id ? f.appointment_id._id.toString() : null,
    treatment_id: f.treatment_id ? f.treatment_id._id.toString() : null
  }))
}

async function completeFollowUp(followUpId, appointmentId = null) {
  if (!isValidObjectId(followUpId)) return null
  
  const followUp = await FollowUp.findById(followUpId)
  if (!followUp) return null
  
  // FIX #5: Log follow-up completion
  if (followUp.status !== 'completed') {
    await logAudit(
      'update',
      'follow-up',
      followUpId,
      { status: followUp.status, completed_appointment_id: followUp.completed_appointment_id },
      { status: 'completed', completed_appointment_id: appointmentId || null },
      `Follow-up marked as completed`
    )
  }
  
  const updated = await FollowUp.findByIdAndUpdate(followUpId, {
    $set: {
      status: 'completed',
      completed_appointment_id: appointmentId || null
    }
  }, { new: true })
  
  if (updated) updated.id = updated._id.toString()
  return updated
}


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

  /**
   * SECURITY FIX 1.1: Calculate subTotal server-side from treatments
   * The frontend may send:
   * - existingTreatmentIds: array of existing treatment _ids to link to this bill
   * - treatments: array of new treatment objects to insert
   */

  // FIX #3.5: Validate consent before billing for treatments
  const patient = await Patient.findById(data.patient_id)
  if (!patient) badRequest('Patient not found')

  const existingIds = Array.isArray(data.existingTreatmentIds) ? data.existingTreatmentIds.filter(isValidObjectId) : []
  const hasNewTreatments = Array.isArray(data.treatments) && data.treatments.length > 0

  // If creating bill with treatments, require consent
  if ((existingIds.length > 0 || hasNewTreatments) && !patient.consentFormSaved) {
    badRequest('Patient consent form required before billing for treatments')
  }

  // FIX #4: Start transaction for consistency
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    let subTotal = 0

    // Fetch and link existing treatments
    if (existingIds.length > 0) {
      const existing = await Treatment.find({ _id: { $in: existingIds }, patient_id: data.patient_id }).session(session)
      if (existing.length !== existingIds.length) {
        badRequest('One or more treatment IDs do not belong to this patient')
      }
      
      // FIX #4: Check all treatments are completed before billing
      const incomplete = existing.filter(t => t.status !== 'completed')
      if (incomplete.length > 0) {
        badRequest(`Cannot bill for incomplete treatments: ${incomplete.map(t => t.treatment_type).join(', ')}`)
      }
      
      for (const t of existing) {
        subTotal += t.cost || 0
      }
    }

    // Add new treatments
    let treatmentsToInsert = []
    if (hasNewTreatments) {
      treatmentsToInsert = data.treatments
        .map(t => ({
          patient_id: data.patient_id,
          appointment_id: data.appointment_id || null,
          treatment_type: normalizeText(t.treatment_type),
          tooth_number: normalizeText(t.tooth_number),
          description: normalizeText(t.description),
          cost: toMoney(t.cost, 0, 'Treatment cost'),
          doctor_notes: normalizeText(t.doctor_notes),
          status: 'completed' // New treatments created in bill must be marked completed
        }))
        .filter(t => t.treatment_type)

      for (const t of treatmentsToInsert) {
        subTotal += t.cost
      }
    }

    if (subTotal <= 0) badRequest('Bill must include at least one treatment with cost > 0')

    // Apply discount and tax
    const paid = toMoney(data.paid_amount, 0, 'Paid amount')
    const discount = toPercent(data.discount)
    const taxPct = toPercent(data.tax_percent)
    const discounted = subTotal * (1 - discount / 100)
    const taxAmount = Math.round(discounted * (taxPct / 100) * 100) / 100
    const total = Math.round((discounted + taxAmount) * 100) / 100

    if (paid > total) badRequest('Paid amount cannot exceed the final bill total')

    const balance = Math.max(0, total - paid)
    const status = paid >= total ? 'paid' : paid > 0 ? 'partial' : 'pending'
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
      tax_amount: taxAmount
    })
    await bill.save({ session })

    // Record initial payment if paid > 0
    if (paid > 0) {
      await Payment.create([{
        bill_id: bill._id,
        patient_id: data.patient_id,
        amount: paid,
        method: paymentMethod,
        notes: 'Initial payment'
      }], { session })
    }

    // Link existing treatments to the bill
    if (existingIds.length > 0) {
      await Treatment.updateMany(
        { _id: { $in: existingIds } },
        { $set: { bill_id: bill._id } },
        { session }
      )
    }

    // Insert new treatments
    if (treatmentsToInsert.length > 0) {
      const newTreatments = treatmentsToInsert.map(t => ({ ...t, bill_id: bill._id }))
      await Treatment.insertMany(newTreatments, { session })
    }

    // Update patient total outstanding balance
    const bills = await Bill.find({
      patient_id: data.patient_id,
      status: { $ne: 'paid' }
    }).session(session)
    
    const totalOutstanding = bills.reduce((sum, b) => sum + (b.balance || 0), 0)
    await Patient.findByIdAndUpdate(
      data.patient_id,
      { $set: { total_outstanding_balance: totalOutstanding } },
      { session }
    )

    // FIX #5: Log bill creation in audit trail
    await logAudit('create', 'bill', bill._id, {}, {
      total_amount: total,
      paid_amount: paid,
      treatments: existingIds.length + treatmentsToInsert.length
    }, `Bill created with ${existingIds.length + treatmentsToInsert.length} treatments`, session)

    // Commit transaction
    await session.commitTransaction()

    return getBillById(bill._id.toString())
  } catch (err) {
    // Rollback if any error
    await session.abortTransaction()
    throw err
  } finally {
    await session.endSession()
  }
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

  // FIX #5: Log payment in audit trail
  const before = {
    paid_amount: bill.paid_amount,
    balance: bill.balance,
    status: bill.status
  }
  const after = {
    paid_amount: newPaid,
    balance: newBalance,
    status: newStatus
  }

  bill.paid_amount = newPaid
  bill.balance     = newBalance
  bill.status      = newStatus
  bill.payment_method = method
  await bill.save()

  // Record in payment history
  const payment = await Payment.create({
    bill_id:    bill._id,
    patient_id: bill.patient_id,
    amount,
    method,
    notes:      data.notes || ''
  })

  // Log audit
  await logAudit('payment', 'bill', bill._id, before, after, `Payment of ₹${amount} received via ${method}`)

  // Update patient total outstanding balance
  const bills = await Bill.find({
    patient_id: bill.patient_id,
    status: { $ne: 'paid' }
  })
  
  const totalOutstanding = bills.reduce((sum, b) => sum + (b.balance || 0), 0)
  await Patient.findByIdAndUpdate(
    bill.patient_id,
    { $set: { total_outstanding_balance: totalOutstanding } }
  )

  return getBillById(id)
}

async function getPaymentsByBill(billId) {
  if (!isValidObjectId(billId)) return []
  const payments = await Payment.find({ bill_id: billId }).sort({ paid_at: 1 }).lean()
  return payments.map(p => ({ ...p, id: p._id.toString() }))
}

// FIX #2.3: Payment reversal system
async function reversePayment(paymentId, reason = '', session = null) {
  if (!isValidObjectId(paymentId)) return null

  const payment = await Payment.findById(paymentId).session(session || undefined)
  if (!payment) return null
  if (payment.is_reversed) badRequest('Payment already reversed')

  // Mark payment as reversed
  const reversedPayment = await Payment.findByIdAndUpdate(
    paymentId,
    {
      $set: {
        is_reversed: true,
        reversed_at: new Date(),
        reversal_reason: reason
      }
    },
    { new: true, session: session || undefined }
  )

  // Recalculate bill balance excluding reversed payments
  const bill = await Bill.findById(payment.bill_id).session(session || undefined)
  
  const allPayments = await Payment.find({
    bill_id: bill._id,
    is_reversed: false
  }).session(session || undefined)

  const totalPaid = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const newBalance = Math.max(0, bill.total_amount - totalPaid)
  const newStatus = totalPaid >= bill.total_amount ? 'paid' : totalPaid > 0 ? 'partial' : 'pending'

  const updatedBill = await Bill.findByIdAndUpdate(
    payment.bill_id,
    {
      $set: {
        paid_amount: totalPaid,
        balance: newBalance,
        status: newStatus
      }
    },
    { new: true, session: session || undefined }
  )

  // Log reversal
  await logAudit(
    'payment',
    'payment',
    paymentId,
    { is_reversed: false, amount: payment.amount },
    { is_reversed: true, amount: payment.amount },
    `Payment of ₹${payment.amount} reversed. Reason: ${reason}`,
    session
  )

  return reversedPayment
}

async function adjustPayment(paymentId, newAmount, reason = '', session = null) {
  if (!isValidObjectId(paymentId)) return null

  const payment = await Payment.findById(paymentId).session(session || undefined)
  if (!payment) return null
  if (payment.is_reversed) badRequest('Cannot adjust reversed payments')

  const amountDifference = toMoney(newAmount) - payment.amount

  const adjustedPayment = await Payment.findByIdAndUpdate(
    paymentId,
    {
      $set: {
        amount: toMoney(newAmount),
        is_adjustment: true,
        adjustment_reason: reason
      }
    },
    { new: true, session: session || undefined }
  )

  // Recalculate bill balance
  const bill = await Bill.findById(payment.bill_id).session(session || undefined)
  
  const allPayments = await Payment.find({
    bill_id: bill._id,
    is_reversed: false
  }).session(session || undefined)

  const totalPaid = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const newBalance = Math.max(0, bill.total_amount - totalPaid)
  const newStatus = totalPaid >= bill.total_amount ? 'paid' : totalPaid > 0 ? 'partial' : 'pending'

  await Bill.findByIdAndUpdate(
    payment.bill_id,
    {
      $set: {
        paid_amount: totalPaid,
        balance: newBalance,
        status: newStatus
      }
    },
    { session: session || undefined }
  )

  // Log adjustment
  await logAudit(
    'adjustment',
    'payment',
    paymentId,
    { amount: payment.amount },
    { amount: toMoney(newAmount) },
    `Payment adjusted from ₹${payment.amount} to ₹${toMoney(newAmount)}. Reason: ${reason}`,
    session
  )

  return adjustedPayment
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

/**
 * Search bills by patient name (regex search on MongoDB)
 * Supports pagination to handle large result sets
 */
async function searchBills(query, page = 1, limit = 50) {
  const searchPattern = normalizeText(query)
  if (!searchPattern) return { items: [], total: 0, page, limit, hasMore: false }

  const skip = (page - 1) * limit
  const regex = new RegExp(searchPattern, 'i') // Case-insensitive

  const bills = await Bill.find()
    .populate('patient_id')
    .exec()
    .then(bills => {
      // Filter by patient name on populated data
      return bills.filter(b => b.patient_id && regex.test(b.patient_id.name))
    })
    .then(filtered => {
      // Sort by creation date descending, then paginate
      filtered.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
      const paged = filtered.slice(skip, skip + limit)
      const total = filtered.length
      return { paged, total }
    })

  const items = bills.paged.map(b => ({
    ...b.toObject?.() || b,
    id: b._id.toString(),
    patient_id: b.patient_id ? b.patient_id._id.toString() : null,
    patient_name: b.patient_id ? b.patient_id.name : ''
  }))

  return { items, total: bills.total, page, limit, hasMore: skip + items.length < bills.total }
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
  getAllPatients, searchPatients, getPatientById, addPatient, updatePatient, archivePatient, unarchivePatient,
  getTodayAppointments, getAppointmentsByDate, getPatientAppointments,
  addAppointment, updateAppointment, updateAppointmentStatus, deleteAppointment, cancelAppointment,
  updateAppointmentCallStatus, getPendingCalls,
  getBlockedSlots, blockSlot, unblockSlot,
  getTreatmentsByAppointment, getTreatmentsByPatient, getTreatmentsByBill, addTreatment, updateTreatment, deleteTreatment, updateTreatmentStatus,
  recordDiagnosis, getDiagnosisByAppointment, getDiagnosisByPatient, updateDiagnosis,
  createFollowUp, getPatientFollowUps, getPendingFollowUps, completeFollowUp,
  getBillsByPatient, getBillById, createBill, updateBillPayment, getPaymentsByBill, reversePayment, adjustPayment, getAllBills, searchBills,
  getSettings, setSetting,
  getDashboardStats,
  logAudit
}
