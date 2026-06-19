const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

router.get('/', asyncHandler(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 20
  const includeArchived = req.query.includeArchived === 'true'
  res.json(await queries.getAllPatients(limit, includeArchived))
}))

router.get('/search', asyncHandler(async (req, res) => {
  res.json(await queries.searchPatients(req.query.q || ''))
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const patient = await queries.getPatientById(req.params.id)
  if (!patient) return res.status(404).json({ error: 'Patient not found' })
  res.json(patient)
}))

router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await queries.addPatient(req.body))
}))

router.put('/:id', asyncHandler(async (req, res) => {
  res.json(await queries.updatePatient(req.params.id, req.body))
}))

// FIX #3.1: Patient archiving endpoints
router.post('/:id/archive', asyncHandler(async (req, res) => {
  res.json(await queries.archivePatient(req.params.id, req.body.reason || '', req.body.archived_by || 'admin'))
}))

router.post('/:id/unarchive', asyncHandler(async (req, res) => {
  res.json(await queries.unarchivePatient(req.params.id))
}))

module.exports = router
