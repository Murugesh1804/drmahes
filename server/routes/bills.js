const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

router.get('/', asyncHandler(async (req, res) => {
  res.json(await queries.getAllBills())
}))

router.get('/patient/:pid', asyncHandler(async (req, res) => {
  res.json(await queries.getBillsByPatient(req.params.pid))
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const bill = await queries.getBillById(req.params.id)
  if (!bill) return res.status(404).json({ error: 'Bill not found' })
  res.json(bill)
}))

router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await queries.createBill(req.body))
}))

router.put('/:id/payment', asyncHandler(async (req, res) => {
  res.json(await queries.updateBillPayment(req.params.id, req.body))
}))

module.exports = router
