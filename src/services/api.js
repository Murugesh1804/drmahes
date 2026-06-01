// src/services/api.js
// Hybrid client: delegates queries to Electron IPC (if present) or falls back to REST API.
// All web requests include JWT Authorization header. 401 triggers auto-logout.

const BASE_URL = '/api'
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

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
export const getAllPatients = () => {
  if (isElectron) return window.electronAPI.getAllPatients()
  return request('/patients')
}

export const searchPatients = (q) => {
  if (isElectron) return window.electronAPI.searchPatients(q)
  return request(`/patients/search?q=${encodeURIComponent(q)}`)
}

export const getPatientById = (id) => {
  if (isElectron) return window.electronAPI.getPatientById(id)
  return request(`/patients/${id}`)
}

export const addPatient = (data) => {
  if (isElectron) return window.electronAPI.addPatient(data)
  return request('/patients', { method: 'POST', body: JSON.stringify(data) })
}

export const updatePatient = (id, data) => {
  if (isElectron) return window.electronAPI.updatePatient(id, data)
  return request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

// ── Appointments ───────────────────────────────────────────
export const getTodayAppointments = () => {
  if (isElectron) return window.electronAPI.getTodayAppointments()
  return request('/appointments/today')
}

export const getAppointmentsByDate = (date) => {
  if (isElectron) return window.electronAPI.getAppointmentsByDate(date)
  return request(`/appointments/date/${date}`)
}

export const getPatientAppointments = (pid) => {
  if (isElectron) return window.electronAPI.getPatientAppointments(pid)
  return request(`/appointments/patient/${pid}`)
}

export const addAppointment = (data) => {
  if (isElectron) return window.electronAPI.addAppointment(data)
  return request('/appointments', { method: 'POST', body: JSON.stringify(data) })
}

export const updateAppointment = (id, data) => {
  if (isElectron) return window.electronAPI.updateAppointment(id, data)
  return request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export const updateAppointmentStatus = (id, status) => {
  if (isElectron) return window.electronAPI.updateAppointmentStatus(id, status)
  return request(`/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
}

export const deleteAppointment = (id) => {
  if (isElectron) return window.electronAPI.deleteAppointment(id)
  return request(`/appointments/${id}`, { method: 'DELETE' })
}

// ── Treatments ─────────────────────────────────────────────
export const getTreatmentsByAppointment = (aid) => {
  if (isElectron) return window.electronAPI.getTreatmentsByAppointment(aid)
  return request(`/treatments/appointment/${aid}`)
}

export const getTreatmentsByPatient = (pid) => {
  if (isElectron) return window.electronAPI.getTreatmentsByPatient(pid)
  return request(`/treatments/patient/${pid}`)
}

export const addTreatment = (data) => {
  if (isElectron) return window.electronAPI.addTreatment(data)
  return request('/treatments', { method: 'POST', body: JSON.stringify(data) })
}

export const updateTreatment = (id, data) => {
  if (isElectron) return window.electronAPI.updateTreatment(id, data)
  return request(`/treatments/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export const deleteTreatment = (id) => {
  if (isElectron) return window.electronAPI.deleteTreatment(id)
  return request(`/treatments/${id}`, { method: 'DELETE' })
}

// ── Bills ──────────────────────────────────────────────────
export const getBillsByPatient = (pid) => {
  if (isElectron) return window.electronAPI.getBillsByPatient(pid)
  return request(`/bills/patient/${pid}`)
}

export const getBillById = (id) => {
  if (isElectron) return window.electronAPI.getBillById(id)
  return request(`/bills/${id}`)
}

export const createBill = (data) => {
  if (isElectron) return window.electronAPI.createBill(data)
  return request('/bills', { method: 'POST', body: JSON.stringify(data) })
}

export const updateBillPayment = (id, data) => {
  if (isElectron) return window.electronAPI.updateBillPayment(id, data)
  return request(`/bills/${id}/payment`, { method: 'PUT', body: JSON.stringify(data) })
}

export const getAllBills = () => {
  if (isElectron) return window.electronAPI.getAllBills()
  return request('/bills')
}

// ── Queue ──────────────────────────────────────────────────
export const getTodayQueue = () => {
  if (isElectron) return window.electronAPI.getTodayQueue()
  return request('/queue/today')
}

// ── Dashboard ──────────────────────────────────────────────
export const getDashboardStats = () => {
  if (isElectron) return window.electronAPI.getDashboardStats()
  return request('/dashboard/stats')
}

// ── Settings ───────────────────────────────────────────────
export const getSettings = () => {
  if (isElectron) return window.electronAPI.getSettings()
  return request('/settings')
}

export const setSetting = (key, val) => {
  if (isElectron) return window.electronAPI.setSetting(key, val)
  return request(`/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value: val }) })
}

// ── Backup ─────────────────────────────────────────────────
export const createBackup = async () => {
  if (isElectron) return window.electronAPI.createBackup()
  // Web mode: call API and return info message
  return request('/backup/download')
}

// ── Kiosk (Responsive HTML5 Fullscreen alternative) ────────
export const toggleKiosk = async (enable) => {
  if (isElectron) {
    await window.electronAPI.toggleKiosk(enable)
    return true
  }
  
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
export const saveConsentForm = (data) => {
  if (isElectron) return window.electronAPI.saveConsentForm(data)
  return request('/consent', { method: 'POST', body: JSON.stringify(data) })
}

export const openConsentForm = (patientId) => {
  if (isElectron) return window.electronAPI.openConsentForm(patientId)
  window.open(`${BASE_URL}/consent/${patientId}`, '_blank')
  return Promise.resolve({ success: true })
}
