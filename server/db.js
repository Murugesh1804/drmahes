const mongoose = require('mongoose')
const path = require('path')

// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-clinic'

// Configure global schema options to ensure virtuals (like id) are included in toJSON / toObject
const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id ? ret._id.toString() : null
      return ret
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id ? ret._id.toString() : null
      return ret
    }
  }
}

// ── PATIENT SCHEMA ─────────────────────────────────────────────────────────
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
  age: { type: Number, default: null },
  gender: { type: String, enum: ['Male', 'Female', 'Other', null], default: null },
  address: { type: String, default: '' },
  complaint: { type: String, default: '' },
  notes: { type: String, default: '' },
  consentFormSaved: { type: Boolean, default: false },
  consentFormPath: { type: String, default: '' },
  consentSignedAt: { type: Date, default: null },
  total_outstanding_balance: { type: Number, default: 0 },
  // PID Generation (corrections.md §3.2)
  pid: { type: String, unique: true, sparse: true, index: true },
  registration_source: {
    type: String,
    enum: ['kiosk', 'reception', 'website-booking', 'walk-in', null],
    default: 'reception'
  },
  // FIX #3.1: Patient archiving system
  is_archived: { type: Boolean, default: false, index: true },
  archived_at: { type: Date, default: null },
  archived_by: { type: String, default: null },
  archived_reason: { type: String, default: '' }
}, schemaOptions)

// FIX #1: Add unique constraints for duplicate prevention
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

// ── APPOINTMENT SCHEMA ──────────────────────────────────────────────────────
const appointmentSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  scheduled_date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
  scheduled_time: { type: String, default: '' },
  reason: { type: String, default: '' },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'done', 'cancelled'],
    default: 'waiting'
  },
  call_status: {
    type: String,
    enum: ['pending', 'called', 'not_required'],
    default: 'not_required'
  },
  queue_number: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  // FIX #2.1: Appointment type and urgency
  appointment_type: {
    type: String,
    enum: ['consultation', 'follow-up', 'treatment', 'emergency', 'check-up', 'review', 'walk-in', 'other'],
    default: 'consultation'
  },
   is_urgent: { type: Boolean, default: false },
   // Walk-in support
   is_walk_in: { type: Boolean, default: false },
   is_time_confirmed: { type: Boolean, default: true },
   // FIX #3.2: Appointment cancellation tracking
   cancellation_reason: {
     type: String,
     enum: ['patient-requested', 'doctor-requested', 'no-show', 'emergency', 'rescheduled', 'other', null],
     default: null
   },
   cancelled_at: { type: Date, default: null },
   cancelled_by: { type: String, default: null } // 'patient', 'staff', 'doctor'
}, {
   ...schemaOptions,
   timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } // Track both created and updated for audit
})

appointmentSchema.index({ scheduled_date: 1, status: 1 })
appointmentSchema.index(
  { scheduled_date: 1, scheduled_time: 1 },
  {
    unique: true,
    partialFilterExpression: {
      scheduled_time: { $type: 'string', $gt: '' },
      status: { $in: ['waiting', 'in-progress', 'done'] }
    }
  }
)

// ── TREATMENT SCHEMA ────────────────────────────────────────────────────────
const treatmentSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  bill_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', default: null, index: true },
  diagnosis_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Diagnosis', default: null }, // FIX #2.2: Link to diagnosis
  treatment_type: { type: String, required: true },
  tooth_number: { type: String, default: '' },  // Legacy single-tooth (backward compat)
  tooth_numbers: [{ type: String }],             // Multi-tooth selection array
  description: { type: String, default: '' },
  cost: { type: Number, default: 0, min: 0 },
  doctor_notes: { type: String, default: '' },
  // FIX #2: Add treatment status tracking
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
  // Soft delete
  deleted_at: { type: Date, default: null },
  // FIX #2.4: Cost history tracking
  cost_history: [{
    amount: { type: Number, required: true },
    changed_at: { type: Date, default: Date.now },
    changed_by: { type: String, default: 'system' },
    reason: { type: String, default: '' }
  }]
}, {
  ...schemaOptions,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

// FIX #2: Add validation for billing incomplete treatments
treatmentSchema.pre('validate', function(next) {
  if (this.bill_id && this.status !== 'completed') {
    return next(new Error('Cannot bill incomplete treatment'))
  }
  if (this.sessions_completed > this.sessions_planned) {
    return next(new Error('Sessions completed exceeds planned'))
  }
  next()
})

// ── BILL SCHEMA ────────────────────────────────────────────────────────────
const billSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  total_amount: { type: Number, default: 0 },
  paid_amount: { type: Number, default: 0 },
  balance: { type: Number, default: 0, min: 0 },
  payment_method: {
    type: String,
    enum: ['cash', 'upi', 'card', 'other'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['paid', 'partial', 'pending'],
    default: 'pending'
  },
  notes: { type: String, default: '' },
  // FIX #3.4: Invoice number uniqueness validation
  invoice_number: { 
    type: String, 
    default: '', 
    unique: true,
    sparse: true,
    index: true
  },
  discount:       { type: Number, default: 0 },   // Flat Discount Amount
  tax_percent:    { type: Number, default: 0 },   // GST/Tax %
  tax_amount:     { type: Number, default: 0 },
  manual_charges: { type: Number, default: 0 },
  medicine_charges: { type: Number, default: 0 },
  // Editable Bills (corrections.md §2.2)
  edit_history: [{
    edited_by: { type: String, default: 'admin' },
    edited_at: { type: Date, default: Date.now },
    previous_values: { type: Object },
    change_description: { type: String, default: '' }
  }],
  last_edited_at: { type: Date, default: null },
  last_edited_by: { type: String, default: null }
}, schemaOptions)

billSchema.index({ status: 1 })
billSchema.index({ created_at: 1 })

const billItemSchema = new mongoose.Schema({
  bill_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true, index: true },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  treatment_type: { type: String, required: true },
  tooth_number: { type: String, default: '' },
  description: { type: String, default: '' },
  cost: { type: Number, default: 0 },
  doctor_notes: { type: String, default: '' }
}, {
  ...schemaOptions,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } // Track both created and updated for audit
})

// ── PAYMENT SCHEMA ─────────────────────────────────────────
const paymentSchema = new mongoose.Schema({
  bill_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true, index: true },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  amount:     { type: Number, required: true },
  method:     { type: String, enum: ['cash', 'upi', 'card', 'other'], default: 'cash' },
  notes:      { type: String, default: '' },
  // FIX #2.3: Payment reversal tracking
  is_reversed: { type: Boolean, default: false },
  reversed_at: { type: Date, default: null },
  reversal_reason: { type: String, default: '' },
  // Manual adjustment flag
  is_adjustment: { type: Boolean, default: false },
  adjustment_reason: { type: String, default: '' }
}, {
  timestamps: { createdAt: 'paid_at', updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// ── COUNTER SCHEMA ─────────────────────────────────────────
// For sequential invoice numbers (INV-YYYY-XXXX)
const counterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 }
})

// ── SETTING SCHEMA ─────────────────────────────────────────────────────────
const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: String, default: '' }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// ── BLOCKED SLOT SCHEMA ─────────────────────────────────────────────────────
// Stores manually blocked time slots per date (e.g. walk-in patient occupies a slot)
const blockedSlotSchema = new mongoose.Schema({
  date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
  slot: { type: String, required: true },               // e.g. '04:00 PM'
  blocked_by: { type: String, default: 'admin' },
  reason: { type: String, default: '' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
// Compound unique index: one record per date+slot combination
blockedSlotSchema.index({ date: 1, slot: 1 }, { unique: true })

// ── DIAGNOSIS SCHEMA ────────────────────────────────────────────────────────
// FIX #2.2: Structured diagnosis recording with findings and recommendations
const diagnosisSchema = new mongoose.Schema({
  patient_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true, 
    index: true 
  },
  appointment_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment', 
    required: true 
  },
  // Structured findings
  findings: {
    affected_teeth: [{ type: String }], // e.g., ['16', '17', '26']
    conditions: [{
      type: String,
      enum: ['cavity', 'abscess', 'plaque', 'bleeding', 'fracture', 'discoloration', 'decay', 'gum-disease', 'other']
    }],
    description: { type: String, required: true }
  },
  // Recommended treatment
  recommended_treatments: [{ type: String }],
  // Doctor's assessment
  urgency: { 
    type: String, 
    enum: ['routine', 'soon', 'urgent'], 
    default: 'routine' 
  },
  // Notes
  notes: { type: String, default: '' },
  // Doctor who diagnosed
  diagnosed_by: { type: String, default: 'Dr. Mahe' }
}, {
  ...schemaOptions,
  timestamps: { createdAt: 'diagnosed_at', updatedAt: false }
})

diagnosisSchema.index({ patient_id: 1, appointment_id: 1 })
diagnosisSchema.index({ diagnosed_at: -1 })

// ── FOLLOW-UP SCHEMA ────────────────────────────────────────────────────────
// FIX #3: Complete follow-up system for patient recall and phase 2 treatment
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
  }
}, {
  ...schemaOptions,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

// Indexes for quick lookups
followUpSchema.index({ patient_id: 1, status: 1 })
followUpSchema.index({ scheduled_date: 1, status: 1 })

// ── AUDIT LOG SCHEMA ────────────────────────────────────────────────────────
// FIX #5: Complete audit trail for compliance and accountability
const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  entity_type: { type: String, required: true },
  entity_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  changed_by: { type: String, default: 'system' },
  before: { type: Object, default: {} },
  after: { type: Object, default: {} },
  details: { type: String, default: '' }
}, {
  timestamps: { createdAt: 'logged_at', updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

auditLogSchema.index({ entity_type: 1, entity_id: 1 })
auditLogSchema.index({ logged_at: 1 })

// ── CONSULTANT PAYMENT SCHEMA (corrections.md §2.3) ──────────────────────────
const consultantPaymentSchema = new mongoose.Schema({
  consultant_name: { type: String, required: true, trim: true, index: true },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  treatment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Treatment', default: null },
  bill_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', default: null },
  treatment_type: { type: String, default: '' },
  treatment_cost: { type: Number, default: 0, min: 0 },
  consultant_share: { type: Number, default: 0, min: 0 },
  amount_paid: { type: Number, default: 0, min: 0 },
  balance_due: { type: Number, default: 0, min: 0 },
  payment_date: { type: Date, default: null },
  payment_method: { type: String, enum: ['cash', 'upi', 'card', 'other', null], default: null },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' }
}, {
  ...schemaOptions,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})
consultantPaymentSchema.index({ consultant_name: 1, status: 1 })
consultantPaymentSchema.index({ created_at: -1 })

// ── TREATMENT MASTER SCHEMA (corrections.md §4.1) ────────────────────────────
const treatmentMasterSchema = new mongoose.Schema({
  treatment_name: { type: String, required: true, unique: true, trim: true },
  category: {
    type: String,
    enum: ['general', 'endodontics', 'orthodontics', 'prosthodontics', 'periodontics', 'surgery', 'cosmetic', 'other'],
    default: 'general'
  },
  standard_cost: { type: Number, default: 0, min: 0 },
  is_active: { type: Boolean, default: true, index: true }
}, {
  ...schemaOptions,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})
treatmentMasterSchema.index({ treatment_name: 1 })
treatmentMasterSchema.index({ category: 1, is_active: 1 })

const Patient = mongoose.model('Patient', patientSchema)
const Appointment = mongoose.model('Appointment', appointmentSchema)
const Treatment = mongoose.model('Treatment', treatmentSchema)
const Bill = mongoose.model('Bill', billSchema)
const BillItem = mongoose.model('BillItem', billItemSchema)
const Payment = mongoose.model('Payment', paymentSchema)
const Counter = mongoose.model('Counter', counterSchema)
const Setting = mongoose.model('Setting', settingSchema)
const BlockedSlot = mongoose.model('BlockedSlot', blockedSlotSchema)
const Diagnosis = mongoose.model('Diagnosis', diagnosisSchema)
const FollowUp = mongoose.model('FollowUp', followUpSchema)
const AuditLog = mongoose.model('AuditLog', auditLogSchema)
const ConsultantPayment = mongoose.model('ConsultantPayment', consultantPaymentSchema)
const TreatmentMaster = mongoose.model('TreatmentMaster', treatmentMasterSchema)

let connected = false

async function initDatabase() {
  if (connected) return mongoose.connection

  // Low-RAM VPS optimizations
  mongoose.set('bufferCommands', false) // Fail fast if DB not connected

  try {
    console.log(`[db] Connecting to MongoDB...`)
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 50,         // Sufficient for concurrent staff members (was 3, causing connection starvation)
      serverSelectionTimeoutMS: 10000, // 10s timeout
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 30000,
    })
    connected = true
    console.log('[db] MongoDB connected successfully.')

    await seedSettings()
  } catch (err) {
    console.error('[db] Failed to connect to MongoDB:', err.message)
    // Don't crash — let server run, routes will return 500 until DB connects
  }

  return mongoose.connection
}

async function seedSettings() {
  const bcrypt = require('bcryptjs')
  
  // Check if cms_password already exists in database
  const existing = await Setting.findOne({ key: 'cms_password' })
  
  // Only generate and log fallback password if it doesn't exist yet
  let defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD
  if (!existing && !defaultPassword) {
    const crypto = require('crypto')
    defaultPassword = crypto.randomBytes(8).toString('hex')
    console.warn(`\n⚠️ WARNING: DEFAULT_ADMIN_PASSWORD not set in .env!`)
    console.warn(`⚠️ Generated strong default password for CMS portal: ${defaultPassword}\n`)
  }

  const defaults = [
    { key: 'clinic_name',    value: "Dr. Mahe's Dentistry" },
    { key: 'doctor_name',    value: 'Dr. Mahe' },
    { key: 'clinic_phone',   value: '+91 94440 12345' },
    { key: 'clinic_address', value: '1st Floor, Kundrathur Main Rd, Jaya Nagar, Porur, Chennai - 600116' },
    { key: 'currency',       value: '₹' }
  ]

  for (const item of defaults) {
    const exists = await Setting.findOne({ key: item.key })
    if (!exists) {
      await Setting.create(item)
    }
  }

  // Only set cms_password if it doesn't already exist
  if (!existing) {
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)
    await Setting.create({ key: 'cms_password', value: hashedPassword })
  }
}

function getDbPath() {
  return MONGODB_URI
}

module.exports = {
  initDatabase,
  getDbPath,
  Patient,
  Appointment,
  Treatment,
  Bill,
  BillItem,
  Payment,
  Counter,
  Setting,
  BlockedSlot,
  Diagnosis,
  FollowUp,
  AuditLog,
  ConsultantPayment,
  TreatmentMaster
}
