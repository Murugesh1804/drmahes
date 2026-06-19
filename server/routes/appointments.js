const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

router.get('/pending-calls', asyncHandler(async (req, res) => {
  res.json(await queries.getPendingCalls())
}))

router.get('/today', asyncHandler(async (req, res) => {
  res.json(await queries.getTodayAppointments())
}))

router.get('/date/:date', asyncHandler(async (req, res) => {
  res.json(await queries.getAppointmentsByDate(req.params.date))
}))

router.get('/patient/:pid', asyncHandler(async (req, res) => {
  res.json(await queries.getPatientAppointments(req.params.pid))
}))

router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await queries.addAppointment(req.body))
}))

router.put('/:id', asyncHandler(async (req, res) => {
  res.json(await queries.updateAppointment(req.params.id, req.body))
}))

router.put('/:id/status', asyncHandler(async (req, res) => {
  res.json(await queries.updateAppointmentStatus(req.params.id, req.body.status))
}))

router.put('/:id/call-status', asyncHandler(async (req, res) => {
  res.json(await queries.updateAppointmentCallStatus(req.params.id, req.body.status))
}))

// FIX #3.2: Appointment cancellation with reason tracking
router.post('/:id/cancel', asyncHandler(async (req, res) => {
  res.json(await queries.cancelAppointment(
    req.params.id,
    req.body.reason || 'other',
    req.body.cancelled_by || 'staff'
  ))
}))

router.delete('/:id', asyncHandler(async (req, res) => {
  res.json(await queries.deleteAppointment(req.params.id))
}))

module.exports = router
