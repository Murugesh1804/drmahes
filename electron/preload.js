const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Patients
  getAllPatients:    ()          => ipcRenderer.invoke('patients:getAll'),
  searchPatients:   (q)         => ipcRenderer.invoke('patients:search', q),
  getPatientById:   (id)        => ipcRenderer.invoke('patients:getById', id),
  addPatient:       (data)      => ipcRenderer.invoke('patients:add', data),
  updatePatient:    (id, data)  => ipcRenderer.invoke('patients:update', id, data),

  // Appointments
  getTodayAppointments:    ()           => ipcRenderer.invoke('appointments:getToday'),
  getAppointmentsByDate:   (date)       => ipcRenderer.invoke('appointments:getByDate', date),
  getPatientAppointments:  (pid)        => ipcRenderer.invoke('appointments:getByPatient', pid),
  addAppointment:          (data)       => ipcRenderer.invoke('appointments:add', data),
  updateAppointment:       (id, data)   => ipcRenderer.invoke('appointments:update', id, data),
  updateAppointmentStatus: (id, status) => ipcRenderer.invoke('appointments:updateStatus', id, status),
  deleteAppointment:       (id)         => ipcRenderer.invoke('appointments:delete', id),

  // Treatments
  getTreatmentsByAppointment: (aid)       => ipcRenderer.invoke('treatments:getByAppointment', aid),
  getTreatmentsByPatient:     (pid)       => ipcRenderer.invoke('treatments:getByPatient', pid),
  addTreatment:               (data)      => ipcRenderer.invoke('treatments:add', data),
  updateTreatment:            (id, data)  => ipcRenderer.invoke('treatments:update', id, data),
  deleteTreatment:            (id)        => ipcRenderer.invoke('treatments:delete', id),

  // Bills
  getBillsByPatient:  (pid)      => ipcRenderer.invoke('bills:getByPatient', pid),
  getBillById:        (id)       => ipcRenderer.invoke('bills:getById', id),
  createBill:         (data)     => ipcRenderer.invoke('bills:create', data),
  updateBillPayment:  (id, data) => ipcRenderer.invoke('bills:updatePayment', id, data),
  getAllBills:         ()         => ipcRenderer.invoke('bills:getAll'),

  // Queue
  getTodayQueue:      () => ipcRenderer.invoke('queue:getToday'),

  // Dashboard
  getDashboardStats:  () => ipcRenderer.invoke('dashboard:getStats'),

  // Settings
  getSettings:  ()          => ipcRenderer.invoke('settings:get'),
  setSetting:   (key, val)  => ipcRenderer.invoke('settings:set', key, val),

  // Backup
  createBackup: () => ipcRenderer.invoke('backup:create'),

  // Kiosk
  toggleKiosk:  (enable) => ipcRenderer.invoke('kiosk:toggle', enable),

  // Print
  printReceipt: (html) => ipcRenderer.invoke('print:receipt', html),

  // Consent Form
  saveConsentForm: (data) => ipcRenderer.invoke('consent:save', data),
  openConsentForm: (patientId) => ipcRenderer.invoke('consent:open', patientId),
})
