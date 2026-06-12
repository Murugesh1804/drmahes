const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

router.get('/blocked', asyncHandler(async (req, res) => {
  if (!req.query.date) return res.status(400).json({ error: 'date query param required' })
  res.json(await queries.getBlockedSlots(req.query.date))
}))

router.post('/block', asyncHandler(async (req, res) => {
  if (!req.body.date || !req.body.slot) return res.status(400).json({ error: 'date and slot are required' })
  res.status(201).json(await queries.blockSlot(req.body.date, req.body.slot, req.body.reason || ''))
}))

router.delete('/block', asyncHandler(async (req, res) => {
  if (!req.body.date || !req.body.slot) return res.status(400).json({ error: 'date and slot are required' })
  res.json(await queries.unblockSlot(req.body.date, req.body.slot))
}))

module.exports = router
