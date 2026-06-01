import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, CheckCircle, ArrowLeft, RotateCcw, User, Phone, Calendar, Clipboard, Check } from 'lucide-react'
import { saveConsentForm, toggleKiosk } from '../services/api'
import { useApp } from '../context/AppContext'

const GENDERS = ['Male', 'Female', 'Other']
const COMPLAINTS = [
  { name: 'Toothache', icon: '⚡' },
  { name: 'Tooth Sensitivity', icon: '❄️' },
  { name: 'Bleeding Gums', icon: '🩸' },
  { name: 'Broken Tooth', icon: '💥' },
  { name: 'Cleaning Required', icon: '🧼' },
  { name: 'Check-up', icon: '🔍' },
  { name: 'Cavity / Filling', icon: '🕳️' },
  { name: 'Missing Tooth', icon: '🦷' },
  { name: 'Braces / Alignment', icon: '😬' },
  { name: 'Other', icon: '💬' },
]
const EMPTY = { name: '', phone: '', age: '', gender: 'Male', complaint: '', notes: '' }

export default function Kiosk() {
  const { settings } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [step, setStep] = useState('form') // 'form' | 'consent' | 'success'
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [kioskOn, setKioskOn] = useState(false)

  // Signature canvas state
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [hasSigned, setHasSigned] = useState(false)
  const lastPos = useRef({ x: 0, y: 0 })

  async function handleKioskToggle() {
    const newVal = !kioskOn
    setKioskOn(newVal)
    await toggleKiosk(newVal)
  }

  function handleFormSubmit() {
    if (!form.name.trim()) { setError('Please enter your full name'); return }
    if (!form.phone.trim()) { setError('Please enter your phone number'); return }
    if (!form.complaint) { setError('Please select your complaint'); return }
    setError('')
    setStep('consent')
  }

  // Initialize canvas drawing settings when step switches to consent
  useEffect(() => {
    if (step === 'consent' && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = '#0f766e' // Premium teal stroke
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      setHasSigned(false)
    }
  }, [step])

  const getCoordinates = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    const pos = getCoordinates(e)
    lastPos.current = pos
    setDrawing(true)
  }

  const draw = (e) => {
    if (!drawing) return
    e.preventDefault()
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getCoordinates(e)
    
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    
    lastPos.current = pos
    setHasSigned(true)
  }

  const stopDrawing = () => {
    setDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      setHasSigned(false)
      setError('')
    }
  }

  const getCompressedSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    
    const smallCanvas = document.createElement('canvas')
    smallCanvas.width = 400
    smallCanvas.height = 200
    const ctx = smallCanvas.getContext('2d')
    ctx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height)
    return smallCanvas.toDataURL('image/jpeg', 0.3)
  }

  async function handleConsentSubmit() {
    if (!hasSigned) {
      setError('Please sign the consent form before checking in.')
      return
    }

    const signatureStr = getCompressedSignature()
    if (!signatureStr) {
      setError('Failed to capture signature. Please try again.')
      return
    }

    setError('')
    setSaving(true)
    try {
      const res = await saveConsentForm({
        name: form.name.trim(),
        phone: form.phone.trim(),
        age: form.age ? Number(form.age) : null,
        gender: form.gender,
        complaint: form.complaint,
        notes: form.notes,
        signature: signatureStr,
      })

      setResult(res)
      setStep('success')
    } catch (e) {
      setError('Something went wrong saving consent. Please ask staff for help.')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  function reset() {
    setForm(EMPTY)
    setStep('form')
    setResult(null)
    setError('')
    setHasSigned(false)
  }

  const set = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); setError('') }

  return (
    <div className="kiosk-page flex flex-col min-h-screen bg-[#060c18] text-slate-100 font-sans">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-slate-900/60 bg-[#0d1527]/80 backdrop-blur-md z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            className="h-12 w-auto object-contain rounded-xl bg-white/10 p-1 border border-white/5 shadow-md shadow-slate-950/20"
            alt="Logo"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <div>
            <p className="text-white font-extrabold text-xl tracking-tight leading-none">
              {settings?.clinic_name || "Dr. Mahe's Dentistry"}
            </p>
            <p className="text-slate-400 text-xs mt-1.5 font-medium tracking-wide uppercase">Patient Self Check-in</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleKioskToggle}
            className="text-xs text-slate-300 hover:text-white border border-slate-800 hover:border-slate-600 rounded-xl px-4 py-2.5 transition-all font-semibold bg-slate-950/30"
          >
            {kioskOn ? 'Exit Fullscreen' : 'Fullscreen Kiosk'}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-semibold transition-all px-3 py-2 hover:bg-slate-800/40 rounded-xl"
          >
            <X size={16} /> Exit
          </button>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="w-full max-w-lg mx-auto mt-8 px-6">
        <div className="flex items-center justify-between relative">
          {/* Connector Line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 -z-10 rounded-full" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary-500 -z-10 rounded-full transition-all duration-300"
            style={{ width: step === 'form' ? '10%' : step === 'consent' ? '50%' : '100%' }}
          />

          {/* Step 1 */}
          <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border transition-all duration-300
              ${step === 'form'
                ? 'bg-primary-600 border-primary-500 text-white ring-4 ring-primary-950/50'
                : 'bg-primary-950 border-primary-600 text-primary-400'}`}>
              {step !== 'form' ? <Check size={14} /> : '1'}
            </div>
            <span className={`text-xs font-bold transition-all duration-300 ${step === 'form' ? 'text-primary-400' : 'text-slate-500'}`}>Details</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border transition-all duration-300
              ${step === 'consent'
                ? 'bg-primary-600 border-primary-500 text-white ring-4 ring-primary-950/50'
                : step === 'success'
                  ? 'bg-primary-950 border-primary-600 text-primary-400'
                  : 'bg-[#0b1222] border-slate-800 text-slate-600'}`}>
              {step === 'success' ? <Check size={14} /> : '2'}
            </div>
            <span className={`text-xs font-bold transition-all duration-300 ${step === 'consent' ? 'text-primary-400' : 'text-slate-500'}`}>Consent</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border transition-all duration-300
              ${step === 'success'
                ? 'bg-emerald-600 border-emerald-500 text-white ring-4 ring-emerald-950/50'
                : 'bg-[#0b1222] border-slate-800 text-slate-600'}`}>
              3
            </div>
            <span className={`text-xs font-bold transition-all duration-300 ${step === 'success' ? 'text-emerald-400' : 'text-slate-500'}`}>Complete</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-6 py-6 overflow-y-auto">
        {step === 'form' && (
          <div className="w-full max-w-2xl bg-[#0b1222]/80 p-8 rounded-[2rem] border border-slate-900/60 shadow-2xl shadow-slate-950/40 animate-fade-in my-6">
            <div className="text-center mb-8">
              <h1 className="text-white text-3xl font-black tracking-tight mb-2">Welcome to Our Clinic</h1>
              <p className="text-slate-400 text-sm">Please register your information to enter the treatment queue</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3.5 text-red-300 text-sm font-semibold mb-6 text-center">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 font-bold text-sm mb-2">
                  <User size={16} className="text-primary-400" /> Full Name *
                </label>
                <input
                  id="kiosk-name"
                  className="w-full bg-[#060a12]/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl px-5 py-4 text-white text-base
                    placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={set('name')}
                  autoFocus
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 font-bold text-sm mb-2">
                  <Phone size={16} className="text-primary-400" /> Phone Number *
                </label>
                <input
                  id="kiosk-phone"
                  className="w-full bg-[#060a12]/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl px-5 py-4 text-white text-base
                    placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter 10-digit mobile number"
                  value={form.phone}
                  onChange={set('phone')}
                  inputMode="tel"
                />
              </div>

              {/* Age + Gender row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-slate-300 font-bold text-sm mb-2">
                    <Calendar size={16} className="text-primary-400" /> Age (optional)
                  </label>
                  <input
                    id="kiosk-age"
                    className="w-full bg-[#060a12]/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl px-5 py-4 text-white text-base
                      placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Enter your age"
                    type="number"
                    min="1" max="120"
                    value={form.age}
                    onChange={set('age')}
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold text-sm mb-2">Gender</label>
                  <div className="flex gap-2">
                    {GENDERS.map(g => (
                      <button
                        key={g}
                        onClick={() => setForm(f => ({ ...f, gender: g }))}
                        className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all border
                          ${form.gender === g
                            ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-950/30'
                            : 'bg-[#060a12]/80 border-slate-800 text-slate-400 hover:bg-slate-900/40'
                          }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Complaint Grid */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 font-bold text-sm mb-3">
                  <Clipboard size={16} className="text-primary-400" /> Primary Dental Concern *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {COMPLAINTS.map(c => (
                    <button
                      key={c.name}
                      onClick={() => setForm(f => ({ ...f, complaint: c.name }))}
                      className={`px-4 py-3.5 rounded-2xl font-bold text-xs text-left border flex items-center gap-2.5 transition-all
                        ${form.complaint === c.name
                          ? 'bg-primary-950 border-primary-500 text-primary-300 shadow-md ring-1 ring-primary-500/30'
                          : 'bg-[#060a12]/30 border-slate-900/60 text-slate-400 hover:border-slate-800 hover:bg-slate-900/20'
                        }`}
                    >
                      <span className="text-base">{c.icon}</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-bold text-sm mb-2">Details / Remarks (optional)</label>
                <textarea
                  id="kiosk-notes"
                  className="w-full bg-[#060a12]/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl px-5 py-3 text-white text-sm
                    placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all"
                  rows={2}
                  placeholder="Mention active tooth pain locations, systemic diseases, allergies, etc."
                  value={form.notes}
                  onChange={set('notes')}
                />
              </div>

              <button
                onClick={handleFormSubmit}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-extrabold text-lg
                  py-4.5 rounded-2xl shadow-xl shadow-primary-950/40
                  transition-all active:scale-[0.98] mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                Proceed to Treatment Consent <span className="text-xl">→</span>
              </button>
            </div>
          </div>
        )}

        {step === 'consent' && (
          <div className="w-full max-w-2xl bg-[#0b1222]/80 p-8 rounded-[2rem] border border-slate-900/60 shadow-2xl animate-fade-in flex flex-col my-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep('form')} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800/40 rounded-xl transition-all">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-white text-2xl font-bold tracking-tight">Clinical Consent</h2>
                <p className="text-slate-400 text-xs mt-0.5">Step 2: Sign declaration agreement</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3 text-red-300 text-sm font-semibold mb-5 text-center">
                ⚠️ {error}
              </div>
            )}

            {/* Consent Form Card */}
            <div className="bg-[#060a12]/80 rounded-2xl p-6 border border-slate-800/80 text-slate-300 text-sm leading-relaxed mb-6 select-none relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl" />
              <p className="font-semibold text-white mb-2 uppercase text-xs tracking-wider text-primary-400">Treatment Authorization</p>
              I, <strong className="text-white">{form.name}</strong>, hereby consent to undergo clinical diagnostic scans, dental cleanings, and treatments deemed necessary by the specialist team of <strong className="text-white">{settings?.clinic_name || "Dr. Mahe's Dentistry"}</strong>. I confirm the treatment options, procedural risks, and associated budgets have been outlined to my satisfaction.
            </div>

            {/* Signature Area */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-slate-300 font-bold text-sm">Patient Signature Space *</label>
                <button
                  onClick={clearSignature}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-colors font-semibold"
                >
                  <RotateCcw size={12} /> Clear Canvas
                </button>
              </div>

              {/* Pad Frame */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-inner border-2 border-slate-800 p-2" style={{ height: '220px' }}>
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair bg-white touch-none"
                />
              </div>
              <p className="text-slate-500 text-xs text-center mt-2.5">Use your finger or mouse pointer to sign within the white box</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={() => setStep('form')}
                className="flex-1 bg-slate-950/60 hover:bg-slate-900/60 text-slate-300 border border-slate-800 font-bold py-4.5 rounded-2xl transition-all cursor-pointer"
              >
                Back to Details
              </button>
              <button
                onClick={handleConsentSubmit}
                disabled={saving}
                className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-extrabold text-base py-4.5 rounded-2xl shadow-lg shadow-primary-950/30 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {saving ? 'Registering...' : 'Agree & Finish Check In ✓'}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center animate-fade-in max-w-md w-full bg-[#0b1222]/80 p-8 rounded-[2rem] border border-slate-900/60 shadow-2xl my-6">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-400">
              <CheckCircle size={44} />
            </div>
            <h2 className="text-white text-3xl font-black mb-1">Check-in Complete!</h2>
            <p className="text-slate-400 text-sm mb-8">Please wait in the reception. We will call you shortly.</p>

            <div className="bg-[#060a12]/80 rounded-2xl p-8 border border-slate-800/80 mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none" />
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1.5">Your Queue Number</p>
              <p className="text-primary-400 text-8xl font-black leading-none">{result?.appt?.queue_number}</p>
              <p className="text-white mt-5 text-lg font-bold">{result?.patient?.name}</p>
              <p className="text-slate-400 text-sm mt-0.5 font-medium">{result?.patient?.complaint}</p>
            </div>

            <button
              onClick={reset}
              className="w-full bg-slate-850 hover:bg-slate-800 text-white font-bold text-base
                py-4.5 rounded-2xl transition-all border border-slate-800 cursor-pointer"
            >
              Done / Next Patient →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
