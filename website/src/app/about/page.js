import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";

export const metadata = {
  title: "Meet Dr. Maheswari, BDS — Dentist in Porur, Chennai",
  description: "Learn about Dr. Maheswari, BDS, lead dentist at Dr. Mahe's Dentistry in Porur, Chennai. Discover our compassionate philosophy, gentle techniques and clinical standards.",
  keywords: ["dr maheswari dentist porur", "dentist porur chennai", "general dentist porur", "dr mahe dentistry about"],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: "Meet Dr. Maheswari | Dr. Mahe's Dentistry Porur",
    description: "Learn about Dr. Maheswari, BDS, lead dentist at Dr. Mahe's Dentistry in Porur, Chennai.",
    url: 'https://drmahesdentistry.in/about',
  }
};

export default function About() {
  const values = [
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
      title: 'Class-B Autoclave Sterilization',
      desc: 'Hospital-grade infection control protocols. Every instrument is vacuum-sealed in sterile pouches and opened fresh before your eyes.'
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
      title: 'Zero Judgment, Total Kindness',
      desc: 'Haven’t been to a dentist in years? Worried about your oral hygiene? You will only receive encouragement, dignity and gentle solutions here.'
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
      title: 'Low-Radiation Digital Scans',
      desc: 'Digital sensors reduce radiation exposure by up to 90% compared to traditional dental X-rays, providing ultra-sharp diagnosis in seconds.'
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
      title: 'You Control the Pace',
      desc: 'We never rush through an appointment. You can pause us anytime with a simple hand gesture. We move at your speed and comfort level.'
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
      title: 'Complete Family Care',
      desc: 'From a toddler’s first milestone checkup to adolescent braces and senior implant rehabilitations — expert care under one roof.'
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
      title: 'Convenient Porur Location',
      desc: 'On Kundrathur Main Road, Porur with parking. Open until 10:00 PM on weekdays and Saturdays for after-work and school visits.'
    },
  ];

  const delays = ["100", "200", "300", "100", "200", "300"];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "@id": "https://drmahesdentistry.in/about#doctor",
      "name": "Dr. Maheswari",
      "jobTitle": "Chief Dental Surgeon & Founder",
      "worksFor": {
        "@id": "https://drmahesdentistry.in/#dentist"
      },
      "honorificSuffix": "BDS",
      "alumniOf": "The Tamil Nadu Dr. M.G.R. Medical University",
      "medicalSpecialty": "Dentistry",
      "url": "https://drmahesdentistry.in/about",
      "image": "https://drmahesdentistry.in/assets/dr.mahe.webp"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ─── PAGE HERO ─── */}
      <section className="page-hero-warm">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">Meet Dr. Maheswari</span>
          </nav>
          <span className="page-hero-badge">Our Founder &amp; Lead Clinician</span>
          <h1 className="page-hero-title-warm">Meet <em>Dr. Maheswari, BDS</em></h1>
          <p className="page-hero-desc-warm">
            Dedicated to gentle, unhurried and genuinely empathetic dentistry for families across Porur and Chennai.
          </p>
        </div>
      </section>

      {/* ─── MAIN DOCTOR PROFILE ─── */}
      <section className="doctor-editorial-section section-padding">
        <div className="container">
          <div className="doctor-editorial-grid">
            <div className="doctor-editorial-media" data-animate="slide-right">
              <div className="doctor-portrait-frame">
                <img
                  src="/assets/dr.mahe.webp"
                  width={1684}
                  height={2528}
                  alt="Dr. Maheswari BDS — Lead Dentist at Dr. Mahe's Dentistry, Porur Chennai"
                />
              </div>
              <div className="doctor-stamp-card">
                <div className="doctor-stamp-label">Qualifications</div>
                <div className="doctor-stamp-name">Dr. Maheswari</div>
                <div className="doctor-stamp-sub">Bachelor of Dental Surgery (BDS)</div>
              </div>
            </div>

            <div className="doctor-letter-content" data-animate="slide-left">
              <span className="section-badge">Personal Philosophy</span>
              <h2 className="doctor-editorial-heading">
                "A gentle touch and clear communication can transform how someone feels about dental care forever."
              </h2>
              <p className="doctor-letter-p">
                Dr. Maheswari completed her dental education with a firm belief that dental visits should be centered around the patient's emotional comfort and long-term health. Over years of clinical practice in Chennai, she observed that fear and anxiety keep people from getting the dental care they deserve.
              </p>
              <p className="doctor-letter-p">
                She founded <strong>Dr. Mahe's Dentistry</strong> in Porur to be a refuge from cold, rushed, clinical environments. Here, every patient is given full attention, time to ask questions and a detailed explanation of their diagnosis in everyday language.
              </p>
              <p className="doctor-letter-p">
                From delicate single-sitting root canals and implant restorations to children’s dentistry and smile makeovers, Dr. Maheswari treats every patient with the precision, patience and warmth she would offer her own family.
              </p>

              <div className="doctor-editorial-actions" style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "32px" }}>
                <Link href="/contact#booking" className="btn btn-primary">
                  Book a Consultation with Dr. Maheswari
                </Link>
                <a
                  href="https://wa.me/919342803217?text=Hi%20Dr.%20Maheswari,%20I%20would%20like%20to%20ask%20a%20question"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <MessageCircle size={18} />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CLINIC VALUES & PROMISES ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">Our Pillars</span>
            <h2 className="section-title">The Principles that Guide <em>Every Visit</em></h2>
            <p className="section-desc">
              Everything we do in our clinic is designed to keep you safe, comfortable and confident in your dental choices.
            </p>
          </div>

          <div className="benefit-grid-warm">
            {values.map((v, i) => (
              <div className="benefit-card-warm" key={v.title} data-animate data-delay={delays[i]}>
                <div className="benefit-icon-warm">{v.icon}</div>
                <h3 className="benefit-title-warm">{v.title}</h3>
                <p className="benefit-desc-warm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CLINIC ENVIRONMENT SHOWCASE ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: "48px", alignItems: "center" }}>
            <div data-animate="slide-right">
              <span className="section-badge">Clinic Environment</span>
              <h2 className="section-title" style={{ fontSize: "2.4rem", textAlign: "left", marginBottom: "18px" }}>
                Designed for <em>Calm &amp; Cleanliness</em>
              </h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.85, marginBottom: "20px" }}>
                From the soothing ambient reception to the ergonomic treatment chairs, our clinic on Kundrathur Main Road is designed to minimize clinical stress.
              </p>
              <div className="info-box-warm">
                <strong>Our Clean Air &amp; Surface Guarantee:</strong> We sanitize every surface between patient appointments and maintain high-efficiency air purification for maximum safety and comfort.
              </div>
            </div>

            <div data-animate="slide-left">
              <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-lg)", border: "4px solid #FFFFFF" }}>
                <img
                  src="/assets/reception_area.webp"
                  alt="Dr. Mahe's Dentistry Reception & Consultation Area Porur"
                  width={1024}
                  height={1024}
                  loading="lazy"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="cta-section-warm">
        <div className="container" data-animate>
          <span className="section-badge" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--accent)", borderColor: "rgba(255,255,255,0.2)" }}>
            Let's Connect
          </span>
          <h2 className="cta-title-warm">Ready to Meet <em>Dr. Maheswari?</em></h2>
          <p className="cta-desc-warm">
            We'd love to welcome you to our Porur clinic. Book an appointment online or call us anytime.
          </p>
          <div className="cta-actions-warm">
            <Link href="/contact#booking" className="btn btn-accent btn-lg">
              Book an Appointment
            </Link>
            <a href="tel:+919342803217" className="btn btn-white btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Phone size={18} />
              <span>Call: +91 93428 03217</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
