const mongoose = require('mongoose')
const { Patient, Appointment, Treatment, Bill, Setting, BlockedSlot, getDbPath } = require('./db')

let db = null

function init(database) {
  db = database
}

// Helper: Ensure valid ObjectId before querying
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id)
}

// ═══════════════════════════════════════════════════════════
// PATIENTS
// ═══════════════════════════════════════════════════════════
async function getAllPatients() {
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
    { $sort: { updated_at: -1 } }
  ])

  // Convert mongoose _id to virtual id for compatibility with the React app
  return result.map(p => ({ ...p, id: p._id.toString() }))
}

async function searchPatients(query) {
  const matchFilter = query.trim() ? {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { phone: { $regex: query, $options: 'i' } }
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

async function addPatient(data) {
  const patient = new Patient({
    name: data.name || '',
    phone: data.phone || '',
    age: data.age || null,
    gender: data.gender || null,
    address: data.address || '',
    complaint: data.complaint || '',
    notes: data.notes || '',
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
  const patient = await Patient.findByIdAndUpdate(id, {
    $set: {
      name: data.name,
      phone: data.phone,
      age: data.age || null,
      gender: data.gender,
      address: data.address,
      complaint: data.complaint,
      notes: data.notes
    }
  }, { new: true }).lean()

  if (patient) patient.id = patient._id.toString()
  return patient
}

// ═══════════════════════════════════════════════════════════
// APPOINTMENTS
// ═══════════════════════════════════════════════════════════
async function getTodayAppointments() {
  const today = new Date().toISOString().split('T')[0]
  return getAppointmentsByDate(today)
}

async function getAppointmentsByDate(date) {
  const appts = await Appointment.find({ scheduled_date: date })
    .populate('patient_id')
    .lean()

  const mapped = appts.map(a => ({
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
    queue_number: a.queue_number || 1,
    notes: a.notes || '',
    created_at: a.created_at
  }))

  const statusOrder = { 'in-progress': 0, 'waiting': 1, 'done': 2, 'cancelled': 3 }
  mapped.sort((x, y) => {
    const ox = statusOrder[x.status] ?? 4
    const oy = statusOrder[y.status] ?? 4
    if (ox !== oy) return ox - oy
    return (x.queue_number || 0) - (y.queue_number || 0)
  })

  return mapped
}

async function getPatientAppointments(patientId) {
  if (!isValidObjectId(patientId)) return []
  const appts = await Appointment.find({ patient_id: patientId }).lean()

  const result = []
  for (const a of appts) {
    const txs = await Treatment.find({ appointment_id: a._id }).select('cost').lean()
    const count = txs.length
    const total = txs.reduce((sum, t) => sum + (t.cost || 0), 0)

    result.push({
      ...a,
      id: a._id.toString(),
      patient_id: a.patient_id.toString(),
      call_status: a.call_status || 'not_required',
      treatment_count: count,
      treatment_total: total
    })
  }

  // Sort by date desc
  result.sort((x, y) => y.scheduled_date.localeCompare(x.scheduled_date))
  return result
}

async function addAppointment(data) {
  const date = data.scheduled_date
  // Get max queue number
  const maxRow = await Appointment.findOne({ scheduled_date: date })
    .sort({ queue_number: -1 })
    .select('queue_number')
    .lean()

  const queueNumber = (maxRow?.queue_number || 0) + 1

  const appt = new Appointment({
    patient_id: data.patient_id,
    scheduled_date: date,
    scheduled_time: data.scheduled_time || '',
    reason: data.reason || '',
    status: 'waiting',
    call_status: data.call_status || 'not_required',
    queue_number: queueNumber,
    notes: data.notes || ''
  })
  await appt.save()

  const doc = appt.toObject()
  doc.id = doc._id.toString()
  return doc
}

async function updateAppointment(id, data) {
  if (!isValidObjectId(id)) return null
  const appt = await Appointment.findByIdAndUpdate(id, {
    $set: {
      scheduled_date: data.scheduled_date,
      scheduled_time: data.scheduled_time,
      reason: data.reason,
      notes: data.notes
    }
  }, { new: true }).lean()

  if (appt) appt.id = appt._id.toString()
  return appt
}

async function updateAppointmentStatus(id, status) {
  if (!isValidObjectId(id)) return null
  await Appointment.findByIdAndUpdate(id, { $set: { status } })
  return { id, status }
}

async function deleteAppointment(id) {
  if (!isValidObjectId(id)) return { success: false }
  await Appointment.findByIdAndDelete(id)
  return { success: true }
}

async function updateAppointmentCallStatus(id, call_status) {
  if (!isValidObjectId(id)) return null
  await Appointment.findByIdAndUpdate(id, { $set: { call_status } })
  return { id, call_status }
}

async function getPendingCalls() {
  const appts = await Appointment.find({ call_status: 'pending' })
    .populate('patient_id')
    .sort({ scheduled_date: 1, created_at: 1 })
    .lean()

  return appts.map(a => ({
    id: a._id.toString(),
    patient_id: a.patient_id ? a.patient_id._id.toString() : null,
    patient_name: a.patient_id ? a.patient_id.name : '',
    patient_phone: a.patient_id ? a.patient_id.phone : '',
    patient_age: a.patient_id ? a.patient_id.age : null,
    scheduled_date: a.scheduled_date,
    scheduled_time: a.scheduled_time || '',
    reason: a.reason || '',
    status: a.status || 'waiting',
    call_status: a.call_status,
    notes: a.notes || '',
    created_at: a.created_at
  }))
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
    appointment_id: t.appointment_id ? t.appointment_id.toString() : null
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
  const tx = new Treatment({
    patient_id: data.patient_id,
    appointment_id: data.appointment_id || null,
    treatment_type: data.treatment_type || '',
    tooth_number: data.tooth_number || '',
    description: data.description || '',
    cost: data.cost || 0,
    doctor_notes: data.doctor_notes || ''
  })
  await tx.save()
  const doc = tx.toObject()
  doc.id = doc._id.toString()
  return doc
}

async function updateTreatment(id, data) {
  if (!isValidObjectId(id)) return null
  const tx = await Treatment.findByIdAndUpdate(id, {
    $set: {
      treatment_type: data.treatment_type,
      tooth_number: data.tooth_number,
      description: data.description,
      cost: data.cost || 0,
      doctor_notes: data.doctor_notes
    }
  }, { new: true }).lean()

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
  const paid = data.paid_amount || 0
  const total = data.total_amount || 0
  const balance = total - paid
  const status = paid >= total ? 'paid' : paid > 0 ? 'partial' : 'pending'

  const bill = new Bill({
    patient_id: data.patient_id,
    appointment_id: data.appointment_id || null,
    total_amount: total,
    paid_amount: paid,
    balance: balance,
    payment_method: data.payment_method || 'cash',
    status: status,
    notes: data.notes || ''
  })
  await bill.save()

  // Save nested treatments if provided
  if (data.treatments && Array.isArray(data.treatments)) {
    for (const t of data.treatments) {
      const tx = new Treatment({
        patient_id: data.patient_id,
        appointment_id: data.appointment_id || null,
        treatment_type: t.treatment_type,
        tooth_number: t.tooth_number || '',
        description: t.description || '',
        cost: t.cost || 0,
        doctor_notes: t.doctor_notes || ''
      })
      await tx.save()
    }
  }

  return getBillById(bill._id.toString())
}

async function updateBillPayment(id, data) {
  if (!isValidObjectId(id)) return null
  const bill = await Bill.findById(id)
  if (!bill) return null

  const newPaid = (bill.paid_amount || 0) + (data.amount || 0)
  const newBalance = bill.total_amount - newPaid
  const newStatus = newPaid >= bill.total_amount ? 'paid' : newPaid > 0 ? 'partial' : 'pending'

  bill.paid_amount = newPaid
  bill.balance = newBalance
  bill.status = newStatus
  if (data.payment_method) {
    bill.payment_method = data.payment_method
  }
  await bill.save()
  return getBillById(id)
}

async function getAllBills() {
  const bills = await Bill.find()
    .populate('patient_id')
    .sort({ created_at: -1 })
    .limit(200)
    .lean()

  return bills.map(b => ({
    ...b,
    id: b._id.toString(),
    patient_id: b.patient_id ? b.patient_id._id.toString() : null,
    patient_name: b.patient_id ? b.patient_id.name : ''
  }))
}

// ═══════════════════════════════════════════════════════════
// QUEUE
// ═══════════════════════════════════════════════════════════
async function getTodayQueue() {
  const today = new Date().toISOString().split('T')[0]
  const appts = await Appointment.find({ scheduled_date: today, status: { $ne: 'cancelled' } })
    .populate('patient_id')
    .lean()

  const mapped = appts.map(a => ({
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
    queue_number: a.queue_number || 1,
    notes: a.notes || '',
    created_at: a.created_at
  }))

  const statusOrder = { 'in-progress': 0, 'waiting': 1, 'done': 2 }
  mapped.sort((x, y) => {
    const ox = statusOrder[x.status] ?? 3
    const oy = statusOrder[y.status] ?? 3
    if (ox !== oy) return ox - oy
    return (x.queue_number || 0) - (y.queue_number || 0)
  })

  return mapped
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
  const today = new Date().toISOString().split('T')[0]

  const totalPatients = await Patient.countDocuments()
  const todayTotal = await Appointment.countDocuments({ scheduled_date: today })
  const todayWaiting = await Appointment.countDocuments({ scheduled_date: today, status: 'waiting' })
  const todayInProgress = await Appointment.countDocuments({ scheduled_date: today, status: 'in-progress' })
  const todayDone = await Appointment.countDocuments({ scheduled_date: today, status: 'done' })

  // Revenue for today
  const startOfDay = new Date(today + 'T00:00:00.000Z')
  const endOfDay = new Date(today + 'T23:59:59.999Z')
  const billsToday = await Bill.find({ created_at: { $gte: startOfDay, $lte: endOfDay } })
    .select('paid_amount')
    .lean()
  const todayRevenue = billsToday.reduce((sum, b) => sum + (b.paid_amount || 0), 0)

  // Pending balance
  const pendingBills = await Bill.find({ status: { $ne: 'paid' } })
    .select('balance')
    .lean()
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
  getTreatmentsByAppointment, getTreatmentsByPatient, addTreatment, updateTreatment, deleteTreatment,
  getBillsByPatient, getBillById, createBill, updateBillPayment, getAllBills,
  getTodayQueue,
  getSettings, setSetting,
  getDashboardStats,
}
