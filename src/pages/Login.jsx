import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, KeyRound, Monitor, ArrowRight } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { login, settings, notify } = useApp()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password) {
      setError('Please enter your portal password')
      return
    }

    setIsSubmitting(true)
    setError('')

    const result = await login(password)
    setIsSubmitting(false)

    if (result.success) {
      notify('Welcome back! Portal unlocked.')
    } else {
      setError(result.error || 'Invalid security password')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-[#070d19] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Ambient Lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Glassmorphic Container */}
      <div className="bg-[#0b1222]/60 border border-slate-800/80 backdrop-blur-xl rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative z-10 flex flex-col items-center">
        {/* Clinic Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-slate-900/80 rounded-2xl flex items-center justify-center border border-slate-800/60 p-2.5 mb-4 shadow-inner">
            <img
              src="/logo.png"
              className="w-full h-full object-contain"
              alt="Logo"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
          <h2 className="text-white text-2xl font-black tracking-tight">
            {settings?.clinic_name || "Dr. Mahe's Dentistry"}
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold tracking-wider uppercase">
            Clinical Management System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-red-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="flex items-center gap-1.5 text-slate-300 font-bold text-xs mb-2 uppercase tracking-wider">
              <Lock size={12} className="text-teal-400" /> Portal Password
            </label>
            <div className="relative">
              <input
                id="portal-password"
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-[#060a12]/80 border border-slate-800/85 hover:border-slate-700 rounded-2xl pl-11 pr-12 py-3.5 text-white text-sm
                  placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError('')
                }}
                disabled={isSubmitting}
                autoFocus
              />
              <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-extrabold text-sm py-4 rounded-2xl
              shadow-lg shadow-teal-950/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Unlock CMS Portal <ArrowRight size={14} /></>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="w-full flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-800/60" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-slate-800/60" />
        </div>

        {/* Kiosk Mode Bypass Button */}
        <button
          id="btn-kiosk-bypass"
          onClick={() => navigate('/kiosk')}
          className="w-full bg-slate-900/40 hover:bg-slate-900/90 text-slate-300 border border-slate-800/60 hover:border-slate-700 font-bold text-xs py-3.5 rounded-2xl
            transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Monitor size={14} className="text-teal-400" /> Patient Self Check-in Kiosk
        </button>
      </div>
    </div>
  )
}
