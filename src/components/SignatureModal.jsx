import { useRef, useState, useEffect, useCallback } from 'react'
import Modal from './Modal'

export default function SignatureModal({ open, onClose, onSave, patientName, saving }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  // Initialize canvas when modal opens
  useEffect(() => {
    if (open && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      // Fill white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = '#0f172a'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      setHasSignature(false)
    }
  }, [open])

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    // Scale coordinates based on canvas size vs display size
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    }
  }, [])

  function startPosition(e) {
    if (e.type !== 'touchstart') e.preventDefault()
    setIsDrawing(true)
    const { x, y } = getPos(e)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
    setHasSignature(true)
  }

  function draw(e) {
    if (!isDrawing) return
    e.preventDefault()
    const { x, y } = getPos(e)
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function endPosition(e) {
    if (e.type !== 'touchend') e.preventDefault()
    setIsDrawing(false)
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    setHasSignature(false)
  }

  function handleSave() {
    if (!hasSignature) return
    const canvas = canvasRef.current
    // Use lower quality jpeg to save space just like kiosk
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6)
    onSave(dataUrl)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Sign Consent Form"
      size="md"
      footer={
        <>
          <button onClick={clearCanvas} type="button" className="btn-secondary mr-auto">
            Clear
          </button>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !hasSignature} className="btn-primary bg-amber-600 hover:bg-amber-700 border-none">
            {saving ? 'Saving...' : 'Save Signature'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          I, <strong className="text-slate-800">{patientName}</strong>, hereby authorize the clinical team of Dr. Mahe's Dentistry to perform dental procedures, diagnostic scans and treatments as necessary to address my condition. I understand that the clinical options, costs and risks have been discussed and I consent to proceed with the treatment plan.
        </p>

        <div className="mt-4">
          <label className="label">Please sign below</label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white touch-none">
            <canvas
              ref={canvasRef}
              width={600}
              height={300}
              className="w-full h-auto cursor-crosshair"
              style={{ maxHeight: '200px' }}
              onMouseDown={startPosition}
              onMouseMove={draw}
              onMouseUp={endPosition}
              onMouseLeave={endPosition}
              onTouchStart={startPosition}
              onTouchMove={draw}
              onTouchEnd={endPosition}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
