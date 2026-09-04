import Link from "next/link";
import { Check, Phone, MessageCircle, Mail, MapPin, Clock, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer-warm">
      <div className="container footer-grid-warm">
        {/* Brand Column */}
        <div className="footer-brand-warm">
          <div className="logo">
            <img
              src="/assets/logo_black.webp"
              width={848}
              height={294}
              alt="Dr. Mahe's Dentistry"
              className="logo-img"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
          <p className="footer-desc-warm">
            A patient-first dental studio in Porur, Chennai. Founded on the conviction that dental care should be calm, unhurried, transparent and genuinely kind.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
            <span style={{
              fontSize: "0.74rem",
              backgroundColor: "rgba(255,255,255,0.08)",
              padding: "6px 14px",
              borderRadius: "var(--radius-pill)",
              color: "var(--accent)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <Check size={13} strokeWidth={2.5} />
              <span>Hospital-Grade Sterilization</span>
            </span>
            <span style={{
              fontSize: "0.74rem",
              backgroundColor: "rgba(255,255,255,0.08)",
              padding: "6px 14px",
              borderRadius: "var(--radius-pill)",
              color: "var(--accent)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <Check size={13} strokeWidth={2.5} />
              <span>Zero-Judgment Space</span>
            </span>
          </div>
        </div>

        {/* Treatments Column */}
        <div className="footer-col-warm">
          <h4>Our Treatments</h4>
          <ul className="footer-list-warm">
            <li><Link href="/root-canal" className="footer-link-warm">Painless Root Canal (RCT)</Link></li>
            <li><Link href="/dental-implants" className="footer-link-warm">Dental Implants</Link></li>
            <li><Link href="/orthodontics" className="footer-link-warm">Orthodontics &amp; Braces</Link></li>
            <li><Link href="/pediatric-dentistry" className="footer-link-warm">Pediatric Dentistry (Kids)</Link></li>
            <li><Link href="/crowns-veneers" className="footer-link-warm">Crowns &amp; Veneers</Link></li>
            <li><Link href="/oral-surgery" className="footer-link-warm">Oral Surgery &amp; Wisdom Tooth</Link></li>
            <li><Link href="/treatments" className="footer-link-warm" style={{ color: "var(--accent)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "5px" }}>Explore All Services <ArrowRight size={14} /></Link></li>
          </ul>
        </div>

        {/* Contact & Hours Column */}
        <div className="footer-col-warm">
          <h4>Clinic &amp; Appointments</h4>
          <ul className="footer-list-warm">
            <li>
              <a href="tel:+919342803217" className="footer-link-warm" style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "1rem", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <Phone size={15} style={{ color: "var(--accent)" }} />
                <span>+91 93428 03217</span>
              </a>
            </li>
            <li>
              <a href="https://wa.me/919342803217" target="_blank" rel="noopener noreferrer" className="footer-link-warm" style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <MessageCircle size={15} style={{ color: "var(--accent)" }} />
                <span>Chat on WhatsApp</span>
              </a>
            </li>
            <li>
              <a href="mailto:smile@drmahesdentistry.in" className="footer-link-warm" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <Mail size={15} style={{ color: "var(--accent)" }} />
                <span>smile@drmahesdentistry.in</span>
              </a>
            </li>
            <li style={{ marginTop: "8px", lineHeight: 1.6, color: "rgba(255,255,255,0.75)", display: "inline-flex", alignItems: "flex-start", gap: "8px" }}>
              <MapPin size={15} style={{ color: "var(--accent)", flexShrink: 0, marginTop: "4px" }} />
              <span>1st Floor, Kundrathur Main Road, Jaya Nagar, Porur, Chennai — 600116</span>
            </li>
            <li style={{ marginTop: "8px", color: "var(--accent)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Clock size={15} style={{ color: "var(--accent)" }} />
              <span>Mon – Sat: 10:00 AM – 10:00 PM</span>
            </li>
            <li style={{ color: "rgba(255,255,255,0.6)", paddingLeft: "23px" }}>
              Sunday: On Appointment
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom-warm">
        <p>© {new Date().getFullYear()} Dr. Mahe's Dentistry. All rights reserved. Registered Dental Practice, Porur, Chennai.</p>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link href="/about" className="footer-link-warm">About Doctor</Link>
          <Link href="/contact" className="footer-link-warm">Find Location</Link>
          <Link href="/contact#booking" className="footer-link-warm">Book Visit</Link>
        </div>
      </div>
    </footer>
  );
}
