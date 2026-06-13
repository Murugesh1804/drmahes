import Link from "next/link";

export const metadata = {
  title: "Smart QR Booking | Dr. Mahe's Dentistry",
  description: "Book an appointment, get directions, or call Dr. Mahe's Dentistry instantly.",
  robots: {
    index: false,
    follow: false,
  }
};

export default function BookPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', padding: '120px 24px 60px' }}>

      {/* Background Glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(196,176,151,0.3) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }}></div>

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1, textAlign: 'center' }} data-animate="fade">

        {/* Links Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Action: Book Appointment */}
          <Link href="/contact#booking" className="qr-btn qr-btn-primary">
            <span className="qr-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            </span>
            <div className="qr-text">
              <span className="qr-title">Book Appointment</span>
              <span className="qr-desc">Schedule your visit online</span>
            </div>
          </Link>

          {/* Action: WhatsApp */}
          <a href="https://wa.me/919342803217" target="_blank" rel="noopener noreferrer" className="qr-btn qr-btn-secondary">
            <span className="qr-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
            </span>
            <div className="qr-text">
              <span className="qr-title">WhatsApp Booking</span>
              <span className="qr-desc">Chat with us directly</span>
            </div>
          </a>

          {/* Action: Call Now */}
          <a href="tel:+919342803217" className="qr-btn qr-btn-secondary">
            <span className="qr-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.86-.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.72 17l.2-.08z" /></svg>
            </span>
            <div className="qr-text">
              <span className="qr-title">Call Clinic</span>
              <span className="qr-desc">Speak to our reception</span>
            </div>
          </a>

          {/* Action: Google Maps */}
          <a href="https://www.google.com/maps/search/?api=1&query=Dr.+Mahe%27s+Dentistry,+Jaya+Nagar,+Porur" target="_blank" rel="noopener noreferrer" className="qr-btn qr-btn-secondary">
            <span className="qr-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            </span>
            <div className="qr-text">
              <span className="qr-title">Get Directions</span>
              <span className="qr-desc">View on Google Maps</span>
            </div>
          </a>

        </div>

        {/* Footer info */}
        <div style={{ marginTop: '48px', fontSize: '0.75rem', color: '#555555' }}>
          <p>Mon – Sat: 10:00 AM – 10:00 PM</p>
          <p style={{ marginTop: '4px' }}>Sunday: On Appointment</p>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .qr-btn {
          display: flex;
          align-items: center;
          padding: 20px 24px;
          border-radius: 16px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          border: 1px solid rgba(17, 17, 17, 0.08);
          background-color: #FFFFFF;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          text-align: left;
        }
        
        .qr-btn:hover {
          transform: translateY(-4px);
          border-color: rgba(196, 176, 151, 0.4);
          background-color: rgba(196, 176, 151, 0.08);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
        }

        .qr-btn-primary {
          background-color: #C4B097;
          border-color: #C4B097;
          color: #111111;
        }

        .qr-btn-primary:hover {
          background-color: #A89680;
          border-color: #A89680;
          color: #111111;
          box-shadow: 0 12px 24px rgba(196, 176, 151, 0.25);
        }

        .qr-icon {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          margin-right: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qr-icon svg {
          width: 100%;
          height: 100%;
          stroke-width: 1.5;
        }

        .qr-btn-primary .qr-icon {
          color: #111111;
        }

        .qr-btn-secondary .qr-icon {
          color: #C4B097;
        }

        .qr-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .qr-title {
          font-weight: 700;
          font-size: 1.05rem;
          font-family: var(--font-heading), 'Poppins', sans-serif;
          letter-spacing: 0.02em;
        }

        .qr-btn-secondary .qr-title {
          color: #111111;
        }

        .qr-desc {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .qr-btn-secondary .qr-desc {
          color: #555555;
        }

        @keyframes pulse-glow {
          0% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
        }

        /* Prevent header/footer from looking weird on this specific page if possible, 
           although Next.js makes it global. The dark background will cover nicely. */
      `}} />
    </div>
  );
}
