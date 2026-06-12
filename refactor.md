# Dental Clinic CMS — Refactor, Optimize & Production Guide

> Analyzed files: `server/index.js` (770 lines), `server/queries.js` (596 lines), `server/db.js`, `server/auth.js`, `server/email.js`, `src/App.jsx`, `src/services/api.js`, `src/pages/` (10 pages), `src/components/` (3 components).

---

## 🔴 Priority 1 — Critical (Fix Before Production)

### 1. Hardcoded Secrets → Move to `.env`

**Files affected:** `server/index.js` L364, `server/db.js` L160

```diff
- const VERIFY_TOKEN = 'drmahe123'       // server/index.js:364
+ const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN

- const hashedPassword = await bcrypt.hash('admin123', 10)  // db.js:160
+ const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || 'change-me-now', 10)
```

**Add to `.env`:**
```
WHATSAPP_VERIFY_TOKEN=your-secret-token
DEFAULT_ADMIN_PASSWORD=your-strong-password
```

> [!CAUTION]
> `'drmahe123'` is a public hardcoded webhook token — anyone can spoof WhatsApp webhook calls to your server. Change immediately.

---

### 2. N+1 Query in `getPatientAppointments`

**File:** [`queries.js` L180–203](file:///c:/Users/dhana/projects/Clinic/server/queries.js#L180-L203)

Currently fetches treatments **inside a loop** — one DB query per appointment:

```js
// ❌ BAD — N+1 queries (1 appointment query + N treatment queries)
for (const a of appts) {
  const txs = await Treatment.find({ appointment_id: a._id })...
}
```

**Fix — use `$lookup` aggregation:**
```js
async function getPatientAppointments(patientId) {
  if (!isValidObjectId(patientId)) return []

  return Appointment.aggregate([
    { $match: { patient_id: new mongoose.Types.ObjectId(patientId) } },
    {
      $lookup: {
        from: 'treatments',
        localField: '_id',
        foreignField: 'appointment_id',
        as: 'treatments'
      }
    },
    {
      $addFields: {
        id: { $toString: '$_id' },
        patient_id: { $toString: '$patient_id' },
        treatment_count: { $size: '$treatments' },
        treatment_total: { $sum: '$treatments.cost' }
      }
    },
    { $sort: { scheduled_date: -1 } }
  ])
}
```

---

### 3. `createBill` Saves Treatments Sequentially

**File:** [`queries.js` L444–457](file:///c:/Users/dhana/projects/Clinic/server/queries.js#L444-L457)

```js
// ❌ BAD — sequential saves inside a loop
for (const t of data.treatments) {
  await tx.save()
}

// ✅ GOOD — bulk insert
await Treatment.insertMany(treatments)
```

---

## 🟠 Priority 2 — Architecture (Major Wins)

### 4. Split `server/index.js` into Route Modules

`server/index.js` is **770 lines** with all routes in one file. This is the biggest maintainability issue.

**Proposed structure:**
```
server/
├── index.js          ← Keep only: middleware, DB init, static files, error handlers
├── routes/
│   ├── auth.js       ← POST /api/auth/login
│   ├── patients.js   ← GET/POST/PUT /api/patients
│   ├── appointments.js
│   ├── treatments.js
│   ├── bills.js
│   ├── slots.js
│   ├── queue.js
│   ├── settings.js
│   ├── consent.js
│   └── dashboard.js
├── middleware/
│   ├── rateLimiters.js  ← Move the 3 rate limiter definitions here
│   └── logger.js        ← Move the request logger here
├── db.js
├── queries.js
├── auth.js
└── email.js
```

**`server/index.js` after refactor (~80 lines):**
```js
const app = express()
// ... middleware setup ...
app.use('/api/patients',    require('./routes/patients'))
app.use('/api/appointments',require('./routes/appointments'))
// ... etc
```

---

### 5. Lazy-Load React Pages

**File:** [`src/App.jsx`](file:///c:/Users/dhana/projects/Clinic/src/App.jsx)

All 10 pages are imported eagerly — they load in the initial bundle even if the user never visits them.

```js
// ❌ Current — all pages in one bundle
import Dashboard from './pages/Dashboard'
import Billing from './pages/Billing'     // 33KB — largest page!
// ...

// ✅ Fix — lazy load with Suspense
import { lazy, Suspense } from 'react'
const Dashboard     = lazy(() => import('./pages/Dashboard'))
const Billing       = lazy(() => import('./pages/Billing'))
const Appointments  = lazy(() => import('./pages/Appointments'))
// ... all other pages

// Wrap Routes in Suspense:
<Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
  <Routes>...</Routes>
</Suspense>
```

> [!TIP]
> `Billing.jsx` (33KB) and `Appointments.jsx` (23KB) are the largest pages. Lazy loading them saves significant initial load time.

---

### 6. Dashboard Stats — Parallel Queries Instead of Sequential

**File:** [`queries.js` L548–579](file:///c:/Users/dhana/projects/Clinic/server/queries.js#L548-L579)

Currently runs **7 separate DB queries** sequentially:

```js
// ❌ Sequential — each query waits for the previous
const totalPatients = await Patient.countDocuments()
const todayTotal    = await Appointment.countDocuments(...)
// ...

// ✅ Parallel — all run at the same time (~7x faster)
const [totalPatients, todayTotal, todayWaiting, todayInProgress, todayDone, billsToday, pendingBills] =
  await Promise.all([
    Patient.countDocuments(),
    Appointment.countDocuments({ scheduled_date: today }),
    Appointment.countDocuments({ scheduled_date: today, status: 'waiting' }),
    Appointment.countDocuments({ scheduled_date: today, status: 'in-progress' }),
    Appointment.countDocuments({ scheduled_date: today, status: 'done' }),
    Bill.find({ created_at: { $gte: startOfDay, $lte: endOfDay } }).select('paid_amount').lean(),
    Bill.find({ status: { $ne: 'paid' } }).select('balance').lean()
  ])
```

---

## 🟡 Priority 3 — Storage Optimization

### 7. Consent Form Storage — Biggest Storage Issue

**File:** [`server/index.js` L253–318](file:///c:/Users/dhana/projects/Clinic/server/index.js#L253-L318)

Currently each consent form stores **two files** on disk:
- `sig_<id>_<timestamp>.jpg` — binary signature image
- `consent_<id>_<timestamp>.html` — full HTML with **base64-encoded signature embedded inline**

This means the signature data is **stored twice** per patient. Over time:
- 100 patients → ~20MB+ in `consent_forms/`
- No cleanup mechanism exists

**Recommended fixes:**

**Option A — Store only the HTML (delete the separate .jpg):**
```js
// The HTML already contains the base64 image — no need for a separate .jpg file
// Remove: fs.writeFileSync(sigPath, buffer)
// Remove: const sigFilename = ...
```

**Option B — Store only the signature image, generate HTML on demand:**
```js
// Store only sig_<id>.jpg (overwrite on re-consent, don't timestamp)
const sigFilename = `sig_${patient._id.toString()}.jpg`
// Generate HTML dynamically at GET /api/consent/:id instead of storing it
```

**Option C — Store signatures in MongoDB GridFS (for VPS with limited disk):**
Saves disk entirely — signatures stored in MongoDB Atlas with automatic redundancy.

**Add a cleanup cron for old consent forms (> 1 year):**
```js
// server/scripts/cleanupConsents.js
const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000
fs.readdirSync(consentFormsDir).forEach(file => {
  const stat = fs.statSync(path.join(consentFormsDir, file))
  if (stat.mtimeMs < oneYearAgo) fs.unlinkSync(...)
})
```

---

### 8. Remove Unused Dependency: `mongoose` + SQLite Conflict

**File:** [`package.json`](file:///c:/Users/dhana/projects/Clinic/package.json)

You have **both** `mongoose` AND `node-sqlite3-wasm` as dependencies. Looking at `db.js`, MongoDB/Mongoose is the only actual database used. The `dental_clinic.db` SQLite file in the root appears to be a leftover from an older version.

```diff
// package.json — remove if SQLite is unused:
- "node-sqlite3-wasm": "^0.8.57",
```

**Verify first:** Check if `dental_clinic.db` is still written to by running:
```powershell
grep -r "sqlite3" c:\Users\dhana\projects\Clinic\server\ --include="*.js"
```

If no results → safe to remove `node-sqlite3-wasm` and delete `dental_clinic.db`.

---

### 9. Remove `ngrok` from Production Dependencies

**File:** [`package.json` L24](file:///c:/Users/dhana/projects/Clinic/package.json#L24)

`ngrok` (a tunneling tool for local dev) is listed as a production dependency. It should be dev-only or removed entirely:

```diff
- "ngrok": "5.0.0-beta.2",     // In "dependencies" ← WRONG
+ // Move to devDependencies if used at all, or remove entirely
```

This saves ~15MB from production `node_modules`.

---

### 10. MongoDB Index Audit

**File:** [`server/db.js`](file:///c:/Users/dhana/projects/Clinic/server/db.js)

Existing indexes are good. Add these missing ones for faster queries:

```js
// appointmentSchema — add compound index for status + date (used in getTodayQueue)
appointmentSchema.index({ scheduled_date: 1, status: 1 })

// billSchema — missing index on status (used in getDashboardStats pendingBills query)
billSchema.index({ status: 1 })

// billSchema — missing index on created_at (used in today's revenue query)
billSchema.index({ created_at: 1 })
```

---

## 🟢 Priority 4 — Code Quality & Maintainability

### 11. Create a Shared Route Handler Wrapper

Every route in `index.js` has this exact same boilerplate:
```js
async (req, res) => {
  try {
    const result = await queries.something()
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
```

Create a tiny wrapper:
```js
// server/middleware/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

module.exports = asyncHandler
```

Then use it:
```js
// Clean, no try/catch noise
app.get('/api/patients', asyncHandler(async (req, res) => {
  const list = await queries.getAllPatients()
  res.json(list)
}))
```

---

### 12. Extract `allSlots` to a Constant

**File:** [`server/index.js` L195–199](file:///c:/Users/dhana/projects/Clinic/server/index.js#L195-L199)

The time slots array is hardcoded inside a route handler. It should be a shared constant:

```js
// server/constants.js
const CLINIC_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM',
  '07:00 PM', '08:00 PM', '09:00 PM'
]
module.exports = { CLINIC_SLOTS }
```

---

### 13. Frontend — Extract API Error Toast Pattern

Many pages likely repeat the same error handling pattern. Create a shared hook:

```js
// src/hooks/useApi.js
import { useState, useCallback } from 'react'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (fn) => {
    setLoading(true)
    setError(null)
    try {
      return await fn()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, execute }
}
```

---

### 14. Add `bcryptjs` Import at Top of File

**File:** [`server/index.js` L670](file:///c:/Users/dhana/projects/Clinic/server/index.js#L670)

`bcryptjs` is `require()`'d inside a route handler. This is inefficient — it loads the module fresh on every password update:

```diff
// At the top of server/index.js with other requires:
+ const bcrypt = require('bcryptjs')

// Remove the inline require:
- const bcrypt = require('bcryptjs')
  const hashed = await bcrypt.hash(value, 10)
```

---

## 📦 Storage Space Reduction Summary

| Item | Current | After Fix | Savings |
|------|---------|-----------|---------|
| `node-sqlite3-wasm` | ~8MB in node_modules | 0 | **~8MB** |
| `ngrok` package | ~15MB | 0 | **~15MB** |
| Duplicate consent form files | 2 files/patient | 1 file/patient | **~50%** |
| `dental_clinic.db` | 52KB + grows | Delete | **52KB+** |
| Vite build (lazy loading) | 1 large bundle | Split chunks | **~40% less initial JS** |

---

## ✅ Production Checklist

| # | Check | Status |
|---|-------|--------|
| 1 | `NODE_ENV=production` set on server | Verify in `.env` |
| 2 | No hardcoded secrets in code | ❌ Fix `drmahe123` token |
| 3 | Default admin password changed | ❌ Change `admin123` seed |
| 4 | `MONGODB_URI` uses Atlas, not localhost | Verify in `.env` |
| 5 | `node_modules` excluded from Git | Check `.gitignore` |
| 6 | `dist/` built fresh before deploy | `npm run build` |
| 7 | `consent_forms/` directory backed up | Manual step |
| 8 | Rate limiters active on public endpoints | ✅ Already done |
| 9 | Helmet security headers enabled | ✅ Already done |
| 10 | JWT auth on all private routes | ✅ Already done |
| 11 | Graceful shutdown handlers | ✅ Already done |
| 12 | `ngrok` removed from prod deps | ❌ Fix `package.json` |
| 13 | `mongoose` pool size ≤ 5 for low-RAM VPS | ✅ Already 3 |
| 14 | Compression (gzip) enabled | ✅ Already done |
| 15 | Static assets cached with `maxAge: 7d` | ✅ Already done |

---

## 🗺️ Suggested Execution Order

```
Week 1 — Security & Quick Wins (no new bugs risk)
  1. Fix hardcoded secrets → .env
  2. Remove ngrok from dependencies
  3. Remove node-sqlite3-wasm (verify first)
  4. Add bcryptjs top-level require
  5. Parallelize getDashboardStats queries

Week 2 — Performance
  6. Add missing MongoDB indexes
  7. Fix N+1 in getPatientAppointments
  8. Fix sequential Treatment.save() in createBill
  9. Add lazy loading to App.jsx

Week 3 — Architecture (refactoring)
  10. Split server/index.js into route modules
  11. Add asyncHandler middleware
  12. Extract CLINIC_SLOTS constant
  13. Create useApi hook in frontend

Week 4 — Storage Cleanup
  14. Audit and clean consent_forms/ directory
  15. Choose consent form storage strategy (Option A/B/C)
  16. Add cleanup cron for old consent files
```
