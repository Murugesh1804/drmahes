const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

// GET / — List payments with filters
router.get('/', asyncHandler(async (req, res) => {
  const { consultant, status, startDate, endDate, page, limit } = req.query
  res.json(await queries.getConsultantPayments({
    consultant,
    status,
    startDate,
    endDate,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 50
  }))
}))

// GET /monthly-report — Monthly summary grouped by consultant
router.get('/monthly-report', asyncHandler(async (req, res) => {
  const month = parseInt(req.query.month) || new Date().getMonth() + 1
  const year = parseInt(req.query.year) || new Date().getFullYear()
  res.json(await queries.getConsultantMonthlyReport(month, year))
}))

// GET /outstanding — All outstanding dues grouped by consultant
router.get('/outstanding', asyncHandler(async (req, res) => {
  res.json(await queries.getConsultantOutstandingDues())
}))

// POST / — Add new consultant payment
router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await queries.addConsultantPayment(req.body))
}))

// PUT /:id — Update consultant payment
router.put('/:id', asyncHandler(async (req, res) => {
  const result = await queries.updateConsultantPayment(req.params.id, req.body)
  if (!result) return res.status(404).json({ error: 'Payment not found' })
  res.json(result)
}))

// PUT /:id/pay — Record a payment amount
router.put('/:id/pay', asyncHandler(async (req, res) => {
  const result = await queries.recordConsultantPaymentAmount(
    req.params.id,
    req.body.amount,
    req.body.payment_method
  )
  if (!result) return res.status(404).json({ error: 'Payment not found' })
  res.json(result)
}))

// DELETE /:id — Delete consultant payment
router.delete('/:id', asyncHandler(async (req, res) => {
  res.json(await queries.deleteConsultantPayment(req.params.id))
}))

module.exports = router
