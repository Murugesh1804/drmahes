const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

// GET / — List all treatment masters (active by default)
router.get('/', asyncHandler(async (req, res) => {
  const includeInactive = req.query.all === 'true'
  res.json(await queries.getAllTreatmentMasters(includeInactive))
}))

// GET /search — Search by name
router.get('/search', asyncHandler(async (req, res) => {
  const q = req.query.q || ''
  res.json(await queries.searchTreatmentMasters(q))
}))

// POST / — Add new treatment master
router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await queries.addTreatmentMaster(req.body))
}))

// PUT /:id — Update treatment master
router.put('/:id', asyncHandler(async (req, res) => {
  const result = await queries.updateTreatmentMaster(req.params.id, req.body)
  if (!result) return res.status(404).json({ error: 'Treatment master not found' })
  res.json(result)
}))

// DELETE /:id — Soft delete (deactivate)
router.delete('/:id', asyncHandler(async (req, res) => {
  res.json(await queries.deleteTreatmentMaster(req.params.id))
}))

module.exports = router
