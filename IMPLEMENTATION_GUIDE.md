# IMPLEMENTATION GUIDE - Quick Fixes & Code Changes

## Phase 1 Priority Fixes (Implement First)

---

## FIX #1: Duplicate Patient Prevention

### File: `server/db.js`

```javascript
// MODIFY patientSchema
const patientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { 
    type: String, 
    default: '', 
    index: true,
    trim: true,
    lowercase: true
  },
  email: { 
    type: String, 
    default: '', 
    index: true,
    trim: true,
    lowercase: true
  },
  // ... rest of fields
}, schemaOptions)

// ADD: Unique constraints
patientSchema.index({ phone: 1 }, { 
  unique: true, 
  sparse: true,
  collation: { locale: 'en', strength: 2 }
})

patientSchema.index({ email: 1 }, { 
  unique: true, 
  sparse: true,
  collation: { locale: 'en', strength: 2 }
})
```

### File: `server/queries.js`

```javascript
async function addPatient(data) {
  const name = normalizeText(data.name)
  if (!name) badRequest('Patient name is required')

  const phone = normalizeText(data.phone)
  const email = normalizeEmail(data.email)

  // FIX #1: Check for duplicates
  if (phone) {
    const existingPhone = await Patient.findOne({ phone: { $regex: `^${phone}$`, $options: 'i' } })
    if (existingPhone) {
      badRequest(`Patient with phone ${phone} already exists (ID: ${existingPhone._id})`)
    }
  }

  if (email) {
    const existingEmail = await Patient.findOne({ email: { $regex: `^${email}$`, $options: 'i' } })
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
```

---

## FIX #2: Treatment Status Tracking

### File: `server/db.js`

```javascript
// MODIFY treatmentSchema
const treatmentSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  bill_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', default: null, index: true },
  treatment_type: { type: String, required: true },
  tooth_number: { type: String, default: '' },
  description: { type: String, default: '' },
  cost: { type: Number, default: 0, min: 0 },
  doctor_notes: { type: String, default: '' },
  
  // FIX #2: Add treatment status
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'cancelled', 'on-hold'],
    default: 'planned'
  },
  
  // Multi-session support
  sessions_planned: { type: Number, default: 1, min: 1 },
  sessions_completed: { type: Number, default: 0, min: 0 },
  
  // Completion tracking
  completed_at: { type: Date, default: null },
  completed_by: { type: String, default: null },
  
  // Cancellation
  cancellation_reason: { type: String, default: '' },
  
  // Deletion (soft delete)
  deleted_at: { type: Date, default: null }
  
}, {
  ...schemaOptions,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

// Add validation
treatmentSchema.pre('validate', function(next) {
  if (this.bill_id && this.status !== 'completed') {
    return next(new Error('Cannot bill incomplete treatment'))
  }
  if (this.sessions_completed > this.sessions_planned) {
    return next(new Error('Sessions completed exceeds planned'))
  }
  next()
})
```

### File: `server/queries.js`

```javascript
// NEW: Update treatment status
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
  
  const updated = await Treatment.findByIdAndUpdate(id, { $set: updates }, { new: true })
  
  updated.id = updated._id.toString()
  return updated
}

// MODIFY: deleteTreatment - Prevent deletion if billed
async function deleteTreatment(id) {
  if (!isValidObjectId(id)) return { success: false }
  
  const tx = await Treatment.findById(id)
  if (!tx) return { success: false }
  
  // FIX #2: Prevent deletion of billed treatments
  if (tx.bill_id) {
    badRequest(`Cannot delete billed treatment. Linked to bill: ${tx.bill_id}`)
  }
  
  if (tx.status === 'completed') {
    badRequest('Cannot delete completed treatments. Archive instead.')
  }
  
  // Soft delete instead
  return Treatment.findByIdAndUpdate(
    id,
    {
      $set: {
        status: 'cancelled',
        cancellation_reason: 'Removed from system',
        deleted_at: new Date()
      }
    },
    { new: true }
  )
}

// MODIFY: updateTreatment - Lock cost after billing
async function updateTreatment(id, data) {
  if (!isValidObjectId(id)) return null
  
  const treatmentType = normalizeText(data.treatment_type)
  if (!treatmentType) badRequest('Treatment type is required')

  const tx = await Treatment.findById(id)
  if (!tx) return null
  
  // FIX #2: Prevent cost modification after billing
  if (tx.bill_id && data.cost !== tx.cost) {
    badRequest(`Cannot modify cost of billed treatment. Current cost: ₹${tx.cost}`)
  }

  const tx = await Treatment.findByIdAndUpdate(id, {
    $set: {
      treatment_type: treatmentType,
      tooth_number: normalizeText(data.tooth_number),
      description: normalizeText(data.description),
      cost: toMoney(data.cost, tx.cost, 'Treatment cost'),
      doctor_notes: normalizeText(data.doctor_notes)
    }
  }, { new: true, runValidators: true }).lean()

  if (tx) tx.id = tx._id.toString()
  return tx
}

// MODIFY: getTreatmentsByPatient - Exclude soft-deleted
async function getTreatmentsByPatient(patientId) {
  if (!isValidObjectId(patientId)) return []
  
  const txs = await Treatment.find({
    patient_id: patientId,
    deleted_at: null // FIX #2: Exclude soft-deleted
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
```

---

## FIX #3: Follow-Up System (CRITICAL)

### File: `server/db.js`

```javascript
// ADD: Follow-up schema
const followUpSchema = new mongoose.Schema({
  patient_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true, 
    index: true 
  },
  appointment_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment', 
    default: null 
  },
  treatment_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Treatment', 
    default: null 
  },
  
  // Follow-up details
  scheduled_date: { type: String, required: true, index: true }, // YYYY-MM-DD
  follow_up_type: {
    type: String,
    enum: ['phase-2-treatment', 'check-up', 'suture-removal', 'root-canal-final', 
           'crown-fitting', 'review', 'emergency', 'other'],
    required: true
  },
  description: { type: String, default: '' },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'pending'
  },
  
  // Reminders
  reminder_sent: { type: Boolean, default: false },
  reminder_sent_at: { type: Date, default: null },
  
  // Completion
  completed_appointment_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment', 
    default: null 
  },
  
}, {
  ...schemaOptions,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

// Index for quick lookups
followUpSchema.index({ patient_id: 1, status: 1 })
followUpSchema.index({ scheduled_date: 1, status: 1 })

const FollowUp = mongoose.model('FollowUp', followUpSchema)

// Add to module.exports
module.exports = {
  // ... existing exports
  FollowUp
}
```

### File: `server/queries.js`

```javascript
// ADD: Import FollowUp
const { Patient, Appointment, Treatment, Bill, BillItem, Payment, Counter, Setting, BlockedSlot, FollowUp } = require('./db')

// ADD: Create follow-up
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

// ADD: Get pending follow-ups
async function getPendingFollowUps() {
  const today = clinicDateString()
  
  const followUps = await FollowUp.find({
    scheduled_date: { $lte: today },
    status: { $in: ['pending', 'scheduled'] }
  })
    .populate('patient_id')
    .populate('appointment_id')
    .sort({ scheduled_date: 1 })
    .lean()
  
  return followUps.map(f => ({
    ...f,
    id: f._id.toString(),
    patient_id: f.patient_id ? f.patient_id._id.toString() : null,
    appointment_id: f.appointment_id ? f.appointment_id._id.toString() : null
  }))
}

// ADD: Get patient follow-ups
async function getPatientFollowUps(patientId, onlyPending = false) {
  if (!isValidObjectId(patientId)) return []
  
  const filter = { patient_id: patientId }
  if (onlyPending) {
    filter.status = { $in: ['pending', 'scheduled'] }
  }
  
  return FollowUp.find(filter)
    .populate('appointment_id')
    .populate('treatment_id')
    .sort({ scheduled_date: 1 })
    .lean()
}

// ADD: Complete follow-up
async function completeFollowUp(followUpId, appointmentId = null) {
  if (!isValidObjectId(followUpId)) return null
  
  return FollowUp.findByIdAndUpdate(followUpId, {
    $set: {
      status: 'completed',
      completed_appointment_id: appointmentId || null
    }
  }, { new: true })
}

// ADD to module.exports
module.exports = {
  // ... existing
  createFollowUp,
  getPendingFollowUps,
  getPatientFollowUps,
  completeFollowUp
}
```

### File: `server/routes/follow-ups.js` (NEW FILE)

```javascript
const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await queries.createFollowUp(req.body))
}))

router.get('/pending', asyncHandler(async (req, res) => {
  res.json(await queries.getPendingFollowUps())
}))

router.get('/patient/:pid', asyncHandler(async (req, res) => {
  const onlyPending = req.query.pending === 'true'
  res.json(await queries.getPatientFollowUps(req.params.pid, onlyPending))
}))

router.put('/:id/complete', asyncHandler(async (req, res) => {
  res.json(await queries.completeFollowUp(req.params.id, req.body.appointment_id))
}))

module.exports = router
```

### File: `server/index.js`

```javascript
// ADD: Register follow-ups route
const followUpRoutes = require('./routes/follow-ups')
// ... in app.use section
app.use('/api/follow-ups', followUpRoutes)
```

---

## FIX #4: Transactional Consistency for Bill Creation

### File: `server/queries.js`

```javascript
// MODIFY: createBill to use transactions
async function createBill(data) {
  if (!isValidObjectId(data.patient_id)) badRequest('Valid patient is required')
  if (data.appointment_id && !isValidObjectId(data.appointment_id)) badRequest('Valid appointment is required')

  // FIX #4: Start transaction
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    let subTotal = 0

    // Fetch and link existing treatments
    const existingIds = Array.isArray(data.existingTreatmentIds) ? data.existingTreatmentIds.filter(isValidObjectId) : []
    if (existingIds.length > 0) {
      const existing = await Treatment.find({ _id: { $in: existingIds }, patient_id: data.patient_id }).session(session)
      if (existing.length !== existingIds.length) {
        throw new Error('One or more treatment IDs do not belong to this patient')
      }
      
      // FIX #4: Validate all treatments are completed
      const incomplete = existing.filter(t => t.status !== 'completed')
      if (incomplete.length > 0) {
        throw new Error(`Cannot bill incomplete treatments: ${incomplete.map(t => t.treatment_type).join(', ')}`)
      }
      
      for (const t of existing) {
        subTotal += t.cost || 0
      }
    }

    // Add new treatments
    let treatmentsToInsert = []
    if (Array.isArray(data.treatments) && data.treatments.length > 0) {
      treatmentsToInsert = data.treatments
        .map(t => ({
          patient_id: data.patient_id,
          appointment_id: data.appointment_id || null,
          treatment_type: normalizeText(t.treatment_type),
          tooth_number: normalizeText(t.tooth_number),
          description: normalizeText(t.description),
          cost: toMoney(t.cost, 0, 'Treatment cost'),
          doctor_notes: normalizeText(t.doctor_notes)
        }))
        .filter(t => t.treatment_type)

      for (const t of treatmentsToInsert) {
        subTotal += t.cost
      }
    }

    if (subTotal <= 0) throw new Error('Bill must include at least one treatment with cost > 0')

    // Apply discount and tax
    const paid = toMoney(data.paid_amount, 0, 'Paid amount')
    const discount = toPercent(data.discount)
    const taxPct = toPercent(data.tax_percent)
    const discounted = subTotal * (1 - discount / 100)
    const taxAmount = Math.round(discounted * (taxPct / 100) * 100) / 100
    const total = Math.round((discounted + taxAmount) * 100) / 100

    if (paid > total) throw new Error('Paid amount cannot exceed the final bill total')

    const balance = Math.max(0, total - paid)
    const status = paid >= total ? 'paid' : paid > 0 ? 'partial' : 'pending'
    const invoiceNumber = await getNextInvoiceNumber()
    const paymentMethod = normalizePaymentMethod(data.payment_method)

    // FIX #4: Save bill with session
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

    // FIX #4: Record payment with session
    if (paid > 0) {
      await Payment.create([{
        bill_id: bill._id,
        patient_id: data.patient_id,
        amount: paid,
        method: paymentMethod,
        notes: 'Initial payment'
      }], { session })
    }

    // FIX #4: Link existing treatments with session
    if (existingIds.length > 0) {
      await Treatment.updateMany(
        { _id: { $in: existingIds } },
        { $set: { bill_id: bill._id } },
        { session }
      )
    }

    // FIX #4: Insert new treatments with session
    if (treatmentsToInsert.length > 0) {
      const newTreatments = treatmentsToInsert.map(t => ({ ...t, bill_id: bill._id }))
      await Treatment.insertMany(newTreatments, { session })
    }

    // FIX #4: Update patient balance with session
    await Patient.findByIdAndUpdate(
      data.patient_id,
      { $set: { total_outstanding_balance: balance } },
      { session }
    )

    // FIX #4: Commit transaction
    await session.commitTransaction()

    return getBillById(bill._id.toString())
  } catch (err) {
    // FIX #4: Rollback on error
    await session.abortTransaction()
    throw err
  } finally {
    await session.endSession()
  }
}
```

---

## FIX #5: Audit Logging

### File: `server/db.js`

```javascript
// ADD: Audit log schema
const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  entity_type: { type: String, required: true },
  entity_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  
  changed_by: { type: String, default: 'system' },
  
  before: { type: Object, default: {} },
  after: { type: Object, default: {} },
  
  details: { type: String, default: '' },
  
}, {
  timestamps: { createdAt: 'logged_at', updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

auditLogSchema.index({ entity_type: 1, entity_id: 1 })
auditLogSchema.index({ logged_at: 1 })

const AuditLog = mongoose.model('AuditLog', auditLogSchema)

// Add to exports
module.exports = {
  // ... existing
  AuditLog
}
```

### File: `server/queries.js`

```javascript
// ADD: Import AuditLog
const { ..., AuditLog } = require('./db')

// ADD: Audit helper
async function logAudit(action, entityType, entityId, before = {}, after = {}, details = '') {
  await AuditLog.create({
    action,
    entity_type: entityType,
    entity_id: entityId,
    changed_by: 'Dr. Mahe',
    before,
    after,
    details
  })
}

// USE IN: updateBillPayment
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

  // Log audit trail
  await logAudit(
    'payment',
    'bill',
    bill._id,
    { paid_amount: bill.paid_amount, balance: bill.balance, status: bill.status },
    { paid_amount: newPaid, balance: newBalance, status: newStatus },
    `Payment of ₹${amount} via ${method}`
  )

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
```

---

## Testing Checklist

- [ ] Create patient with duplicate phone - should error
- [ ] Create patient with duplicate email - should error
- [ ] Create treatment, update to 'planned' → 'in-progress' → 'completed'
- [ ] Try to bill incomplete treatment - should error
- [ ] Try to delete billed treatment - should error
- [ ] Try to change cost after billing - should error
- [ ] Create bill with transactional success
- [ ] Create bill with transactional failure (rollback test)
- [ ] Create follow-up for patient
- [ ] Get pending follow-ups (overdue)
- [ ] Complete follow-up and verify status
- [ ] Check audit log for all changes

