const mongoose = require('mongoose')
const { Patient, Appointment, Treatment, Bill, BillItem, Payment, Counter, Setting, BlockedSlot, Diagnosis, FollowUp, AuditLog, ConsultantPayment, TreatmentMaster, MedicineMaster, AdvanceLedger, LabWorkOrder, Enquiry, getDbPath } = require('./db')

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
  return ['cash', 'upi', 'card', 'advance', 'other'].includes(method) ? method : fallback
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

// FIX #5: Helper to normalize tooth numbers to consistent array format
function normalizeToothNumbers(value) {
  // If already an array, filter out empty strings
  if (Array.isArray(value)) {
    return value.filter(t => t && typeof t === 'string' && t.trim())
  }
  // If string, split by comma and trim
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map(s => s.trim()).filter(Boolean)
  }
  // Default to empty array
  return []
}

// FIX #5: Helper to convert tooth numbers array to display string
function toothNumbersToString(toothNumbers) {
  if (!Array.isArray(toothNumbers) || toothNumbers.length === 0) return ''
  return toothNumbers.join(', ')
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

// IST offset applied by default (5.5 hours) as per business requirement
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
async function getAllPatients(optionsOrLimit = 20, includeArchivedParam = false, periodParam = 'all') {
  let limit = 20
  let page = 1
  let includeArchived = false
  let period = 'all'
  let isPaginated = false

  if (typeof optionsOrLimit === 'object' && optionsOrLimit !== null) {
    page = Math.max(1, parseInt(optionsOrLimit.page) || 1)
    limit = parseInt(optionsOrLimit.limit) || 20
    includeArchived = Boolean(optionsOrLimit.includeArchived)
    period = optionsOrLimit.period || 'all'
    isPaginated = Boolean(optionsOrLimit.paginated || optionsOrLimit.page)
  } else {
    limit = typeof optionsOrLimit === 'number' ? optionsOrLimit : 20
    includeArchived = includeArchivedParam
    period = periodParam || 'all'
  }

  let createdFilter = {}
  if (period !== 'all') {
    const now = new Date()
    let start
    if (period === 'day') {
      start = new Date(now.setHours(0,0,0,0))
    } else if (period === 'week') {
      const d = new Date()
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      start = new Date(d.setDate(diff))
      start.setHours(0,0,0,0)
    } else if (period === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
    }
    if (start) {
      createdFilter = { created_at: { $gte: start } }
    }
  }
  const matchFilter = {
    ...(includeArchived ? {} : { is_archived: false }),
    ...createdFilter
  }

  const pipeline = [
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
        email: 1,
        age: 1,
        gender: 1,
        address: 1,
        complaint: 1,
        notes: 1,
        consentFormSaved: 1,
        consentFormPath: 1,
        consentSignedAt: 1,
        pid: 1,
        is_archived: 1,
        archived_at: 1,
        archived_reason: 1,
        created_at: 1,
        updated_at: 1,
        appointment_count: { $size: '$appts' },
        last_visit: { $max: '$appts.scheduled_date' }
      }
    },
    { $sort: { updated_at: -1 } }
  ]

  if (isPaginated && limit > 0) {
    const skip = (page - 1) * limit
    const [itemsResult, countResult] = await Promise.all([
      Patient.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
      Patient.countDocuments(matchFilter)
    ])
    const items = itemsResult.map(p => ({ ...p, id: p._id.toString() }))
    return {
      items,
      total: countResult,
      page,
      limit,
      totalPages: Math.ceil(countResult / limit) || 1,
      hasMore: skip + items.length < countResult
    }
  }

  if (limit > 0) {
    pipeline.push({ $limit: limit })
  }

  const result = await Patient.aggregate(pipeline)
  const items = result.map(p => ({ ...p, id: p._id.toString() }))
  return items
}

async function searchPatients(query) {
  const matchFilter = query.trim() ? {
    $or: [
      { name:      { $regex: query, $options: 'i' } },
      { phone:     { $regex: query, $options: 'i' } },
      { complaint: { $regex: query, $options: 'i' } },
      { notes:     { $regex: query, $options: 'i' } },
      { pid:       { $regex: query, $options: 'i' } },
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
        pid: 1,
        is_archived: 1,
        archived_at: 1,
        archived_reason: 1,
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

  // Allow multiple family members (parent/children) to share the same phone number.
  // Only reject if a patient with the EXACT SAME name AND phone already exists.
  if (phone && name) {
    const existingSameNameAndPhone = await Patient.findOne({ 
      phone: { $regex: `^${phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
    })
    if (existingSameNameAndPhone) {
      badRequest(`Patient "${name}" with phone ${phone} already exists (ID: ${existingSameNameAndPhone._id})`)
    }
  }

  // Check for duplicate email (allows family members with the same phone number to share an email)
  if (email) {
    const existingEmail = await Patient.findOne({ 
      email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
      ...(phone ? { phone: { $ne: phone } } : {})
    })
    if (existingEmail) {
      badRequest(`Patient with email ${email} already exists under a different phone number (${existingEmail.phone})`)
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
    consentSignedAt: data.consentSignedAt || null,
    registration_source: data.registration_source || 'reception'
  })

  // Auto-generate PID
  const counterDoc = await Counter.findOneAndUpdate(
    { key: 'patient_id' },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  )
  patient.pid = `MD-${counterDoc.seq}`

  await patient.save()
  const doc = patient.toObject()
  doc.id = doc._id.toString()
  return doc
}

async function generatePatientId(id) {
  if (!isValidObjectId(id)) return null
  const patient = await Patient.findById(id)
  if (!patient) return null
  if (patient.pid) return patient.toObject() // Already has ID

  const doc = await Counter.findOneAndUpdate(
    { key: 'patient_id' },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  )
  patient.pid = `MD-${doc.seq}`
  await patient.save()
  
  const docObj = patient.toObject()
  docObj.id = docObj._id.toString()
  return docObj
}

async function updatePatient(id, data) {
  if (!isValidObjectId(id)) return null

  const patient = await Patient.findById(id)
  if (!patient) return null

  const name = data.name !== undefined ? normalizeText(data.name) : patient.name
  if (!name) badRequest('Patient name is required')

  const phone = data.phone !== undefined ? normalizeText(data.phone) : patient.phone
  const email = data.email !== undefined ? normalizeEmail(data.email) : patient.email

  // Allow multiple family members (parent/children) to share the same phone number.
  // Only reject if ANOTHER patient with the EXACT SAME name AND phone already exists.
  if (phone && name) {
    const existingSameNameAndPhone = await Patient.findOne({
      _id: { $ne: id },
      phone: { $regex: `^${phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
    })
    if (existingSameNameAndPhone) {
      badRequest(`Another patient named "${name}" with phone ${phone} already exists (ID: ${existingSameNameAndPhone._id})`)
    }
  }

  if (email) {
    const existingEmail = await Patient.findOne({
      _id: { $ne: id },
      email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
      ...(phone ? { phone: { $ne: phone } } : {})
    })
    if (existingEmail) {
      badRequest(`Another patient with email ${email} already exists under a different phone number (${existingEmail.phone})`)
    }
  }

  const age = data.age !== undefined ? normalizeAge(data.age) : patient.age
  const gender = data.gender !== undefined ? normalizeGender(data.gender) : patient.gender
  const address = data.address !== undefined ? normalizeText(data.address) : patient.address
  const complaint = data.complaint !== undefined ? normalizeText(data.complaint) : patient.complaint
  const notes = data.notes !== undefined ? normalizeText(data.notes) : patient.notes

  // FIX #5: Log patient updates
  const hasChanges = name !== patient.name || 
                    phone !== patient.phone ||
                    email !== patient.email ||
                    age !== patient.age ||
                    gender !== patient.gender ||
                    address !== patient.address ||
                    complaint !== patient.complaint ||
                    notes !== patient.notes

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
        gender: patient.gender,
        address: patient.address,
        complaint: patient.complaint,
        notes: patient.notes
      },
      {
        name,
        phone,
        email,
        age,
        gender,
        address,
        complaint,
        notes
      },
      'Patient information updated'
    )
  }

  const updatedPatient = await Patient.findByIdAndUpdate(id, {
    $set: {
      name,
      phone,
      email,
      age,
      gender,
      address,
      complaint,
      notes
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
// ENQUIRIES
// ═══════════════════════════════════════════════════════════

async function getAllEnquiries(limit = 20) {
  const result = await Enquiry.find()
    .sort({ updated_at: -1 })
    .limit(limit)
    .lean()
  return result.map(e => ({ ...e, id: e._id.toString() }))
}

async function searchEnquiries(query) {
  const matchFilter = query.trim() ? {
    $or: [
      { name:      { $regex: query, $options: 'i' } },
      { phone:     { $regex: query, $options: 'i' } },
      { complaint: { $regex: query, $options: 'i' } },
      { notes:     { $regex: query, $options: 'i' } },
    ]
  } : {}

  const result = await Enquiry.find(matchFilter)
    .sort({ name: 1 })
    .limit(50)
    .lean()
  return result.map(e => ({ ...e, id: e._id.toString() }))
}

async function addEnquiry(data) {
  const name = normalizeText(data.name)
  if (!name) badRequest('Name is required')

  const phone = normalizeText(data.phone)

  const enquiry = new Enquiry({
    name,
    phone,
    age: normalizeAge(data.age),
    gender: normalizeGender(data.gender),
    complaint: normalizeText(data.complaint),
    notes: normalizeText(data.notes),
    status: data.status || 'pending'
  })

  await enquiry.save()
  const doc = enquiry.toObject()
  doc.id = doc._id.toString()
  return doc
}

async function updateEnquiryStatus(id, status) {
  if (!isValidObjectId(id)) return null
  if (!['pending', 'converted', 'non-converted'].includes(status)) badRequest('Invalid status')

  const updated = await Enquiry.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true }
  ).lean()

  if (updated) {
    updated.id = updated._id.toString()
  }
  return updated
}

async function deleteEnquiry(id) {
  if (!isValidObjectId(id)) return false
  const deleted = await Enquiry.findByIdAndDelete(id)
  return !!deleted
}

async function convertEnquiryToPatient(id) {
  if (!isValidObjectId(id)) return null
  const enquiry = await Enquiry.findById(id)
  if (!enquiry) return null

  // Create new patient using enquiry details
  const patient = await addPatient({
    name: enquiry.name,
    phone: enquiry.phone || '',
    age: enquiry.age || null,
    gender: enquiry.gender || 'Male',
    complaint: enquiry.complaint || '',
    notes: enquiry.notes ? `[From Enquiry] ${enquiry.notes}` : '',
    registration_source: 'enquiry'
  })

  enquiry.status = 'converted'
  await enquiry.save()

  return {
    patient,
    enquiry: { ...enquiry.toObject(), id: enquiry._id.toString() }
  }
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

async function getNextReceiptNumber() {
  const year = new Date().getFullYear()
  const key  = `receipt_${year}`
  const doc  = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  )
  const seq = String(doc.seq).padStart(4, '0')
  return `REC-${year}-${seq}`
}

async function getNextCreditNoteNumber() {
  const year = new Date().getFullYear()
  const key  = `credit_note_${year}`
  const doc  = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  )
  const seq = String(doc.seq).padStart(4, '0')
  return `CN-${year}-${seq}`
}

async function getNextLabOrderNumber() {
  const year = new Date().getFullYear()
  const key  = `lab_order_${year}`
  const doc  = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  )
  const seq = String(doc.seq).padStart(4, '0')
  return `LAB-${year}-${seq}`
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

/**
 * Apply current TreatmentMaster standard_cost to unbilled treatments.
 * Billed treatments keep their locked cost (price at time of billing).
 * For unbilled treatments, cost is always recalculated from the current
 * TreatmentMaster price × tooth count so price changes propagate everywhere.
 */
async function applyMasterCost(txs) {
  const masters = await TreatmentMaster.find({ is_active: true }).lean()
  return txs.map(t => {
    // Billed treatments: keep locked cost
    if (t.bill_id) return t
    const toothNumbers = normalizeToothNumbers(t.tooth_numbers || t.tooth_number)
    const count = toothNumbers.length > 0 ? toothNumbers.length : 1
    const master = masters.find(m => m.treatment_name.toLowerCase() === (t.treatment_type || '').toLowerCase())
    const masterCost = master ? master.standard_cost : 0
    return { ...t, cost: masterCost * count }
  })
}

async function getTreatmentsByAppointment(appointmentId) {
  if (!isValidObjectId(appointmentId)) return []
  const txs = await Treatment.find({ appointment_id: appointmentId, deleted_at: null }).sort({ created_at: 1 }).lean()
  const enriched = await applyMasterCost(txs)
  return enriched.map(t => ({
    ...t,
    id: t._id.toString(),
    patient_id: t.patient_id.toString(),
    appointment_id: t.appointment_id ? t.appointment_id.toString() : null,
    bill_id: t.bill_id ? t.bill_id.toString() : null,
    tooth_numbers: normalizeToothNumbers(t.tooth_numbers || t.tooth_number)
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
    bill_id: t.bill_id ? t.bill_id.toString() : null,
    tooth_numbers: normalizeToothNumbers(t.tooth_numbers || t.tooth_number)
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

  const enriched = await applyMasterCost(txs)
  return enriched.map(t => ({
    ...t,
    id: t._id.toString(),
    patient_id: t.patient_id.toString(),
    appointment_id: t.appointment_id ? t.appointment_id._id.toString() : null,
    appointment_date: t.appointment_id ? t.appointment_id.scheduled_date : null,
    appointment_status: t.appointment_id ? t.appointment_id.status : null,
    tooth_numbers: normalizeToothNumbers(t.tooth_numbers || t.tooth_number)
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

  // Case-insensitive lookup so cost is always found regardless of capitalisation
  const selectedMaster = await TreatmentMaster.findOne({
    treatment_name: { $regex: `^${treatmentType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
  })
  if (!selectedMaster) {
    badRequest(`Treatment type "${treatmentType}" not found in Treatment Masters`)
  }
  const toothNumbers = normalizeToothNumbers(data.tooth_numbers || data.tooth_number)
  const toothCount = toothNumbers.length > 0 ? toothNumbers.length : 1
  const costPerTooth = selectedMaster.standard_cost || 0
  const calculatedCost = costPerTooth * toothCount

  // Save treatment WITHOUT linking to a bill.
  // Bills are only created explicitly from the Billing page.
  // The treatment will appear in "Unbilled Completed Treatments" until then.
  const tx = new Treatment({
    patient_id: data.patient_id,
    appointment_id: data.appointment_id || null,
    treatment_type: treatmentType,
    tooth_number: toothNumbersToString(toothNumbers),
    tooth_numbers: toothNumbers,
    description: normalizeText(data.description),
    cost: calculatedCost,
    doctor_notes: normalizeText(data.doctor_notes),
    status: data.status || 'completed',
    implant_details: data.implant_details || {},
    bill_id: null
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

  if (data.implant_details) {
    tx.implant_details = { ...(tx.implant_details || {}), ...data.implant_details }
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
  const toothNumbers = normalizeToothNumbers(data.tooth_numbers || data.tooth_number || tx.tooth_numbers)
  const updates = {
    treatment_type: treatmentType,
    tooth_number: toothNumbersToString(toothNumbers),
    tooth_numbers: toothNumbers,
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
    patient_email: b.patient_id ? b.patient_id.email : '',
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
    patient_phone: b.patient_id ? b.patient_id.phone : '',
    patient_email: b.patient_id ? b.patient_id.email : ''
  }
}

// FIX #1: Delete bill and recalculate patient outstanding balance
async function deleteBill(id) {
  if (!isValidObjectId(id)) return null
  
  const bill = await Bill.findById(id)
  if (!bill) return null
  
  const session = await mongoose.startSession()
  session.startTransaction()
  
  try {
    const patientId = bill.patient_id
    
    // Unlink treatments from this bill
    await Treatment.updateMany(
      { bill_id: id },
      { $set: { bill_id: null } },
      { session }
    )
    
    // Delete bill
    await Bill.findByIdAndDelete(id, { session })
    
    // FIX #6: Use atomic decrement instead of recalculating from all bills
    // Subtract the deleted bill's balance from patient's total
    await Patient.findByIdAndUpdate(
      patientId,
      { $inc: { total_outstanding_balance: -bill.balance } },
      { session }
    )
    
    // Log audit
    await logAudit(
      'delete',
      'bill',
      id,
      { total_amount: bill.total_amount, balance: bill.balance },
      {},
      `Bill deleted with balance ₹${bill.balance}`,
      session
    )
    
    await session.commitTransaction()
    return { success: true }
  } catch (err) {
    await session.abortTransaction()
    throw err
  } finally {
    await session.endSession()
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
    const masters = await TreatmentMaster.find({ is_active: true }).session(session).lean()
    const medicineMasters = await MedicineMaster.find({ is_active: true }).session(session).lean()

    const resolveCost = (treatmentType) => {
      if (treatmentType.startsWith('Medicine: ')) {
        let medStr = treatmentType.substring(10).trim()
        let qty = 1
        
        const qtyMatch = medStr.match(/ \(Qty: (\d+)\)$/i)
        if (qtyMatch) {
          qty = parseInt(qtyMatch[1], 10)
          medStr = medStr.replace(/ \(Qty: \d+\)$/i, '').trim()
        }
        
        const medName = medStr.toLowerCase()
        const matched = medicineMasters.find(m => m.item_name.toLowerCase() === medName)
        if (!matched) badRequest(`Medicine "${medStr}" not found in Medicine Masters`)
        return (matched.standard_cost || 0) * qty
      } else {
        const matched = masters.find(m => m.treatment_name.toLowerCase() === treatmentType.toLowerCase())
        if (!matched) badRequest(`Treatment type "${treatmentType}" not found in Treatment Masters`)
        return matched.standard_cost || 0
      }
    }

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
        const toothNumbers = normalizeToothNumbers(t.tooth_numbers || t.tooth_number)
        const count = toothNumbers.length > 0 ? toothNumbers.length : 1
        let costPerTooth = 0
        try {
          costPerTooth = resolveCost(t.treatment_type)
        } catch (e) {
          // If a legacy treatment or removed master, fallback to its existing cost instead of erroring out existing treatments
          costPerTooth = (t.cost || 0) / count
        }
        const dynamicCost = costPerTooth * count
        subTotal += dynamicCost
        
        // Also update the treatment cost in the db so it is persisted
        t.cost = dynamicCost
        await Treatment.findByIdAndUpdate(t._id, { $set: { cost: dynamicCost } }).session(session)
      }
    }

    // Add new treatments
    let treatmentsToInsert = []
    if (hasNewTreatments) {
      treatmentsToInsert = data.treatments
        .map(t => {
          const toothNumbers = normalizeToothNumbers(t.tooth_numbers || t.tooth_number)
          const count = toothNumbers.length > 0 ? toothNumbers.length : 1
          const costPerTooth = resolveCost(t.treatment_type)
          const dynamicCost = costPerTooth * count

          return {
            patient_id: data.patient_id,
            appointment_id: data.appointment_id || null,
            treatment_type: normalizeText(t.treatment_type),
            tooth_number: toothNumbersToString(toothNumbers),
            tooth_numbers: toothNumbers,
            description: normalizeText(t.description),
            cost: dynamicCost,
            doctor_notes: normalizeText(t.doctor_notes),
            status: 'completed'
          }
        })
        .filter(t => t.treatment_type)

      for (const t of treatmentsToInsert) {
        subTotal += t.cost
      }
    }

    if (subTotal <= 0) badRequest('Bill must include at least one treatment with cost > 0')

    // Apply discount, manual/medicine charges and tax
    const paid = toMoney(data.paid_amount, 0, 'Paid amount')
    const manualCharges = toMoney(data.manual_charges, 0, 'Manual charges')
    const medicineCharges = toMoney(data.medicine_charges, 0, 'Medicine charges')
    const discount = toMoney(data.discount, 0, 'Discount') // Flat amount
    const taxPct = toPercent(data.tax_percent)
    
    // Formula: Bill Total = Sum(All Treatment Costs) + Manual Charges + Medicine Charges - Discount
    const baseTotal = subTotal + manualCharges + medicineCharges - discount
    const taxAmount = Math.round(baseTotal * (taxPct / 100) * 100) / 100
    const total = Math.round((baseTotal + taxAmount) * 100) / 100

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
      tax_amount: taxAmount,
      manual_charges: manualCharges,
      medicine_charges: medicineCharges
    })
    await bill.save({ session })

    // Record initial payment if paid > 0
    if (paid > 0) {
      let initialPaymentDate = new Date()
      if (data.payment_date || data.paid_at) {
        const parsed = new Date(data.payment_date || data.paid_at)
        if (!isNaN(parsed.getTime())) initialPaymentDate = parsed
      }
      const receiptNumber = await getNextReceiptNumber()
      await Payment.create([{
        bill_id:      bill._id,
        patient_id:   data.patient_id,
        amount:       paid,
        method:       paymentMethod,
        payment_date: initialPaymentDate,
        paid_at:      initialPaymentDate,
        receipt_number: receiptNumber,
        reference_id: data.reference_id || '',
        notes:        data.payment_notes || data.notes || 'Initial payment'
      }], { session })
    }

    // Apply Advance Wallet Balance if requested
    const advanceToApply = toMoney(data.apply_advance, 0, 'Advance amount')
    if (advanceToApply > 0) {
      const patient = await Patient.findById(data.patient_id).session(session)
      if (patient && (patient.advance_balance || 0) >= advanceToApply) {
        patient.advance_balance = Math.round(((patient.advance_balance || 0) - advanceToApply) * 100) / 100
        await patient.save({ session })

        const advanceReceipt = await getNextReceiptNumber()
        await Payment.create([{
          bill_id:        bill._id,
          patient_id:     data.patient_id,
          amount:         advanceToApply,
          method:         'advance',
          payment_date:   new Date(),
          paid_at:        new Date(),
          receipt_number: advanceReceipt,
          notes:          'Allocated from Patient Advance Wallet'
        }], { session })

        await AdvanceLedger.create([{
          patient_id:     data.patient_id,
          receipt_number: advanceReceipt,
          type:           'allocation',
          amount:         advanceToApply,
          payment_method: 'other',
          bill_id:        bill._id,
          notes:          `Applied to Bill ${invoiceNumber}`,
          balance_after:  patient.advance_balance
        }], { session })

        const newTotalPaid = Math.round(((bill.paid_amount || 0) + advanceToApply) * 100) / 100
        bill.paid_amount = newTotalPaid
        bill.balance = Math.max(0, bill.total_amount - newTotalPaid)
        bill.status = newTotalPaid >= bill.total_amount ? 'paid' : 'partial'
        await bill.save({ session })
      }
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

    // FIX #6: Use atomic increment instead of recalculating from all bills
    // This prevents race conditions and is more efficient
    await Patient.findByIdAndUpdate(
      data.patient_id,
      { $inc: { total_outstanding_balance: balance } },
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
  let paymentDate = new Date()
  if (data.payment_date || data.paid_at) {
    const parsed = new Date(data.payment_date || data.paid_at)
    if (!isNaN(parsed.getTime())) paymentDate = parsed
  }

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

  // FIX #4: Wrap in transaction for consistency
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    bill.paid_amount = newPaid
    bill.balance     = newBalance
    bill.status      = newStatus
    bill.payment_method = method
    await bill.save({ session })

    // Record in payment history with sequential Receipt Number
    const receiptNumber = await getNextReceiptNumber()
    const payment = await Payment.create([{
      bill_id:      bill._id,
      patient_id:   bill.patient_id,
      amount,
      method,
      payment_date: paymentDate,
      paid_at:      paymentDate,
      receipt_number: receiptNumber,
      reference_id: data.reference_id || '',
      notes:        data.notes || ''
    }], { session })

    // If payment method is advance wallet, deduct from patient advance balance
    if (method === 'advance') {
      const patient = await Patient.findById(bill.patient_id).session(session)
      if (!patient || (patient.advance_balance || 0) < amount) {
        badRequest('Insufficient patient advance balance')
      }
      patient.advance_balance = Math.round(((patient.advance_balance || 0) - amount) * 100) / 100
      await patient.save({ session })

      await AdvanceLedger.create([{
        patient_id:     bill.patient_id,
        receipt_number: receiptNumber,
        type:           'allocation',
        amount,
        payment_method: 'other',
        bill_id:        bill._id,
        notes:          `Applied to Bill ${bill.invoice_number || bill._id}`,
        balance_after:  patient.advance_balance
      }], { session })
    }

    const dateStr = paymentDate.toISOString().split('T')[0]
    // Log audit
    await logAudit('payment', 'bill', bill._id, before, after, `Payment of ₹${amount} received via ${method} (Receipt: ${receiptNumber}) on ${dateStr}`, session)

    // FIX #6: Use atomic decrement instead of recalculating from all bills
    // Balance DECREASES by the amount paid (negative increment)
    await Patient.findByIdAndUpdate(
      bill.patient_id,
      { $inc: { total_outstanding_balance: -amount } },
      { session }
    )

    await session.commitTransaction()
    return getBillById(id)
  } catch (err) {
    await session.abortTransaction()
    throw err
  } finally {
    await session.endSession()
  }
}

async function getPaymentsByBill(billId) {
  if (!isValidObjectId(billId)) return []
  const payments = await Payment.find({ bill_id: billId }).sort({ payment_date: 1, paid_at: 1 }).lean()
  return payments.map(p => ({
    ...p,
    id: p._id.toString(),
    payment_date: p.payment_date || p.paid_at || p.created_at,
    payment_method: p.method || p.payment_method || 'cash'
  }))
}

// FIX #2.3: Corporate Payment reversal & Credit Note system
async function reversePayment(paymentId, data = {}, session = null) {
  if (!isValidObjectId(paymentId)) return null
  const reason = typeof data === 'string' ? data : (data.reason || '')
  const refundMethod = typeof data === 'object' ? (data.refund_method || 'none') : 'none'

  const isExternalSession = Boolean(session)
  const dbSession = session || await mongoose.startSession()
  if (!isExternalSession) dbSession.startTransaction()

  try {
    const payment = await Payment.findById(paymentId).session(dbSession)
    if (!payment) {
      if (!isExternalSession) await dbSession.endSession()
      return null
    }
    if (payment.is_reversed) badRequest('Payment already reversed')

    const creditNoteNumber = await getNextCreditNoteNumber()

    // Mark payment as reversed with Credit Note and Refund Method
    const reversedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        $set: {
          is_reversed: true,
          reversed_at: new Date(),
          reversal_reason: reason,
          credit_note_number: creditNoteNumber,
          refund_method: refundMethod
        }
      },
      { new: true, session: dbSession }
    )

    // If refundMethod is 'to_advance_wallet', credit patient's advance balance
    if (refundMethod === 'to_advance_wallet') {
      const patient = await Patient.findById(payment.patient_id).session(dbSession)
      if (patient) {
        patient.advance_balance = Math.round(((patient.advance_balance || 0) + payment.amount) * 100) / 100
        await patient.save({ session: dbSession })

        await AdvanceLedger.create([{
          patient_id: payment.patient_id,
          receipt_number: creditNoteNumber,
          type: 'deposit',
          amount: payment.amount,
          payment_method: 'other',
          bill_id: payment.bill_id,
          notes: `Refund from Credit Note ${creditNoteNumber}: ${reason || 'Reversed payment'}`,
          balance_after: patient.advance_balance
        }], { session: dbSession })
      }
    }

    const bill = await Bill.findById(payment.bill_id).session(dbSession)
    const allPayments = await Payment.find({
      bill_id: bill._id,
      is_reversed: false
    }).session(dbSession)

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
      { session: dbSession }
    )

    await Patient.findByIdAndUpdate(
      bill.patient_id,
      { $inc: { total_outstanding_balance: payment.amount } },
      { session: dbSession }
    )

    // Log reversal with Credit Note
    await logAudit(
      'payment',
      'payment',
      paymentId,
      { is_reversed: false, amount: payment.amount },
      { is_reversed: true, amount: payment.amount, credit_note_number: creditNoteNumber, refund_method: refundMethod },
      `Payment of ₹${payment.amount} reversed via Credit Note ${creditNoteNumber}. Reason: ${reason}`,
      dbSession
    )

    if (!isExternalSession) await dbSession.commitTransaction()
    return reversedPayment
  } catch (err) {
    if (!isExternalSession) await dbSession.abortTransaction()
    throw err
  } finally {
    if (!isExternalSession) await dbSession.endSession()
  }
}

async function adjustPayment(paymentId, newAmount, reason = '', session = null) {
  if (!isValidObjectId(paymentId)) return null

  const isExternalSession = Boolean(session)
  const dbSession = session || await mongoose.startSession()
  if (!isExternalSession) dbSession.startTransaction()

  try {
    const payment = await Payment.findById(paymentId).session(dbSession)
    if (!payment) {
      if (!isExternalSession) await dbSession.endSession()
      return null
    }
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
      { new: true, session: dbSession }
    )

    const bill = await Bill.findById(payment.bill_id).session(dbSession)
    const allPayments = await Payment.find({
      bill_id: bill._id,
      is_reversed: false
    }).session(dbSession)

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
      { session: dbSession }
    )

    await Patient.findByIdAndUpdate(
      bill.patient_id,
      { $inc: { total_outstanding_balance: amountDifference } },
      { session: dbSession }
    )

    // Log adjustment
    await logAudit(
      'adjustment',
      'payment',
      paymentId,
      { amount: payment.amount },
      { amount: toMoney(newAmount) },
      `Payment adjusted from ₹${payment.amount} to ₹${toMoney(newAmount)}. Reason: ${reason}`,
      dbSession
    )

    if (!isExternalSession) await dbSession.commitTransaction()
    return adjustedPayment
  } catch (err) {
    if (!isExternalSession) await dbSession.abortTransaction()
    throw err
  } finally {
    if (!isExternalSession) await dbSession.endSession()
  }
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
    patient_name: b.patient_id ? b.patient_id.name : '',
    patient_pid:  b.patient_id ? (b.patient_id.pid || null) : null,
    age:          b.patient_id ? b.patient_id.age : null,
    gender:       b.patient_id ? b.patient_id.gender : null,
    phone:        b.patient_id ? b.patient_id.phone : '',
    patient_email: b.patient_id ? b.patient_id.email : ''
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
  
  // Aggregate to join patients and filter by patient name inside MongoDB
  const pipeline = [
    {
      $lookup: {
        from: 'patients',
        localField: 'patient_id',
        foreignField: '_id',
        as: 'patient'
      }
    },
    { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
    {
      $match: {
        'patient.name': { $regex: searchPattern, $options: 'i' }
      }
    }
  ]
  
  const [results, totalCount] = await Promise.all([
    Bill.aggregate([
      ...pipeline,
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]),
    Bill.aggregate([
      ...pipeline,
      { $count: 'total' }
    ])
  ])
  
  const total = totalCount.length > 0 ? totalCount[0].total : 0
  
  const items = results.map(b => ({
    ...b,
    id: b._id.toString(),
    patient_id:  b.patient ? b.patient._id.toString() : null,
    patient_name: b.patient ? b.patient.name : '',
    patient_pid:  b.patient ? (b.patient.pid || null) : null,
    age:          b.patient ? b.patient.age : null,
    gender:       b.patient ? b.patient.gender : null,
    phone:        b.patient ? b.patient.phone : '',
    patient_email: b.patient ? b.patient.email : ''
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

async function setSettingsBulk(settingsObj) {
  const entries = Object.entries(settingsObj || {})
  const updates = entries.map(([key, value]) => ({
    updateOne: {
      filter: { key },
      update: { $set: { value } },
      upsert: true
    }
  }))
  if (updates.length > 0) {
    await Setting.bulkWrite(updates)
  }
  return getSettings()
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════════════════════
async function getDashboardStats(period = 'today', dateParam = null) {
  let targetDate = clinicDateString()
  let range = clinicDayRange(targetDate)

  if (period === 'yesterday') {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    targetDate = clinicDateString(d)
    range = clinicDayRange(targetDate)
  } else if (period === 'week') {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    const startStr = clinicDateString(monday)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const endStr = clinicDateString(sunday)
    const startRange = clinicDayRange(startStr)
    const endRange = clinicDayRange(endStr)
    range = { start: startRange.start, end: endRange.end }
    targetDate = `${startStr} to ${endStr}`
  } else if (dateParam) {
    targetDate = dateParam
    range = clinicDayRange(targetDate)
  }

  const isRange = period === 'week'

  const [
    totalPatients,
    todayTotal,
    todayWaiting,
    todayInProgress,
    todayDone,
    todayPayments,
    pendingBills
  ] = await Promise.all([
    Patient.countDocuments({ is_archived: false }),
    isRange ? Appointment.countDocuments({ created_at: { $gte: range.start, $lte: range.end } }) : Appointment.countDocuments({ scheduled_date: targetDate }),
    isRange ? Appointment.countDocuments({ created_at: { $gte: range.start, $lte: range.end }, status: 'waiting' }) : Appointment.countDocuments({ scheduled_date: targetDate, status: 'waiting' }),
    isRange ? Appointment.countDocuments({ created_at: { $gte: range.start, $lte: range.end }, status: 'in-progress' }) : Appointment.countDocuments({ scheduled_date: targetDate, status: 'in-progress' }),
    isRange ? Appointment.countDocuments({ created_at: { $gte: range.start, $lte: range.end }, status: 'done' }) : Appointment.countDocuments({ scheduled_date: targetDate, status: 'done' }),
    Payment.find({ payment_date: { $gte: range.start, $lte: range.end }, is_reversed: false }).select('amount').lean(),
    Bill.find({ status: { $ne: 'paid' } }).select('balance').lean()
  ])

  const todayRevenue = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const pendingBalance = pendingBills.reduce((sum, b) => sum + (b.balance || 0), 0)

  return {
    totalPatients,
    todayTotal,
    todayWaiting,
    todayInProgress,
    todayDone,
    todayRevenue,
    pendingBalance,
    period,
    targetDate
  }
}

// ═══════════════════════════════════════════════════════════
// REVENUE INSIGHTS (Corporate Cash vs Accrual Recognition)
// ═══════════════════════════════════════════════════════════
async function getRevenueInsights(options = {}) {
  let billMatch = {}
  let txMatch = { cost: { $gt: 0 }, status: { $ne: 'cancelled' } }
  let paymentMatch = { is_reversed: false }

  const { startDate, endDate, period } = options || {}
  let start = null
  let end = null

  if (startDate && endDate) {
    start = new Date(startDate + 'T00:00:00')
    end = new Date(endDate + 'T23:59:59.999')
  } else if (period === 'month') {
    const now = new Date()
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  } else if (period === 'year') {
    const now = new Date()
    start = new Date(now.getFullYear(), 0, 1)
    end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
  } else if (period === '30days') {
    const now = new Date()
    end = new Date()
    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  if (start && end) {
    billMatch = { created_at: { $gte: start, $lte: end } }
    txMatch.created_at = { $gte: start, $lte: end }
    paymentMatch.payment_date = { $gte: start, $lte: end }
  }

  const [
    allBills,
    monthlyBilledData,
    monthlyCollectedData,
    realizedPayments,
    paymentMethodsData,
    topTreatmentsData
  ] = await Promise.all([
    Bill.find(billMatch).select('paid_amount total_amount balance created_at').lean(),
    Bill.aggregate([
      ...(Object.keys(billMatch).length > 0 ? [{ $match: billMatch }] : []),
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
          billed: { $sum: "$total_amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Payment.aggregate([
      ...(Object.keys(paymentMatch).length > 0 ? [{ $match: paymentMatch }] : []),
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$payment_date" } },
          collected: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Payment.find(paymentMatch).select('amount method payment_date').lean(),
    Payment.aggregate([
      ...(Object.keys(paymentMatch).length > 0 ? [{ $match: paymentMatch }] : []),
      {
        $group: {
          _id: "$method",
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]),
    Treatment.aggregate([
      { $match: txMatch },
      {
        $group: {
          _id: "$treatment_type",
          revenue: { $sum: "$cost" },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ])
  ])

  const totalBilled = allBills.reduce((sum, b) => sum + (b.total_amount || 0), 0)
  const totalCollected = realizedPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalRevenue = totalCollected // Realized Cash Collections
  const pendingBalance = allBills.reduce((sum, b) => sum + (b.balance || 0), 0)

  const allMonths = new Set([
    ...monthlyBilledData.map(d => d._id),
    ...monthlyCollectedData.map(d => d._id)
  ].filter(Boolean))

  const sortedMonths = Array.from(allMonths).sort()
  const monthlyTrends = sortedMonths.map(ym => {
    const [year, month] = ym.split('-')
    const date = new Date(year, month - 1, 1)
    const billedItem = monthlyBilledData.find(d => d._id === ym)
    const collectedItem = monthlyCollectedData.find(d => d._id === ym)
    return {
      month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      billed: billedItem ? billedItem.billed : 0,
      revenue: collectedItem ? collectedItem.collected : 0,
      collected: collectedItem ? collectedItem.collected : 0
    }
  })

  const paymentMethods = paymentMethodsData.map(d => ({
    method: d._id || 'other',
    revenue: d.revenue,
    count: d.count
  }))

  const topTreatments = topTreatmentsData.map(d => ({
    treatment: d._id || 'unknown',
    revenue: d.revenue,
    count: d.count
  }))

  const billCount = allBills.length
  const avgBillValue = billCount > 0 ? totalBilled / billCount : 0
  const collectionRate = totalBilled > 0 ? (totalRevenue / totalBilled) * 100 : 0

  // Peak revenue month
  const peakMonth = monthlyTrends.length > 0
    ? monthlyTrends.reduce((max, m) => m.revenue > max.revenue ? m : max, monthlyTrends[0])
    : null

  // Average monthly revenue (over months with data)
  const avgMonthlyRevenue = monthlyTrends.length > 0
    ? monthlyTrends.reduce((sum, m) => sum + m.revenue, 0) / monthlyTrends.length
    : 0

  // Month-over-month growth (last 2 months)
  let monthOverMonthGrowth = null
  if (monthlyTrends.length >= 2) {
    const prev = monthlyTrends[monthlyTrends.length - 2].revenue
    const curr = monthlyTrends[monthlyTrends.length - 1].revenue
    monthOverMonthGrowth = prev > 0 ? ((curr - prev) / prev) * 100 : null
  }

  return {
    totalRevenue,
    totalBilled,
    pendingBalance,
    monthlyTrends,
    paymentMethods,
    topTreatments,
    billCount,
    avgBillValue,
    collectionRate,
    peakMonth,
    avgMonthlyRevenue,
    monthOverMonthGrowth
  }
}

// ═══════════════════════════════════════════════════════════
// PID GENERATION (corrections.md §3.2)
// ═══════════════════════════════════════════════════════════
async function generatePID() {
  const year = new Date().getFullYear()
  const key = `pid_${year}`
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  )
  const seq = String(doc.seq).padStart(4, '0')
  const pid = `PID-${year}-${seq}`
  
  // Validate uniqueness
  const exists = await Patient.findOne({ pid })
  if (exists) {
    return generatePID() // Retry on collision
  }
  return pid
}

// ═══════════════════════════════════════════════════════════
// UNBILLED TREATMENTS (corrections.md §1.3)
// ═══════════════════════════════════════════════════════════
async function getUnbilledTreatments(patientId) {
  if (!isValidObjectId(patientId)) return []
  const txs = await Treatment.find({
    patient_id: patientId,
    status: 'completed',
    bill_id: null,
    deleted_at: null
  })
    .populate('appointment_id', 'scheduled_date')
    .sort({ created_at: -1 })
    .lean()

  // Use shared helper: always recalculates cost from current TreatmentMaster
  const enriched = await applyMasterCost(txs)

  return enriched.map(t => ({
    ...t,
    id: t._id.toString(),
    patient_id: t.patient_id.toString(),
    appointment_id: t.appointment_id ? t.appointment_id._id.toString() : null,
    appointment_date: t.appointment_id ? t.appointment_id.scheduled_date : null,
    tooth_numbers: normalizeToothNumbers(t.tooth_numbers || t.tooth_number)
  }))
}

// ═══════════════════════════════════════════════════════════
// TREATMENT FILTERS (corrections.md §1.4)
// ═══════════════════════════════════════════════════════════
async function getTreatmentsFiltered({ startDate, endDate, patientId, status } = {}) {
  const filter = { deleted_at: null }
  if (patientId && isValidObjectId(patientId)) filter.patient_id = patientId
  if (status) filter.status = status
  if (startDate || endDate) {
    filter.created_at = {}
    if (startDate) filter.created_at.$gte = new Date(startDate + 'T00:00:00.000Z')
    if (endDate) filter.created_at.$lte = new Date(endDate + 'T23:59:59.999Z')
  }

  const txs = await Treatment.find(filter)
    .populate('patient_id', 'name phone')
    .populate('appointment_id', 'scheduled_date')
    .sort({ created_at: -1 })
    .limit(200)
    .lean()

  const enriched = await applyMasterCost(txs)
  return enriched.map(t => ({
    ...t,
    id: t._id.toString(),
    patient_id: t.patient_id ? t.patient_id._id.toString() : null,
    patient_name: t.patient_id ? t.patient_id.name : '',
    patient_phone: t.patient_id ? t.patient_id.phone : '',
    appointment_id: t.appointment_id ? t.appointment_id._id.toString() : null,
    appointment_date: t.appointment_id ? t.appointment_id.scheduled_date : null,
    tooth_numbers: normalizeToothNumbers(t.tooth_numbers || t.tooth_number)
  }))
}

// ═══════════════════════════════════════════════════════════
// EDITABLE BILLS (corrections.md §2.2)
// ═══════════════════════════════════════════════════════════
async function updateBill(id, data) {
  if (!isValidObjectId(id)) return null
  const bill = await Bill.findById(id)
  if (!bill) return null

  // Capture previous values for audit
  const previousValues = {
    total_amount: bill.total_amount,
    discount: bill.discount,
    tax_percent: bill.tax_percent,
    tax_amount: bill.tax_amount,
    notes: bill.notes,
    manual_charges: bill.manual_charges || 0,
    medicine_charges: bill.medicine_charges || 0
  }

  // Apply changes
  if (data.discount !== undefined) bill.discount = toMoney(data.discount, 0, 'Discount')
  if (data.tax_percent !== undefined) bill.tax_percent = toPercent(data.tax_percent)
  if (data.notes !== undefined) bill.notes = normalizeText(data.notes)
  if (data.manual_charges !== undefined) bill.manual_charges = toMoney(data.manual_charges, 0, 'Manual charges')
  if (data.medicine_charges !== undefined) bill.medicine_charges = toMoney(data.medicine_charges, 0, 'Medicine charges')

  // Recalculate totals from linked treatments
  const treatments = await Treatment.find({ bill_id: bill._id, deleted_at: null }).lean()
  const subTotal = treatments.reduce((sum, t) => sum + (t.cost || 0), 0)

  // Formula: Bill Total = Sum(All Treatment Costs) + Manual Charges + Medicine Charges - Discount
  const baseTotal = subTotal + (bill.manual_charges || 0) + (bill.medicine_charges || 0) - (bill.discount || 0)
  const taxAmount = Math.round(baseTotal * (bill.tax_percent / 100) * 100) / 100
  const newTotal = Math.round((baseTotal + taxAmount) * 100) / 100

  bill.total_amount = newTotal
  bill.tax_amount = taxAmount
  bill.balance = Math.max(0, newTotal - bill.paid_amount)
  bill.status = bill.paid_amount >= newTotal ? 'paid' : bill.paid_amount > 0 ? 'partial' : 'pending'

  // Push to edit history
  bill.edit_history.push({
    edited_by: 'admin',
    edited_at: new Date(),
    previous_values,
    change_description: normalizeText(data.change_description) || 'Bill updated'
  })
  bill.last_edited_at = new Date()
  bill.last_edited_by = 'admin'

  await bill.save()

  // Log audit
  await logAudit('edit', 'bill', bill._id, previousValues, {
    total_amount: bill.total_amount,
    discount: bill.discount,
    tax_percent: bill.tax_percent,
    manual_charges: bill.manual_charges,
    medicine_charges: bill.medicine_charges
  }, `Bill edited: ${data.change_description || 'Updated'}`)

  // Update patient outstanding
  const bills = await Bill.find({ patient_id: bill.patient_id, status: { $ne: 'paid' } })
  const totalOutstanding = bills.reduce((sum, b) => sum + (b.balance || 0), 0)
  await Patient.findByIdAndUpdate(bill.patient_id, { $set: { total_outstanding_balance: totalOutstanding } })

  return getBillById(id)
}

async function getBillEditHistory(id) {
  if (!isValidObjectId(id)) return []
  const bill = await Bill.findById(id).select('edit_history').lean()
  if (!bill) return []
  return bill.edit_history || []
}

// ═══════════════════════════════════════════════════════════
// WALK-IN APPOINTMENT (corrections.md §3.1)
// ═══════════════════════════════════════════════════════════
async function addWalkInAppointment(data) {
  const name = normalizeText(data.name)
  if (!name) badRequest('Patient name is required')
  const phone = normalizeText(data.phone)
  if (!phone) badRequest('Phone number is required')

  // Find existing patient by both phone and name (so parent and child don't overwrite each other)
  let patient = await Patient.findOne({
    phone: { $regex: `^${phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
  })

  if (!patient) {
    // Create new patient inline with PID
    const pid = await generatePID()
    patient = new Patient({
      name,
      phone,
      age: normalizeAge(data.age),
      gender: normalizeGender(data.gender),
      complaint: normalizeText(data.reason),
      registration_source: 'walk-in',
      pid
    })
    await patient.save()
  }

  const date = clinicDateString()
  const queueNumber = await getNextQueueNumber(date)

  const appt = new Appointment({
    patient_id: patient._id,
    scheduled_date: date,
    scheduled_time: '',
    reason: normalizeText(data.reason),
    status: 'waiting',
    call_status: 'not_required',
    queue_number: queueNumber,
    notes: normalizeText(data.notes) || 'Walk-in appointment',
    appointment_type: 'walk-in',
    is_urgent: data.is_urgent === true || data.is_urgent === 'true',
    is_walk_in: true,
    is_time_confirmed: false
  })
  await appt.save()

  const apptDoc = appt.toObject()
  apptDoc.id = apptDoc._id.toString()

  const patientDoc = patient.toObject()
  patientDoc.id = patientDoc._id.toString()

  return { patient: patientDoc, appointment: apptDoc }
}

// ═══════════════════════════════════════════════════════════
// CONSULTANT PAYMENT TRACKING (corrections.md §2.3)
// ═══════════════════════════════════════════════════════════
async function addConsultantPayment(data) {
  const consultantName = normalizeText(data.consultant_name)
  if (!consultantName) badRequest('Consultant name is required')
  if (!isValidObjectId(data.patient_id)) badRequest('Valid patient is required')

  const treatmentCost = toMoney(data.treatment_cost, 0, 'Treatment cost')
  const consultantShare = toMoney(data.consultant_share, 0, 'Consultant share')
  const amountPaid = toMoney(data.amount_paid, 0, 'Amount paid')
  
  if (amountPaid > consultantShare) badRequest('Amount paid cannot exceed consultant share')

  const balanceDue = Math.max(0, consultantShare - amountPaid)
  const status = amountPaid >= consultantShare ? 'paid' : amountPaid > 0 ? 'partial' : 'pending'

  const payment = new ConsultantPayment({
    consultant_name: consultantName,
    patient_id: data.patient_id,
    treatment_id: isValidObjectId(data.treatment_id) ? data.treatment_id : null,
    bill_id: isValidObjectId(data.bill_id) ? data.bill_id : null,
    treatment_type: normalizeText(data.treatment_type),
    treatment_cost: treatmentCost,
    consultant_share: consultantShare,
    amount_paid: amountPaid,
    balance_due: balanceDue,
    payment_date: amountPaid > 0 ? new Date() : null,
    payment_method: amountPaid > 0 ? normalizePaymentMethod(data.payment_method) : null,
    notes: normalizeText(data.notes),
    status
  })
  await payment.save()

  const doc = payment.toObject()
  doc.id = doc._id.toString()
  return doc
}

async function updateConsultantPayment(id, data) {
  if (!isValidObjectId(id)) return null
  const payment = await ConsultantPayment.findById(id)
  if (!payment) return null

  if (data.consultant_share !== undefined) payment.consultant_share = toMoney(data.consultant_share, payment.consultant_share)
  if (data.amount_paid !== undefined) payment.amount_paid = toMoney(data.amount_paid, payment.amount_paid)
  if (data.treatment_cost !== undefined) payment.treatment_cost = toMoney(data.treatment_cost, payment.treatment_cost)
  if (data.treatment_type !== undefined) payment.treatment_type = normalizeText(data.treatment_type)
  if (data.notes !== undefined) payment.notes = normalizeText(data.notes)
  if (data.payment_method !== undefined) payment.payment_method = normalizePaymentMethod(data.payment_method)
  if (data.consultant_name !== undefined) payment.consultant_name = normalizeText(data.consultant_name)

  payment.balance_due = Math.max(0, payment.consultant_share - payment.amount_paid)
  payment.status = payment.amount_paid >= payment.consultant_share ? 'paid' : payment.amount_paid > 0 ? 'partial' : 'pending'
  if (payment.amount_paid > 0 && !payment.payment_date) payment.payment_date = new Date()

  await payment.save()

  const doc = payment.toObject()
  doc.id = doc._id.toString()
  return doc
}

async function deleteConsultantPayment(id) {
  if (!isValidObjectId(id)) return { success: false }
  await ConsultantPayment.findByIdAndDelete(id)
  return { success: true }
}

async function getConsultantPayments({ consultant, status, startDate, endDate, page = 1, limit = 50 } = {}) {
  const filter = {}
  if (consultant) filter.consultant_name = { $regex: consultant, $options: 'i' }
  if (status) filter.status = status
  if (startDate || endDate) {
    filter.created_at = {}
    if (startDate) filter.created_at.$gte = new Date(startDate + 'T00:00:00.000Z')
    if (endDate) filter.created_at.$lte = new Date(endDate + 'T23:59:59.999Z')
  }

  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    ConsultantPayment.find(filter)
      .populate('patient_id', 'name phone')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ConsultantPayment.countDocuments(filter)
  ])

  return {
    items: items.map(p => ({
      ...p,
      id: p._id.toString(),
      patient_id: p.patient_id ? p.patient_id._id.toString() : null,
      patient_name: p.patient_id ? p.patient_id.name : '',
      patient_phone: p.patient_id ? p.patient_id.phone : ''
    })),
    total,
    page,
    limit,
    hasMore: skip + items.length < total
  }
}

async function getConsultantMonthlyReport(month, year) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  const payments = await ConsultantPayment.find({
    created_at: { $gte: startDate, $lte: endDate }
  })
    .populate('patient_id', 'name')
    .sort({ consultant_name: 1, created_at: -1 })
    .lean()

  // Group by consultant
  const grouped = {}
  for (const p of payments) {
    if (!grouped[p.consultant_name]) {
      grouped[p.consultant_name] = {
        consultant: p.consultant_name,
        total_share: 0,
        total_paid: 0,
        total_due: 0,
        count: 0,
        payments: []
      }
    }
    const g = grouped[p.consultant_name]
    g.total_share += p.consultant_share || 0
    g.total_paid += p.amount_paid || 0
    g.total_due += p.balance_due || 0
    g.count++
    g.payments.push({
      ...p,
      id: p._id.toString(),
      patient_name: p.patient_id ? p.patient_id.name : ''
    })
  }

  return Object.values(grouped)
}

async function getConsultantOutstandingDues() {
  const payments = await ConsultantPayment.find({
    status: { $in: ['pending', 'partial'] }
  })
    .populate('patient_id', 'name phone')
    .sort({ consultant_name: 1, created_at: -1 })
    .lean()

  // Group by consultant
  const grouped = {}
  for (const p of payments) {
    if (!grouped[p.consultant_name]) {
      grouped[p.consultant_name] = {
        consultant: p.consultant_name,
        total_due: 0,
        count: 0,
        items: []
      }
    }
    const g = grouped[p.consultant_name]
    g.total_due += p.balance_due || 0
    g.count++
    g.items.push({
      ...p,
      id: p._id.toString(),
      patient_name: p.patient_id ? p.patient_id.name : '',
      patient_phone: p.patient_id ? p.patient_id.phone : ''
    })
  }

  return Object.values(grouped)
}

async function recordConsultantPaymentAmount(id, amount, method = 'cash', paymentDate = null) {
  if (!isValidObjectId(id)) return null
  const payment = await ConsultantPayment.findById(id)
  if (!payment) return null

  const paymentAmount = toMoney(amount)
  if (paymentAmount <= 0) badRequest('Payment amount must be greater than zero')
  if (paymentAmount > payment.balance_due) badRequest('Payment amount cannot exceed balance due')

  payment.amount_paid = Math.round((payment.amount_paid + paymentAmount) * 100) / 100
  payment.balance_due = Math.max(0, payment.consultant_share - payment.amount_paid)
  payment.status = payment.amount_paid >= payment.consultant_share ? 'paid' : 'partial'
  
  let payDate = new Date()
  if (paymentDate) {
    const parsed = new Date(paymentDate)
    if (!isNaN(parsed.getTime())) payDate = parsed
  }
  payment.payment_date = payDate
  payment.payment_method = normalizePaymentMethod(method)

  await payment.save()

  const doc = payment.toObject()
  doc.id = doc._id.toString()
  return doc
}

// ═══════════════════════════════════════════════════════════
// TREATMENT MASTER (corrections.md §4.1)
// ═══════════════════════════════════════════════════════════
async function getAllTreatmentMasters(includeInactive = false) {
  const filter = includeInactive ? {} : { is_active: true }
  const items = await TreatmentMaster.find(filter).sort({ category: 1, treatment_name: 1 }).lean()
  return items.map(t => ({ ...t, id: t._id.toString() }))
}

async function addTreatmentMaster(data) {
  const treatmentName = normalizeText(data.treatment_name)
  if (!treatmentName) badRequest('Treatment name is required')

  // Check duplicate
  const existing = await TreatmentMaster.findOne({
    treatment_name: { $regex: `^${treatmentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
  })
  if (existing) badRequest(`Treatment "${treatmentName}" already exists`)

  const validCategories = ['general', 'endodontics', 'orthodontics', 'prosthodontics', 'periodontics', 'surgery', 'cosmetic', 'other']
  const category = validCategories.includes(data.category) ? data.category : 'general'

  const item = new TreatmentMaster({
    treatment_name: treatmentName,
    category,
    standard_cost: toMoney(data.standard_cost, 0, 'Standard cost'),
    is_active: data.is_active !== false
  })
  await item.save()
  const doc = item.toObject()
  doc.id = doc._id.toString()
  return doc
}

async function updateTreatmentMaster(id, data) {
  if (!isValidObjectId(id)) return null
  const item = await TreatmentMaster.findById(id)
  if (!item) return null

  if (data.treatment_name !== undefined) {
    const name = normalizeText(data.treatment_name)
    if (!name) badRequest('Treatment name is required')
    // Check duplicate (exclude self)
    const existing = await TreatmentMaster.findOne({
      _id: { $ne: id },
      treatment_name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
    })
    if (existing) badRequest(`Treatment "${name}" already exists`)
    item.treatment_name = name
  }

  const validCategories = ['general', 'endodontics', 'orthodontics', 'prosthodontics', 'periodontics', 'surgery', 'cosmetic', 'other']
  if (data.category !== undefined && validCategories.includes(data.category)) item.category = data.category
  if (data.standard_cost !== undefined) item.standard_cost = toMoney(data.standard_cost, item.standard_cost, 'Standard cost')
  if (data.is_active !== undefined) item.is_active = data.is_active === true || data.is_active === 'true'

  await item.save()
  const doc = item.toObject()
  doc.id = doc._id.toString()
  return doc
}

async function deleteTreatmentMaster(id) {
  if (!isValidObjectId(id)) return { success: false }
  // Soft delete by marking inactive
  await TreatmentMaster.findByIdAndUpdate(id, { $set: { is_active: false } })
  return { success: true }
}

async function searchTreatmentMasters(query) {
  const q = normalizeText(query)
  if (!q) return getAllTreatmentMasters()
  const items = await TreatmentMaster.find({
    is_active: true,
    treatment_name: { $regex: q, $options: 'i' }
  }).sort({ treatment_name: 1 }).lean()
  return items.map(t => ({ ...t, id: t._id.toString() }))
}

// MEDICINE MASTER
// ═══════════════════════════════════════════════════════════
async function getAllMedicineMasters(includeInactive = false) {
  const filter = includeInactive ? {} : { is_active: true }
  const items = await MedicineMaster.find(filter).sort({ type: 1, item_name: 1 }).lean()
  return items.map(t => ({ ...t, id: t._id.toString() }))
}

async function addMedicineMaster(data) {
  const itemName = normalizeText(data.item_name)
  if (!itemName) badRequest('Item name is required')

  const existing = await MedicineMaster.findOne({
    item_name: { $regex: `^${itemName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
  })
  if (existing) badRequest(`Medicine/Product "${itemName}" already exists`)

  const type = data.type === 'product' ? 'product' : 'medicine'

  const item = new MedicineMaster({
    item_name: itemName,
    type,
    standard_cost: toMoney(data.standard_cost, 0, 'Standard cost'),
    is_active: data.is_active !== false
  })
  await item.save()
  const doc = item.toObject()
  doc.id = doc._id.toString()
  return doc
}

async function updateMedicineMaster(id, data) {
  if (!isValidObjectId(id)) return null
  const item = await MedicineMaster.findById(id)
  if (!item) return null

  if (data.item_name !== undefined) {
    const name = normalizeText(data.item_name)
    if (!name) badRequest('Item name is required')
    const existing = await MedicineMaster.findOne({
      _id: { $ne: id },
      item_name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
    })
    if (existing) badRequest(`Item "${name}" already exists`)
    item.item_name = name
  }

  if (data.type !== undefined) item.type = data.type === 'product' ? 'product' : 'medicine'
  if (data.standard_cost !== undefined) item.standard_cost = toMoney(data.standard_cost, item.standard_cost, 'Standard cost')
  if (data.is_active !== undefined) item.is_active = data.is_active === true || data.is_active === 'true'

  await item.save()
  const doc = item.toObject()
  doc.id = doc._id.toString()
  return doc
}

async function deleteMedicineMaster(id) {
  if (!isValidObjectId(id)) return { success: false }
  await MedicineMaster.findByIdAndUpdate(id, { $set: { is_active: false } })
  return { success: true }
}

async function searchMedicineMasters(query) {
  const q = normalizeText(query)
  if (!q) return getAllMedicineMasters()
  const items = await MedicineMaster.find({
    is_active: true,
    item_name: { $regex: q, $options: 'i' }
  }).sort({ item_name: 1 }).lean()
  return items.map(t => ({ ...t, id: t._id.toString() }))
}

// ═══════════════════════════════════════════════════════════
// PATIENT ADVANCE LEDGER (Patient Wallet / Escrow)
// ═══════════════════════════════════════════════════════════
async function addPatientAdvanceDeposit(patientId, data) {
  if (!isValidObjectId(patientId)) badRequest('Valid patient is required')
  const amount = toMoney(data.amount, 0, 'Advance deposit amount')
  if (amount <= 0) badRequest('Deposit amount must be greater than zero')

  const patient = await Patient.findById(patientId)
  if (!patient) badRequest('Patient not found')

  const receiptNumber = await getNextReceiptNumber()
  const paymentMethod = normalizePaymentMethod(data.payment_method, 'cash')
  const newBalance = Math.round(((patient.advance_balance || 0) + amount) * 100) / 100

  patient.advance_balance = newBalance
  await patient.save()

  const entry = new AdvanceLedger({
    patient_id: patientId,
    receipt_number: receiptNumber,
    type: 'deposit',
    amount,
    payment_method: paymentMethod,
    reference_id: data.reference_id || '',
    notes: data.notes || 'Advance deposit',
    balance_after: newBalance
  })
  await entry.save()

  await logAudit('deposit', 'advance', patientId, {}, { amount, newBalance }, `Advance deposit of ₹${amount} received via ${paymentMethod} (Receipt: ${receiptNumber})`)

  return {
    success: true,
    advance_balance: newBalance,
    entry: entry.toObject()
  }
}

async function getPatientAdvanceHistory(patientId) {
  if (!isValidObjectId(patientId)) return { balance: 0, items: [] }
  const [patient, items] = await Promise.all([
    Patient.findById(patientId).select('advance_balance').lean(),
    AdvanceLedger.find({ patient_id: patientId }).sort({ created_at: -1 }).lean()
  ])
  return {
    balance: patient?.advance_balance || 0,
    items: items.map(i => ({ ...i, id: i._id.toString() }))
  }
}

// ═══════════════════════════════════════════════════════════
// DENTAL LAB WORK ORDERS (Prosthetics / Slips)
// ═══════════════════════════════════════════════════════════
async function createLabWorkOrder(data) {
  if (!isValidObjectId(data.patient_id)) badRequest('Valid patient is required')
  const labName = normalizeText(data.lab_name)
  if (!labName) badRequest('Lab name is required')
  const workType = normalizeText(data.work_type)
  if (!workType) badRequest('Work type (e.g. Zirconia Crown, PFM) is required')

  const workOrderNumber = await getNextLabOrderNumber()
  const toothNumbers = normalizeToothNumbers(data.tooth_numbers || data.tooth_number)

  const order = new LabWorkOrder({
    work_order_number: workOrderNumber,
    patient_id: data.patient_id,
    treatment_id: isValidObjectId(data.treatment_id) ? data.treatment_id : null,
    lab_name: labName,
    work_type: workType,
    tooth_numbers: toothNumbers,
    shade: normalizeText(data.shade),
    impression_type: data.impression_type || 'physical_impression',
    sent_date: data.sent_date ? new Date(data.sent_date) : new Date(),
    expected_date: data.expected_date ? new Date(data.expected_date) : null,
    status: data.status || 'sent',
    lab_cost: toMoney(data.lab_cost, 0, 'Lab cost'),
    doctor_notes: normalizeText(data.doctor_notes),
    is_remake: Boolean(data.is_remake),
    remake_reason: normalizeText(data.remake_reason)
  })
  await order.save()

  await logAudit('create', 'lab_order', order._id, {}, { work_order_number: workOrderNumber, labName }, `Created Lab Order ${workOrderNumber} for ${workType}`)

  const doc = order.toObject()
  doc.id = doc._id.toString()
  return doc
}

async function updateLabWorkOrder(id, data) {
  if (!isValidObjectId(id)) return null
  const order = await LabWorkOrder.findById(id)
  if (!order) return null

  if (data.status !== undefined) {
    order.status = data.status
    if (data.status === 'received' && !order.received_date) order.received_date = new Date()
    if (data.status === 'fitted' && !order.fitted_date) order.fitted_date = new Date()
  }
  if (data.lab_name !== undefined) order.lab_name = normalizeText(data.lab_name)
  if (data.work_type !== undefined) order.work_type = normalizeText(data.work_type)
  if (data.shade !== undefined) order.shade = normalizeText(data.shade)
  if (data.impression_type !== undefined) order.impression_type = data.impression_type
  if (data.sent_date !== undefined) order.sent_date = new Date(data.sent_date)
  if (data.expected_date !== undefined) order.expected_date = data.expected_date ? new Date(data.expected_date) : null
  if (data.received_date !== undefined) order.received_date = data.received_date ? new Date(data.received_date) : null
  if (data.fitted_date !== undefined) order.fitted_date = data.fitted_date ? new Date(data.fitted_date) : null
  if (data.lab_cost !== undefined) order.lab_cost = toMoney(data.lab_cost, order.lab_cost)
  if (data.doctor_notes !== undefined) order.doctor_notes = normalizeText(data.doctor_notes)
  if (data.is_remake !== undefined) order.is_remake = Boolean(data.is_remake)
  if (data.remake_reason !== undefined) order.remake_reason = normalizeText(data.remake_reason)
  if (data.tooth_numbers !== undefined) order.tooth_numbers = normalizeToothNumbers(data.tooth_numbers)

  await order.save()

  const doc = order.toObject()
  doc.id = doc._id.toString()
  return doc
}

async function getAllLabWorkOrders({ status, labName, patientId, page = 1, limit = 50 } = {}) {
  const filter = {}
  if (status) filter.status = status
  if (labName) filter.lab_name = { $regex: labName, $options: 'i' }
  if (patientId && isValidObjectId(patientId)) filter.patient_id = patientId

  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    LabWorkOrder.find(filter)
      .populate('patient_id', 'name phone pid')
      .sort({ sent_date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    LabWorkOrder.countDocuments(filter)
  ])

  return {
    items: items.map(o => ({
      ...o,
      id: o._id.toString(),
      patient_name: o.patient_id?.name || '',
      patient_phone: o.patient_id?.phone || '',
      patient_pid: o.patient_id?.pid || '',
      patient_id: o.patient_id ? o.patient_id._id.toString() : null
    })),
    total,
    page,
    limit,
    hasMore: skip + items.length < total
  }
}

async function getLabWorkOrderById(id) {
  if (!isValidObjectId(id)) return null
  const order = await LabWorkOrder.findById(id).populate('patient_id', 'name phone pid').lean()
  if (!order) return null
  return {
    ...order,
    id: order._id.toString(),
    patient_name: order.patient_id?.name || '',
    patient_phone: order.patient_id?.phone || '',
    patient_pid: order.patient_id?.pid || '',
    patient_id: order.patient_id ? order.patient_id._id.toString() : null
  }
}

async function deleteLabWorkOrder(id) {
  if (!isValidObjectId(id)) return { success: false }
  await LabWorkOrder.findByIdAndDelete(id)
  return { success: true }
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
  getUnbilledTreatments, getTreatmentsFiltered,
  recordDiagnosis, getDiagnosisByAppointment, getDiagnosisByPatient, updateDiagnosis,
  createFollowUp, getPatientFollowUps, getPendingFollowUps, completeFollowUp,
  getBillsByPatient, getBillById, createBill, updateBillPayment, updateBill, getBillEditHistory, deleteBill,
  getPaymentsByBill, reversePayment, adjustPayment, getAllBills, searchBills,
  addWalkInAppointment,
  generatePatientId,
  addConsultantPayment, updateConsultantPayment, deleteConsultantPayment,
  getConsultantPayments, getConsultantMonthlyReport, getConsultantOutstandingDues, recordConsultantPaymentAmount,
  getAllTreatmentMasters, addTreatmentMaster, updateTreatmentMaster, deleteTreatmentMaster, searchTreatmentMasters,
  getAllMedicineMasters, addMedicineMaster, updateMedicineMaster, deleteMedicineMaster, searchMedicineMasters,
  getSettings, setSetting, setSettingsBulk,
  getDashboardStats, getRevenueInsights,
  logAudit,
  getAllEnquiries, searchEnquiries, addEnquiry, updateEnquiryStatus, deleteEnquiry, convertEnquiryToPatient,
  getNextReceiptNumber, getNextCreditNoteNumber, getNextLabOrderNumber,
  addPatientAdvanceDeposit, getPatientAdvanceHistory,
  createLabWorkOrder, updateLabWorkOrder, getAllLabWorkOrders, getLabWorkOrderById, deleteLabWorkOrder
}
