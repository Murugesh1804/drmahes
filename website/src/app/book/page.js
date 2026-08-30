import Link from "next/link";
import { Calendar, MessageCircle, Phone, MapPin, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Quick Appointment & Contact | Dr. Mahe's Dentistry",
  description: "Quickly book an appointment, chat on WhatsApp, get directions, or call Dr. Mahe's Dentistry in Porur.",
  robots: {
    index: false,
    follow: false,
  }
};

export default function BookPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '120px 24px 60px',
      position: 'relative'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        top: '25%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '380px',
        height: '380px',
        background: 'radial-gradient(circle, rgba(184,151,114,0.18) 0%, rgba(250,248,245,0) 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1, textAlign: 'center' }} data-animate="scale">
        <div style={{ marginBottom: "28px" }}>
          <span className="section-badge">Fast Access</span>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginTop: "8px", fontFamily: "var(--font-display, serif)" }}>
            Dr. Mahe's Dentistry
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Kundrathur Main Road, Porur, Chennai
          </p>
        </div>

        {/* Links Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Action: Book Appointment */}
          <Link href="/contact#booking" className="qr-card qr-card-primary">
            <span className="qr-card-icon">
              <Calendar size={22} strokeWidth={2} />
            </span>
            <div className="qr-card-text">
              <span className="qr-card-title">Book an Appointment</span>
              <span className="qr-card-desc">Choose service, date &amp; time</span>
            </div>
            <ArrowRight size={18} style={{ marginLeft: "auto", color: "var(--primary)" }} />
          </Link>

          {/* Action: WhatsApp */}
          <a
            href="https://wa.me/919342803217?text=Hi%20Dr.%20Maheswari,%20I%20would%20like%20to%20book%20an%20appointment"
            target="_blank"
            rel="noopener noreferrer"
            className="qr-card qr-card-secondary"
          >
            <span className="qr-card-icon" style={{ color: "var(--accent-hover)" }}>
              <MessageCircle size={22} strokeWidth={2} />
            </span>
            <div className="qr-card-text">
              <span className="qr-card-title">Chat on WhatsApp</span>
              <span className="qr-card-desc">Direct line with our coordinator</span>
            </div>
            <ArrowRight size={18} style={{ marginLeft: "auto", color: "var(--accent-hover)" }} />
          </a>

          {/* Action: Call Now */}
          <a href="tel:+919342803217" className="qr-card qr-card-secondary">
            <span className="qr-card-icon" style={{ color: "var(--accent-hover)" }}>
              <Phone size={22} strokeWidth={2} />
            </span>
            <div className="qr-card-text">
              <span className="qr-card-title">Call Clinic</span>
              <span className="qr-card-desc">+91 93428 03217</span>
            </div>
            <ArrowRight size={18} style={{ marginLeft: "auto", color: "var(--accent-hover)" }} />
          </a>

          {/* Action: Google Maps */}
          <a
            href="https://www.google.com/maps/search/?api=1&query=Dr.+Mahe%27s+Dentistry,+Jaya+Nagar,+Porur"
            target="_blank"
            rel="noopener noreferrer"
            className="qr-card qr-card-secondary"
          >
            <span className="qr-card-icon" style={{ color: "var(--accent-hover)" }}>
              <MapPin size={22} strokeWidth={2} />
            </span>
            <div className="qr-card-text">
              <span className="qr-card-title">Google Maps Directions</span>
              <span className="qr-card-desc">1st Floor, Kundrathur Main Rd, Porur</span>
            </div>
            <ArrowRight size={18} style={{ marginLeft: "auto", color: "var(--accent-hover)" }} />
          </a>
        </div>

        {/* Hours */}
        <div style={{ marginTop: '36px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p><strong>Open Monday to Saturday:</strong> 10:00 AM – 10:00 PM</p>
          <p style={{ color: 'var(--accent-hover)', marginTop: '2px', fontWeight: 600 }}>Sunday: On Appointment</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .qr-card {
          display: flex;
          align-items: center;
          padding: 18px 22px;
          border-radius: var(--radius);
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1.5px solid var(--border);
          background-color: #FFFFFF;
          text-align: left;
          box-shadow: var(--shadow-xs);
        }
        
        .qr-card:hover {
          transform: translateY(-3px);
          border-color: var(--accent-border);
          box-shadow: var(--shadow-md);
        }

        .qr-card-primary {
          background-color: var(--accent-light);
          border-color: var(--accent-border);
        }
        .qr-card-primary:hover {
          background-color: var(--accent);
          border-color: var(--accent);
        }
        .qr-card-primary:hover .qr-card-title {
          color: var(--primary);
        }

        .qr-card-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background-color: var(--accent-light);
          color: var(--accent-hover);
          flex-shrink: 0;
          margin-right: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qr-card-primary .qr-card-icon {
          background-color: #FFFFFF;
          color: var(--primary);
        }

        .qr-card-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .qr-card-title {
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .qr-card-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
      `}} />
    </div>
  );
}
