// Clinic timezone (India Standard Time)
const CLINIC_TIME_ZONE = 'Asia/Kolkata'

/**
 * Get today's date in clinic timezone as YYYY-MM-DD string
 */
export function clinicDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date)
  const byType = Object.fromEntries(parts.map(p => [p.type, p.value]))
  return `${byType.year}-${byType.month}-${byType.day}`
}

/**
 * Format date string for display (e.g., "Mon, 15 Jan 2024")
 */
export function fmtDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}

/**
 * Format date for display with time
 */
export function fmtDateTime(dateStr, timeStr) {
  const date = new Date(`${dateStr}T${timeStr}`)
  return date.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}