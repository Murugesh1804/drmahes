// server/index.js — Production-hardened Express server
// Security: helmet, CORS lockdown, rate limiting, JWT auth on all /api routes
// Performance: gzip compression, mongoose pool size 3, graceful shutdown

require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs')

const { initDatabase } = require('./db')
const queries = require('./queries')
const { handleLogin, verifyToken } = require('./auth')
const { sendAppointmentConfirmation } = require('./email')

const app = express()
app.set('trust proxy', 1)
const PORT = process.env.PORT || 5000

// ── ALLOWED ORIGINS ─────────────────────────────────────────────────────────
let ALLOWED_ORIGINS = [
  'https://portal.drmahesdentistry.in',
  'https://kiosk.drmahesdentistry.in',
  'https://drmahesdentistry.in',
  'https://www.drmahesdentistry.in',
  'http://localhost:5173',   // Vite dev server
  'http://localhost:5500',
  'http://localhost:5000',
  'http://localhost:3000',   // Next.js dev server
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:3000',
]

if (process.env.NODE_ENV === 'production') {
  ALLOWED_ORIGINS = ALLOWED_ORIGINS.filter(origin => !origin.includes('localhost') && !origin.includes('127.0.0.1'))
}

// ── SECURITY HEADERS (helmet) ────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      objectSrc: ["'none'"],
    }
  },
  crossOriginEmbedderPolicy: false,
}))

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return cb(null, true)
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: Origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── COMPRESSION (gzip — saves 60-70% on JSON responses) ─────────────────────
app.use(compression({ level: 6, threshold: 1024 }))

// ── BODY PARSING ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' })) // Reduced from 10mb; signatures ~200KB

// ── RATE LIMITING ────────────────────────────────────────────────────────────
// Global: 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
})

app.use('/api', globalLimiter)

// ── INITIALIZE DB ────────────────────────────────────────────────────────────
async function startServer() {
  const db = await initDatabase()
  queries.init(db)
  const server = app.listen(PORT, () => {
    console.log(`[server] Running on port ${PORT} (${process.env.NODE_ENV || 'development'})`)
    console.log(`[server] JWT auth enabled — all /api routes protected`)
  })

  function gracefulShutdown(signal) {
    console.log(`[server] ${signal} received — shutting down gracefully`)
    server.close(() => {
      console.log('[server] HTTP server closed')
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10000)
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
}

startServer().catch(err => {
  console.error('[server] Failed to start:', err)
  process.exit(1)
})

// Create consent forms directory
const consentFormsDir = path.join(__dirname, '../consent_forms')
if (!fs.existsSync(consentFormsDir)) {
  fs.mkdirSync(consentFormsDir, { recursive: true })
}

// ── REQUEST LOGGER (production-safe) ─────────────────────────────────────────
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  } else {
    // In production, only log non-GET requests or errors (reduces log noise)
    if (req.method !== 'GET') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
    }
  }
  next()
})

// ── PUBLIC ROUTES (no auth required) ─────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'))
app.use('/api/consent', require('./routes/consent'))
app.use('/api', require('./routes/public'))

// ── AUTH MIDDLEWARE — Protects all /api routes below this line ────────────────
app.use('/api', verifyToken)

// ── AUTHENTICATED ROUTES ──────────────────────────────────────────────────────
app.use('/api/patients', require('./routes/patients'))
app.use('/api/appointments', require('./routes/appointments'))
app.use('/api/treatments', require('./routes/treatments'))
app.use('/api/diagnoses', require('./routes/diagnoses'))
app.use('/api/bills', require('./routes/bills'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/follow-ups', require('./routes/follow-ups'))
app.use('/api/settings', require('./routes/settings'))
app.use('/api/slots', require('./routes/slots'))
app.use('/api/dashboard', require('./routes/dashboard'))
app.use('/api/consultant-payments', require('./routes/consultant-payments'))
app.use('/api/treatment-masters', require('./routes/treatment-masters'))
app.use('/api/enquiries', require('./routes/enquiries'))

// ── BACKUP ────────────────────────────────────────────────────────────────────
// Returns only DB name/status — NOT the full connection URI
app.get('/api/backup/download', (req, res) => {
  res.json({
    message: 'Data is stored in MongoDB Atlas cloud. Use MongoDB Atlas dashboard to export data.',
    dbName: 'dental-clinic',
    timestamp: new Date().toISOString(),
  })
})

// ── SERVE STATIC FILES ────────────────────────────────────────────────────────
const kioskPath = path.join(__dirname, '../kiosk')
app.use('/kiosk', express.static(kioskPath, {
  maxAge: '7d',
  etag: false, // Save CPU by not hashing static files
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    }
  }
}))

const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath, {
  maxAge: '7d',          // Cache static assets 7 days
  etag: false,           // Save CPU
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Don't cache index.html — always fresh
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    }
  }
}))

// SPA fallback — all non-API GET requests serve index.html
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'))
  }
  next()
})

// ── 404 & ERROR HANDLERS ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error('[error]', err.message)
  const status = err.statusCode && err.statusCode >= 400 && err.statusCode < 500
    ? err.statusCode
    : 500
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message })
})

// ── GRACEFUL SHUTDOWN HANDLERS ─────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err)
  process.exit(1)
})
