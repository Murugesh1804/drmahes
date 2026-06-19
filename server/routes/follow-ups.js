const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

/**
 * GET /api/follow-ups/pending
 * Get all pending follow-ups (due today or overdue)
 */
router.get('/pending', asyncHandler(async (req, res) => {
  res.json(await queries.getPendingFollowUps())
}))

/**
 * GET /api/follow-ups/patient/:pid
 * Get all follow-ups for a patient
 */
router.get('/patient/:pid', asyncHandler(async (req, res) => {
  const onlyPending = req.query.pending === 'true'
  res.json(await queries.getPatientFollowUps(req.params.pid, onlyPending))
}))

/**
 * POST /api/follow-ups
 * Create a new follow-up
 */
router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await queries.createFollowUp(req.body))
}))

/**
 * PUT /api/follow-ups/:id/complete
 * Mark a follow-up as completed
 */
router.put('/:id/complete', asyncHandler(async (req, res) => {
  res.json(await queries.completeFollowUp(req.params.id, req.body.appointment_id))
}))

module.exports = router
