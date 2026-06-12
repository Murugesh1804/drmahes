const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const { Patient } = require('../db')
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')
const rateLimit = require('express-rate-limit')

const publicFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please try again later.' },
})

const consentFormsDir = path.join(__dirname, '../../consent_forms')

router.post('/', publicFormLimiter, asyncHandler(async (req, res) => {
  const { name, phone, age, gender, complaint, notes, signature } = req.body

  if (!name || !phone || !signature) {
    return res.status(400).json({ error: 'Name, Phone and Signature are required' })
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

  // Store ONLY the signature image (Option B)
  const base64Data = signature.replace(/^data:image\/[a-z]+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')

  // Don't timestamp, overwrite on re-consent
  const sigFilename = `sig_${patient._id.toString()}.jpg`
  const sigPath = path.join(consentFormsDir, sigFilename)
  fs.writeFileSync(sigPath, buffer)

  patient.consentFormSaved = true
  patient.consentFormPath = `consent_forms/${sigFilename}` // Just save the signature path
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
}))

router.get('/:patientId', asyncHandler(async (req, res) => {
  const patient = await queries.getPatientById(req.params.patientId)
  if (!patient || !patient.consentFormSaved || !patient.consentFormPath) {
    return res.status(404).send('Consent form not found for this patient.')
  }

  const filePath = path.join(__dirname, '../..', patient.consentFormPath)
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Consent form signature not found on disk.')
  }

  // Generate HTML dynamically
  const base64Data = fs.readFileSync(filePath).toString('base64')
  const dateStr = new Date(patient.consentSignedAt).toLocaleDateString('en-IN', {
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
    <div class="field" style="grid-column: span 2;"><span class="label">Chief Complaint</span><span class="value">${patient.complaint || 'General check-up'}</span></div>
  </div>
  <div class="text-block">
    I hereby authorize the clinical team of Dr. Mahe's Dentistry to perform dental procedures, diagnostic scans and treatments as necessary to address my condition. I understand that the clinical options, costs and risks have been discussed and I consent to proceed with the treatment plan.
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

  res.setHeader('Content-Type', 'text/html')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  res.send(consentHtml)
}))

module.exports = router
