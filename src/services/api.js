// src/services/api.js
// REST client for database queries.
// All web requests include JWT Authorization header. 401 triggers auto-logout.

const BASE_URL = '/api'

/** Get stored JWT token from sessionStorage */
function getToken() {
  return typeof sessionStorage !== 'undefined'
    ? sessionStorage.getItem('cms_token')
    : null
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(url, { ...options, headers })

  // Token expired or invalid — trigger auto-logout
  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent('cms:session-expired'))
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Session expired')
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown API error' }))
    throw new Error(err.error || `HTTP error ${response.status}`)
  }
  return response.json().catch(() => null)
}

// ── Patients ───────────────────────────────────────────────
export const getAllPatients = () => request('/patients')

export const searchPatients = (q) => request(`/patients/search?q=${encodeURIComponent(q)}`)

export const getPatientById = (id) => request(`/patients/${id}`)

export const addPatient = (data) => request('/patients', { method: 'POST', body: JSON.stringify(data) })

export const updatePatient = (id, data) => request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) })

// ── Appointments ───────────────────────────────────────────
export const getTodayAppointments = () => request('/appointments/today')

export const getAppointmentsByDate = (date) => request(`/appointments/date/${date}`)

export const getPatientAppointments = (pid) => request(`/appointments/patient/${pid}`)

export const addAppointment = (data) => request('/appointments', { method: 'POST', body: JSON.stringify(data) })

export const updateAppointment = (id, data) => request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const updateAppointmentStatus = (id, status) => request(`/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })

export const updateCallStatus = (id, status) => request(`/appointments/${id}/call-status`, { method: 'PUT', body: JSON.stringify({ status }) })

export const getPendingCalls = () => request('/appointments/pending-calls')

export const deleteAppointment = (id) => request(`/appointments/${id}`, { method: 'DELETE' })

// ── Treatments ─────────────────────────────────────────────
export const getTreatmentsByAppointment = (aid) => request(`/treatments/appointment/${aid}`)

export const getTreatmentsByPatient = (pid) => request(`/treatments/patient/${pid}`)

export const addTreatment = (data) => request('/treatments', { method: 'POST', body: JSON.stringify(data) })

export const updateTreatment = (id, data) => request(`/treatments/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteTreatment = (id) => request(`/treatments/${id}`, { method: 'DELETE' })

// ── Bills ──────────────────────────────────────────────────
export const getBillsByPatient = (pid) => request(`/bills/patient/${pid}`)

export const getBillById = (id) => request(`/bills/${id}`)

export const createBill = (data) => request('/bills', { method: 'POST', body: JSON.stringify(data) })

export const updateBillPayment = (id, data) => request(`/bills/${id}/payment`, { method: 'PUT', body: JSON.stringify(data) })

export const getAllBills = () => request('/bills')

// ── Queue ──────────────────────────────────────────────────
export const getTodayQueue = () => request('/queue/today')

// ── Dashboard ──────────────────────────────────────────────
export const getDashboardStats = () => request('/dashboard/stats')

// ── Settings ───────────────────────────────────────────────
export const getSettings = () => request('/settings')

export const setSetting = (key, val) => request(`/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value: val }) })

// ── Backup ─────────────────────────────────────────────────
export const createBackup = async () => request('/backup/download')

// ── Kiosk (Responsive HTML5 Fullscreen alternative) ────────
export const toggleKiosk = async (enable) => {
  if (enable) {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
      }
    } catch (e) {
      console.warn("Fullscreen request failed:", e)
    }
  } else {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      }
    } catch (e) {
      console.warn("Fullscreen exit failed:", e)
    }
  }
  return true
}

// ── Consent Form API ───────────────────────────────────────
export const saveConsentForm = (data) => request('/consent', { method: 'POST', body: JSON.stringify(data) })

export const openConsentForm = (patientId) => {
  window.open(`${BASE_URL}/consent/${patientId}`, '_blank')
  return Promise.resolve({ success: true })
}

// ── Slot Blocking (per-date manual slot management) ────────
export const getBlockedSlots = (date) => request(`/slots/blocked?date=${encodeURIComponent(date)}`)

export const blockSlot = (date, slot, reason = '') => request('/slots/block', { method: 'POST', body: JSON.stringify({ date, slot, reason }) })

export const unblockSlot = (date, slot) => request('/slots/block', { method: 'DELETE', body: JSON.stringify({ date, slot }) })
