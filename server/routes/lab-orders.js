const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

/**
 * GET /api/lab-orders
 * List all lab work orders with optional filters
 */
router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 50)
  const { status, labName, patientId } = req.query
  res.json(await queries.getAllLabWorkOrders({ status, labName, patientId, page, limit }))
}))

/**
 * GET /api/lab-orders/:id
 * Get a single lab work order by ID
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const order = await queries.getLabWorkOrderById(req.params.id)
  if (!order) return res.status(404).json({ error: 'Lab work order not found' })
  res.json(order)
}))

/**
 * POST /api/lab-orders
 * Create a new dental lab work order
 */
router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await queries.createLabWorkOrder(req.body))
}))

/**
 * PUT /api/lab-orders/:id
 * Update status or details of a lab work order
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const order = await queries.updateLabWorkOrder(req.params.id, req.body)
  if (!order) return res.status(404).json({ error: 'Lab work order not found' })
  res.json(order)
}))

/**
 * DELETE /api/lab-orders/:id
 * Delete a lab work order
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  res.json(await queries.deleteLabWorkOrder(req.params.id))
}))

module.exports = router
