# 🛠️ PRODUCTION AUDIT - QUICK FIX GUIDE

## Priority 1: CRITICAL (Do First)

### Fix 1: Remove .env from Git History
```bash
# 1. Remove from version control
git rm --cached .env
git commit -m "Remove .env from git tracking"
git push

# 2. Update .gitignore
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore"
git push

# 3. Rotate ALL credentials in MongoDB/environment:
# - Change MongoDB password
# - Generate new JWT_SECRET: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
# - Regenerate SMTP credentials
# - Regenerate WhatsApp token
```

---

### Fix 2: Remove Hardcoded Default Password
**File:** `server/db.js`

**Replace lines 158-177:**
```javascript
// OLD (VULNERABLE):
async function seedSettings() {
  const bcrypt = require('bcryptjs')
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const defaults = [
    // ...
    { key: 'cms_password', value: hashedPassword }
  ]
  // ...
}

// NEW (SAFE):
async function seedSettings() {
  const bcrypt = require('bcryptjs')
  
  // Check if already configured
  const existing = await Setting.findOne({ key: 'cms_password' })
  if (existing) return
  
  // In production, require manual setup
  if (process.env.NODE_ENV === 'production') {
    console.warn('[WARNING] CMS password not configured. Set initial password via MongoDB.')
    return
  }
  
  // Only auto-seed in dev with environment variable
  const initialPassword = process.env.INITIAL_PASSWORD || 'changeme123'
  const hashedPassword = await bcrypt.hash(initialPassword, 10)
  
  const defaults = [
    { key: 'clinic_name', value: "Dr. Mahe's Dentistry" },
    { key: 'doctor_name', value: 'Dr. Mahe' },
    { key: 'clinic_phone', value: '+91 94440 12345' },
    { key: 'clinic_address', value: '1st Floor, Kundrathur Main Rd, Jaya Nagar, Porur, Chennai - 600116' },
    { key: 'currency', value: '₹' },
    { key: 'cms_password', value: hashedPassword }
  ]
  
  for (const item of defaults) {
    const exists = await Setting.findOne({ key: item.key })
    if (!exists) {
      await Setting.create(item)
    }
  }
}
```

---

### Fix 3: Add HTML Escaping Library
```bash
npm install html-entities dompurify

# Update package.json to include these dependencies
```

**File:** `src/pages/Dashboard.jsx` - Lines 100-150 (patient names in stats)
```javascript
// ADD AT TOP:
import { escapeHtml } from 'html-entities'

// REPLACE rendering of patient names:
// OLD:
<div className="stat-value">{stat.name}</div>

// NEW:
<div className="stat-value">{escapeHtml(stat.name)}</div>
```

**File:** `src/pages/Patients.jsx` - Lines 95-120 (patient list)
```javascript
// OLD:
<h3 className="font-semibold">{patient.name}</h3>

// NEW:
import { escapeHtml } from 'html-entities'
<h3 className="font-semibold">{escapeHtml(patient.name)}</h3>
```

**File:** `server/index.js` - Lines 265-310 (consent form generation)
```javascript
// ADD FUNCTION:
function escapeHtml(text) {
  const map = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#039;'
  }
  return String(text || '').replace(/[&<>"']/g, m => map[m])
}

// REPLACE consent form HTML:
// OLD:
    <span class="value">${patient.name}</span>

// NEW:
    <span class="value">${escapeHtml(patient.name)}</span>
```

---

## Priority 2: HIGH (Do This Week)

### Fix 4: Add Email Validation
**File:** `server/index.js` - Line 142

```javascript
// ADD FUNCTION:
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return email && email.length <= 254 && re.test(email)
}

// REPLACE email handling in website-book endpoint:
// OLD (around line 142):
const email = patientEmail ? patientEmail.trim().toLowerCase() : null

// NEW:
let email = null
if (patientEmail) {
  const trimmed = patientEmail.trim().toLowerCase()
  if (!isValidEmail(trimmed)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }
  email = trimmed
}
```

---

### Fix 5: Add Phone Validation
**File:** `server/index.js` - Line 141

```javascript
// ADD FUNCTION:
function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

// REPLACE phone handling:
// OLD:
const phone = patientPhone.trim()

// NEW:
const phone = patientPhone.trim()
if (!isValidPhone(phone)) {
  return res.status(400).json({ 
    error: 'Phone must be 10-15 digits' 
  })
}
```

---

### Fix 6: Add Regex Injection Protection
**File:** `server/queries.js` - Line 54

```javascript
// REPLACE searchPatients function:
// OLD:
async function searchPatients(query) {
  const matchFilter = query.trim() ? {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { phone: { $regex: query, $options: 'i' } }
    ]
  } : {}

// NEW:
async function searchPatients(query) {
  const sanitized = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matchFilter = sanitized ? {
    $or: [
      { name: { $regex: sanitized, $options: 'i' } },
      { phone: { $regex: sanitized, $options: 'i' } }
    ]
  } : {}
```

---

### Fix 7: Validate Bill Amounts
**File:** `server/queries.js` - Add after `getBillById` function

```javascript
async function updateBillPayment(billId, paidAmount) {
  if (!isValidObjectId(billId)) return null
  
  // Validation
  if (typeof paidAmount !== 'number' || paidAmount < 0) {
    throw new Error('Paid amount must be a positive number')
  }
  
  const bill = await Bill.findById(billId)
  if (!bill) throw new Error('Bill not found')
  
  if (paidAmount > bill.total_amount) {
    throw new Error(`Paid amount cannot exceed total (${bill.total_amount})`)
  }
  
  const balance = bill.total_amount - paidAmount
  const status = paidAmount === 0 ? 'pending'
                : paidAmount >= bill.total_amount ? 'paid'
                : 'partial'
  
  return Bill.findByIdAndUpdate(billId, {
    $set: { paid_amount: paidAmount, balance, status, updated_at: new Date() }
  }, { new: true }).lean()
}
```

---

### Fix 8: Prevent Past Date Appointments
**File:** `server/db.js` - Update appointmentSchema

```javascript
const appointmentSchema = new mongoose.Schema({
  // ... existing fields
  scheduled_date: {
    type: String,
    required: true,
    index: true,
    validate: {
      validator: function(v) {
        const appointmentDate = new Date(v + 'T00:00:00')
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return appointmentDate >= today
      },
      message: 'Cannot schedule appointment for past date'
    }
  },
  // ... rest of fields
}, schemaOptions)
```

---

## Priority 3: MEDIUM (Do This Month)

### Fix 9: Add Audit Logging
**File:** `server/db.js` - Add schema

```javascript
const auditSchema = new mongoose.Schema({
  userId: { type: String, default: 'unknown' },
  action: { type: String, enum: ['CREATE', 'READ', 'UPDATE', 'DELETE'], required: true },
  resource: { type: String, required: true },
  resourceId: String,
  changes: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now, index: true }
})

const AuditLog = mongoose.model('AuditLog', auditSchema)

// Export it
module.exports = {
  // ... existing exports
  AuditLog
}
```

**File:** `server/index.js` - Add logging middleware

```javascript
const { AuditLog } = require('./db')

app.post('/api/patients', verifyToken, async (req, res) => {
  try {
    const patient = await queries.addPatient(req.body)
    
    // Log action
    await AuditLog.create({
      userId: 'admin',
      action: 'CREATE',
      resource: 'Patient',
      resourceId: patient.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    })
    
    res.status(201).json(patient)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
```

---

### Fix 10: Add Token Refresh Endpoint
**File:** `server/index.js` - Add new route

```javascript
app.post('/api/auth/refresh', authLimiter, async (req, res) => {
  try {
    const header = req.headers['authorization'] || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }
    
    // Verify (allows expired tokens within grace period)
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true })
    
    // Check if token is too old (more than 24 hours)
    const ageInHours = (Date.now() / 1000 - decoded.iat) / 3600
    if (ageInHours > 24) {
      return res.status(401).json({ error: 'Token expired. Please login again.' })
    }
    
    // Issue new token
    const newToken = jwt.sign(
      { role: 'cms', iat: Math.floor(Date.now() / 1000) },
      JWT_SECRET,
      { expiresIn: '15m' }
    )
    
    res.json({ token: newToken })
  } catch (err) {
    res.status(401).json({ error: 'Token refresh failed' })
  }
})
```

**File:** `src/context/AppContext.jsx` - Add auto-refresh

```javascript
useEffect(() => {
  // Refresh token every 10 minutes
  const interval = setInterval(async () => {
    const token = sessionStorage.getItem('cms_token')
    if (!token) return
    
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        sessionStorage.setItem('cms_token', data.token)
      } else if (res.status === 401) {
        onTokenExpired()
      }
    } catch (err) {
      console.error('Token refresh failed:', err)
    }
  }, 10 * 60 * 1000)
  
  return () => clearInterval(interval)
}, [])
```

---

### Fix 11: Add Idle Session Timeout
**File:** `src/context/AppContext.jsx`

```javascript
const [idleTimer, setIdleTimer] = useState(null)

const resetIdleTimer = () => {
  if (idleTimer) clearTimeout(idleTimer)
  
  const timer = setTimeout(() => {
    if (isAuthenticated) {
      console.log('Session idle timeout')
      logout()
      notify('Session expired due to inactivity. Please login again.', 'error')
    }
  }, 5 * 60 * 1000) // 5 minutes
  
  setIdleTimer(timer)
}

// Listen for user activity
useEffect(() => {
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
  events.forEach(event => {
    window.addEventListener(event, resetIdleTimer)
  })
  
  resetIdleTimer()
  
  return () => {
    events.forEach(event => {
      window.removeEventListener(event, resetIdleTimer)
    })
    if (idleTimer) clearTimeout(idleTimer)
  }
}, [isAuthenticated])
```

---

## Testing Commands

```bash
# After fixes, test for XSS
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"<img src=x onerror=\"alert(1)\">","phone":"1234567890"}'

# Test email validation
curl -X POST http://localhost:5000/api/appointments/website-book \
  -H "Content-Type: application/json" \
  -d '{"patientName":"Test","patientPhone":"1234567890","patientEmail":"invalid","date":"2026-06-10","timeSlot":"10:00 AM","service":"Checkup"}'

# Test phone validation
curl -X POST http://localhost:5000/api/appointments/website-book \
  -H "Content-Type: application/json" \
  -d '{"patientName":"Test","patientPhone":"abc","patientEmail":"test@example.com","date":"2026-06-10","timeSlot":"10:00 AM","service":"Checkup"}'

# Test past date prevention
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"patient_id":"<id>","scheduled_date":"2025-01-01","scheduled_time":"10:00 AM","reason":"Test"}'
```

---

## Environment Variables Template (.env.example)

```env
# MongoDB Atlas - Update with new credentials
MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/dental-clinic?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (GENERATE NEW: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
JWT_SECRET=your-long-random-64-char-hex-string-here

# Optional: Initial password for first setup (development only)
INITIAL_PASSWORD=changeme123

# WhatsApp Integration (update these)
PHONE_NUMBER_ID=your-phone-id
VERIFY_TOKEN=your-verify-token
TOKEN=your-whatsapp-token

# SMTP Configuration (update with new credentials)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=2525
SMTP_USER=your-email@smtp-brevo.com
SMTP_PASS=your-smtp-password
MAIL_FROM="Dr. Mahe's Dentistry" <smile@drmahesdentistry.in>

# Optional: Encryption key for sensitive fields (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=your-32-byte-hex-key

# Optional: AWS S3 for backups
AWS_BUCKET=clinic-backups
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

---

## Deployment Checklist

- [ ] All code from PRODUCTION_AUDIT_REPORT.md fixes applied
- [ ] `.env` file removed from git and regenerated
- [ ] All credentials rotated (MongoDB, JWT, SMTP, WhatsApp)
- [ ] Input validation tests pass
- [ ] XSS tests pass (no malicious payloads stored/rendered)
- [ ] HTTPS configured with valid SSL cert
- [ ] CORS headers properly set (X-Frame-Options, X-Content-Type-Options)
- [ ] Rate limiting tested (429 responses)
- [ ] Audit logging working
- [ ] Token refresh working
- [ ] Idle timeout working
- [ ] Backup strategy enabled
- [ ] Monitoring and alerting configured
- [ ] Security headers tested (https://securityheaders.com/)
- [ ] SSL tested (https://www.ssllabs.com/ssltest/)
- [ ] Load test passed (min 100 concurrent users)
- [ ] Incident response plan documented
- [ ] Team training completed

---

## Questions?

Refer to the full PRODUCTION_AUDIT_REPORT.md for detailed explanations and additional fixes.

