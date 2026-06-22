const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

// GET /filtered — Treatments with date range filters
router.get('/filtered', asyncHandler(async (req, res) => {
  const { startDate, endDate, patientId, status } = req.query
  res.json(await queries.getTreatmentsFiltered({ startDate, endDate, patientId, status }))
}))

// GET /unbilled/:patientId — Completed unbilled treatments for a patient
router.get('/unbilled/:patientId', asyncHandler(async (req, res) => {
  res.json(await queries.getUnbilledTreatments(req.params.patientId))
}))

router.get('/appointment/:aid', asyncHandler(async (req, res) => {
  res.json(await queries.getTreatmentsByAppointment(req.params.aid))
}))

router.get('/patient/:pid', asyncHandler(async (req, res) => {
  res.json(await queries.getTreatmentsByPatient(req.params.pid))
}))

router.get('/bill/:bid', asyncHandler(async (req, res) => {
  res.json(await queries.getTreatmentsByBill(req.params.bid))
}))

router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await queries.addTreatment(req.body))
}))

router.put('/:id', asyncHandler(async (req, res) => {
  res.json(await queries.updateTreatment(req.params.id, req.body))
}))

router.delete('/:id', asyncHandler(async (req, res) => {
  res.json(await queries.deleteTreatment(req.params.id))
}))

module.exports = router

