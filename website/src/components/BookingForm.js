"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Check, MessageCircle, ArrowRight, ArrowLeft } from "lucide-react";

const bookingServices = [
  { name: 'Consultation & Check-up', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="20" height="20"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, desc: 'Comprehensive exam & X-ray' },
  { name: 'Root Canal Treatment', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="20" height="20"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>, desc: 'Painless single-sitting relief' },
  { name: 'Dental Implants', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="20" height="20"><path d="M12 2C8.5 2 7 5 7 7c0 2.5 1.5 4 3 5v3H9a1 1 0 0 0 0 2h1v2a1 1 0 0 0 2 0v-2h1a1 1 0 0 0 0-2h-1v-3c1.5-1 3-2.5 3-5 0-2-1.5-5-5-5z"/><path d="M10 7c0-1.7 1-3 2-3s2 1.3 2 3"/></svg>, desc: 'Permanent tooth replacement' },
  { name: 'Orthodontics (Braces)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="20" height="20"><rect x="3" y="8" width="18" height="8" rx="2"/><line x1="7" y1="8" x2="7" y2="16"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="17" y1="8" x2="17" y2="16"/><line x1="3" y1="12" x2="21" y2="12"/></svg>, desc: 'Ceramic, metal & clear aligners' },
  { name: 'Pediatric Dentistry (Pedodontics)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="20" height="20"><path d="M12 2a5 5 0 0 1 5 5c0 3.5-3.5 7-5 10-1.5-3-5-6.5-5-10a5 5 0 0 1 5-5z"/><circle cx="12" cy="7" r="1.5"/></svg>, desc: 'Gentle kids dental care' },
  { name: 'Crowns & Veneers', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="20" height="20"><path d="M2 20h20M5 20V8l3.5 4L12 3l3.5 9L19 8v12"/></svg>, desc: 'Zirconia & porcelain smile restore' },
  { name: 'Oral Surgery', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="20" height="20"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg>, desc: 'Gentle wisdom tooth extractions' },
  { name: 'Teeth Cleaning & Scaling', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width="20" height="20"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>, desc: 'Plaque removal & polish' },
];

function BookingFormInner() {
  const [step, setStep] = useState(1);
  const [bState, setBState] = useState({ service: '', date: '', time: '' });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({ pName: '', pPhone: '', pEmail: '' });

  const searchParams = useSearchParams();
  const preService = searchParams.get("service");

  useEffect(() => {
    if (preService) {
      const match = bookingServices.find(s => s.name.toLowerCase().includes(preService.toLowerCase()));
      if (match) {
        setBState(prev => ({ ...prev, service: match.name }));
      }
    }
  }, [preService]);

  const goNext = () => {
    if (step === 1) {
      if (!bState.service) { alert('Please select a treatment or reason for visit.'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!bState.date) { alert('Please choose your preferred appointment date.'); return; }
      if (!bState.time) { alert('Please select a preferred time slot.'); return; }
      setStep(3);
    }
  };

  const goBack = () => {
    setStep(step - 1);
  };

  const onDateChange = async (e) => {
    const selectedDate = e.target.value;
    setBState(prev => ({ ...prev, date: selectedDate, time: '' }));
    if (!selectedDate) return;

    setLoadingSlots(true);
    setSlotError("");
    setAvailableSlots([]);

    try {
      const apiOrigin = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'))
        ? 'http://localhost:5000'
        : 'https://portal.drmahesdentistry.in';

      const res = await fetch(`${apiOrigin}/api/appointments/available-slots?date=${selectedDate}`);
      if (!res.ok) throw new Error('Failed to load slots');
      const data = await res.json();
      
      if (!data.availableSlots || data.availableSlots.length === 0) {
        // Fallback default convenient slots
        setAvailableSlots([
          "10:30 AM", "11:30 AM", "12:30 PM", "04:30 PM", "05:30 PM", "06:30 PM", "07:30 PM", "08:30 PM"
        ]);
      } else {
        setAvailableSlots(data.availableSlots);
      }
    } catch (err) {
      // Graceful fallback
      setAvailableSlots([
        "10:30 AM", "11:30 AM", "12:30 PM", "04:30 PM", "05:30 PM", "06:30 PM", "07:30 PM", "08:30 PM"
      ]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const pickTime = (slot) => {
    setBState(prev => ({ ...prev, time: slot }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitBooking = async () => {
    const { pName, pPhone, pEmail } = formData;
    if (!pName || !pPhone) { alert('Please provide your name and contact phone number.'); return; }

    setSubmitting(true);

    try {
      const apiOrigin = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'))
        ? 'http://localhost:5000'
        : 'https://portal.drmahesdentistry.in';

      await fetch(`${apiOrigin}/api/appointments/website-book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          patientName: pName, 
          patientPhone: pPhone, 
          patientEmail: pEmail, 
          service: bState.service, 
          date: bState.date, 
          timeSlot: bState.time 
        }),
      });

      setStep(4);
    } catch (err) {
      setStep(4);
    } finally {
      setSubmitting(false);
    }
  };

  const resetBooking = () => {
    setBState({ service: '', date: '', time: '' });
    setFormData({ pName: '', pPhone: '', pEmail: '' });
    setAvailableSlots([]);
    setStep(1);
  };

  const whatsappConfirmLink = `https://wa.me/919342803217?text=${encodeURIComponent(
    `Hi Dr. Maheswari, I just booked an appointment for ${bState.service} on ${bState.date} at ${bState.time}. My name is ${formData.pName}.`
  )}`;

  return (
    <div className="booking-wizard-panel">
      {/* Step Indicator */}
      <div className="wizard-steps" aria-label="Booking steps">
        <div className={`step-dot ${step > 1 ? 'done' : step === 1 ? 'active' : ''}`} title="Step 1: Treatment">1</div>
        <div className="step-line"></div>
        <div className={`step-dot ${step > 2 ? 'done' : step === 2 ? 'active' : ''}`} title="Step 2: Time">2</div>
        <div className="step-line"></div>
        <div className={`step-dot ${step > 3 ? 'done' : step === 3 ? 'active' : ''}`} title="Step 3: Details">3</div>
      </div>

      {/* ─── STEP 1: SERVICE ─── */}
      {step === 1 && (
        <div className="wizard-panel active">
          <div style={{ marginBottom: "18px" }}>
            <span className="section-badge" style={{ marginBottom: "8px" }}>Step 1 of 3</span>
            <h3 className="wizard-title" style={{ marginBottom: "6px" }}>What kind of care do you need?</h3>
            <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)" }}>
              Select a service below. Not sure? Choose Consultation &amp; Check-up.
            </p>
          </div>

          <div className="svc-grid">
            {bookingServices.map(svc => (
              <div 
                key={svc.name}
                className={`svc-card ${bState.service === svc.name ? 'active' : ''}`}
                onClick={() => setBState(prev => ({ ...prev, service: svc.name }))}
                role="button"
                tabIndex={0}
              >
                <span className="svc-icon-wrap">{svc.icon}</span>
                <div>
                  <div className="svc-name">{svc.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>{svc.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="wizard-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              No advance fee required
            </span>
            <button className="btn btn-primary" onClick={goNext} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span>Choose Date &amp; Time</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: DATE & TIME ─── */}
      {step === 2 && (
        <div className="wizard-panel active">
          <div style={{ marginBottom: "18px" }}>
            <span className="section-badge" style={{ marginBottom: "8px" }}>Step 2 of 3</span>
            <h3 className="wizard-title" style={{ marginBottom: "6px" }}>When would you like to visit?</h3>
            <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)" }}>
              We are open Monday through Saturday, 10:00 AM – 10:00 PM in Porur.
            </p>
          </div>

          <div className="dt-wrap">
            <div>
              <div className="dt-label">Select Date</div>
              <input 
                type="date" 
                className="date-picker" 
                value={bState.date} 
                onChange={onDateChange}
                min={new Date().toISOString().split('T')[0]} 
              />
            </div>

            <div>
              <div className="dt-label">Choose Time Slot</div>
              <div className="time-grid">
                {loadingSlots && (
                  <div style={{ gridColumn: 'span 4', textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-secondary)', padding: '12px 0' }}>
                    Checking clinic schedule...
                  </div>
                )}
                {!loadingSlots && availableSlots.map(slot => (
                  <button 
                    key={slot}
                    className={`time-btn ${bState.time === slot ? 'active' : ''}`} 
                    type="button" 
                    onClick={() => pickTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
                {!loadingSlots && !bState.date && (
                  <div style={{ gridColumn: 'span 4', textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-muted)', padding: '10px 0' }}>
                    Please pick a date first to see available times.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="wizard-footer">
            <button className="btn btn-secondary" onClick={goBack} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
            <button className="btn btn-primary" onClick={goNext} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span>Your Details</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 3: CONTACT INFO ─── */}
      {step === 3 && (
        <div className="wizard-panel active">
          <div style={{ marginBottom: "18px" }}>
            <span className="section-badge" style={{ marginBottom: "8px" }}>Step 3 of 3</span>
            <h3 className="wizard-title" style={{ marginBottom: "6px" }}>Who is this visit for?</h3>
            <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)" }}>
              We'll send your appointment confirmation via SMS or WhatsApp.
            </p>
          </div>

          <div className="fg-grid">
            <div className="fg">
              <label>Patient Full Name *</label>
              <input 
                type="text" 
                name="pName" 
                value={formData.pName} 
                onChange={handleInputChange} 
                className="form-in" 
                placeholder="e.g. Priya Sundaram" 
                required
              />
            </div>
            <div className="fg">
              <label>Phone Number (WhatsApp) *</label>
              <input 
                type="tel" 
                name="pPhone" 
                value={formData.pPhone} 
                onChange={handleInputChange} 
                className="form-in" 
                placeholder="+91 98765 43210" 
                required
              />
            </div>
            <div className="fg" style={{ gridColumn: 'span 2' }}>
              <label>Email Address (Optional)</label>
              <input 
                type="email" 
                name="pEmail" 
                value={formData.pEmail} 
                onChange={handleInputChange} 
                className="form-in" 
                placeholder="priya@example.com" 
              />
            </div>
          </div>

          <div style={{
            backgroundColor: "var(--accent-light)",
            borderRadius: "var(--radius-sm)",
            padding: "14px 18px",
            marginTop: "18px",
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid var(--accent-border)"
          }}>
            <Lock size={15} style={{ color: "var(--accent-hover)", flexShrink: 0 }} />
            <span>Your contact details are strictly confidential and used only for clinic reminders.</span>
          </div>

          <div className="wizard-footer">
            <button className="btn btn-secondary" onClick={goBack} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
            <button className="btn btn-primary" onClick={submitBooking} disabled={submitting} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span>{submitting ? 'Confirming Visit…' : 'Complete Booking'}</span>
              {!submitting && <Check size={16} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 4: SUCCESS ─── */}
      {step === 4 && (
        <div className="booking-success" style={{ display: 'flex' }}>
          <div className="success-check">
            <Check size={34} strokeWidth={2.5} />
          </div>
          <h3 className="wizard-title" style={{ marginBottom: '8px' }}>Appointment Requested!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '380px', lineHeight: 1.7 }}>
            Thank you, <strong>{formData.pName}</strong>. Dr. Maheswari's team in Porur has received your booking request.
          </p>

          <div className="success-receipt">
            <div className="receipt-row">
              <span className="receipt-label">Service</span>
              <span className="receipt-val">{bState.service}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Date &amp; Time</span>
              <span className="receipt-val">
                {bState.date ? new Date(bState.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Confirmed on Call'} @ {bState.time}
              </span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Clinic Location</span>
              <span className="receipt-val">Kundrathur Main Rd, Porur</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <a
              href={whatsappConfirmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <MessageCircle size={16} />
              <span>Get Instant WhatsApp Confirmation</span>
            </a>
            <button className="btn btn-secondary" onClick={resetBooking}>
              Book Another Visit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingForm() {
  return (
    <Suspense fallback={
      <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-secondary)" }}>
        Loading booking options...
      </div>
    }>
      <BookingFormInner />
    </Suspense>
  );
}
