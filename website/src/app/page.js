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
        <div className="container" data-animate>
          <div className="section-header" style={{ marginBottom: '2rem' }}>
            <span className="section-badge">Comprehensive Care</span>
            <h2 className="section-title">Complete Dental Care in Porur</h2>
          </div>
          <div className="care-text" style={{ columnCount: 2, columnGap: '3rem', fontSize: '1.05rem', lineHeight: '1.7' }}>
            <p style={{ marginBottom: '1rem' }}>
              At Dr. Mahe's Dentistry, we believe that a healthy smile is the foundation of overall well-being.
              Located in the heart of Porur, Chennai, our clinic is equipped to handle everything from routine
              teeth cleaning and preventive dental services to full-mouth rehabilitation. Whether you need
              painless root canal treatment to save a damaged tooth or permanent dental implants to restore
              missing teeth, our experienced team provides comprehensive solutions tailored to your unique needs.
            </p>
            <p>
              We also specialize in cosmetic dentistry, offering premium crowns, fillings, and veneers to
              enhance your natural smile. For our younger patients, our dedicated pediatric dentistry services
              ensure that children build healthy oral habits early on in a friendly, stress-free environment.
              Our goal is to be your lifelong partner in maintaining optimal oral health for the entire family.
            </p>
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
      <section className="philosophy-section section-padding" style={{ backgroundColor: 'var(--surface-color)' }}>
        <div className="container" data-animate>
          <div className="section-header">
            <span className="section-badge">Our Approach</span>
            <h2 className="section-title">Patient Comfort First Philosophy</h2>
          </div>
          <div className="philosophy-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', fontSize: '1.1rem', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '1rem' }}>
              We understand that visiting the dentist can sometimes be an anxious experience. That is why our entire practice is built around a "Patient Comfort First" philosophy. From the moment you walk into our clinic in Porur, you will be greeted by a calming atmosphere designed to put you at ease.
            </p>
            <p>
              We use advanced local anesthesia techniques, state-of-the-art diagnostic tools like digital X-rays, and ergonomic dental chairs to ensure every procedure—whether it's a simple tooth filling or an intricate oral surgery—is as painless and efficient as possible. We take the time to listen to your concerns, explain all treatment options transparently, and proceed at a pace you are completely comfortable with.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FAQS ─── */}
      <section className="faq-section section-padding">
        <div className="container" data-animate>
          <div className="section-header">
            <span className="section-badge">Questions?</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className="faq-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
            <div className="faq-item">
              <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Do root canals hurt?</h4>
              <p>With modern anesthesia and rotary endodontics, root canal treatments at our clinic are virtually painless and often completed in a single sitting.</p>
            </div>
            <div className="faq-item">
              <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>How long do dental implants last?</h4>
              <p>With proper care and oral hygiene, high-quality titanium dental implants can last a lifetime, providing a permanent solution for missing teeth.</p>
            </div>
            <div className="faq-item">
              <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>When should I bring my child for their first dental visit?</h4>
              <p>We recommend scheduling your child's first visit by their first birthday or when their first tooth erupts to establish a baseline for preventive care.</p>
            </div>
            <div className="faq-item">
              <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Do you offer cosmetic dentistry?</h4>
              <p>Yes, we offer a range of cosmetic treatments including teeth whitening, veneers, and aesthetic crowns to help you achieve your perfect smile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL SHARING ─── */}
      <section className="social-share-section section-padding" style={{ borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <div className="container" data-animate>
          <h4 style={{ marginBottom: '1rem', fontWeight: '500', fontSize: '1.2rem' }}>Share our services with family and friends</h4>
          <div className="social-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="https://www.facebook.com/sharer/sharer.php?u=https://drmahesdentistry.com" target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#1877F2', color: 'white', borderRadius: '4px' }}>
              Share on Facebook
            </a>
            <a href="https://twitter.com/intent/tweet?url=https://drmahesdentistry.com&text=Check%20out%20Dr.%20Mahe's%20Dentistry%20in%20Porur!" target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#1DA1F2', color: 'white', borderRadius: '4px' }}>
              Share on Twitter
            </a>
            <a href="https://api.whatsapp.com/send?text=Check%20out%20Dr.%20Mahe's%20Dentistry%20in%20Porur!%20https://drmahesdentistry.com" target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#25D366', color: 'white', borderRadius: '4px' }}>
              Share on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
