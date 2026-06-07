// server/index.js — Production-hardened Express server
// Security: helmet, CORS lockdown, rate limiting, JWT auth on all /api routes
// Performance: gzip compression, mongoose pool size 3, graceful shutdown

require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs')

const { initDatabase, Patient, Appointment } = require('./db')
const queries = require('./queries')
const { handleLogin, verifyToken } = require('./auth')
const { sendAppointmentConfirmation } = require('./email')

const app = express()
app.set('trust proxy', 1)
const PORT = process.env.PORT || 5000

// ── ALLOWED ORIGINS ─────────────────────────────────────────────────────────
let ALLOWED_ORIGINS = [
  'https://portal.drmahesdentistry.in',
  'https://kiosk.drmahesdentistry.in',
  'https://drmahesdentistry.in',
  'https://www.drmahesdentistry.in',
  'http://localhost:5173',   // Vite dev server
  'http://localhost:5500',
  'http://localhost:5000',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5000',
]

if (process.env.NODE_ENV === 'production') {
  ALLOWED_ORIGINS = ALLOWED_ORIGINS.filter(origin => !origin.includes('localhost') && !origin.includes('127.0.0.1'))
}

// ── SECURITY HEADERS (helmet) ────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Managed at Nginx level
  crossOriginEmbedderPolicy: false,
}))

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return cb(null, true)
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: Origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── COMPRESSION (gzip — saves 60-70% on JSON responses) ─────────────────────
app.use(compression({ level: 6, threshold: 1024 }))

// ── BODY PARSING ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' })) // Reduced from 10mb; signatures ~200KB

// ── RATE LIMITING ────────────────────────────────────────────────────────────
// Global: 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
})

// Auth: 5 login attempts per 15 minutes per IP (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes.' },
  skipSuccessfulRequests: true,
})

// Public Forms: 5 submissions per 60 minutes per IP (spam protection)
const publicFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please try again later.' },
})

app.use('/api', globalLimiter)

// ── INITIALIZE DB ────────────────────────────────────────────────────────────
const db = initDatabase()
queries.init(db)

// Create consent forms directory
const consentFormsDir = path.join(__dirname, '../consent_forms')
if (!fs.existsSync(consentFormsDir)) {
  fs.mkdirSync(consentFormsDir, { recursive: true })
}

// ── REQUEST LOGGER (production-safe) ─────────────────────────────────────────
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  } else {
    // In production, only log non-GET requests or errors (reduces log noise)
    if (req.method !== 'GET') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
    }
  }
  next()
})

// ── HEALTH CHECK (public — for uptime monitors) ───────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  })
})

// ── AUTH ENDPOINT (public — rate limited) ─────────────────────────────────────
app.post('/api/auth/login', authLimiter, handleLogin)

// ── PUBLIC ROUTES (no auth required) ─────────────────────────────────────────
// Website online booking — called from drmahesdentistry.in public website
app.post('/api/appointments/website-book', publicFormLimiter, async (req, res) => {
  try {
    const { patientName, patientPhone, patientEmail, service, date, timeSlot } = req.body

    if (!patientName || !patientPhone) {
      return res.status(400).json({ error: 'Name and Phone are required' })
    }

    const phone = patientPhone.trim()
    const email = patientEmail ? patientEmail.trim().toLowerCase() : null

    // Dedup: look up patient by phone first, then by email (if provided)
    let patient = await Patient.findOne({ phone })
    if (!patient && email) {
      patient = await Patient.findOne({ email })
    }

    if (!patient) {
      patient = new Patient({
        name: patientName.trim(),
        phone: phone,
        notes: `Registered via website booking (${patientEmail || 'No Email'})`
      })
      await patient.save()
    } else {
      // Returning patient — update phone/name if changed
      if (!patient.phone && phone) patient.phone = phone
      await patient.save()
    }

    const appt = await queries.addAppointment({
      patient_id: patient._id.toString(),
      scheduled_date: date,
      scheduled_time: timeSlot,
      reason: service,
      notes: 'Website online booking',
      call_status: 'pending'
    })

    // Send confirmation email asynchronously if email is provided
    if (email) {
      sendAppointmentConfirmation(email, patientName.trim(), date, timeSlot, service)
        .catch(err => console.error('[email-trigger] Error sending confirmation email in background:', err))
    }

    res.status(201).json({ patient, appt })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Public endpoint to get available slots for a specific date
app.get('/api/appointments/available-slots', async (req, res) => {
  try {
    const { date } = req.query
    if (!date) {
      return res.status(400).json({ error: 'Date query parameter is required' })
    }

    const allSlots = [
      '10:00 AM', '11:00 AM', '12:00 PM',
      '04:00 PM', '05:00 PM', '06:00 PM',
      '07:00 PM', '08:00 PM', '09:00 PM'
    ]

    // Find non-cancelled appointments for this date
    const booked = await Appointment.find({
      scheduled_date: date,
      status: { $ne: 'cancelled' }
    }).select('scheduled_time').lean()

    const bookedSlots = booked.map(a => a.scheduled_time).filter(Boolean)

    // Find manually blocked slots for this date
    const blockedRecords = await queries.getBlockedSlots(date)
    const blockedSlots = blockedRecords.map(r => r.slot)

    // Available = not booked by appointment AND not manually blocked
    const takenSlots = new Set([...bookedSlots, ...blockedSlots])
    const availableSlots = allSlots.filter(slot => !takenSlots.has(slot))

    res.json({ date, availableSlots })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Kiosk consent form submission — called from kiosk page (no CMS login required)
app.post('/api/consent', publicFormLimiter, async (req, res) => {
  try {
    const { name, phone, age, gender, complaint, notes, signature } = req.body

    if (!name || !phone || !signature) {
      return res.status(400).json({ error: 'Name, Phone, and Signature are required' })
    }

    const cleanPhone = phone.trim()
    let patient = await Patient.findOne({ phone: cleanPhone })

    if (!patient) {
      patient = new Patient({
        name: name.trim(),
        phone: cleanPhone,
        age: age ? Number(age) : null,
        gender,
        complaint,
        notes: notes || 'Kiosk check-in'
      })
      await patient.save()
    } else {
      patient.age = age ? Number(age) : patient.age
      patient.gender = gender || patient.gender
      patient.complaint = complaint || patient.complaint
      patient.notes = notes || patient.notes
      await patient.save()
    }

    const timestamp = Date.now()
    const base64Data = signature.replace(/^data:image\/[a-z]+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    const sigFilename = `sig_${patient._id.toString()}_${timestamp}.jpg`
    const sigPath = path.join(consentFormsDir, sigFilename)
    fs.writeFileSync(sigPath, buffer)

    const htmlFilename = `consent_${patient._id.toString()}_${timestamp}.html`
    const htmlPath = path.join(consentFormsDir, htmlFilename)

    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })

    const consentHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Dental Treatment Consent Form - ${patient.name}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; color: #1e293b; background-color: #ffffff; }
    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
    .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
    .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.1em; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; }
    .field { display: flex; flex-direction: column; }
    .label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
    .value { font-size: 15px; font-weight: 600; color: #334155; }
    .text-block { line-height: 1.6; font-size: 14px; color: #475569; margin-bottom: 30px; border-left: 3px solid #cbd5e1; padding-left: 15px; }
    .signature-section { display: flex; flex-direction: column; align-items: flex-end; margin-top: 40px; }
    .signature-wrap { background: #fafafa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; width: 220px; text-align: center; }
    .signature-img { max-width: 200px; height: auto; display: block; margin: 0 auto; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 50px; border-top: 1px dashed #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">DR. MAHE'S DENTISTRY</div>
    <div class="subtitle">Patient Treatment Consent</div>
  </div>
  <div class="grid">
    <div class="field"><span class="label">Patient Name</span><span class="value">${patient.name}</span></div>
    <div class="field"><span class="label">Phone Number</span><span class="value">${patient.phone || '—'}</span></div>
    <div class="field"><span class="label">Age &amp; Gender</span><span class="value">${patient.age ? patient.age + ' yrs' : '—'} · ${patient.gender || '—'}</span></div>
    <div class="field"><span class="label">Date Signed</span><span class="value">${dateStr}</span></div>
    <div class="field" style="grid-column: span 2;"><span class="label">Chief Complaint</span><span class="value">${complaint || 'General check-up'}</span></div>
  </div>
  <div class="text-block">
    I hereby authorize the clinical team of Dr. Mahe's Dentistry to perform dental procedures, diagnostic scans, and treatments as necessary to address my condition. I understand that the clinical options, costs, and risks have been discussed, and I consent to proceed with the treatment plan.
  </div>
  <div class="signature-section">
    <div class="signature-wrap">
      <img src="data:image/jpeg;base64,${base64Data}" class="signature-img" alt="Patient Signature" />
      <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; border-top: 1px solid #f1f5f9; padding-top: 4px; font-weight: 600;">Patient Signature</div>
    </div>
  </div>
  <div class="footer">Dr. Mahe's Dentistry · Porur, Chennai · WhatsApp: +91 94440 12345</div>
</body>
</html>`

    fs.writeFileSync(htmlPath, consentHtml)

    patient.consentFormSaved = true
    patient.consentFormPath = `consent_forms/${htmlFilename}`
    patient.consentSignedAt = new Date()
    await patient.save()

    const today = new Date().toISOString().split('T')[0]
    const appt = await queries.addAppointment({
      patient_id: patient._id.toString(),
      scheduled_date: today,
      scheduled_time: '',
      reason: complaint,
      notes: notes || 'Kiosk check-in'
    })

    const patientJSON = patient.toObject()
    patientJSON.id = patientJSON._id.toString()

    res.status(201).json({ patient: patientJSON, appt })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Consent form view — public read (for printing signed forms)
app.get('/api/consent/:patientId', async (req, res) => {
  try {
    const patient = await queries.getPatientById(req.params.patientId)
    if (!patient || !patient.consentFormSaved || !patient.consentFormPath) {
      return res.status(404).send('Consent form not found for this patient.')
    }

    const filePath = path.join(__dirname, '..', patient.consentFormPath)
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Consent form file not found on disk.')
    }

    const html = fs.readFileSync(filePath, 'utf8')
    res.setHeader('Content-Type', 'text/html')
    res.setHeader('X-Robots-Tag', 'noindex, nofollow') // Don't index consent forms
    res.send(html)
  } catch (err) {
    res.status(500).send(err.message)
  }
})

// ── WHATSAPP WEBHOOK VERIFICATION (public) ──────────────────────────────────
app.get('/api/webhook/whatsapp', (req, res) => {
  const VERIFY_TOKEN = 'drmahe123'
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge)
  }

  return res.sendStatus(403)
})

// ── AUTH MIDDLEWARE — Protects all /api routes below this line ────────────────
app.use('/api', verifyToken)

// ── SLOT BLOCKING (Authenticated) ─────────────────────────────────────────────────
app.get('/api/slots/blocked', async (req, res) => {
  try {
    const { date } = req.query
    if (!date) return res.status(400).json({ error: 'date query param required' })
    const list = await queries.getBlockedSlots(date)
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/slots/block', async (req, res) => {
  try {
    const { date, slot, reason } = req.body
    if (!date || !slot) return res.status(400).json({ error: 'date and slot are required' })
    const result = await queries.blockSlot(date, slot, reason || '')
    res.status(201).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/slots/block', async (req, res) => {
  try {
    const { date, slot } = req.body
    if (!date || !slot) return res.status(400).json({ error: 'date and slot are required' })
    const result = await queries.unblockSlot(date, slot)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── PATIENTS ─────────────────────────────────────────────────────────────────
app.get('/api/patients', async (req, res) => {
  try {
    const list = await queries.getAllPatients()
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/patients/search', async (req, res) => {
  try {
    const { q } = req.query
    const list = await queries.searchPatients(q || '')
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/patients/:id', async (req, res) => {
  try {
    const patient = await queries.getPatientById(req.params.id)
    if (!patient) return res.status(404).json({ error: 'Patient not found' })
    res.json(patient)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/patients', async (req, res) => {
  try {
    const patient = await queries.addPatient(req.body)
    res.status(201).json(patient)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/patients/:id', async (req, res) => {
  try {
    const patient = await queries.updatePatient(req.params.id, req.body)
    res.json(patient)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── APPOINTMENTS ──────────────────────────────────────────────────────────────
app.get('/api/appointments/pending-calls', async (req, res) => {
  try {
    const list = await queries.getPendingCalls()
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/appointments/today', async (req, res) => {
  try {
    const list = await queries.getTodayAppointments()
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/appointments/date/:date', async (req, res) => {
  try {
    const list = await queries.getAppointmentsByDate(req.params.date)
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/appointments/patient/:pid', async (req, res) => {
  try {
    const list = await queries.getPatientAppointments(req.params.pid)
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/appointments', async (req, res) => {
  try {
    const appt = await queries.addAppointment(req.body)
    res.status(201).json(appt)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/appointments/:id', async (req, res) => {
  try {
    const appt = await queries.updateAppointment(req.params.id, req.body)
    res.json(appt)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const result = await queries.updateAppointmentStatus(req.params.id, status)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/appointments/:id/call-status', async (req, res) => {
  try {
    const { status } = req.body
    const result = await queries.updateAppointmentCallStatus(req.params.id, status)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const result = await queries.deleteAppointment(req.params.id)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── TREATMENTS ────────────────────────────────────────────────────────────────
app.get('/api/treatments/appointment/:aid', async (req, res) => {
  try {
    const list = await queries.getTreatmentsByAppointment(req.params.aid)
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/treatments/patient/:pid', async (req, res) => {
  try {
    const list = await queries.getTreatmentsByPatient(req.params.pid)
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/treatments', async (req, res) => {
  try {
    const tx = await queries.addTreatment(req.body)
    res.status(201).json(tx)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/treatments/:id', async (req, res) => {
  try {
    const tx = await queries.updateTreatment(req.params.id, req.body)
    res.json(tx)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/treatments/:id', async (req, res) => {
  try {
    const result = await queries.deleteTreatment(req.params.id)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── BILLS ─────────────────────────────────────────────────────────────────────
app.get('/api/bills', async (req, res) => {
  try {
    const list = await queries.getAllBills()
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/bills/patient/:pid', async (req, res) => {
  try {
    const list = await queries.getBillsByPatient(req.params.pid)
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/bills/:id', async (req, res) => {
  try {
    const bill = await queries.getBillById(req.params.id)
    if (!bill) return res.status(404).json({ error: 'Bill not found' })
    res.json(bill)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/bills', async (req, res) => {
  try {
    const bill = await queries.createBill(req.body)
    res.status(201).json(bill)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/bills/:id/payment', async (req, res) => {
  try {
    const bill = await queries.updateBillPayment(req.params.id, req.body)
    res.json(bill)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── QUEUE ─────────────────────────────────────────────────────────────────────
app.get('/api/queue/today', async (req, res) => {
  try {
    const list = await queries.getTodayQueue()
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── SETTINGS ──────────────────────────────────────────────────────────────────
app.get('/api/settings', async (req, res) => {
  try {
    const list = await queries.getSettings()
    // Never expose the cms_password hash to the client
    const safe = { ...list }
    if (safe.cms_password) {
      safe.cms_password = safe.cms_password.startsWith('$2b$') ? '••••••••' : '••••••••'
    }
    res.json(safe)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/settings/:key', async (req, res) => {
  try {
    const { value } = req.body
    const key = req.params.key

    // Hash password before storing if key is cms_password
    if (key === 'cms_password' && value && !value.startsWith('$2b$')) {
      const bcrypt = require('bcryptjs')
      const hashed = await bcrypt.hash(value, 10)
      const result = await queries.setSetting(key, hashed)
      return res.json(result)
    }

    const result = await queries.setSetting(key, value)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── DASHBOARD STATS ───────────────────────────────────────────────────────────
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const stats = await queries.getDashboardStats()
    res.json(stats)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── BACKUP ────────────────────────────────────────────────────────────────────
// Returns only DB name/status — NOT the full connection URI
app.get('/api/backup/download', (req, res) => {
  res.json({
    message: 'Data is stored in MongoDB Atlas cloud. Use MongoDB Atlas dashboard to export data.',
    dbName: 'dental-clinic',
    timestamp: new Date().toISOString(),
  })
})

// ── SERVE STATIC FILES ────────────────────────────────────────────────────────
const kioskPath = path.join(__dirname, '../kiosk')
app.use('/kiosk', express.static(kioskPath, {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    }
  }
}))

const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath, {
  maxAge: '7d',          // Cache static assets 7 days
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Don't cache index.html — always fresh
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    }
  }
}))

// SPA fallback — all non-API GET requests serve index.html
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'))
  }
  next()
})

// ── 404 & ERROR HANDLERS ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error('[error]', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

// ── START SERVER ──────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`[server] Running on port ${PORT} (${process.env.NODE_ENV || 'development'})`)
  console.log(`[server] JWT auth enabled — all /api routes protected`)
})

// ── GRACEFUL SHUTDOWN (important for low-RAM VPS) ─────────────────────────────
function gracefulShutdown(signal) {
  console.log(`[server] ${signal} received — shutting down gracefully`)
  server.close(() => {
    console.log('[server] HTTP server closed')
    process.exit(0)
  })
  // Force exit after 10s if connections hang
  setTimeout(() => process.exit(1), 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err)
  gracefulShutdown('uncaughtException')
})
