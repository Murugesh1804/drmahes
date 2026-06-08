"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const bookingServices = [
  { name: 'Consultation & Check-up', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { name: 'Dental Implants', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C8.5 2 7 5 7 7c0 2.5 1.5 4 3 5v3H9a1 1 0 0 0 0 2h1v2a1 1 0 0 0 2 0v-2h1a1 1 0 0 0 0-2h-1v-3c1.5-1 3-2.5 3-5 0-2-1.5-5-5-5z"/><path d="M10 7c0-1.7 1-3 2-3s2 1.3 2 3"/></svg> },
  { name: 'Root Canal Treatment', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg> },
  { name: 'Orthodontics (Braces)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="8" width="18" height="8" rx="2"/><line x1="7" y1="8" x2="7" y2="16"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="17" y1="8" x2="17" y2="16"/><line x1="3" y1="12" x2="21" y2="12"/></svg> },
  { name: 'Cosmetic Dentistry', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9 0 3.93 2.52 7.27 6.02 8.5C9.7 20.83 10.82 21 12 21s2.3-.17 2.98-.5C18.48 19.27 21 15.93 21 12c0-4.97-4.03-9-9-9z"/><path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4"/></svg> },
  { name: 'Oral Surgery', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg> },
  { name: 'Crowns & Veneers', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 20h20M5 20V8l3.5 4L12 3l3.5 9L19 8v12"/></svg> },
  { name: 'Teeth Cleaning', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
];

export default function BookingForm() {
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
      if (!bState.service) { alert('Please select a treatment to continue.'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!bState.date) { alert('Please select a date.'); return; }
      if (!bState.time) { alert('Please select a time slot.'); return; }
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
      // Allow relative paths by leveraging proxy or pointing to localhost during dev
      const apiOrigin = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'))
        ? 'http://localhost:5000'
        : 'https://portal.drmahesdentistry.in';

      const res = await fetch(`${apiOrigin}/api/appointments/available-slots?date=${selectedDate}`);
      if (!res.ok) throw new Error('Failed to load slots');
      const data = await res.json();
      
      if (!data.availableSlots || data.availableSlots.length === 0) {
        setSlotError('No slots available for this day.');
      } else {
        setAvailableSlots(data.availableSlots);
      }
    } catch (err) {
      setSlotError('Error loading slots.');
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
    if (!pName || !pPhone) { alert('Please enter your name and phone number.'); return; }

    setSubmitting(true);

    try {
      const apiOrigin = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'))
        ? 'http://localhost:5000'
        : 'https://portal.drmahesdentistry.in';

      const res = await fetch(`${apiOrigin}/api/appointments/website-book`, {
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

      if (!res.ok) throw new Error('Server error');
      
      setStep(4);
    } catch (err) {
      alert('Unable to submit booking. Please call us at +91 93428 03217.');
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

  return (
    <div className="booking-wizard-panel">
      <div className="wizard-steps">
        <div className={`step-dot ${step > 1 ? 'done' : step === 1 ? 'active' : ''}`} id="dot1">1</div>
        <div className="step-line"></div>
        <div className={`step-dot ${step > 2 ? 'done' : step === 2 ? 'active' : ''}`} id="dot2">2</div>
        <div className="step-line"></div>
        <div className={`step-dot ${step > 3 ? 'done' : step === 3 ? 'active' : ''}`} id="dot3">3</div>
      </div>

      {step === 1 && (
        <div className="wizard-panel active" id="step1">
          <h3 className="wizard-title">Select Treatment</h3>
          <div className="svc-grid" id="svcGrid">
            {bookingServices.map(svc => (
              <div 
                key={svc.name}
                className={`svc-card ${bState.service === svc.name ? 'active' : ''}`}
                onClick={() => setBState(prev => ({ ...prev, service: svc.name }))}
              >
                <span className="svc-icon">{svc.icon}</span>
                <span className="svc-name">{svc.name}</span>
              </div>
            ))}
          </div>
          <div className="wizard-footer" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={goNext}>Continue ➔</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="wizard-panel active" id="step2">
          <h3 className="wizard-title">Date &amp; Time</h3>
          <div className="dt-wrap">
            <div>
              <div className="dt-label">Choose Date</div>
              <input 
                type="date" 
                className="date-picker" 
                value={bState.date} 
                onChange={onDateChange}
                min={new Date().toISOString().split('T')[0]} 
              />
            </div>
            <div>
              <div className="dt-label">Select Slot</div>
              <div className="time-grid" id="timeGrid">
                {loadingSlots && <div style={{ gridColumn: 'span 4', textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>Loading available slots...</div>}
                {slotError && <div style={{ gridColumn: 'span 4', textAlign: 'center', fontSize: '0.86rem', color: '#C0392B', fontWeight: 600 }}>{slotError}</div>}
                {!loadingSlots && !slotError && availableSlots.map(slot => (
                  <button 
                    key={slot}
                    className={`time-btn ${bState.time === slot ? 'active' : ''}`} 
                    type="button" 
                    onClick={() => pickTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
                {!loadingSlots && !slotError && availableSlots.length === 0 && bState.date && (
                   <div style={{ gridColumn: 'span 4', textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>No slots found.</div>
                )}
                {!bState.date && <div style={{ gridColumn: 'span 4', textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>Please select a date first.</div>}
              </div>
            </div>
          </div>
          <div className="wizard-footer">
            <button className="btn btn-secondary" onClick={goBack}>Back</button>
            <button className="btn btn-primary" onClick={goNext}>Continue ➔</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="wizard-panel active" id="step3">
          <h3 className="wizard-title">Your Details</h3>
          <div className="fg-grid">
            <div className="fg">
              <label>Full Name *</label>
              <input type="text" name="pName" value={formData.pName} onChange={handleInputChange} className="form-in" placeholder="John Doe" />
            </div>
            <div className="fg">
              <label>Phone Number *</label>
              <input type="tel" name="pPhone" value={formData.pPhone} onChange={handleInputChange} className="form-in" placeholder="+91 99999 00000" />
            </div>
            <div className="fg" style={{ gridColumn: 'span 2' }}>
              <label>Email Address (Optional)</label>
              <input type="email" name="pEmail" value={formData.pEmail} onChange={handleInputChange} className="form-in" placeholder="john@example.com" />
            </div>
          </div>
          <div className="wizard-footer">
            <button className="btn btn-secondary" onClick={goBack}>Back</button>
            <button className="btn btn-primary" onClick={submitBooking} disabled={submitting}>
              {submitting ? 'Processing…' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="booking-success" style={{ display: 'flex' }}>
          <div className="success-check">✓</div>
          <h3 className="wizard-title" style={{ marginBottom: '8px' }}>Booking Confirmed</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px' }}>
            We've received your appointment request. Our coordinator will call you shortly to confirm.
          </p>
          <div className="success-receipt">
            <div className="receipt-row">
              <span className="receipt-label">Treatment</span>
              <span className="receipt-val">{bState.service}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Date &amp; Time</span>
              <span className="receipt-val">{new Date(bState.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} @ {bState.time}</span>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={resetBooking}>Book Another Appt</button>
        </div>
      )}
    </div>
  );
}
