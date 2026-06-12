const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'server', 'routes');
if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir);

const routes = {
  'patients.js': `const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

router.get('/', asyncHandler(async (req, res) => {
  res.json(await queries.getAllPatients())
}))

router.get('/search', asyncHandler(async (req, res) => {
  res.json(await queries.searchPatients(req.query.q || ''))
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const patient = await queries.getPatientById(req.params.id)
  if (!patient) return res.status(404).json({ error: 'Patient not found' })
  res.json(patient)
}))

router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await queries.addPatient(req.body))
}))

router.put('/:id', asyncHandler(async (req, res) => {
  res.json(await queries.updatePatient(req.params.id, req.body))
}))

module.exports = router
`,
  'appointments.js': `const express = require('express')
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

router.delete('/:id', asyncHandler(async (req, res) => {
  res.json(await queries.deleteAppointment(req.params.id))
}))

module.exports = router
`,
  'treatments.js': `const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

router.get('/appointment/:aid', asyncHandler(async (req, res) => {
  res.json(await queries.getTreatmentsByAppointment(req.params.aid))
}))

router.get('/patient/:pid', asyncHandler(async (req, res) => {
  res.json(await queries.getTreatmentsByPatient(req.params.pid))
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
`,
  'bills.js': `const express = require('express')
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
`,
  'queue.js': `const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

router.get('/today', asyncHandler(async (req, res) => {
  res.json(await queries.getTodayQueue())
}))

module.exports = router
`,
  'settings.js': `const express = require('express')
const router = express.Router()
const queries = require('../queries')
const bcrypt = require('bcryptjs')
const asyncHandler = require('../middleware/asyncHandler')

router.get('/', asyncHandler(async (req, res) => {
  const list = await queries.getSettings()
  const safe = { ...list }
  if (safe.cms_password) {
    safe.cms_password = '••••••••'
  }
  res.json(safe)
}))

router.put('/:key', asyncHandler(async (req, res) => {
  const { value } = req.body
  const key = req.params.key

  if (key === 'cms_password' && value && !value.startsWith('$2b$')) {
    const hashed = await bcrypt.hash(value, 10)
    return res.json(await queries.setSetting(key, hashed))
  }

  res.json(await queries.setSetting(key, value))
}))

module.exports = router
`,
  'slots.js': `const express = require('express')
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
`,
  'dashboard.js': `const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

router.get('/stats', asyncHandler(async (req, res) => {
  res.json(await queries.getDashboardStats())
}))

module.exports = router
`
};

for (const [file, content] of Object.entries(routes)) {
  fs.writeFileSync(path.join(routesDir, file), content);
}
console.log('Routes generated');
