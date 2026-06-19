const express = require('express')
const router = express.Router()
const queries = require('../queries')
const asyncHandler = require('../middleware/asyncHandler')

router.get('/today', asyncHandler(async (req, res) => {
  res.json(await queries.getTodayQueue())
}))

// ── SSE — real-time queue stream ────────────────────────────
const sseClients = new Set()

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // Disable Nginx buffering if behind proxy
  res.flushHeaders()

  const sendQueue = async () => {
    try {
      const data = await queries.getTodayQueue()
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    } catch (e) {
      res.write(`data: []\n\n`)
    }
  }

  // Send immediately on connect
  sendQueue()

  // Push every 10 seconds
  const interval = setInterval(sendQueue, 10000)
  sseClients.add(res)

  req.on('close', () => {
    clearInterval(interval)
    sseClients.delete(res)
  })
})

// Exported so appointment status changes can trigger a push
async function broadcastQueue() {
  if (sseClients.size === 0) return
  try {
    const data = await queries.getTodayQueue()
    const payload = `data: ${JSON.stringify(data)}\n\n`
    sseClients.forEach(client => {
      try { client.write(payload) } catch (_) {}
    })
  } catch (e) {}
}

module.exports = router
module.exports.broadcastQueue = broadcastQueue
