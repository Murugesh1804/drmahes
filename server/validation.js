const ALLOWED_WEBSITE_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM',
  '07:00 PM', '08:00 PM', '09:00 PM'
]

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function isValidDateString(value) {
  const date = normalizeText(value)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const timestamp = Date.parse(date)
  return Number.isFinite(timestamp)
}

function isValidEmail(value) {
  const email = normalizeText(value).toLowerCase()
  return email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidTimeSlot(value) {
  return ALLOWED_WEBSITE_SLOTS.includes(normalizeText(value))
}

function validateSignaturePayload(signature) {
  if (!signature || typeof signature !== 'string') return false
  const match = signature.match(/^data:image\/(png|jpeg|jpg);base64,([A-Za-z0-9+/=]+)$/)
  if (!match) return false

  const base64Data = match[2]
  const sizeBytes = Buffer.byteLength(base64Data, 'base64')
  return sizeBytes > 0 && sizeBytes <= 250 * 1024
}

module.exports = {
  normalizeText,
  isValidDateString,
  isValidEmail,
  isValidTimeSlot,
  validateSignaturePayload,
  ALLOWED_WEBSITE_SLOTS,
}
