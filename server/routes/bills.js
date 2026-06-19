const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')
const email = require('../email')

router.get('/', asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 50)
  res.json(await queries.getAllBills(page, limit))
}))

router.get('/patient/:pid', asyncHandler(async (req, res) => {
  res.json(await queries.getBillsByPatient(req.params.pid))
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const bill = await queries.getBillById(req.params.id)
  if (!bill) return res.status(404).json({ error: 'Bill not found' })
  res.json(bill)
}))

router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await queries.createBill(req.body))
}))

router.put('/:id/payment', asyncHandler(async (req, res) => {
  res.json(await queries.updateBillPayment(req.params.id, req.body))
}))

// ── Payment history for a bill ──────────────────────────────
router.get('/:id/payments', asyncHandler(async (req, res) => {
  res.json(await queries.getPaymentsByBill(req.params.id))
}))

// ── Refund a bill ───────────────────────────────────────────
router.post('/:id/refund', asyncHandler(async (req, res) => {
  const { amount } = req.body
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid refund amount' })
  res.json(await queries.refundBillPayment(req.params.id, amount))
}))

// ── Email invoice ───────────────────────────────────────────
router.post('/:id/email', asyncHandler(async (req, res) => {
  const bill = await queries.getBillById(req.params.id)
  if (!bill) return res.status(404).json({ error: 'Bill not found' })

  const toEmail = req.body.email
  if (!toEmail) return res.status(400).json({ error: 'Email address required' })

  let treatments = []
  if (bill.appointment_id) {
    treatments = await queries.getTreatmentsByAppointment(bill.appointment_id)
  }

  const result = await email.sendInvoiceEmail(toEmail, bill, treatments)
  if (!result.success) return res.status(500).json({ error: result.error })
  res.json({ success: true })
}))

module.exports = router
