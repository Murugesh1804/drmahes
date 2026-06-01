const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const { initDatabase, Patient } = require('./db')
const queries = require('./queries')

const app = express()
const PORT = process.env.PORT || 5000

// Initialize DB
const db = initDatabase()
queries.init(db)

app.use(cors())
app.use(express.json({ limit: '10mb' })) // Increase payload limit to handle base64 signatures

// Create consent forms directory if it doesn't exist
const consentFormsDir = path.join(__dirname, '../consent_forms')
if (!fs.existsSync(consentFormsDir)) {
  fs.mkdirSync(consentFormsDir, { recursive: true })
}

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// ── PATIENTS ───────────────────────────────────────────────────────────────
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

// ── APPOINTMENTS ───────────────────────────────────────────────────────────
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

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const result = await queries.deleteAppointment(req.params.id)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── TREATMENTS ─────────────────────────────────────────────────────────────
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

// ── BILLS ──────────────────────────────────────────────────────────────────
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

// ── QUEUE ──────────────────────────────────────────────────────────────────
app.get('/api/queue/today', async (req, res) => {
  try {
    const list = await queries.getTodayQueue()
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── SETTINGS ───────────────────────────────────────────────────────────────
app.get('/api/settings', async (req, res) => {
  try {
    const list = await queries.getSettings()
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/settings/:key', async (req, res) => {
  try {
    const { value } = req.body
    const result = await queries.setSetting(req.params.key, value)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── DASHBOARD STATS ────────────────────────────────────────────────────────
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const stats = await queries.getDashboardStats()
    res.json(stats)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── WEBSITE ONLINE BOOKINGS ────────────────────────────────────────────────
app.post('/api/appointments/website-book', async (req, res) => {
  try {
    const { patientName, patientPhone, patientEmail, service, date, timeSlot } = req.body

    if (!patientName || !patientPhone) {
      return res.status(400).json({ error: 'Name and Phone are required' })
    }

    const phone = patientPhone.trim()
    let patient = await Patient.findOne({ phone })
    
    if (!patient) {
      patient = new Patient({
        name: patientName.trim(),
        phone: phone,
        notes: `Registered via website booking (${patientEmail || 'No Email'})`
      })
      await patient.save()
    }

    const appt = await queries.addAppointment({
      patient_id: patient._id.toString(),
      scheduled_date: date,
      scheduled_time: timeSlot,
      reason: service,
      notes: 'Website online booking'
    })

    res.status(201).json({ patient, appt })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── KIOSK REGISTRATION & SIGNED CONSENT FORM ───────────────────────────────
app.post('/api/consent', async (req, res) => {
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
      // Update patient complaint and age from Kiosk details
      patient.age = age ? Number(age) : patient.age
      patient.gender = gender || patient.gender
      patient.complaint = complaint || patient.complaint
      patient.notes = notes || patient.notes
      await patient.save()
    }

    // Decode and save signature to local filesystem with low space (JPEG)
    const timestamp = Date.now()
    const base64Data = signature.replace(/^data:image\/[a-z]+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    
    const sigFilename = `sig_${patient._id.toString()}_${timestamp}.jpg`
    const sigPath = path.join(consentFormsDir, sigFilename)
    fs.writeFileSync(sigPath, buffer)

    // Create a lightweight HTML consent document containing patient info and signature
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
    @media print {
      body { padding: 0; }
      .signature-wrap { border: none; background: transparent; }
    }
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

  <div class="footer">
    Dr. Mahe's Dentistry · Porur, Chennai · WhatsApp: +91 94440 12345
  </div>
</body>
</html>`

    fs.writeFileSync(htmlPath, consentHtml)

    // Update patient record
    patient.consentFormSaved = true
    patient.consentFormPath = `consent_forms/${htmlFilename}`
    patient.consentSignedAt = new Date()
    await patient.save()

    // Create appointment for today
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
    res.send(html)
  } catch (err) {
    res.status(500).send(err.message)
  }
})

// ── BACKUP ─────────────────────────────────────────────────────────────────
app.get('/api/backup/download', (req, res) => {
  try {
    const dbPath = queries.getDbPath()
    const filename = `dental-backup-${new Date().toISOString().split('T')[0]}.db`
    // In MongoDB, we return the connection string as a download or message
    res.send(`MongoDB Cloud URI: ${dbPath}`)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Serve static assets in production
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'))
  }
  next()
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
