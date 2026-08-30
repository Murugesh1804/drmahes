# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Primary:** Solo dental practitioner (Dr. Mahe) managing all clinical and operational aspects independently (patient consultations, dental charting, procedure execution, billing, and revenue tracking).
- **Secondary:** Visiting consultant dental specialists (tracking case payouts and treatments performed).
- **Walk-in & Existing Patients:** Self check-in via the clinic reception kiosk and appointment booking/discovery via the public clinic website.

## Product Purpose
An integrated digital healthcare suite for Dr. Mahe's Dentistry that unifies:
1. **Clinical Management System (CMS):** Offline-first/local-network clinic management, electronic medical records (EMR), dental charting, treatment plans, prescriptions, automated billing/invoicing, consultant payment tracking, and analytics.
2. **Patient Self Check-In Kiosk:** Streamlined touch kiosk for walk-in and arriving patients to register and join the queue.
3. **Public Clinic Website:** Modern marketing and online appointment booking portal presenting treatments, clinic credentials, and patient guidance.

## Positioning
A responsive, high-speed, offline-capable dental practice operating system custom-tailored for a solo practitioner's workflow. It eliminates heavy SaaS recurring costs and cloud latency by running resiliently on clinic local infrastructure with fast keyboard-driven actions, instant patient lookups, and unified patient lifecycle management from web inquiry to treatment completion.

## Operating Context
- **Clinical Environment:** Chairside dental operatory and reception desk running locally on Windows / local network. Fast one-hand or keyboard shortcut workflows (`Alt+N` for new patient, `Alt+B` for billing) to minimize friction while multitasking.
- **Patient Touchpoints:** High-touch waiting room check-in tablet/kiosk and mobile/desktop web browsers for prospective patients researching procedures.
- **Financial & Regulatory:** INR (`₹`) currency, Indian clinical billing compliance, itemized treatment plans, consultant doctor commission split tracking, and printable consent forms / PDF bills.

## Capabilities and Constraints
- **Capabilities:**
  - Fast patient search, demographics, and medical/dental history.
  - Interactive treatment plans, teeth charting, and session-by-session notes.
  - Itemized invoicing with discounts, tax, multiple payment modes (Cash, UPI, Card), and printable bill receipts.
  - Visiting consultant payment ledger with revenue share calculations.
  - Analytics for daily/monthly collections, pending dues, and treatment volume.
  - Public Next.js portal with treatment showcases and online appointment booking.
  - Standalone touch-optimized patient check-in kiosk.
- **Constraints:**
  - Local-first architecture (Express + MongoDB) that must operate reliably without continuous high-speed internet.
  - Single-user / solo practitioner operational speed: minimal modal clutter, high readability, high visual contrast for fast scanning.

## Brand Commitments
- **Name:** Dr. Mahe's Dentistry
- **Identity & Tone:** Trustworthy, clinical, clean, warm, and sophisticated.
- **Core Aesthetic Tokens:** Refined warm neutrals (`#F7F5F0`), deep obsidian/slate (`#111111`), warm champagne/gold accent (`#C4B097`), clean typography (Poppins + Open Sans / Inter), soft elevation shadows, and rounded container geometry (`10px`-`16px` radius).

## Evidence on Hand
- Full incumbent React single-page CMS application with active pages: `Dashboard`, `Patients`, `PatientDetail`, `Appointments`, `Treatments`, `Billing`, `ConsultantPayments`, `Revenue`, `Enquiries`, and `TreatmentMaster`.
- Next.js website in `/website` with structured treatment pages and booking flow.
- Standalone kiosk in `/kiosk/index.html` with integrated design tokens.
- Consent forms and print bill templates (`bill.html`).

## Product Principles
1. **Chairside Efficiency First:** High information density without visual clutter; actions like adding patients, logging procedures, or billing must take seconds, not minutes.
2. **Total Clinical Clarity:** Patient history, active medical conditions, tooth numbers, and financial balances must be unambiguous and immediately legible.
3. **Resilient Local Reliability:** The core clinical workflow must never stall due to network hiccups; data persistence and snappy local state are paramount.
4. **Warm Professionalism:** The interface reflects premium healthcare quality across CMS, kiosk, and web surfaces—clean, calming, and free of noisy distractions.

## Accessibility & Inclusion
- High visual contrast for chairside operatory lighting.
- Legible typography scale suitable for quick glance scanning at varying screen distances.
- Full keyboard navigation and touch accessibility for kiosk surfaces.
