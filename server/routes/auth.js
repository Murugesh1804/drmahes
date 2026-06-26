const express = require('express')
const router = express.Router()
const { handleLogin } = require('../auth')
const rateLimit = require('express-rate-limit')
const RateLimitMongo = require('rate-limit-mongo')

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes.' },
  skipSuccessfulRequests: true,
  store: new RateLimitMongo({
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-clinic',
    collectionName: 'rate-limit-auth',
    expireTimeMs: 15 * 60 * 1000,
    errorOnInitFailure: true,
  })
})

router.post('/login', authLimiter, handleLogin)

module.exports = router
