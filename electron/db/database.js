const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')
const { app } = require('electron')

// In production Electron, we can load a config.json or search userData for the .env/connection string.
// Let's load the connection string from env or fallback.
let MONGODB_URI = process.env.MONGODB_URI

// In Electron, we can also look for a .env file next to the app executable or in the project root.
const possibleEnvPaths = [
  path.join(app.getAppPath(), '.env'),
  path.join(app.getAppPath(), '../.env'),
  path.join(process.cwd(), '.env'),
  path.join(path.dirname(app.getPath('exe')), '.env'),
  path.join(app.getPath('userData'), 'mongodb_uri.txt')
]

for (const p of possibleEnvPaths) {
  try {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8')
      if (p.endsWith('mongodb_uri.txt')) {
        MONGODB_URI = content.trim()
        break
      } else {
        // Parse basic .env
        const lines = content.split('\n')
        for (const line of lines) {
          if (line.startsWith('MONGODB_URI=')) {
            MONGODB_URI = line.split('MONGODB_URI=')[1].trim().replace(/['"]/g, '')
            break
          }
        }
      }
    }
  } catch (e) {
    // Ignore
  }
}

if (!MONGODB_URI) {
  MONGODB_URI = 'mongodb://localhost:27017/dental-clinic'
}

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
  scheduled_date: { type: String, required: true, index: true },
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
  timestamps: { createdAt: 'created_at', updatedAt: false }
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

// Use existing models if defined to avoid overlap errors in hot-reloads
const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema)
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema)
const Treatment = mongoose.models.Treatment || mongoose.model('Treatment', treatmentSchema)
const Bill = mongoose.models.Bill || mongoose.model('Bill', billSchema)
const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema)

let connected = false

function initDatabase() {
  if (connected) return mongoose.connection

  console.log(`Electron connecting to MongoDB at: ${MONGODB_URI}`)
  mongoose.connect(MONGODB_URI)
    .then(() => {
      connected = true
      console.log('Electron MongoDB connection established.')
      seedSettings()
    })
    .catch(err => {
      console.error('Electron failed to connect to MongoDB:', err)
    })

  return mongoose.connection
}

async function seedSettings() {
  const defaults = [
    { key: 'clinic_name',    value: "Dr. Mahe's Dentistry" },
    { key: 'doctor_name',    value: 'Dr. Mahe' },
    { key: 'clinic_phone',   value: '+91 94440 12345' },
    { key: 'clinic_address', value: '1st Floor, Kundrathur Main Rd, Jaya Nagar, Porur, Chennai - 600116' },
    { key: 'currency',       value: '₹' },
    { key: 'cms_password',    value: 'admin123' }
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
