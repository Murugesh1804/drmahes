const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

router.get('/insights', asyncHandler(async (req, res) => {
  res.json(await queries.getRevenueInsights())
}))

module.exports = router
