const express = require('express')
const router = express.Router()
const { Patient, Appointment } = require('../db')
const queries = require('../queries')
const { sendAppointmentConfirmation } = require('../email')
const rateLimit = require('express-rate-limit')
const RateLimitMongo = require('rate-limit-mongo')
const asyncHandler = require('../middleware/asyncHandler')
const { isValidDateString, isValidEmail, isValidTimeSlot } = require('../validation')

const publicFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please try again later.' },
  store: new RateLimitMongo({
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-clinic',
    collectionName: 'rate-limit-public',
    expireTimeMs: 60 * 60 * 1000,
    errorOnInitFailure: true,
  })
})

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  })
})

router.post('/appointments/website-book', publicFormLimiter, asyncHandler(async (req, res) => {
  const { patientName, patientPhone, patientEmail, service, date, timeSlot } = req.body

  if (!patientName || !patientPhone || !date) {
    return res.status(400).json({ error: 'Name, Phone and Date are required' })
  }

  const phone = patientPhone.trim()
  const email = patientEmail ? patientEmail.trim().toLowerCase() : null

  if (!isValidDateString(date)) {
    return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' })
  }

  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  if (timeSlot && !isValidTimeSlot(timeSlot)) {
    return res.status(400).json({ error: 'Invalid time slot selected' })
  }

  let patient = await Patient.findOne({ phone })
  if (!patient && email) {
    patient = await Patient.findOne({ email })
  }

  if (!patient) {
    patient = await queries.addPatient({
      name: patientName.trim(),
      phone,
      email,
      notes: `Registered via website booking (${email || 'No Email'})`,
      registration_source: 'website-booking'
    })
  } else {
    if (!patient.phone && phone) patient.phone = phone
    if (!patient.email && email) patient.email = email
    await patient.save()
  }

  if (timeSlot) {
    const blocked = await queries.getBlockedSlots(date)
    const blockedSlots = blocked.map(r => r.slot)
    if (blockedSlots.includes(timeSlot)) {
      return res.status(409).json({ error: 'This appointment slot is blocked' })
    }

    const existing = await queries.getAppointmentsByDate(date)
    const bookedSlots = existing
      .filter(a => a.status !== 'cancelled')
      .map(a => a.scheduled_time)
      .filter(Boolean)
    if (bookedSlots.includes(timeSlot)) {
      return res.status(409).json({ error: 'This appointment slot is already booked' })
    }
  }

  const appt = await queries.addAppointment({
    patient_id: patient._id.toString(),
    scheduled_date: date,
    scheduled_time: timeSlot || '',
    reason: service,
    notes: 'Website online booking',
    call_status: 'pending'
  })

  if (email) {
    sendAppointmentConfirmation(email, patientName.trim(), date, timeSlot, service)
      .catch(err => console.error('[email-trigger] Error sending confirmation email in background:', err))
  }

  res.status(201).json({ patient, appt })
}))

router.get('/appointments/available-slots', asyncHandler(async (req, res) => {
  const { date } = req.query
  if (!date) {
    return res.status(400).json({ error: 'Date query parameter is required' })
  }

  const allSlots = [
    '10:00 AM', '11:00 AM', '12:00 PM',
    '04:00 PM', '05:00 PM', '06:00 PM',
    '07:00 PM', '08:00 PM', '09:00 PM'
  ]

  const booked = await Appointment.find({
    scheduled_date: date,
    status: { $ne: 'cancelled' }
  }).select('scheduled_time').lean()

  const bookedSlots = booked.map(a => a.scheduled_time).filter(Boolean)

  const blockedRecords = await queries.getBlockedSlots(date)
  const blockedSlots = blockedRecords.map(r => r.slot)

  const takenSlots = new Set([...bookedSlots, ...blockedSlots])
  const availableSlots = allSlots.filter(slot => !takenSlots.has(slot))

  res.json({ date, availableSlots })
}))

router.get('/webhook/whatsapp', (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge)
  }

  return res.sendStatus(403)
})

module.exports = router
