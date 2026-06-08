import Link from "next/link";
import { Suspense } from "react";
import BookingForm from "../../components/BookingForm";

export const metadata = {
  title: "Contact & Book Appointment | Dr. Mahe's Dentistry, Porur, Chennai",
  description: "Book your dental appointment online at Dr. Mahe's Dentistry in Porur, Chennai. Contact us at +91 93428 03217 or visit our modern clinic on Kundrathur Main Road.",
  keywords: ["book dentist appointment porur", "dental appointment chennai", "dr mahe dentistry contact", "dentist porur location"],
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: "Contact & Book Appointment | Dr. Mahe's Dentistry",
    description: "Book your dental appointment online at Dr. Mahe's Dentistry in Porur, Chennai.",
    url: 'https://drmahesdentistry.com/contact',
  }
};

export default function Contact() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">Contact &amp; Booking</span>
          </nav>
          <span className="page-hero-badge">We're Here for You</span>
          <h1 className="page-hero-title">Book an <em>Appointment</em></h1>
          <p className="page-hero-desc">It is simple to book an appointment online with Dr. Maheswari in Porur, Chennai. Choose your treatment, pick a date and time and share your details.</p>
          <div className="page-hero-actions">
            <a href="tel:+919342803217" className="btn btn-primary">Call Us Now</a>
            <a href="https://wa.me/919342803217" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">WhatsApp</a>
          </div>
        </div>
      </section>

      <section className="booking-section section-padding" id="booking">
        <div className="container">
          <div className="booking-layout" data-animate="scale">
            <div className="booking-info">
              <div>
                <h2 className="booking-info-title">Schedule Your Visit</h2>
                <p className="booking-info-desc">Fill the form on the right. We'll contact you within a few hours to confirm your appointment.</p>
              </div>
              <div className="contact-list">
                <div className="contact-row">
                  <span className="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.86-.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.72 17l.2-.08z" /></svg></span>
                  <div>
                    <div className="contact-label">Call or WhatsApp</div>
                    <div className="contact-value"><a href="tel:+919342803217">+91 93428 03217</a></div>
                  </div>
                </div>
                <div className="contact-row">
                  <span className="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg></span>
                  <div>
                    <div className="contact-label">Email Us</div>
                    <div className="contact-value"><a href="mailto:smile@drmahesdentistry.in">smile@drmahesdentistry.in</a></div>
                  </div>
                </div>
                <div className="contact-row">
                  <span className="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></span>
                  <div>
                    <div className="contact-label">Location</div>
                    <div className="contact-value">1st floor, Kundrathur Main Rd,<br />Jaya Nagar, Porur, Chennai – 600116</div>
                  </div>
                </div>
                <div className="contact-row">
                  <span className="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></span>
                  <div>
                    <div className="contact-label">Clinic Hours</div>
                    <div className="contact-value">Mon – Sat: 10:00 AM – 10:00 PM<br />(Sunday: On Appointment)</div>
                  </div>
                </div>
              </div>
            </div>

            <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading booking form...</div>}>
              <BookingForm />
            </Suspense>

          </div>
        </div>
      </section>

      <section className="location-section section-padding" id="location">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Find Us</span>
            <h2 className="section-title">Locate Our Clinic</h2>
            <p className="section-desc">Conveniently located on Porur High Road, Chennai — easy to reach by bus, auto, cab, or private vehicle.</p>
          </div>
          <div className="location-layout">
            <div className="location-cards">
              <div className="loc-card">
                <div className="loc-label">Address</div>
                <div className="loc-main">Dr. Mahe's Dentistry</div>
                <div className="loc-sub">1st floor, Kundrathur Main Rd,<br />Jaya Nagar, Porur, Chennai – 600116</div>
              </div>
              <div className="loc-card">
                <div className="loc-label">Phone &amp; WhatsApp</div>
                <div className="loc-main"><a href="tel:+919342803217" style={{ color: 'var(--text-primary)' }}>+91 93428 03217</a></div>
                <div className="loc-sub"><a href="https://wa.me/919342803217" target="_blank" rel="noopener noreferrer">Chat on WhatsApp →</a></div>
              </div>
              <div className="loc-card">
                <div className="loc-label">Clinic Hours</div>
                <div className="loc-main">Monday – Saturday</div>
                <div className="loc-sub">10:00 AM – 10:00 PM<br /><span style={{ color: 'var(--accent)' }}>Sunday: Based on appointments</span></div>
              </div>
              <a href="https://www.google.com/maps/search/?api=1&query=Dr.+Mahe%27s+Dentistry,+Jaya+Nagar,+Porur" target="_blank" rel="noopener noreferrer" className="directions-btn">
                ↗ &nbsp;Get Directions on Google Maps
              </a>
            </div>
            <div>
              <div className="map-frame">
                <iframe src="https://maps.google.com/maps?q=1st+floor,+Kundrathur+Main+Rd,+Jaya+Nagar,+Porur,+Chennai,+Tamil+Nadu+600116&output=embed&z=15"
                  allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  title="Dr. Mahe's Dentistry location — Porur Chennai"></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
