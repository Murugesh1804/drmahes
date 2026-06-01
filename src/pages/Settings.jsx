import { useState, useEffect } from 'react'
import { Save, HardDrive, Loader } from 'lucide-react'
import { getSettings, setSetting, createBackup } from '../services/api'
import { useApp } from '../context/AppContext'

const FIELDS = [
  { key: 'clinic_name',    label: 'Clinic Name',    placeholder: "Dr. Mahe's Dentistry",   type: 'text'  },
  { key: 'doctor_name',    label: 'Doctor Name',    placeholder: 'Dr. Mahe',           type: 'text'  },
  { key: 'clinic_phone',   label: 'Clinic Phone',   placeholder: '98765 43210',         type: 'text'  },
  { key: 'clinic_address', label: 'Clinic Address', placeholder: '123, Main Street…',   type: 'text'  },
  { key: 'currency',       label: 'Currency Symbol',placeholder: '₹',                   type: 'text'  },
  { key: 'cms_password',   label: 'CMS Portal Password', placeholder: 'admin123',       type: 'password' },
]

export default function Settings() {
  const { notify, loadSettings } = useApp()
  const [values, setValues] = useState({})
  const [saving, setSaving] = useState(false)
  const [backing, setBacking] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    getSettings()
      .then(s => setValues(s && typeof s === 'object' ? s : {}))
      .catch(e => console.error('Failed to load settings:', e))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      for (const [k, v] of Object.entries(values)) {
        await setSetting(k, v)
      }
      await loadSettings()
      notify('Settings saved successfully')
      setDirty(false)
    } finally { setSaving(false) }
  }

  async function handleBackup() {
    setBacking(true)
    try {
      const result = await createBackup()
      if (result.success) {
        notify(`Backup saved to: ${result.path}`)
      } else {
        notify('Backup cancelled', 'error')
      }
    } finally { setBacking(false) }
  }

  function set(key, val) {
    setValues(v => ({ ...v, [key]: val }))
    setDirty(true)
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      {/* Clinic Settings */}
      <div className="card space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Clinic Information</h2>
            <p className="text-slate-400 text-sm mt-0.5">Appears on bills and receipts</p>
          </div>
          <button
            id="btn-save-settings"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="btn-primary"
          >
            {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        <div className="divider" />

        <div className="space-y-4">
          {FIELDS.map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                id={`setting-${key}`}
                className="input"
                type={type}
                placeholder={placeholder}
                value={values[key] || ''}
                onChange={e => set(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      {(values.clinic_name || values.doctor_name) && (
        <div className="card bg-slate-800 text-white">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Receipt Preview</p>
          <div className="text-center space-y-1 py-3 border-y border-slate-700">
            <p className="text-xl font-black">{values.clinic_name || 'Clinic Name'}</p>
            <p className="text-slate-300">{values.doctor_name || ''}</p>
            {values.clinic_phone && <p className="text-slate-400 text-sm">{values.clinic_phone}</p>}
            {values.clinic_address && <p className="text-slate-400 text-sm">{values.clinic_address}</p>}
          </div>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Sample Treatment</span>
              <span>{values.currency || '₹'}500</span>
            </div>
            <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-700">
              <span>Total</span>
              <span>{values.currency || '₹'}500</span>
            </div>
          </div>
        </div>
      )}

      {/* Backup */}
      <div className="card">
        <h2 className="font-bold text-slate-800 text-lg mb-1">Database Backup</h2>
        <p className="text-slate-400 text-sm mb-5">
          Creates a copy of all your clinic data. Store it on a USB drive or cloud folder.
        </p>
        <button
          id="btn-backup"
          onClick={handleBackup}
          disabled={backing}
          className="btn-secondary"
        >
          {backing
            ? <><Loader size={16} className="animate-spin" /> Creating backup…</>
            : <><HardDrive size={16} /> Create Backup (.db file)</>
          }
        </button>
        <p className="text-xs text-slate-400 mt-3">
          💡 Tip: Schedule regular backups to prevent data loss
        </p>
      </div>

      {/* About */}
      <div className="card bg-primary-50 border border-primary-100">
        <h2 className="font-bold text-primary-800 mb-1">About</h2>
        <p className="text-primary-600 text-sm">Dental Clinic Management System v1.0</p>
        <p className="text-primary-500 text-xs mt-1">Offline-first · SQLite · Electron + React</p>
      </div>
    </div>
  )
}
