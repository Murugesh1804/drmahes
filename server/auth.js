// server/auth.js — JWT authentication helpers
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { Setting } = require('./db')

/**
 * Initialize JWT_SECRET with strict validation for production
 * In production, require JWT_SECRET to be explicitly set in .env
 * In development, use a warning-flagged default
 */
function initializeJwtSecret() {
  let secret = process.env.JWT_SECRET
  
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[auth] FATAL: JWT_SECRET must be explicitly set in .env for production. ' +
        'Please set JWT_SECRET to a strong, random string (minimum 32 characters).'
      )
    }
    // Development: use default but warn loudly
    secret = 'drmahes-cms-secret-change-in-prod-2024'
    console.warn('\n⚠️ WARNING: JWT_SECRET not set. Using default development secret.')
    console.warn('⚠️ This is INSECURE for production. Set JWT_SECRET in .env immediately.\n')
  }
  
  return secret
}

const JWT_SECRET = initializeJwtSecret()
const JWT_EXPIRES = process.env.JWT_EXPIRES || '24h'

/**
 * POST /api/auth/login
 * Accepts { password }, validates against bcrypt hash stored in MongoDB.
 * Returns signed JWT on success.
 */
async function handleLogin(req, res) {
  try {
    const { password } = req.body
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' })
    }

    // Fetch stored password from settings
    const setting = await Setting.findOne({ key: 'cms_password' }).lean()
    if (!setting || !setting.value) {
      return res.status(500).json({ error: 'CMS password not configured' })
    }

    const stored = setting.value
    let valid = false

    // Support both bcrypt hashes ($2b$...) and legacy plaintext
    if (stored.startsWith('$2b$') || stored.startsWith('$2a$')) {
      valid = await bcrypt.compare(password, stored)
    } else {
      // Plaintext legacy — compare directly, then auto-upgrade to bcrypt
      valid = (password === stored)
      if (valid) {
        // Upgrade to bcrypt hash silently
        const hash = await bcrypt.hash(stored, 10)
        await Setting.findOneAndUpdate({ key: 'cms_password' }, { value: hash })
        console.log('[auth] Upgraded cms_password to bcrypt hash')
      }
    }

    if (!valid) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    const token = jwt.sign(
      { role: 'cms', iat: Math.floor(Date.now() / 1000) },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    )

    res.json({ token, expiresIn: JWT_EXPIRES })
  } catch (err) {
    console.error('[auth] Login error:', err)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

/**
 * Express middleware — validates Bearer token on protected routes.
 * Skips public routes defined in server/index.js.
 */
function verifyToken(req, res, next) {
  const header = req.headers['authorization'] || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' })
    }
    return res.status(401).json({ error: 'Invalid token' })
  }
}

/**
 * Hash a password with bcrypt (cost factor 10 — balanced for VPS)
 */
async function hashPassword(plain) {
  return bcrypt.hash(plain, 10)
}

module.exports = { handleLogin, verifyToken, hashPassword }
