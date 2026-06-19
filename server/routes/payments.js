const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

/**
 * GET /api/payments/bill/:bid
 * Get all payments for a bill
 */
router.get('/bill/:bid', asyncHandler(async (req, res) => {
  res.json(await queries.getPaymentsByBill(req.params.bid))
}))

/**
 * POST /api/payments/:id/reverse
 * Reverse a payment
 */
router.post('/:id/reverse', asyncHandler(async (req, res) => {
  res.json(await queries.reversePayment(req.params.id, req.body.reason || ''))
}))

/**
 * POST /api/payments/:id/adjust
 * Adjust a payment amount
 */
router.post('/:id/adjust', asyncHandler(async (req, res) => {
  res.json(await queries.adjustPayment(
    req.params.id,
    req.body.amount,
    req.body.reason || ''
  ))
}))

module.exports = router
