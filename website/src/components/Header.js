"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Phone, MessageCircle } from "lucide-react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  const closeMobileNav = () => {
    setMobileNavOpen(false);
  };

  return (
    <>
      {/* ─── TOP ANNOUNCEMENT & CONTEXT BAR ─── */}
      <div className="top-bar">
        <div className="container top-bar-inner">
          <div className="top-bar-item">
            <span className="top-bar-dot"></span>
            <span>Welcoming patients in Porur, Chennai · Mon–Sat 10:00 AM – 10:00 PM</span>
          </div>
          <div className="top-bar-item" style={{ gap: "18px" }}>
            <span>Need advice? Call: <a href="tel:+919342803217" className="top-bar-link">+91 93428 03217</a></span>
            <a
              href="https://wa.me/919342803217"
              target="_blank"
              rel="noopener noreferrer"
              className="top-bar-link"
              style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>

      {/* ─── MAIN HEADER ─── */}
      <header className={`header ${scrolled ? "scrolled" : ""}`} id="header">
        <div className="container nav-container">
          <Link href="/" className="logo" onClick={closeMobileNav} aria-label="Dr. Mahe's Dentistry Home">
            <img
              src="/assets/logo_new.webp"
              width={927}
              height={269}
              alt="Dr. Mahe's Dentistry Logo"
              className="logo-img"
            />
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
              Home
            </Link>
            <Link href="/about" className={`nav-link ${pathname === "/about" ? "active" : ""}`}>
              Meet Dr. Maheswari
            </Link>
            <Link href="/treatments" className={`nav-link ${pathname === "/treatments" || pathname.startsWith("/dental-implants") || pathname.startsWith("/root-canal") || pathname.startsWith("/orthodontics") || pathname.startsWith("/pediatric-dentistry") || pathname.startsWith("/oral-surgery") || pathname.startsWith("/crowns-veneers") ? "active" : ""}`}>
              Treatments
            </Link>
            <Link href="/contact" className={`nav-link ${pathname === "/contact" ? "active" : ""}`}>
              Clinic &amp; Hours
            </Link>
          </nav>

          <div className="nav-actions">
            <a href="tel:+919342803217" className="nav-phone-pill" aria-label="Call clinic phone">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.86-.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.72 17l.2-.08z"/></svg>
              <span>+91 93428 03217</span>
            </a>
            <Link href="/contact#booking" className="btn btn-primary btn-sm">
              Book Appointment
            </Link>
          </div>

          <button
            className={`hamburger ${mobileNavOpen ? "open" : ""}`}
            id="hamburgerBtn"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileNavOpen}
            onClick={toggleMobileNav}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* ─── MOBILE DRAWER ─── */}
      <div className={`mobile-nav ${mobileNavOpen ? "open" : ""}`} id="mobileNav" role="dialog" aria-label="Mobile navigation">
        <Link href="/" className="nav-link" onClick={closeMobileNav}>Home</Link>
        <Link href="/about" className="nav-link" onClick={closeMobileNav}>Meet Dr. Maheswari</Link>
        <Link href="/treatments" className="nav-link" onClick={closeMobileNav}>All Treatments</Link>
        <Link href="/contact" className="nav-link" onClick={closeMobileNav}>Location &amp; Hours</Link>
        
        <div className="mobile-nav-contacts">
          <Link href="/contact#booking" className="btn btn-primary" onClick={closeMobileNav} style={{ width: '100%' }}>
            Book Consultation
          </Link>
          <a href="tel:+919342803217" className="btn btn-secondary" style={{ width: '100%' }}>
            <Phone size={16} />
            <span>Call +91 93428 03217</span>
          </a>
          <a href="https://wa.me/919342803217" target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp" style={{ width: '100%' }}>
            <MessageCircle size={16} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* ─── MOBILE FLOATING QUICK ACTION BAR ─── */}
      <div className="mobile-float-bar" aria-label="Quick mobile contacts">
        <a href="tel:+919342803217" className="mobile-float-btn" aria-label="Call clinic">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.86-.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.72 17l.2-.08z"/></svg>
          <span>Call Us</span>
        </a>
        <a href="https://wa.me/919342803217" target="_blank" rel="noopener noreferrer" className="mobile-float-btn" aria-label="WhatsApp clinic">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          <span>WhatsApp</span>
        </a>
        <Link href="/contact#booking" className="mobile-float-btn primary" aria-label="Book visit">
          <span>Book Now →</span>
        </Link>
      </div>
    </>
  );
}
