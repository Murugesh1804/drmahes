// server/auth.js — JWT authentication helpers with 2FA (Email OTP)
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { Setting } = require('./db')
const { sendOtpEmail } = require('./email')

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

// ── OTP STORE ─────────────────────────────────────────────────────────────────
// In-memory store: key = sessionId (random), value = { code, expiresAt }
// Each entry is auto-cleaned after expiry to prevent memory leaks.
const otpStore = new Map()

const OTP_TTL_MS = 5 * 60 * 1000      // 5 minutes
const OTP_CLEANUP_INTERVAL = 60 * 1000 // Clean up expired OTPs every minute

// Periodic cleanup of expired OTPs
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of otpStore.entries()) {
    if (val.expiresAt <= now) {
      otpStore.delete(key)
    }
  }
}, OTP_CLEANUP_INTERVAL)

/**
 * Generate a cryptographically random 6-digit OTP code.
 */
function generateOtp() {
  // Use Math.random padded — for a medical admin portal this is sufficient.
  // For higher security, swap with: require('crypto').randomInt(100000, 999999)
  const crypto = require('crypto')
  return String(crypto.randomInt(100000, 1000000)).padStart(6, '0')
}

/**
 * POST /api/auth/login  (Step 1 — Password check)
 * Validates password. On success, generates a 6-digit OTP and emails it.
 * Returns { step: 'otp', sessionId } — no JWT yet.
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

    // ── 2FA: Generate OTP and send via email ────────────────────────────────
    const otpCode = generateOtp()

    // Unique session ID ties this OTP to a specific login attempt
    const crypto = require('crypto')
    const sessionId = crypto.randomBytes(24).toString('hex')

    otpStore.set(sessionId, {
      code: otpCode,
      expiresAt: Date.now() + OTP_TTL_MS,
    })

    // Get admin email: prefer DB setting, then env var, then SMTP_USER
    const adminEmailSetting = await Setting.findOne({ key: 'admin_email' }).lean()
    const adminEmail =
      (adminEmailSetting?.value) ||
      process.env.ADMIN_EMAIL ||
      process.env.SMTP_USER

    if (!adminEmail) {
      console.error('[auth] No admin email configured. Set ADMIN_EMAIL in .env or Settings.')
      return res.status(500).json({ error: 'Admin email not configured. Please set it in Settings.' })
    }

    await sendOtpEmail(adminEmail, otpCode)
    console.log(`[auth] OTP sent to ${adminEmail} (session: ${sessionId.slice(0, 8)}…)`)

    // Return sessionId — frontend will include it in the OTP verification call
    res.json({ step: 'otp', sessionId, expiresIn: OTP_TTL_MS / 1000 })

  } catch (err) {
    console.error('[auth] Login error:', err)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

/**
 * POST /api/auth/verify-otp  (Step 2 — OTP check)
 * Body: { sessionId, otp }
 * On success: issues JWT token.
 */
async function handleVerifyOtp(req, res) {
  try {
    const { sessionId, otp } = req.body

    if (!sessionId || !otp) {
      return res.status(400).json({ error: 'Session ID and OTP are required' })
    }

    const entry = otpStore.get(sessionId)

    if (!entry) {
      return res.status(401).json({ error: 'OTP session expired or invalid. Please start over.' })
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(sessionId)
      return res.status(401).json({ error: 'OTP has expired (5 minutes). Please start over.' })
    }

    // Timing-safe comparison to prevent timing attacks
    const crypto = require('crypto')
    const expectedBuf = Buffer.from(String(entry.code))
    const actualBuf   = Buffer.from(String(otp).trim())

    const valid =
      expectedBuf.length === actualBuf.length &&
      crypto.timingSafeEqual(expectedBuf, actualBuf)

    if (!valid) {
      return res.status(401).json({ error: 'Incorrect OTP. Please check your email.' })
    }

    // OTP used — delete immediately (single-use)
    otpStore.delete(sessionId)

    const token = jwt.sign(
      { role: 'cms', iat: Math.floor(Date.now() / 1000) },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    )

    console.log('[auth] 2FA verified — JWT issued')
    res.json({ token, expiresIn: JWT_EXPIRES })

  } catch (err) {
    console.error('[auth] OTP verification error:', err)
    res.status(500).json({ error: 'Verification failed' })
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

module.exports = { handleLogin, handleVerifyOtp, verifyToken, hashPassword }
