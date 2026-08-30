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
            <span className="hero-eyebrow">Dr. Mahe's Dentistry · Porur, Chennai</span>
            <h1 className="hero-title">Advanced Dental Care with a <em>Gentle Touch</em></h1>
            <p className="hero-desc">
              We believe a trip to the dentist shouldn't be something you dread. At Dr. Mahe's Dentistry,
              every visit is calm, unhurried, and genuinely kind — from check-ups to complex procedures.
            </p>
            <div className="hero-actions">
              <Link href="/contact#booking" className="btn btn-primary">Book Consultation</Link>
              <Link href="/treatments" className="btn btn-secondary">Our Treatments</Link>
            </div>
            <div className="hero-avail">
              <span className="hero-avail-dot"></span>
              Open today · Mon – Sat, 10 AM – 10 PM
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

      {/* ─── TRUST STRIP ─── */}
      <div className="trust-strip" aria-label="Why patients choose us">
        <div className="container trust-strip-inner">
          <div className="trust-item">
            <div className="trust-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div>
              <div className="trust-item-label">Sterilization</div>
              <div className="trust-item-text">Hospital-grade autoclave, every instrument opened fresh in front of you</div>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            </div>
            <div>
              <div className="trust-item-label">No Surprises</div>
              <div className="trust-item-text">Clear diagnosis, honest pricing, and your options explained before anything begins</div>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <div className="trust-item-label">All Ages Welcome</div>
              <div className="trust-item-text">Toddlers to seniors — complete family dental care under one roof in Porur</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── COMPREHENSIVE CARE ─── */}
      <section className="comprehensive-care section-padding">
        <div className="container">
          <div className="care-intro-layout" data-animate>
            <div>
              <span className="care-intro-label">Comprehensive Excellence</span>
              <h2 className="care-intro-heading">Complete Family &amp; Advanced Dental Care in Porur</h2>
            </div>
            <div>
              <p className="care-intro-body">
                From foundational oral hygiene to complex aesthetic rehabilitations, we offer end-to-end dental solutions designed around precision, safety, and your long-term wellbeing. You'll never feel rushed, pressured, or uninformed.
              </p>
              <div className="care-pillars">
                <div className="care-pillar">
                  <div className="care-pillar-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                  </div>
                  <div>
                    <div className="care-pillar-title">Preventive &amp; Hygiene Care</div>
                    <div className="care-pillar-desc">Comprehensive exams, digital X-rays, scaling, and professional cleaning to protect your natural dental structure.</div>
                  </div>
                </div>
                <div className="care-pillar">
                  <div className="care-pillar-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <div>
                    <div className="care-pillar-title">Restorative &amp; Endodontics</div>
                    <div className="care-pillar-desc">Painless single-sitting root canals, implants, and fillings using advanced micro-endodontic instruments.</div>
                  </div>
                </div>
                <div className="care-pillar">
                  <div className="care-pillar-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                  </div>
                  <div>
                    <div className="care-pillar-title">Cosmetics &amp; Child Care</div>
                    <div className="care-pillar-desc">Custom zirconia crowns, porcelain veneers, teeth whitening, clear aligners, and gentle pediatric dentistry.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TREATMENTS ─── */}
      <section className="treatments-section section-padding" id="treatments">
        <div className="container">
          <div className="treatments-section-intro" data-animate>
            <div className="treatments-section-intro-left">
              <span className="treatments-intro-eyebrow">What We Offer</span>
              <h2 className="treatments-intro-title">Our Core Treatments</h2>
            </div>
            <p className="treatments-intro-right">
              Expert dental care across all specialities — performed with precision, modern equipment and genuine care for your comfort.
            </p>
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
                  <Link href={tx.page} className="tx-link">Learn more →</Link>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }} data-animate>
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
              <p className="doctor-pullquote">"Every patient deserves to leave feeling better than when they walked in — not just physically, but about the whole experience."</p>
              <h2 className="doctor-name">Dr. Maheswari</h2>
              <div className="doctor-quals">BDS — General Dentist</div>
              <p className="doctor-bio">
                Dr. Maheswari started her practice with a simple conviction: dental care should be something people look forward to, not put off. She takes time with every patient — to understand what worries you, explain exactly what's happening, and make sure you're comfortable at every step.
              </p>
              <p className="doctor-bio">
                From routine cleanings and children's first visits to root canals, implants and smile makeovers, she brings the same unhurried attention to every case.
              </p>
              <div className="doctor-specs">
                <div className="spec-row"><div className="spec-dot"></div>Teeth Cleaning &amp; Preventive Care</div>
                <div className="spec-row"><div className="spec-dot"></div>Root Canal Treatment (RCT)</div>
                <div className="spec-row"><div className="spec-dot"></div>Pediatric Dentistry &amp; Child Care</div>
                <div className="spec-row"><div className="spec-dot"></div>Implants, Crowns &amp; Veneers</div>
              </div>
              <Link href="/about" className="btn btn-primary">Meet Dr. Maheswari</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PHILOSOPHY ─── */}
      <section className="philosophy-section section-padding">
        <div className="container">
          <div className="philosophy-layout" data-animate>
            <div className="philosophy-left">
              <span className="philosophy-eyebrow">Our Approach</span>
              <h2 className="philosophy-heading">Comfort isn't a bonus. It's the whole point.</h2>
              <p className="philosophy-body">
                Dental anxiety is real, and we take it seriously. At Dr. Mahe's Dentistry, we've built every part of the experience — from the reception area to the treatment chair — around the idea that calm, transparent care produces better outcomes and happier patients.
              </p>
              <p className="philosophy-body">
                We don't rush. We don't push unnecessary treatments. We tell you exactly what we see, what we recommend, and why — then let you decide.
              </p>
            </div>
            <div className="philosophy-right">
              <div className="philosophy-commitments">
                <div className="philosophy-commitment">
                  <div className="philosophy-commitment-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <div className="philosophy-commitment-title">Gentle Anesthesia</div>
                    <p className="philosophy-commitment-desc">Modern pain-free numbing techniques — procedures feel seamless, not stressful.</p>
                  </div>
                </div>
                <div className="philosophy-commitment">
                  <div className="philosophy-commitment-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  </div>
                  <div>
                    <div className="philosophy-commitment-title">Strict Sterilization</div>
                    <p className="philosophy-commitment-desc">Hospital-grade autoclave protocols and infection control — no shortcuts, ever.</p>
                  </div>
                </div>
                <div className="philosophy-commitment">
                  <div className="philosophy-commitment-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <div>
                    <div className="philosophy-commitment-title">Clear Counseling</div>
                    <p className="philosophy-commitment-desc">Transparent treatment plans, honest pricing, and detailed guidance after every visit.</p>
                  </div>
                </div>
                <div className="philosophy-commitment">
                  <div className="philosophy-commitment-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                  </div>
                  <div>
                    <div className="philosophy-commitment-title">A Calm Space</div>
                    <p className="philosophy-commitment-desc">Treatment bays designed to feel relaxing, not clinical — because how you feel matters.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQS ─── */}
      <section className="faqs-section section-padding" id="faqs">
        <div className="container">
          <div className="faqs-intro" data-animate>
            <div className="faqs-intro-left">
              <span className="faqs-intro-eyebrow">Common Questions</span>
              <h2 className="faqs-intro-title">Things patients usually want to know</h2>
            </div>
            <p className="faqs-intro-right">
              We get a lot of the same questions before first visits. Here are honest answers to the most common ones — no jargon, no filler.
            </p>
          </div>

          <div className="faqs-list" data-animate>
            <details className="faq-item">
              <summary className="faq-btn">
                <span>Will a root canal hurt?</span>
                <span className="faq-icon">+</span>
              </summary>
              <div className="faq-answer">
                No — not at Dr. Mahe's Dentistry. With modern digital X-rays, computerized local anesthesia, and high-precision rotary instruments, root canal treatments here are comfortable and typically done in a single sitting. Most patients are surprised by how easy it is.
              </div>
            </details>

            <details className="faq-item">
              <summary className="faq-btn">
                <span>How long do dental implants last?</span>
                <span className="faq-icon">+</span>
              </summary>
              <div className="faq-answer">
                Dental implants are built to last a lifetime. The biocompatible titanium fixture fuses directly with your jawbone, making it as stable as a natural tooth root. With normal oral hygiene and periodic check-ups, most implants last indefinitely.
              </div>
            </details>

            <details className="faq-item">
              <summary className="faq-btn">
                <span>When should my child first visit a dentist?</span>
                <span className="faq-icon">+</span>
              </summary>
              <div className="faq-answer">
                We recommend bringing your child in when their first tooth appears, or by their first birthday — whichever comes first. Early visits are short and gentle, building a positive relationship with dental care while catching any early concerns before they become bigger problems.
              </div>
            </details>

            <details className="faq-item">
              <summary className="faq-btn">
                <span>What are my options for restoring a damaged or missing tooth?</span>
                <span className="faq-icon">+</span>
              </summary>
              <div className="faq-answer">
                Quite a few, depending on your situation. We offer dental implants, zirconia crowns, ultra-thin porcelain veneers, tooth-colored composite fillings, and professional whitening. We'll assess your teeth and talk through what makes sense for your goals and budget — no pressure.
              </div>
            </details>

            <details className="faq-item">
              <summary className="faq-btn">
                <span>Where are you located and when are you open?</span>
                <span className="faq-icon">+</span>
              </summary>
              <div className="faq-answer">
                We're on Kundrathur Main Road in Porur, Chennai — easy to reach by bus, auto or private vehicle, with parking available. We're open Monday through Saturday from 10:00 AM to 10:00 PM, so evening appointments after work or school are no problem.
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
            <h3 style={{ fontSize: '1.6rem', fontWeight: '700', marginTop: 8 }}>Know someone looking for a good dentist in Porur?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginTop: 8, maxWidth: 480, margin: '10px auto 0' }}>
              Share Dr. Mahe's Dentistry with family and friends in Chennai — a recommendation from someone they trust goes a long way.
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
