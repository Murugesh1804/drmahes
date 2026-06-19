import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react'
import { getTodayQueue, updateAppointmentStatus } from '../services/api'
import { useApp } from '../context/AppContext'

const STATUS_CONFIG = {
  waiting:       { label: 'Waiting',     bg: 'bg-amber-50',   border: 'border-amber-300',   dot: 'bg-amber-400', text: 'text-amber-800'  },
  'in-progress': { label: 'In Progress', bg: 'bg-blue-50',    border: 'border-blue-400',    dot: 'bg-blue-500',  text: 'text-blue-800'   },
  done:          { label: 'Done',        bg: 'bg-emerald-50', border: 'border-emerald-300', dot: 'bg-emerald-400', text: 'text-emerald-700' },
  cancelled:     { label: 'Cancelled',   bg: 'bg-slate-50',   border: 'border-slate-200',   dot: 'bg-slate-300', text: 'text-slate-500'  },
}

export default function Queue() {
  const { notify } = useApp()
  const navigate = useNavigate()
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getTodayQueue()
      setQueue(data || [])
    } catch (e) {
      console.error(e)
      setQueue([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // SSE — real-time queue updates (falls back to 30s poll if SSE unsupported)
  useEffect(() => {
    let es = null
    try {
      es = new EventSource('/api/queue/stream')
      es.onmessage = (e) => {
        try { setQueue(JSON.parse(e.data) || []) } catch (_) {}
        setLoading(false)
      }
      es.onerror = () => {
        es?.close()
        // Fallback: poll every 30s
        const t = setInterval(load, 30000)
        return () => clearInterval(t)
      }
    } catch (_) {
      const t = setInterval(load, 30000)
      return () => clearInterval(t)
    }
    return () => es?.close()
  }, [load])

  async function handleStatus(id, status) {
    await updateAppointmentStatus(id, status)
    notify(`Status → ${STATUS_CONFIG[status].label}`)
    load()
  }

  const current = queue.find(a => a.status === 'in-progress')
  const waiting  = queue.filter(a => a.status === 'waiting')
  const done     = queue.filter(a => a.status === 'done')

  async function callNext() {
    try {
      if (current) {
        await updateAppointmentStatus(current.id, 'done')
        notify('Finished current patient')
      }
      if (waiting.length > 0) {
        await updateAppointmentStatus(waiting[0].id, 'in-progress')
        notify(`Called ${waiting[0].patient_name}`)
      } else if (!current) {
        notify('No patients waiting', 'error')
      } else {
        notify('Queue is now clear')
      }
    } catch (e) {
      notify('Error updating queue', 'error')
    } finally {
      load()
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header actions */}
      <div className="flex items-center gap-3">
        <button id="btn-refresh-queue" onClick={load} className="btn-secondary">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
        <span className="text-sm text-slate-400">Auto-refreshes every 30s</span>
        <button
          id="btn-call-next"
          onClick={callNext}
          disabled={waiting.length === 0 && !current}
          className="btn-primary btn-lg ml-auto text-base"
        >
          <ChevronRight size={20} />
          {current ? 'Finish & Call Next' : 'Call Next Patient'}
        </button>
      </div>

      {/* Current patient — hero card */}
      <div className={`rounded-3xl border-2 p-8 transition-all
        ${current
          ? 'bg-blue-600 border-blue-600 shadow-2xl shadow-blue-200'
          : 'bg-white border-dashed border-slate-200'
        }`}
      >
        {current ? (
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-white/20 flex items-center justify-center text-white text-5xl font-black">
              {current.queue_number}
            </div>
            <div className="text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-1">
                Currently Seeing
              </p>
              <p className="text-4xl font-black leading-none">{current.patient_name}</p>
              <div className="flex items-center gap-4 mt-2 text-blue-200 text-sm">
                {current.patient_phone && <span>📞 {current.patient_phone}</span>}
                {current.patient_age && <span>👤 {current.patient_age} yrs</span>}
                {current.reason && <span>• {current.reason}</span>}
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                id="btn-done-current"
                onClick={() => handleStatus(current.id, 'done')}
                className="bg-white/20 hover:bg-white/30 text-white rounded-2xl px-6 py-3 font-bold transition-all"
              >
                ✓ Done
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-slate-400">
            <Clock size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-xl">No patient in progress</p>
            <p className="text-sm mt-1">Click "Call Next Patient" to start</p>
          </div>
        )}
      </div>

      {/* Waiting list */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8">
          <h2 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-black flex items-center justify-center">
              {waiting.length}
            </span>
            Waiting
          </h2>
          {waiting.length === 0 ? (
            <div className="card text-center py-10 text-slate-400">
              <CheckCircle size={32} className="mx-auto mb-2 opacity-30" />
              <p className="font-medium">Queue is clear!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {waiting.map((a, i) => (
                <div
                  key={a.id}
                  className={`card flex items-center gap-4 transition-all
                    ${i === 0 ? 'ring-2 ring-amber-300 shadow-md' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-2xl font-black text-xl flex items-center justify-center flex-shrink-0
                    ${i === 0 ? 'bg-amber-400 text-white shadow-lg' : 'bg-slate-100 text-slate-600'}`}>
                    {a.queue_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => navigate(`/patients/${a.patient_id}`)}
                      className="font-bold text-slate-800 hover:text-primary-600 transition-colors text-lg"
                    >
                      {a.patient_name}
                    </button>
                    <div className="flex gap-3 mt-0.5 text-sm text-slate-400 flex-wrap">
                      {a.patient_phone && <span>{a.patient_phone}</span>}
                      {a.patient_age && <span>{a.patient_age} yrs</span>}
                      {a.scheduled_time && <span>⏰ {a.scheduled_time}</span>}
                      {a.reason && <span>• {a.reason}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      id={`btn-q-start-${a.id}`}
                      onClick={() => handleStatus(a.id, 'in-progress')}
                      className="btn-primary text-sm"
                    >
                      Start
                    </button>
                    <button
                      onClick={() => handleStatus(a.id, 'cancelled')}
                      className="btn-ghost text-sm text-slate-400"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Done today */}
        <div className="col-span-4">
          <h2 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">
              {done.length}
            </span>
            Completed Today
          </h2>
          <div className="space-y-2">
            {done.length === 0 ? (
              <div className="card text-center py-6 text-slate-400 text-sm">None yet</div>
            ) : (
              done.map(a => (
                <div key={a.id} className="card flex items-center gap-3 opacity-70">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center">
                    {a.queue_number}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-700 text-sm truncate">{a.patient_name}</p>
                    {a.reason && <p className="text-xs text-slate-400 truncate">{a.reason}</p>}
                  </div>
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
