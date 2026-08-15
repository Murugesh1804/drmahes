import Link from "next/link";
import BookingForm from "../components/BookingForm";

export default function Home() {
  const treatmentsData = [
    { name: 'Dental Implants', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C8.5 2 7 5 7 7c0 2.5 1.5 4 3 5v3H9a1 1 0 0 0 0 2h1v2a1 1 0 0 0 2 0v-2h1a1 1 0 0 0 0-2h-1v-3c1.5-1 3-2.5 3-5 0-2-1.5-5-5-5z" /><path d="M10 7c0-1.7 1-3 2-3s2 1.3 2 3" /></svg>, desc: 'Permanent, natural-looking tooth replacements using biocompatible titanium fixtures — restoring full function and aesthetics.', img: '/assets/dental implant.jpg', page: '/dental-implants' },
    { name: 'Root Canal Treatment', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>, desc: 'Painless, single-sitting endodontic therapy to save infected teeth, eliminate pain and preserve your natural smile.', img: '/assets/root canal treament.jpg', page: '/root-canal' },
    { name: 'Orthodontics & Braces', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="8" width="18" height="8" rx="2" /><line x1="7" y1="8" x2="7" y2="16" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="17" y1="8" x2="17" y2="16" /><line x1="3" y1="12" x2="21" y2="12" /></svg>, desc: 'Metal, ceramic and self-ligating braces — precisely customized alignment for children, teens and adults.', img: '/assets/braces.jpg', page: '/orthodontics' },
    { name: 'Pediatric Dentistry', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2a5 5 0 0 1 5 5c0 3.5-3.5 7-5 10-1.5-3-5-6.5-5-10a5 5 0 0 1 5-5z" /><circle cx="12" cy="7" r="1.5" /></svg>, desc: 'Specialized, gentle dental care for infants, children, and teenagers — preventive care, cavity treatments, and habit counseling.', img: '/assets/pedo.jpg', page: '/pediatric-dentistry' },
    { name: 'Oral Surgery', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" /></svg>, desc: 'Expert removal of wisdom teeth, impacted molars and complex extractions with precision and minimal discomfort.', img: '/assets/OralSurgery.jpg', page: '/oral-surgery' },
    { name: 'Crowns & Veneers', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 20h20M5 20V8l3.5 4L12 3l3.5 9L19 8v12" /></svg>, desc: 'Premium zirconia, e.max and metal-ceramic restorations — precision-crafted to protect and beautifully restore your teeth.', img: '/assets/veneers.jpg', page: '/crowns-veneers' },
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
              <img src="/assets/clinic.webp" width={1024} height={1024} alt="Dr. Mahe's Dentistry — modern reception area, Porur Chennai"
                className="hero-img" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-content">
          <div className="marquee-text">
            <span className="dot">·</span> Advanced Sterilization <span className="dot">·</span> Painless Root Canals <span className="dot">·</span> Pediatric Dentistry <span className="dot">·</span> Premium Implants <span className="dot">·</span> Digital X-Rays <span className="dot">·</span> Orthodontics &amp; Braces <span className="dot">·</span> Child Dental Care <span className="dot">·</span> Oral Surgery
          </div>
          <div className="marquee-text">
            <span className="dot">·</span> Advanced Sterilization <span className="dot">·</span> Painless Root Canals <span className="dot">·</span> Pediatric Dentistry <span className="dot">·</span> Premium Implants <span className="dot">·</span> Digital X-Rays <span className="dot">·</span> Orthodontics &amp; Braces <span className="dot">·</span> Child Dental Care <span className="dot">·</span> Oral Surgery
          </div>
        </div>
      </div>

      {/* ─── COMPREHENSIVE CARE OVERVIEW ─── */}
      <section className="comprehensive-care section-padding">
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">Comprehensive Excellence</span>
            <h2 className="section-title">Complete Family &amp; Advanced Dental Care in Porur</h2>
            <p className="section-desc">
              From foundational oral hygiene to complex aesthetic rehabilitations, we offer end-to-end dental solutions designed around precision, safety, and long-term wellness.
            </p>
          </div>

          <div className="values-grid" data-animate>
            <div className="value-card">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3 className="value-title">Preventive &amp; Hygiene Care</h3>
              <p className="value-desc">
                Comprehensive dental examinations, digital radiography, scaling, and professional teeth cleaning to preserve your natural dental structure and prevent periodontal disease.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3 className="value-title">Restorative &amp; Endodontics</h3>
              <p className="value-desc">
                Painless single-sitting root canals, dental implants, high-durability tooth fillings, and wisdom tooth extractions using advanced micro-endodontic instruments.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </div>
              <h3 className="value-title">Cosmetics &amp; Child Care</h3>
              <p className="value-desc">
                Custom zirconia crowns, porcelain veneers, teeth whitening, clear aligners, and specialized pediatric dentistry for children in a gentle, stress-free setting.
              </p>
            </div>
          </div>
        </div>
      </section>

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
                  <Link href={tx.page} className="tx-link">Explore {tx.name}</Link>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 44 }} data-animate>
            <Link href="/treatments" className="btn btn-secondary">View All Treatments</Link>
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
                <div className="spec-row"><div className="spec-dot"></div>Pediatric Dentistry &amp; Child Care</div>
                <div className="spec-row"><div className="spec-dot"></div>Kids &amp; Family Dental Care</div>
              </div>
              <Link href="/about" className="btn btn-primary">Learn More About Dr. Maheswari</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PHILOSOPHY ─── */}
      <section className="philosophy-section section-padding">
        <div className="container" data-animate>
          <div className="philosophy-banner">
            <div className="section-header" style={{ marginBottom: 24, textAlign: 'left' }}>
              <span className="section-badge" style={{ backgroundColor: 'rgba(196,176,151,0.2)', color: 'var(--accent)' }}>Our Core Philosophy</span>
              <h2 className="section-title" style={{ color: '#FFFFFF' }}>Patient Comfort First</h2>
              <p className="section-desc" style={{ color: '#AAAAAA', maxWidth: '640px', marginLeft: 0 }}>
                Dental care should never be a source of stress or discomfort. At Dr. Mahe's Dentistry in Porur, every aspect of your visit is crafted to ensure a serene, painless, and transparent treatment experience.
              </p>
            </div>

            <div className="philosophy-grid">
              <div className="philosophy-pill-card">
                <div className="philosophy-pill-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h4 className="philosophy-pill-title">Gentle Anesthesia</h4>
                <p className="philosophy-pill-desc">Modern pain-free numbing techniques for seamless, stress-free procedures.</p>
              </div>

              <div className="philosophy-pill-card">
                <div className="philosophy-pill-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h4 className="philosophy-pill-title">Strict Sterilization</h4>
                <p className="philosophy-pill-desc">Hospital-grade autoclave protocols &amp; strict infection control standards.</p>
              </div>

              <div className="philosophy-pill-card">
                <div className="philosophy-pill-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <h4 className="philosophy-pill-title">Clear Counseling</h4>
                <p className="philosophy-pill-desc">Transparent treatment plans, honest pricing, and detailed post-care guidance.</p>
              </div>

              <div className="philosophy-pill-card">
                <div className="philosophy-pill-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <h4 className="philosophy-pill-title">Ergonomic Ambience</h4>
                <p className="philosophy-pill-desc">Relaxing treatment bays designed to make your dental visits genuinely calming.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQS ─── */}
      <section className="faqs-section section-padding" id="faqs">
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">Patient Clarity</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-desc">Got questions about treatments, timelines, or comfort? Find clear answers below.</p>
          </div>

          <div className="faqs-list" data-animate>
            <details className="faq-item">
              <summary className="faq-btn">
                <span>Are root canal treatments painless at your clinic?</span>
                <span className="faq-icon">+</span>
              </summary>
              <div className="faq-answer">
                Yes, absolutely. With modern digital X-rays, localized computerized anesthesia, and high-precision rotary endodontic tools, root canal treatments at Dr. Mahe's Dentistry are comfortable, efficient, and typically completed in a single sitting without discomfort.
              </div>
            </details>

            <details className="faq-item">
              <summary className="faq-btn">
                <span>How long do dental implants last?</span>
                <span className="faq-icon">+</span>
              </summary>
              <div className="faq-answer">
                Dental implants are engineered to be a lifetime solution for missing teeth. Crafted from bio-compatible titanium that fuses directly with jawbone, they function, feel, and look like natural teeth. With routine oral hygiene and periodic dental check-ups, implants can last indefinitely.
              </div>
            </details>

            <details className="faq-item">
              <summary className="faq-btn">
                <span>When should my child first visit a pediatric dentist?</span>
                <span className="faq-icon">+</span>
              </summary>
              <div className="faq-answer">
                We recommend bringing your child for their initial dental check-up by their first birthday or when their first tooth emerges. Early visits establish a friendly relationship with the dentist and help detect initial cavity risks or bite alignment issues early on.
              </div>
            </details>

            <details className="faq-item">
              <summary className="faq-btn">
                <span>What cosmetic options do you offer for restoring damaged teeth?</span>
                <span className="faq-icon">+</span>
              </summary>
              <div className="faq-answer">
                We offer a full range of aesthetic restorative options including custom ultra-thin porcelain veneers, premium zirconia crowns, composite tooth-colored fillings, and professional teeth whitening designed to give you a bright, flawless, natural-looking smile.
              </div>
            </details>

            <details className="faq-item">
              <summary className="faq-btn">
                <span>Where is the clinic located and what are your consulting hours?</span>
                <span className="faq-icon">+</span>
              </summary>
              <div className="faq-answer">
                Dr. Mahe's Dentistry is conveniently located on Kundrathur Main Road in Porur, Chennai. We are open Monday through Saturday from 10:00 AM to 10:00 PM, allowing flexible evening consultations for working professionals and families.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL SHARING ─── */}
      <section className="social-share-section section-padding">
        <div className="container" data-animate>
          <div className="social-share-box">
            <span className="section-badge">Spread The Word</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '700', marginTop: 8 }}>Recommend Dr. Mahe's Dentistry</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: 6 }}>
              Know someone in Porur, Chennai looking for expert dental care? Share our clinic details with your network.
            </p>
            <div className="social-buttons">
              <a
                href="https://www.facebook.com/sharer/sharer.php?u=https://drmahesdentistry.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                aria-label="Share on Facebook"
              >
                <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
              <a
                href="https://twitter.com/intent/tweet?url=https://drmahesdentistry.com&text=Check%20out%20Dr.%20Mahe's%20Dentistry%20in%20Porur,%20Chennai!"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                aria-label="Share on Twitter"
              >
                <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X (Twitter)
              </a>
              <a
                href="https://api.whatsapp.com/send?text=Check%20out%20Dr.%20Mahe's%20Dentistry%20in%20Porur!%20https://drmahesdentistry.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                aria-label="Share on WhatsApp"
              >
                <svg viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
