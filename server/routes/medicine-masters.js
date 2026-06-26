const express = require('express')
const router = express.Router()
const queries = require('../queries')

// GET / — List all medicine masters (active by default)
router.get('/', async (req, res, next) => {
  try {
    const includeInactive = req.query.all === 'true'
    res.json(await queries.getAllMedicineMasters(includeInactive))
  } catch (err) { next(err) }
})

// GET /search — Search by name
router.get('/search', async (req, res, next) => {
  try {
    const q = req.query.q || ''
    res.json(await queries.searchMedicineMasters(q))
  } catch (err) { next(err) }
})

// POST / — Add new medicine master
router.post('/', async (req, res, next) => {
  try {
    res.status(201).json(await queries.addMedicineMaster(req.body))
  } catch (err) { next(err) }
})

// PUT /:id — Update medicine master
router.put('/:id', async (req, res, next) => {
  try {
    const result = await queries.updateMedicineMaster(req.params.id, req.body)
    if (!result) return res.status(404).json({ error: 'Medicine/Product not found' })
    res.json(result)
  } catch (err) { next(err) }
})

// DELETE /:id — Soft delete
router.delete('/:id', async (req, res, next) => {
  try {
    res.json(await queries.deleteMedicineMaster(req.params.id))
  } catch (err) { next(err) }
})

module.exports = router
