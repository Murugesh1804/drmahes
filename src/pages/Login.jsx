import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, KeyRound, Monitor, ArrowRight, Mail, RotateCcw, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { login, verifyOtp, settings, notify } = useApp()
  const navigate = useNavigate()

  // Step 1 state
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Step tracking
  const [step, setStep] = useState(1) // 1 = password, 2 = OTP
  const [sessionId, setSessionId] = useState(null)

  // Step 2 state
  const [otp, setOtp] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(300) // 5 minutes
  const [canResend, setCanResend] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(30)

  // Shared state
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const otpInputRef = useRef(null)
  const timerRef = useRef(null)
  const resendRef = useRef(null)

  // Start countdown when we enter OTP step
  useEffect(() => {
    if (step !== 2) return

    // Auto-focus OTP input
    setTimeout(() => otpInputRef.current?.focus(), 100)

    // Main OTP expiry countdown (5 min)
    setSecondsLeft(300)
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current)
          setError('OTP has expired. Please start over.')
          return 0
        }
        return s - 1
      })
    }, 1000)

    // Resend cooldown (30s)
    setCanResend(false)
    setResendCooldown(30)
    resendRef.current = setInterval(() => {
      setResendCooldown(s => {
        if (s <= 1) {
          clearInterval(resendRef.current)
          setCanResend(true)
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => {
      clearInterval(timerRef.current)
      clearInterval(resendRef.current)
    }
  }, [step])

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  // Step 1: Submit password
  const handlePasswordSubmit = async (e) => {
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
      setSessionId(result.sessionId)
      setStep(2)
      setPassword('')
    } else {
      setError(result.error || 'Invalid security password')
      setPassword('')
    }
  }

  // Step 2: Submit OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit code from your email')
      return
    }
    if (secondsLeft === 0) {
      setError('OTP has expired. Please start over.')
      return
    }

    setIsSubmitting(true)
    setError('')

    const result = await verifyOtp(sessionId, otp)
    setIsSubmitting(false)

    if (result.success) {
      notify('Welcome back! Portal unlocked. 🔐')
    } else {
      setError(result.error || 'Invalid OTP code')
      setOtp('')
      otpInputRef.current?.focus()
    }
  }

  // Resend OTP — go back to step 1 to re-enter password (more secure than storing password in state)
  const handleResend = () => {
    if (!canResend) return
    handleGoBack()
  }

  const handleGoBack = () => {
    clearInterval(timerRef.current)
    clearInterval(resendRef.current)
    setStep(1)
    setOtp('')
    setError('')
    setSessionId(null)
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

        {/* Step indicators */}
        <div className="flex items-center gap-3 mb-7 w-full justify-center">
          <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${step === 1 ? 'text-teal-400' : 'text-emerald-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all
              ${step === 1 ? 'bg-teal-500/20 border-teal-500 text-teal-400' : 'bg-emerald-500/20 border-emerald-500 text-emerald-400'}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            Password
          </div>
          <div className={`flex-1 h-px transition-colors ${step === 2 ? 'bg-teal-500/50' : 'bg-slate-800'}`} />
          <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${step === 2 ? 'text-teal-400' : 'text-slate-600'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all
              ${step === 2 ? 'bg-teal-500/20 border-teal-500 text-teal-400' : 'bg-slate-800 border-slate-700 text-slate-600'}`}>
              2
            </div>
            Verify Email
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-red-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5 mb-4">
            ⚠️ {error}
          </div>
        )}

        {/* ── STEP 1: Password ──────────────────────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handlePasswordSubmit} className="w-full space-y-5">
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
                <>Continue <ArrowRight size={14} /></>
              )}
            </button>
          </form>
        )}

        {/* ── STEP 2: OTP ────────────────────────────────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="w-full space-y-5">
            {/* Info banner */}
            <div className="bg-teal-500/5 border border-teal-500/20 rounded-2xl px-4 py-3.5 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Mail size={14} className="text-teal-400" />
                <span className="text-teal-300 font-bold text-xs uppercase tracking-wider">Check Your Email</span>
              </div>
              <p className="text-slate-400 text-xs">
                A 6-digit code was sent to your admin email address.
              </p>
            </div>

            {/* OTP input */}
            <div>
              <label className="flex items-center justify-between text-slate-300 font-bold text-xs mb-2 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-teal-400" /> Enter OTP Code
                </span>
                {/* Countdown */}
                <span className={`font-mono font-black text-sm ${secondsLeft <= 60 ? 'text-red-400' : 'text-teal-400'}`}>
                  {formatTime(secondsLeft)}
                </span>
              </label>
              <input
                id="otp-input"
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className="w-full bg-[#060a12]/80 border border-slate-800/85 hover:border-slate-700 rounded-2xl px-4 py-4 text-white text-3xl font-black text-center
                  tracking-[0.5em] placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-transparent transition-all font-mono"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setOtp(val)
                  if (error) setError('')
                }}
                disabled={isSubmitting || secondsLeft === 0}
                autoComplete="one-time-code"
              />
            </div>

            {/* Submit */}
            <button
              id="btn-otp-submit"
              type="submit"
              disabled={isSubmitting || secondsLeft === 0 || otp.length !== 6}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-extrabold text-sm py-4 rounded-2xl
                shadow-lg shadow-teal-950/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Verify & Unlock <ShieldCheck size={14} /></>
              )}
            </button>

            {/* Resend + Back row */}
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleGoBack}
                className="text-slate-500 hover:text-slate-300 font-semibold flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>
              <button
                id="btn-resend-otp"
                type="button"
                onClick={handleResend}
                disabled={!canResend || isSubmitting}
                className={`font-bold flex items-center gap-1.5 transition-colors
                  ${canResend ? 'text-teal-400 hover:text-teal-300 cursor-pointer' : 'text-slate-600 cursor-not-allowed'}`}
              >
                <RotateCcw size={11} />
                {canResend ? 'Resend code' : `Resend in ${resendCooldown}s`}
              </button>
            </div>
          </form>
        )}

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
