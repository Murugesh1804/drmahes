const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

router.get('/stats', asyncHandler(async (req, res) => {
  const period = req.query.period || 'today'
  const date = req.query.date || null
  res.json(await queries.getDashboardStats(period, date))
}))

module.exports = router
