const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

router.get('/stats', asyncHandler(async (req, res) => {
  res.json(await queries.getDashboardStats())
}))

module.exports = router
