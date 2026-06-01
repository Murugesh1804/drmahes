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
  phone: { type: String, default: '', index: true },
  age: { type: Number, default: null },
  gender: { type: String, enum: ['Male', 'Female', 'Other', null], default: null },
  address: { type: String, default: '' },
  complaint: { type: String, default: '' },
  notes: { type: String, default: '' },
  consentFormSaved: { type: Boolean, default: false },
  consentFormPath: { type: String, default: '' },
  consentSignedAt: { type: Date, default: null }
}, schemaOptions)

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
  queue_number: { type: Number, default: 1 },
  notes: { type: String, default: '' }
}, {
  ...schemaOptions,
  timestamps: { createdAt: 'created_at', updatedAt: false } // Only track created_at
})

// ── TREATMENT SCHEMA ────────────────────────────────────────────────────────
const treatmentSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  treatment_type: { type: String, required: true },
  tooth_number: { type: String, default: '' },
  description: { type: String, default: '' },
  cost: { type: Number, default: 0 },
  doctor_notes: { type: String, default: '' }
}, {
  ...schemaOptions,
  timestamps: { createdAt: 'created_at', updatedAt: false }
})

// ── BILL SCHEMA ────────────────────────────────────────────────────────────
const billSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  total_amount: { type: Number, default: 0 },
  paid_amount: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
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
  notes: { type: String, default: '' }
}, schemaOptions)

// ── SETTING SCHEMA ─────────────────────────────────────────────────────────
const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: String, default: '' }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

const Patient = mongoose.model('Patient', patientSchema)
const Appointment = mongoose.model('Appointment', appointmentSchema)
const Treatment = mongoose.model('Treatment', treatmentSchema)
const Bill = mongoose.model('Bill', billSchema)
const Setting = mongoose.model('Setting', settingSchema)

let connected = false

async function initDatabase() {
  if (connected) return mongoose.connection

  // Low-RAM VPS optimizations
  mongoose.set('bufferCommands', false) // Fail fast if DB not connected

  try {
    console.log(`[db] Connecting to MongoDB...`)
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 3,          // Limit connections (saves RAM on small VPS)
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
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const defaults = [
    { key: 'clinic_name',    value: "Dr. Mahe's Dentistry" },
    { key: 'doctor_name',    value: 'Dr. Mahe' },
    { key: 'clinic_phone',   value: '+91 94440 12345' },
    { key: 'clinic_address', value: '1st Floor, Kundrathur Main Rd, Jaya Nagar, Porur, Chennai - 600116' },
    { key: 'currency',       value: '₹' },
    { key: 'cms_password',    value: hashedPassword }
  ]

  for (const item of defaults) {
    const exists = await Setting.findOne({ key: item.key })
    if (!exists) {
      await Setting.create(item)
    }
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
  Setting
}
