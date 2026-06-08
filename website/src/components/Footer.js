import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="logo">
            <img src="/assets/logo_black.webp" width={848} height={294} alt="Dr. Mahe's Dentistry" className="logo-img" />
          </div>
          <p className="footer-desc">
            Modern dental care centred on precision, patient comfort and full transparency. Implants, endodontics, orthodontics and cosmetic dentistry — by Dr. Maheswari in Porur, Chennai.
          </p>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul className="footer-list">
            <li><Link href="/" className="footer-item">Home</Link></li>
            <li><Link href="/about" className="footer-item">About Dr. Maheswari</Link></li>
            <li><Link href="/treatments" className="footer-item">All Treatments</Link></li>
            <li><Link href="/contact#booking" className="footer-item">Book Appointment</Link></li>
            <li><Link href="/contact" className="footer-item">Contact &amp; Location</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact Us</h4>
          <ul className="footer-list">
            <li className="footer-item"><a href="tel:+919342803217">+91 93428 03217</a></li>
            <li className="footer-item"><a href="https://wa.me/919342803217" target="_blank" rel="noopener noreferrer">WhatsApp Us</a></li>
            <li className="footer-item"><a href="mailto:smile@drmahesdentistry.in">smile@drmahesdentistry.in</a></li>
            <li className="footer-item" style={{ marginTop: "6px" }}>1st floor, Kundrathur Main Rd,</li>
            <li className="footer-item">Jaya Nagar, Porur, Chennai — 600116</li>
            <li className="footer-item" style={{ marginTop: "10px", color: "var(--accent)" }}>Mon – Sat: 10:00 AM – 10:00 PM</li>
            <li className="footer-item" style={{ color: "var(--accent)" }}>Sunday: On Appointment</li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Dr. Mahe's Dentistry. All rights reserved.</p>
        <p>Porur, Chennai, Tamil Nadu</p>
      </div>
    </footer>
  );
}
