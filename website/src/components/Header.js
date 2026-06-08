"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
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
      <header className={`header ${scrolled ? "scrolled" : ""}`} id="header">
        <div className="container nav-container">
          <Link href="/" className="logo">
            <img
              src="/assets/logo_white.webp"
              width={927}
              height={269}
              alt="Dr. Mahe's Dentistry"
              className="logo-img"
            />
          </Link>
          <nav className="nav-links" aria-label="Main navigation">
            <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
              Home
            </Link>
            <Link href="/about" className={`nav-link ${pathname === "/about" ? "active" : ""}`}>
              About
            </Link>
            <Link href="/treatments" className={`nav-link ${pathname === "/treatments" ? "active" : ""}`}>
              Treatments
            </Link>
            <Link href="/contact" className={`nav-link ${pathname === "/contact" ? "active" : ""}`}>
              Contact
            </Link>
            <Link href="/contact#booking" className="btn btn-secondary nav-book-btn">
              Book Now
            </Link>
          </nav>
          <div className="nav-controls">
            <button
              className={`hamburger ${mobileNavOpen ? "open" : ""}`}
              id="hamburgerBtn"
              aria-label="Open navigation"
              aria-expanded={mobileNavOpen}
              onClick={toggleMobileNav}
              style={{ borderColor: 'var(--text-primary)' }}
            >
              <span style={{ backgroundColor: 'var(--text-primary)' }}></span>
              <span style={{ backgroundColor: 'var(--text-primary)' }}></span>
              <span style={{ backgroundColor: 'var(--text-primary)' }}></span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV */}
      <div className={`mobile-nav ${mobileNavOpen ? "open" : ""}`} id="mobileNav" role="dialog" aria-label="Mobile navigation">
        <Link href="/" className="nav-link" onClick={closeMobileNav}>Home</Link>
        <Link href="/about" className="nav-link" onClick={closeMobileNav}>About</Link>
        <Link href="/treatments" className="nav-link" onClick={closeMobileNav}>Treatments</Link>
        <Link href="/contact" className="nav-link" onClick={closeMobileNav}>Contact</Link>
        <Link href="/contact#booking" className="btn btn-primary" onClick={closeMobileNav}>Book Appointment</Link>
      </div>
    </>
  );
}
