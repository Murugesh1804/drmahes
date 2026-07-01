const express = require('express')
const router = express.Router()
const { handleLogin, handleVerifyOtp } = require('../auth')
const rateLimit = require('express-rate-limit')
const RateLimitMongo = require('rate-limit-mongo')

// Rate limiter for login attempts — 5 per 15 min per IP (failed requests only)
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

// Rate limiter for OTP verification — 10 per 15 min per IP
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP attempts. Please wait 15 minutes.' },
  skipSuccessfulRequests: true,
  store: new RateLimitMongo({
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-clinic',
    collectionName: 'rate-limit-otp',
    expireTimeMs: 15 * 60 * 1000,
    errorOnInitFailure: true,
  })
})

// Step 1: Password check → sends OTP email
router.post('/login', authLimiter, handleLogin)

// Step 2: OTP verification → issues JWT
router.post('/verify-otp', otpLimiter, handleVerifyOtp)

module.exports = router
