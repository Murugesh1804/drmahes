import Link from "next/link";
import BookingForm from "../components/BookingForm";

export default function Home() {
  const treatmentsData = [
    { name: 'Dental Implants', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C8.5 2 7 5 7 7c0 2.5 1.5 4 3 5v3H9a1 1 0 0 0 0 2h1v2a1 1 0 0 0 2 0v-2h1a1 1 0 0 0 0-2h-1v-3c1.5-1 3-2.5 3-5 0-2-1.5-5-5-5z" /><path d="M10 7c0-1.7 1-3 2-3s2 1.3 2 3" /></svg>, desc: 'Permanent, natural-looking tooth replacements using biocompatible titanium fixtures — restoring full function and aesthetics.', img: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=700&h=420&fit=crop&q=82', page: '/dental-implants' },
    { name: 'Root Canal Treatment', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>, desc: 'Painless, single-sitting endodontic therapy to save infected teeth, eliminate pain and preserve your natural smile.', img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=700&h=420&fit=crop&q=82', page: '/root-canal' },
    { name: 'Orthodontics & Braces', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="8" width="18" height="8" rx="2" /><line x1="7" y1="8" x2="7" y2="16" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="17" y1="8" x2="17" y2="16" /><line x1="3" y1="12" x2="21" y2="12" /></svg>, desc: 'Metal, ceramic and self-ligating braces — precisely customized alignment for children, teens and adults.', img: 'https://images.unsplash.com/photo-1588776814546-1ffbb29d6390?w=700&h=420&fit=crop&q=82', page: '/orthodontics' },
    { name: 'Cosmetic Dentistry', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9 0 3.93 2.52 7.27 6.02 8.5C9.7 20.83 10.82 21 12 21s2.3-.17 2.98-.5C18.48 19.27 21 15.93 21 12c0-4.97-4.03-9-9-9z" /><path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4" /></svg>, desc: 'Porcelain veneers, composite bonding and whitening treatments to craft a confident, radiant smile.', img: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=700&h=420&fit=crop&q=82', page: '/cosmetic-dentistry' },
    { name: 'Oral Surgery', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" /></svg>, desc: 'Expert removal of wisdom teeth, impacted molars and complex extractions with precision and minimal discomfort.', img: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=700&h=420&fit=crop&q=82', page: '/oral-surgery' },
    { name: 'Crowns & Veneers', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 20h20M5 20V8l3.5 4L12 3l3.5 9L19 8v12" /></svg>, desc: 'Premium zirconia, e.max and metal-ceramic restorations — precision-crafted to protect and beautifully restore your teeth.', img: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=700&h=420&fit=crop&q=82', page: '/crowns-veneers' },
  ];

  const delays = ["100", "200", "300", "100", "200", "300"];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "name": "Dr. Mahe's Dentistry",
    "image": "https://drmahesdentistry.com/assets/logo_black.webp",
    "@id": "https://drmahesdentistry.com",
    "url": "https://drmahesdentistry.com",
    "telephone": "+919342803217",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Kundrathur Main Road, Porur",
      "addressLocality": "Chennai",
      "postalCode": "600116",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 13.0382,
      "longitude": 80.1565
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "10:00",
      "closes": "22:00"
    },
    "sameAs": [
      "https://drmahesdentistry.com"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ─── HERO ─── */}
      <section className="hero" id="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-badge">Welcome to Dr. Mahe's Dentistry · Porur, Chennai</div>
            <h1 className="hero-title">Advanced Dental Care with a <em>Gentle Touch</em></h1>
            <p className="hero-desc">
              At Dr. Mahe's Dentistry, we provide modern, compassionate dental treatment in a calm, hygienic and
              patient-first environment. From routine check-ups to advanced implants — we're here for every smile.
            </p>
            <div className="hero-actions">
              <Link href="/contact#booking" className="btn btn-primary">Book Consultation</Link>
              <Link href="/treatments" className="btn btn-secondary">Our Treatments</Link>
            </div>
            <div className="hero-pills">
              <span className="hero-pill"><span className="hero-pill-dot"></span>Digital X-Ray</span>
              <span className="hero-pill"><span className="hero-pill-dot"></span>Mon – Sat · 10:00 AM – 10:00 PM</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-img-mask">
              <img src="/assets/reception_area.webp" width={1024} height={1024} alt="Dr. Mahe's Dentistry — modern reception area, Porur Chennai"
                className="hero-img" />
            </div>
            <div className="hero-float-card">
              <div className="hero-float-card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: 16, height: 16, strokeWidth: 2.5, color: 'var(--accent)', display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}>
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Patient Comfort First
              </div>
              <div className="hero-float-card-desc">Modern equipment, personalised care and complete transparency in every treatment plan.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-content">
          <div className="marquee-text">
            <span className="dot">✦</span> Advanced Sterilization <span className="dot">✦</span> Painless Root Canals <span className="dot">✦</span> Cosmetic Veneers <span className="dot">✦</span> Premium Implants <span className="dot">✦</span> Digital X-Rays <span className="dot">✦</span> Orthodontics &amp; Braces <span className="dot">✦</span> Smile Makeovers <span className="dot">✦</span> Oral Surgery
          </div>
          <div className="marquee-text">
            <span className="dot">✦</span> Advanced Sterilization <span className="dot">✦</span> Painless Root Canals <span className="dot">✦</span> Cosmetic Veneers <span className="dot">✦</span> Premium Implants <span className="dot">✦</span> Digital X-Rays <span className="dot">✦</span> Orthodontics &amp; Braces <span className="dot">✦</span> Smile Makeovers <span className="dot">✦</span> Oral Surgery
          </div>
        </div>
      </div>

      {/* ─── TREATMENTS ─── */}
      <section className="treatments-section section-padding" id="treatments">
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">What We Offer</span>
            <h2 className="section-title">Our Core Treatments</h2>
            <p className="section-desc">Expert dental care across all specialities — performed with precision, modern equipment and genuine care for your comfort.</p>
          </div>
          <div className="treatments-grid" id="treatmentsGrid">
            {treatmentsData.map((tx, i) => (
              <div className="tx-card" key={tx.name} data-animate data-delay={delays[i]}>
                <div className="tx-img-wrap">
                  <img src={tx.img} alt={`${tx.name} — Dr. Mahe's Dentistry`} width={700} height={420} loading="lazy" />
                  <div className="tx-img-overlay"></div>
                </div>
                <div className="tx-body">
                  <div className="tx-icon">{tx.icon}</div>
                  <h3 className="tx-name">{tx.name}</h3>
                  <div className="tx-desc">{tx.desc}</div>
                  <Link href={tx.page} className="tx-link">Learn More ➔</Link>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 44 }} data-animate>
            <Link href="/treatments" className="btn btn-secondary">View All Treatments →</Link>
          </div>
        </div>
      </section>

      {/* ─── DOCTOR ─── */}
      <section className="doctor-section section-padding">
        <div className="container">
          <div className="doctor-layout">
            <div className="doctor-img-wrap" data-animate="slide-left">
              <div className="doctor-img-frame">
                <img src="/assets/dr.mahe.webp" width={1684} height={2528} alt="Dr. Maheswari BDS — General Dentist at Dr. Mahe's Dentistry, Porur Chennai" loading="lazy" />
              </div>
              <div className="doctor-badge">
                <div className="doctor-badge-label">Specialization</div>
                <div className="doctor-badge-value">General &amp; Family Dentistry</div>
              </div>
            </div>
            <div className="doctor-info" data-animate="slide-right">
              <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: 16 }}>Meet Your Doctor</div>
              <h2 className="doctor-name">Dr. Maheswari</h2>
              <div className="doctor-quals">BDS — General Dentist</div>
              <p className="doctor-bio">
                At Dr. Mahe's Dentistry, we provide advanced dental care with a gentle touch and a patient-first approach.
                From precise root canal treatments and aesthetic smile enhancements to comfortable dental care for children,
                Dr. Maheswari is dedicated to creating a positive experience for patients of all ages.
              </p>
              <div className="doctor-specs">
                <div className="spec-row"><div className="spec-dot"></div>Teeth Cleaning &amp; Preventive Care</div>
                <div className="spec-row"><div className="spec-dot"></div>Root Canal Treatment (RCT)</div>
                <div className="spec-row"><div className="spec-dot"></div>Cosmetic &amp; Aesthetic Dentistry</div>
                <div className="spec-row"><div className="spec-dot"></div>Kids &amp; Family Dental Care</div>
              </div>
              <Link href="/about" className="btn btn-primary">Learn More About Dr. Maheswari</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
