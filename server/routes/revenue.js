const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

router.get('/insights', asyncHandler(async (req, res) => {
  const { startDate, endDate, period } = req.query
  res.json(await queries.getRevenueInsights({ startDate, endDate, period }))
}))

module.exports = router
