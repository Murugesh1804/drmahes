const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

/**
 * GET /api/diagnoses/appointment/:aid
 * Get diagnosis for a specific appointment
 */
router.get('/appointment/:aid', asyncHandler(async (req, res) => {
  res.json(await queries.getDiagnosisByAppointment(req.params.aid))
}))

/**
 * GET /api/diagnoses/patient/:pid
 * Get all diagnoses for a patient
 */
router.get('/patient/:pid', asyncHandler(async (req, res) => {
  res.json(await queries.getDiagnosisByPatient(req.params.pid))
}))

/**
 * POST /api/diagnoses
 * Record a new diagnosis
 */
router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await queries.recordDiagnosis(req.body))
}))

/**
 * PUT /api/diagnoses/:id
 * Update an existing diagnosis
 */
router.put('/:id', asyncHandler(async (req, res) => {
  res.json(await queries.updateDiagnosis(req.params.id, req.body))
}))

module.exports = router
