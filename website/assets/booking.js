/* ── BOOKING WIZARD ── */
const bookingServices = [
  { name: 'Consultation & Check-up', icon: '🔍' },
  { name: 'Dental Implants', icon: '🦷' },
  { name: 'Root Canal Treatment', icon: '🔬' },
  { name: 'Orthodontics (Braces)', icon: '⛓' },
  { name: 'Cosmetic Dentistry', icon: '✨' },
  { name: 'Oral Surgery', icon: '💉' },
  { name: 'Crowns & Veneers', icon: '👑' },
  { name: 'Teeth Cleaning', icon: '🪥' },
];

let bState = { service: '', date: '', time: '' };

const svcGrid = document.getElementById('svcGrid');
if (svcGrid) {
  bookingServices.forEach(svc => {
    const card = document.createElement('div');
    card.className = 'svc-card';
    card.setAttribute('data-name', svc.name);
    card.innerHTML = `<span class="svc-icon">${svc.icon}</span><span class="svc-name">${svc.name}</span>`;
    card.addEventListener('click', () => {
      svcGrid.querySelectorAll('.svc-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      bState.service = svc.name;
    });
    svcGrid.appendChild(card);
  });
}

/* Pre-select service if URL has ?service= param */
const urlParams = new URLSearchParams(window.location.search);
const preService = urlParams.get('service');
if (preService && svcGrid) {
  setTimeout(() => {
    const cards = svcGrid.querySelectorAll('.svc-card');
    cards.forEach(card => {
      if (card.getAttribute('data-name').toLowerCase().includes(preService.toLowerCase())) {
        card.click();
      }
    });
  }, 100);
}

function setDots(step) {
  ['dot1', 'dot2', 'dot3'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    const n = i + 1;
    el.className = 'step-dot' + (n < step ? ' done' : n === step ? ' active' : '');
  });
}

function goNext(current) {
  if (current === 1) {
    if (!bState.service) { alert('Please select a treatment to continue.'); return; }
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('apptDate').min = today;
    setDots(2);
  } else if (current === 2) {
    if (!bState.date) { alert('Please select a date.'); return; }
    if (!bState.time) { alert('Please select a time slot.'); return; }
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');
    setDots(3);
  }
}

function goBack(current) {
  document.getElementById(`step${current}`).classList.remove('active');
  document.getElementById(`step${current - 1}`).classList.add('active');
  setDots(current - 1);
}

function onDateChange() {
  const selectedDate = document.getElementById('apptDate').value;
  bState.date = selectedDate;
  if (!selectedDate) return;

  const timeGrid = document.getElementById('timeGrid');
  timeGrid.innerHTML = '<div style="grid-column: span 3; text-align: center; font-size: 0.86rem; color: var(--text-secondary);">Loading available slots...</div>';

  const apiOrigin = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'))
    ? 'http://localhost:5000'
    : 'https://portal.drmahesdentistry.in';

  fetch(`${apiOrigin}/api/appointments/available-slots?date=${selectedDate}`)
    .then(r => { if (!r.ok) throw new Error('Failed to load slots'); return r.json(); })
    .then(data => {
      timeGrid.innerHTML = '';
      bState.time = '';
      if (!data.availableSlots || data.availableSlots.length === 0) {
        timeGrid.innerHTML = '<div style="grid-column: span 3; text-align: center; font-size: 0.86rem; color: #C0392B; font-weight: 600;">No slots available for this day.</div>';
        return;
      }
      data.availableSlots.forEach(slot => {
        const btn = document.createElement('button');
        btn.className = 'time-btn'; btn.type = 'button'; btn.textContent = slot;
        btn.onclick = () => pickTime(slot, btn);
        timeGrid.appendChild(btn);
      });
    })
    .catch(() => {
      timeGrid.innerHTML = '<div style="grid-column: span 3; text-align: center; font-size: 0.86rem; color: #C0392B;">Error loading slots.</div>';
    });
}

function pickTime(slot, btn) {
  bState.time = slot;
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function submitBooking() {
  const name = document.getElementById('pName').value.trim();
  const phone = document.getElementById('pPhone').value.trim();
  const email = document.getElementById('pEmail').value.trim();
  if (!name || !phone) { alert('Please enter your name and phone number.'); return; }

  const btn = document.getElementById('confirmBtn');
  btn.textContent = 'Processing…'; btn.disabled = true;

  const apiOrigin = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'))
    ? 'http://localhost:5000'
    : 'https://portal.drmahesdentistry.in';

  fetch(`${apiOrigin}/api/appointments/website-book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientName: name, patientPhone: phone, patientEmail: email, service: bState.service, date: bState.date, timeSlot: bState.time }),
  })
    .then(r => { if (!r.ok) throw new Error('Server error'); return r.json(); })
    .then(() => {
      document.getElementById('step3').classList.remove('active');
      document.getElementById('rService').textContent = bState.service;
      const fmt = new Date(bState.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      document.getElementById('rDateTime').textContent = `${fmt} @ ${bState.time}`;
      const success = document.getElementById('bookingSuccess');
      success.style.display = 'flex'; setDots(4);
    })
    .catch(() => {
      alert('Unable to submit booking. Please call us at +91 93428 03217.');
      btn.textContent = 'Confirm Booking'; btn.disabled = false;
    });
}

function resetBooking() {
  bState = { service: '', date: '', time: '' };
  if (svcGrid) svcGrid.querySelectorAll('.svc-card').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  ['apptDate','pName','pPhone','pEmail'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  const success = document.getElementById('bookingSuccess');
  if (success) success.style.display = 'none';
  document.getElementById('step1').classList.add('active');
  const btn = document.getElementById('confirmBtn');
  if (btn) { btn.textContent = 'Confirm Booking'; btn.disabled = false; }
  setDots(1);
}
