const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = !app.isPackaged

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#f1f5f9',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
    titleBarStyle: 'default',
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// ─── DB init ───────────────────────────────────────────────────────────────
const { initDatabase } = require('./db/database')
const queries = require('./db/queries')
let db

app.whenReady().then(() => {
  db = initDatabase()
  queries.init(db)
  createWindow()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ─── IPC: Patients ─────────────────────────────────────────────────────────
ipcMain.handle('patients:getAll',    ()          => queries.getAllPatients())
ipcMain.handle('patients:search',    (_, q)      => queries.searchPatients(q))
ipcMain.handle('patients:getById',   (_, id)     => queries.getPatientById(id))
ipcMain.handle('patients:add',       (_, data)   => queries.addPatient(data))
ipcMain.handle('patients:update',    (_, id, d)  => queries.updatePatient(id, d))

// ─── IPC: Appointments ─────────────────────────────────────────────────────
ipcMain.handle('appointments:getToday',       ()           => queries.getTodayAppointments())
ipcMain.handle('appointments:getByDate',      (_, date)    => queries.getAppointmentsByDate(date))
ipcMain.handle('appointments:getByPatient',   (_, pid)     => queries.getPatientAppointments(pid))
ipcMain.handle('appointments:add',            (_, data)    => queries.addAppointment(data))
ipcMain.handle('appointments:update',         (_, id, d)   => queries.updateAppointment(id, d))
ipcMain.handle('appointments:updateStatus',   (_, id, s)   => queries.updateAppointmentStatus(id, s))
ipcMain.handle('appointments:delete',         (_, id)      => queries.deleteAppointment(id))

// ─── IPC: Treatments ───────────────────────────────────────────────────────
ipcMain.handle('treatments:getByAppointment', (_, aid)   => queries.getTreatmentsByAppointment(aid))
ipcMain.handle('treatments:getByPatient',     (_, pid)   => queries.getTreatmentsByPatient(pid))
ipcMain.handle('treatments:add',              (_, data)  => queries.addTreatment(data))
ipcMain.handle('treatments:update',           (_, id, d) => queries.updateTreatment(id, d))
ipcMain.handle('treatments:delete',           (_, id)    => queries.deleteTreatment(id))

// ─── IPC: Bills ────────────────────────────────────────────────────────────
ipcMain.handle('bills:getByPatient',  (_, pid)    => queries.getBillsByPatient(pid))
ipcMain.handle('bills:getById',       (_, id)     => queries.getBillById(id))
ipcMain.handle('bills:create',        (_, data)   => queries.createBill(data))
ipcMain.handle('bills:updatePayment', (_, id, d)  => queries.updateBillPayment(id, d))
ipcMain.handle('bills:getAll',        ()          => queries.getAllBills())

// ─── IPC: Queue ────────────────────────────────────────────────────────────
ipcMain.handle('queue:getToday', () => queries.getTodayQueue())

// ─── IPC: Dashboard ────────────────────────────────────────────────────────
ipcMain.handle('dashboard:getStats', () => queries.getDashboardStats())

// ─── IPC: Settings ─────────────────────────────────────────────────────────
ipcMain.handle('settings:get',     ()          => queries.getSettings())
ipcMain.handle('settings:set',     (_, k, v)   => queries.setSetting(k, v))

// ─── IPC: Backup ───────────────────────────────────────────────────────────
ipcMain.handle('backup:create', async () => {
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Database Backup',
    defaultPath: `dental-backup-${new Date().toISOString().split('T')[0]}.db`,
    filters: [{ name: 'SQLite Database', extensions: ['db'] }],
  })
  if (canceled || !filePath) return { success: false }
  const dbPath = queries.getDbPath()
  fs.copyFileSync(dbPath, filePath)
  return { success: true, path: filePath }
})

// ─── IPC: Kiosk ────────────────────────────────────────────────────────────
ipcMain.handle('kiosk:toggle', (_, enable) => {
  if (mainWindow) mainWindow.setKiosk(enable)
})

// ─── IPC: Print ────────────────────────────────────────────────────────────
ipcMain.handle('print:receipt', async (_, html) => {
  const win = new BrowserWindow({ show: false, webPreferences: { contextIsolation: true } })
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
  win.webContents.print({ silent: false, printBackground: true }, () => win.close())
})

// ─── IPC: Consent Form ──────────────────────────────────────────────────────
ipcMain.handle('consent:save', async (_, data) => {
  const fs = require('fs')
  const path = require('path')
  const queries = require('./db/queries')
  
  const consentDir = path.join(app.getPath('userData'), 'consent_forms')
  if (!fs.existsSync(consentDir)) {
    fs.mkdirSync(consentDir, { recursive: true })
  }
  
  const Patient = require('./db/database').Patient
  let patient = await Patient.findOne({ phone: data.phone.trim() })
  if (!patient) {
    patient = new Patient({
      name: data.name.trim(),
      phone: data.phone.trim(),
      age: data.age ? Number(data.age) : null,
      gender: data.gender,
      complaint: data.complaint,
      notes: data.notes || 'Kiosk check-in'
    })
    await patient.save()
  } else {
    patient.age = data.age ? Number(data.age) : patient.age
    patient.gender = data.gender || patient.gender
    patient.complaint = data.complaint || patient.complaint
    patient.notes = data.notes || patient.notes
    await patient.save()
  }
  
  const timestamp = Date.now()
  const base64Data = data.signature.replace(/^data:image\/[a-z]+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')
  
  const sigFilename = `sig_${patient._id.toString()}_${timestamp}.jpg`
  const sigPath = path.join(consentDir, sigFilename)
  fs.writeFileSync(sigPath, buffer)
  
  const htmlFilename = `consent_${patient._id.toString()}_${timestamp}.html`
  const htmlPath = path.join(consentDir, htmlFilename)
  
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
  
  const consentHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Dental Treatment Consent Form - ${patient.name}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; color: #1e293b; background-color: #ffffff; }
    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
    .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
    .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.1em; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; }
    .field { display: flex; flex-direction: column; }
    .label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
    .value { font-size: 15px; font-weight: 600; color: #334155; }
    .text-block { line-height: 1.6; font-size: 14px; color: #475569; margin-bottom: 30px; border-left: 3px solid #cbd5e1; padding-left: 15px; }
    .signature-section { display: flex; flex-direction: column; align-items: flex-end; margin-top: 40px; }
    .signature-wrap { background: #fafafa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; width: 220px; text-align: center; }
    .signature-img { max-width: 200px; height: auto; display: block; margin: 0 auto; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 50px; border-top: 1px dashed #e2e8f0; padding-top: 15px; }
    @media print {
      body { padding: 0; }
      .signature-wrap { border: none; background: transparent; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">DR. MAHE'S DENTISTRY</div>
    <div class="subtitle">Patient Treatment Consent</div>
  </div>
  
  <div class="grid">
    <div class="field"><span class="label">Patient Name</span><span class="value">${patient.name}</span></div>
    <div class="field"><span class="label">Phone Number</span><span class="value">${patient.phone || '—'}</span></div>
    <div class="field"><span class="label">Age &amp; Gender</span><span class="value">${patient.age ? patient.age + ' yrs' : '—'} · ${patient.gender || '—'}</span></div>
    <div class="field"><span class="label">Date Signed</span><span class="value">${dateStr}</span></div>
    <div class="field" style="grid-column: span 2;"><span class="label">Chief Complaint</span><span class="value">${data.complaint || 'General check-up'}</span></div>
  </div>

  <div class="text-block">
    I hereby authorize the clinical team of Dr. Mahe's Dentistry to perform dental procedures, diagnostic scans, and treatments as necessary to address my condition. I understand that the clinical options, costs, and risks have been discussed, and I consent to proceed with the treatment plan.
  </div>

  <div class="signature-section">
    <div class="signature-wrap">
      <img src="data:image/jpeg;base64,${base64Data}" class="signature-img" alt="Patient Signature" />
      <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; border-top: 1px solid #f1f5f9; padding-top: 4px; font-weight: 600;">Patient Signature</div>
    </div>
  </div>

  <div class="footer">
    Dr. Mahe's Dentistry · Porur, Chennai · WhatsApp: +91 94440 12345
  </div>
</body>
</html>`

  fs.writeFileSync(htmlPath, consentHtml)

  patient.consentFormSaved = true
  patient.consentFormPath = `consent_forms/${htmlFilename}`
  patient.consentSignedAt = new Date()
  await patient.save()

  try {
    const serverConsentDir = path.join(app.getAppPath(), 'consent_forms')
    if (!fs.existsSync(serverConsentDir)) {
      fs.mkdirSync(serverConsentDir, { recursive: true })
    }
    fs.writeFileSync(path.join(serverConsentDir, htmlFilename), consentHtml)
    fs.writeFileSync(path.join(serverConsentDir, sigFilename), buffer)
  } catch (e) {
    // Ignore
  }

  const appt = await queries.addAppointment({
    patient_id: patient._id.toString(),
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '',
    reason: data.complaint,
    notes: data.notes || 'Kiosk check-in'
  })

  const patientJSON = patient.toObject()
  patientJSON.id = patientJSON._id.toString()

  return { patient: patientJSON, appt }
})

ipcMain.handle('consent:open', async (_, patientId) => {
  const { shell } = require('electron')
  const Patient = require('./db/database').Patient
  const patient = await Patient.findById(patientId).lean()
  if (patient && patient.consentFormSaved && patient.consentFormPath) {
    const path = require('path')
    const fs = require('fs')
    
    let filePath = path.join(app.getAppPath(), patient.consentFormPath)
    if (!fs.existsSync(filePath)) {
      filePath = path.join(app.getPath('userData'), 'consent_forms', path.basename(patient.consentFormPath))
    }
    
    if (fs.existsSync(filePath)) {
      shell.openPath(filePath)
      return { success: true }
    }
  }
  return { success: false }
})
