import { useState, useEffect } from 'react'
import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ open, onClose, onConfirm, title = 'Are you sure?', message, confirmText = 'Confirm', danger = true }) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (!open) {
      setCountdown(3)
      return
    }
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [open, countdown])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle size={18} />
          <span>{title}</span>
        </div>
      }
      size="sm"
      footer={
        <div className="flex gap-2 w-full">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button 
            onClick={() => { onConfirm(); onClose() }} 
            disabled={countdown > 0} 
            className={`btn-primary flex-1 ${danger ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500/20' : ''}`}
          >
            {countdown > 0 ? `Wait (${countdown}s)` : confirmText}
          </button>
        </div>
      }
    >
      <p className="text-slate-600 text-sm">{message}</p>
    </Modal>
  )
}
