const express = require('express')
const router = express.Router()
const { handleLogin } = require('../auth')
const rateLimit = require('express-rate-limit')

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes.' },
  skipSuccessfulRequests: true,
})

router.post('/login', authLimiter, handleLogin)

module.exports = router
