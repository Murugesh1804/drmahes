const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

// GET /api/enquiries - List all enquiries, optionally search
router.get('/', asyncHandler(async (req, res) => {
  const q = req.query.q || ''
  if (q.trim().length >= 2) {
    const data = await queries.searchEnquiries(q)
    return res.json(data)
  }
  const data = await queries.getAllEnquiries()
  res.json(data)
}))

// POST /api/enquiries - Add new enquiry
router.post('/', asyncHandler(async (req, res) => {
  const enquiry = await queries.addEnquiry(req.body)
  res.status(201).json(enquiry)
}))

// PATCH /api/enquiries/:id/status - Update enquiry status
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body
  const updated = await queries.updateEnquiryStatus(req.params.id, status)
  if (!updated) return res.status(404).json({ error: 'Enquiry not found' })
  res.json(updated)
}))

// DELETE /api/enquiries/:id - Delete enquiry
router.delete('/:id', asyncHandler(async (req, res) => {
  const success = await queries.deleteEnquiry(req.params.id)
  if (!success) return res.status(404).json({ error: 'Enquiry not found' })
  res.json({ success: true })
}))

module.exports = router
