const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')
const { Database } = require('node-sqlite3-wasm')

// Load .env
require('dotenv').config({ path: path.join(__dirname, '../.env') })
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-clinic'

// Schemas & Models (locally defined for isolation during migration)
const Patient = mongoose.model('Patient', new mongoose.Schema({
  name: String, phone: String, age: Number, gender: String, address: String, complaint: String, notes: String,
  consentFormSaved: Boolean, consentFormPath: String, consentSignedAt: Date, created_at: Date, updated_at: Date
}))

const Appointment = mongoose.model('Appointment', new mongoose.Schema({
  patient_id: mongoose.Schema.Types.ObjectId, scheduled_date: String, scheduled_time: String, reason: String,
  status: String, queue_number: Number, notes: String, created_at: Date
}))

const Treatment = mongoose.model('Treatment', new mongoose.Schema({
  patient_id: mongoose.Schema.Types.ObjectId, appointment_id: mongoose.Schema.Types.ObjectId,
  treatment_type: String, tooth_number: String, description: String, cost: Number, doctor_notes: String, created_at: Date
}))

const Bill = mongoose.model('Bill', new mongoose.Schema({
  patient_id: mongoose.Schema.Types.ObjectId, appointment_id: mongoose.Schema.Types.ObjectId,
  total_amount: Number, paid_amount: Number, balance: Number, payment_method: String, status: String, notes: String,
  created_at: Date, updated_at: Date
}))

const Setting = mongoose.model('Setting', new mongoose.Schema({
  key: String, value: String
}))

async function run() {
  const dbFile = path.join(__dirname, '../dental_clinic.db')
  if (!fs.existsSync(dbFile)) {
    console.log('No SQLite database (dental_clinic.db) found to migrate. Skipping migration.')
    process.exit(0)
  }

  console.log('SQLite database found. Initiating migration...')
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}`)
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB.')

  const sqliteDb = new Database(dbFile)

  // Map stores to map SQLite integer IDs to MongoDB ObjectIds
  const patientIdMap = {}
  const apptIdMap = {}

  // 1. Migrate Settings
  console.log('Migrating settings...')
  const settingsRows = sqliteDb.all('SELECT * FROM settings')
  for (const s of settingsRows) {
    await Setting.findOneAndUpdate({ key: s.key }, { value: s.value }, { upsert: true })
  }
  console.log(`Migrated ${settingsRows.length} settings.`)

  // 2. Migrate Patients
  console.log('Migrating patients...')
  const patientRows = sqliteDb.all('SELECT * FROM patients')
  for (const p of patientRows) {
    const mongoId = new mongoose.Types.ObjectId()
    patientIdMap[p.id] = mongoId

    await Patient.create({
      _id: mongoId,
      name: p.name,
      phone: p.phone || '',
      age: p.age,
      gender: p.gender,
      address: p.address || '',
      complaint: p.complaint || '',
      notes: p.notes || '',
      consentFormSaved: false,
      consentFormPath: '',
      consentSignedAt: null,
      created_at: p.created_at ? new Date(p.created_at) : new Date(),
      updated_at: p.updated_at ? new Date(p.updated_at) : new Date()
    })
  }
  console.log(`Migrated ${patientRows.length} patients.`)

  // 3. Migrate Appointments
  console.log('Migrating appointments...')
  const apptRows = sqliteDb.all('SELECT * FROM appointments')
  for (const a of apptRows) {
    const mongoId = new mongoose.Types.ObjectId()
    apptIdMap[a.id] = mongoId

    const patientMongoId = patientIdMap[a.patient_id]
    if (!patientMongoId) {
      console.warn(`Warning: Patient with ID ${a.patient_id} not found in map. Skipping appointment ${a.id}.`)
      continue
    }

    await Appointment.create({
      _id: mongoId,
      patient_id: patientMongoId,
      scheduled_date: a.scheduled_date,
      scheduled_time: a.scheduled_time || '',
      reason: a.reason || '',
      status: a.status || 'waiting',
      queue_number: a.queue_number || 1,
      notes: a.notes || '',
      created_at: a.created_at ? new Date(a.created_at) : new Date()
    })
  }
  console.log(`Migrated ${apptRows.length} appointments.`)

  // 4. Migrate Treatments
  console.log('Migrating treatments...')
  const txRows = sqliteDb.all('SELECT * FROM treatments')
  let txCount = 0
  for (const t of txRows) {
    const patientMongoId = patientIdMap[t.patient_id]
    const apptMongoId = t.appointment_id ? apptIdMap[t.appointment_id] : null

    if (!patientMongoId) {
      console.warn(`Warning: Patient with ID ${t.patient_id} not found. Skipping treatment ${t.id}.`)
      continue
    }

    await Treatment.create({
      patient_id: patientMongoId,
      appointment_id: apptMongoId,
      treatment_type: t.treatment_type,
      tooth_number: t.tooth_number || '',
      description: t.description || '',
      cost: t.cost || 0,
      doctor_notes: t.doctor_notes || '',
      created_at: t.created_at ? new Date(t.created_at) : new Date()
    })
    txCount++
  }
  console.log(`Migrated ${txCount} treatments.`)

  // 5. Migrate Bills
  console.log('Migrating bills...')
  const billRows = sqliteDb.all('SELECT * FROM bills')
  let billCount = 0
  for (const b of billRows) {
    const patientMongoId = patientIdMap[b.patient_id]
    const apptMongoId = b.appointment_id ? apptIdMap[b.appointment_id] : null

    if (!patientMongoId) {
      console.warn(`Warning: Patient with ID ${b.patient_id} not found. Skipping bill ${b.id}.`)
      continue
    }

    await Bill.create({
      patient_id: patientMongoId,
      appointment_id: apptMongoId,
      total_amount: b.total_amount || 0,
      paid_amount: b.paid_amount || 0,
      balance: b.balance || 0,
      payment_method: b.payment_method || 'cash',
      status: b.status || 'pending',
      notes: b.notes || '',
      created_at: b.created_at ? new Date(b.created_at) : new Date(),
      updated_at: b.updated_at ? new Date(b.updated_at) : new Date()
    })
    billCount++
  }
  console.log(`Migrated ${billCount} bills.`)

  console.log('Data migration complete! Cleaning up connections.')
  sqliteDb.close()
  await mongoose.disconnect()
  console.log('Migration finished successfully.')
}

run().catch(err => {
  console.error('Migration failed with error:', err)
  process.exit(1)
})
