import Link from "next/link";
import BookingForm from "../components/BookingForm";
import PatientConcernExplorer from "../components/PatientConcernExplorer";
import { Check, Phone, MessageCircle, MapPin, Clock, ArrowRight, Star } from "lucide-react";

export default function Home() {
  const treatmentsData = [
    {
      name: 'Dental Implants',
      badge: 'Permanent Replacement',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 2C8.5 2 7 5 7 7c0 2.5 1.5 4 3 5v3H9a1 1 0 0 0 0 2h1v2a1 1 0 0 0 2 0v-2h1a1 1 0 0 0 0-2h-1v-3c1.5-1 3-2.5 3-5 0-2-1.5-5-5-5z" /><path d="M10 7c0-1.7 1-3 2-3s2 1.3 2 3" /></svg>,
      desc: 'Lifelike tooth replacement using biocompatible medical titanium fixtures — preserves jawbone integrity and restores natural chewing comfort for life.',
      img: '/assets/dental implant.jpg',
      page: '/dental-implants',
      meta: 'Lifetime Durability',
      linkText: 'Explore Dental Implant Costs & Timeline'
    },
    {
      name: 'Root Canal Treatment',
      badge: 'Single Sitting',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>,
      desc: 'Painless, gentle endodontic care using precision micro-rotary instruments to eliminate infection and save your natural tooth in a single comfortable visit.',
      img: '/assets/root canal treament.jpg',
      page: '/root-canal',
      meta: 'Painless & Same-day',
      linkText: 'Read Root Canal Procedure Guide'
    },
    {
      name: 'Orthodontics & Braces',
      badge: 'Kids, Teens & Adults',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="8" width="18" height="8" rx="2" /><line x1="7" y1="8" x2="7" y2="16" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="17" y1="8" x2="17" y2="16" /><line x1="3" y1="12" x2="21" y2="12" /></svg>,
      desc: 'Ceramic brackets, self-ligating systems and invisible clear aligners customized to give you a straight, harmonious smile with minimal discomfort.',
      img: '/assets/braces.jpg',
      page: '/orthodontics',
      meta: 'Clear Aligners & Ceramic',
      linkText: 'Explore Braces & Aligner Options'
    },
    {
      name: 'Pediatric Dentistry',
      badge: 'Gentle Child Care',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 2a5 5 0 0 1 5 5c0 3.5-3.5 7-5 10-1.5-3-5-6.5-5-10a5 5 0 0 1 5-5z" /><circle cx="12" cy="7" r="1.5" /></svg>,
      desc: 'Fun, fear-free dentistry for toddlers, children and teens. Preventive fluoride, cavity treatments and gentle habit coaching in a relaxed setting.',
      img: '/assets/pedo.jpg',
      page: '/pediatric-dentistry',
      meta: 'Fear-Free for Kids',
      linkText: 'See Kids Dental Care Services'
    },
    {
      name: 'Crowns & Veneers',
      badge: 'Natural Aesthetics',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M2 20h20M5 20V8l3.5 4L12 3l3.5 9L19 8v12" /></svg>,
      desc: 'Hand-crafted zirconia, e.max and porcelain restorations that seamlessly match your natural tooth shade, restoring beauty and strength.',
      img: '/assets/veneers.jpg',
      page: '/crowns-veneers',
      meta: 'Custom Shade Matching',
      linkText: 'View Crowns & Veneers Guide'
    },
    {
      name: 'Oral Surgery & Wisdom Tooth',
      badge: 'Gentle Extractions',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" /></svg>,
      desc: 'Safe, minimally invasive removal of impacted wisdom molars and complex extractions with gentle anesthesia and dedicated post-care guidance.',
      img: '/assets/OralSurgery.jpg',
      page: '/oral-surgery',
      meta: 'Minimal Recovery Time',
      linkText: 'Read Wisdom Tooth Removal Guide'
    },
  ];

  const delays = ["100", "200", "300", "100", "200", "300"];

  const reviews = [
    {
      name: "Varma Sharma",
      rating: 5,
      time: "1 month ago",
      review:
        "Great Experience! Teeth cleaning was gentle and thorough and the doctor were very friendly. Thank you."
    },
    {
      name: "Surya Kumar",
      rating: 5,
      time: "1 week ago",
      review:
        "Had a very good experience at Dr. Mahe’s Dentistry. The doctor were friendly, professional and explained the treatment clearly. The clinic was clean and well maintained. Overall, I’m happy with the care and would definitely recommend Dr. Mahe’s Dentistry to others."
    },
    {
      name: "Pavithra",
      rating: 5,
      time: "2 weeks ago",
      review:
        "Good check it out guys ...it was nice experience"
    },
    {
      name: "Moonishaa Papi",
      rating: 5,
      time: "2 weeks ago",
      review:
        "Had a good experience in tooth cleaning, she's vry friendly and she explained me about tooth very clearly"
    },
    {
      name: "Siva Kumar",
      rating: 5,
      time: "1 month ago",
      review:
        "I had an excellent experience at this dental clinic. I visited for a dental check-up, tooth scaling and a tooth extraction. Mam explained every step of the treatment clearly and the extraction was smooth and almost painless."
    },
    {
      name: "Lavanya Nagamani",
      rating: 5,
      time: "1 month ago",
      review:
        "The clinic was so neat and I had Great experience from start to finish. The scaling was comfortable and my fractured tooth was restored with excellent precision. Thank you for the wonderful care! 🦷"
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "name": "Dr. Mahe's Dentistry",
    "image": "https://drmahesdentistry.in/assets/logo_black.webp",
    "@id": "https://drmahesdentistry.in",
    "url": "https://drmahesdentistry.in",
    "telephone": "+919342803217",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1st floor, Kundrathur Main Road, Jaya Nagar, Porur",
      "addressLocality": "Chennai",
      "postalCode": "600116",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 13.0382,
      "longitude": 80.1565
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "6"
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
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── 1. HERO SECTION (WARM & REASSURING) ─── */}
      <section className="hero-warm" id="hero">
        <div className="container hero-grid-warm">
          <div className="hero-content" data-animate="slide-right">
            <div className="hero-status-pill">
              <span className="hero-status-dot"></span>
              <span>Open today · Welcoming patients in Porur until 10:00 PM</span>
            </div>

            <h1 className="hero-title-warm">
              Advanced Dental Care in <em>Porur, Chennai</em>
            </h1>
            <p className="hero-tagline-warm">with a Gentle Touch</p>

            <p className="hero-lead-warm">
              We know visiting the dentist can feel daunting. At Dr. Mahe's Dentistry, every visit is calm, unhurried, transparent and genuinely kind — from simple cleanings to complete smile restorations.
            </p>

            <div className="hero-actions-warm">
              <Link href="/contact#booking" className="btn btn-primary btn-lg">
                Book a Consultation
              </Link>
              <Link href="/treatments" className="btn btn-secondary btn-lg">
                Explore Treatments
              </Link>
              <a
                href="https://wa.me/919342803217?text=Hi%20Dr.%20Maheswari,%20I%20would%20like%20to%20know%20more%20about%20dental%20treatments"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <MessageCircle size={18} />
                <span>WhatsApp Doctor</span>
              </a>
            </div>

            <div className="hero-trust-row">
              <div className="hero-trust-item">
                <Check size={15} strokeWidth={2.5} className="hero-trust-icon" />
                <span>Hospital-Grade Sterilization</span>
              </div>
              <div className="hero-trust-item">
                <Check size={15} strokeWidth={2.5} className="hero-trust-icon" />
                <span>Zero-Judgment Care</span>
              </div>
              <div className="hero-trust-item">
                <Check size={15} strokeWidth={2.5} className="hero-trust-icon" />
                <span>100% Upfront Pricing</span>
              </div>
              <div className="hero-trust-item">
                <Check size={15} strokeWidth={2.5} className="hero-trust-icon" />
                <span>Painless Anesthesia</span>
              </div>
            </div>

            <div className="hero-handwrite-note">
              “Every smile is unique and so is our time with you.” <span>— Dr. Maheswari, BDS</span>
            </div>
          </div>

          <div className="hero-visual-box" data-animate="slide-left">
            <div className="hero-photo-card">
              <img
                src="/assets/clinic.webp"
                width={1024}
                height={1024}
                alt="Dr. Mahe's Dentistry modern clinic interior in Porur, Chennai"
                priority="true"
              />
            </div>

            <div className="hero-float-badge">
              <div className="hero-float-badge-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <div>
                <div className="hero-float-badge-title">Painless Care Promise</div>
                <div className="hero-float-badge-sub">Computerized gentle anesthesia &amp; unhurried pace</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. THE GENTLE CARE DIFFERENCE (4 PILLARS) ─── */}
      <section className="gentle-promises-section section-padding-sm">
        <div className="container">
          <div className="section-header" data-animate style={{ marginBottom: "38px" }}>
            <span className="section-badge">The Gentle Care Difference</span>
            <h2 className="section-title">A Higher Standard of <em>Compassionate Dentistry</em></h2>
            <p className="section-desc">
              Four fundamental clinical commitments that guide every consultation, cleaning and treatment.
            </p>
          </div>

          <div className="promises-grid">
            <div className="promise-card" data-animate data-delay="100">
              <div className="promise-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
              </div>
              <h3 className="promise-title">Pain-Conscious Care</h3>
              <p className="promise-desc">
                Pre-numb comfort gels and micro-rotary instruments mean you feel virtually nothing. No sharp pinches, no anxiety.
              </p>
            </div>

            <div className="promise-card" data-animate data-delay="200">
              <div className="promise-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
              </div>
              <h3 className="promise-title">Zero Judgment Zone</h3>
              <p className="promise-desc">
                Haven't visited a dentist in years? Worried about your teeth? You will always receive kindness, respect and zero lectures.
              </p>
            </div>

            <div className="promise-card" data-animate data-delay="300">
              <div className="promise-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              </div>
              <h3 className="promise-title">100% Honest Pricing</h3>
              <p className="promise-desc">
                We clearly walk through your diagnosis and all treatment choices before starting anything. Zero hidden fees, zero pressure.
              </p>
            </div>

            <div className="promise-card" data-animate data-delay="400">
              <div className="promise-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
              </div>
              <h3 className="promise-title">Hospital Sterilization</h3>
              <p className="promise-desc">
                Class-B vacuum autoclave protocols. Every instrument is sealed in sterile pouches and opened fresh in front of your eyes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. INTERACTIVE PATIENT CONCERN EXPLORER ─── */}
      <section className="concern-section section-padding">
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">Personalized Dental Guide</span>
            <h2 className="section-title">What brings you in <em>today?</em></h2>
            <p className="section-desc">
              Select what you are experiencing below to see our recommended care pathway, expected timeline and direct booking options.
            </p>
          </div>

          <PatientConcernExplorer />
        </div>
      </section>

      {/* ─── 4. CORE TREATMENTS DIRECTORY ─── */}
      <section className="treatments-section section-padding" id="treatments">
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">Comprehensive Excellence</span>
            <h2 className="section-title">Our Core Treatments in <em>Porur</em></h2>
            <p className="section-desc">
              From preventive checkups to surgical smile rehabilitations, every treatment is delivered with precision and deep empathy.
            </p>
          </div>

          <div className="treatments-grid">
            {treatmentsData.map((tx, i) => (
              <div className="tx-card-warm" key={tx.name} data-animate data-delay={delays[i]}>
                <div className="tx-card-img-wrap">
                  <img src={tx.img} alt={`${tx.name} at Dr. Mahe's Dentistry Porur`} width={700} height={420} loading="lazy" />
                  <span className="tx-card-badge">{tx.badge}</span>
                </div>
                <div className="tx-card-body">
                  <h3 className="tx-card-name">{tx.name}</h3>
                  <p className="tx-card-desc">{tx.desc}</p>
                  <div className="tx-card-meta">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>{tx.meta}</span>
                    <Link href={tx.page} className="tx-card-link">
                      <span>{tx.linkText}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 48 }} data-animate>
            <Link href="/treatments" className="btn btn-secondary btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <span>View All Treatment Guides &amp; Procedures</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 5. EDITORIAL LETTER FROM DR. MAHESWARI ─── */}
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
                  loading="lazy"
                />
              </div>
              <div className="doctor-stamp-card">
                <div className="doctor-stamp-label">Lead Clinician</div>
                <div className="doctor-stamp-name">Dr. Maheswari</div>
                <div className="doctor-stamp-sub">BDS · General &amp; Aesthetic Dentist</div>
              </div>
            </div>

            <div className="doctor-letter-content" data-animate="slide-left">
              <div className="doctor-handwrite-intro">A personal note from Dr. Maheswari ~ Founder &amp; Lead Clinician</div>
              <h2 className="doctor-editorial-heading">
                "Dentistry isn't just about teeth. It is about how you <em>feel</em> when you are here."
              </h2>
              <p className="doctor-letter-p">
                When I opened our clinic on Kundrathur Main Road in Porur, I wanted to build the kind of practice I would want my own family to visit: one where nobody feels hurried, nobody feels judged and treatments are explained with honesty and clarity.
              </p>
              <p className="doctor-letter-p">
                Whether you need immediate relief from toothache, want to gently introduce your toddler to their first dental checkup, or are planning a complete smile makeover with implants, my team and I promise to listen first, move at your pace and treat you with warmth.
              </p>

              <div className="doctor-signature-block">
                <div className="doctor-sign-info">
                  <div style={{ fontFamily: "var(--font-handwrite, cursive)", fontSize: "1.6rem", color: "var(--accent-hover)", lineHeight: 1.1, marginBottom: "4px" }}>
                    Warmly, Dr. Mahe
                  </div>
                  <span className="doctor-sign-name">Dr. Maheswari, BDS</span>
                  <span className="doctor-sign-role">Dr. Mahe's Dentistry · Porur, Chennai</span>
                </div>
                <Link href="/about" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>Read Dr. Maheswari's Story</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. FIRST VISIT JOURNEY (WHAT TO EXPECT) ─── */}
      <section className="first-visit-section section-padding">
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">Anxiety-Free Experience</span>
            <h2 className="section-title">Your First Visit: <em>Step by Step</em></h2>
            <p className="section-desc">
              Here is exactly what happens when you step into our clinic in Porur. No sudden surprises, no rushing.
            </p>
          </div>

          <div className="journey-timeline-grid">
            <div className="journey-step-card" data-animate data-delay="100">
              <div className="journey-step-num">
                <span>01</span>
                <span className="journey-step-badge">Warm Welcome</span>
              </div>
              <h3 className="journey-step-title">Unhurried Conversation</h3>
              <p className="journey-step-desc">
                We sit down together in a comfortable consultation setting. Tell us your concerns, past experiences, or any dental worries you have.
              </p>
            </div>

            <div className="journey-step-card" data-animate data-delay="200">
              <div className="journey-step-num">
                <span>02</span>
                <span className="journey-step-badge">Low Radiation</span>
              </div>
              <h3 className="journey-step-title">Gentle Digital Assessment</h3>
              <p className="journey-step-desc">
                Using ultra-low-dose digital X-rays and intraoral cameras, we take high-definition images to accurately view your tooth structure.
              </p>
            </div>

            <div className="journey-step-card" data-animate data-delay="300">
              <div className="journey-step-num">
                <span>03</span>
                <span className="journey-step-badge">Plain English</span>
              </div>
              <h3 className="journey-step-title">Clear Options &amp; Pricing</h3>
              <p className="journey-step-desc">
                We show you exactly what we see on screen, walk through treatment options, timelines and exact costs before anything starts.
              </p>
            </div>

            <div className="journey-step-card" data-animate data-delay="400">
              <div className="journey-step-num">
                <span>04</span>
                <span className="journey-step-badge">At Your Pace</span>
              </div>
              <h3 className="journey-step-title">Pain-Conscious Care</h3>
              <p className="journey-step-desc">
                If you choose to proceed, treatments are carried out with soothing local numbing and total gentleness. You can pause us anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. PATIENT STORIES (VOICES OF PORUR) ─── */}
      <section className="patient-stories-section section-padding">
        <div className="container">
          <div className="section-header" data-animate>
            <div style={{ fontFamily: "var(--font-handwrite, cursive)", fontSize: "1.5rem", color: "var(--accent-hover)", marginBottom: "4px" }}>
              Authentic stories from our Porur neighbors
            </div>
            <span className="section-badge">Verified Google Reviews</span>
            <h2 className="section-title">Words from our <em>Patients</em></h2>
            <p className="section-desc">
              Real experiences and authentic reviews from patients who visited Dr. Mahe's Dentistry in Porur.
            </p>
          </div>

          <div className="stories-grid">
            {reviews.map((r, i) => (
              <div className="story-card" key={r.name} data-animate data-delay={delays[i]}>
                <div>
                  <div className="story-header">
                    <div className="story-stars" aria-label={`${r.rating} out of 5 stars`}>
                      {[...Array(r.rating)].map((_, starIdx) => (
                        <Star key={starIdx} size={15} fill="currentColor" strokeWidth={0} />
                      ))}
                    </div>
                    <span className="story-time">{r.time}</span>
                  </div>
                  <p className="story-text">"{r.review}"</p>
                </div>
                <div className="story-author">
                  <div className="story-avatar">{r.name.charAt(0)}</div>
                  <div>
                    <div className="story-name">{r.name}</div>
                    <div className="story-tag">Verified Patient · Google Review</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. FAQS SECTION (EMPATHETIC & CLEAR) ─── */}
      <section className="faqs-section-warm section-padding" id="faqs">
        <div className="container">
          <div className="faqs-layout-warm">
            <div data-animate="slide-right">
              <span className="section-badge">Honest Answers</span>
              <h2 className="section-title">Common questions &amp; <em>patient fears</em></h2>
              <p className="section-desc" style={{ marginBottom: "28px" }}>
                We understand that dental appointments bring up questions and worries. Here is straight talk on what you can expect.
              </p>

              <div className="faqs-side-box">
                <h3>Still have a question?</h3>
                <p>Feel free to message Dr. Maheswari's team directly on WhatsApp or call our reception desk anytime.</p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <a href="tel:+919342803217" className="btn btn-primary btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <Phone size={14} />
                    <span>Call +91 93428 03217</span>
                  </a>
                  <a href="https://wa.me/919342803217" target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <MessageCircle size={14} />
                    <span>WhatsApp Us</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="faqs-accordion-list" data-animate="slide-left">
              <details className="faq-item-warm" open>
                <summary>
                  <span>Will a root canal treatment hurt?</span>
                  <span className="faq-icon">+</span>
                </summary>
                <div className="faq-body-warm">
                  No — not at Dr. Mahe's Dentistry. With modern pre-numb comfort gels, computerized gentle anesthesia and precision rotary instruments, root canals here are comfortable and typically completed in a single sitting. Most patients tell us they felt no pain whatsoever during the procedure.
                </div>
              </details>

              <details className="faq-item-warm">
                <summary>
                  <span>I haven't visited a dentist in years. Will I be judged?</span>
                  <span className="faq-icon">+</span>
                </summary>
                <div className="faq-body-warm">
                  Never. We have a strict zero-judgment policy. Life happens, dental anxiety is real and we admire your courage in taking the step to visit today. We are here solely to help you get comfortable and healthy — zero guilt or lectures.
                </div>
              </details>

              <details className="faq-item-warm">
                <summary>
                  <span>How long do dental implants last?</span>
                  <span className="faq-icon">+</span>
                </summary>
                <div className="faq-body-warm">
                  Dental implants are designed to last a lifetime. The medical-grade titanium fixture integrates directly with your jawbone, acting just like a natural tooth root. With regular brushing, flossing and periodic routine checkups, implants rarely ever require replacement.
                </div>
              </details>

              <details className="faq-item-warm">
                <summary>
                  <span>When should I bring my child for their first checkup?</span>
                  <span className="faq-icon">+</span>
                </summary>
                <div className="faq-body-warm">
                  We recommend bringing your child when their first tooth appears, or by their first birthday. Early visits are fun, gentle and brief — helping your child feel happy and comfortable in the clinic environment while catching any early habits or enamel issues early.
                </div>
              </details>

              <details className="faq-item-warm">
                <summary>
                  <span>Do you explain all treatment costs upfront?</span>
                  <span className="faq-icon">+</span>
                </summary>
                <div className="faq-body-warm">
                  Always 100%. Before any procedure begins, Dr. Maheswari explains what was found on the digital X-ray, presents the available treatment options and outlines the exact cost. You are always free to decide without any pressure.
                </div>
              </details>

              <details className="faq-item-warm">
                <summary>
                  <span>What are your clinic hours in Porur?</span>
                  <span className="faq-icon">+</span>
                </summary>
                <div className="faq-body-warm">
                  We are open Monday through Saturday from 10:00 AM to 10:00 PM. Evening appointments are ideal for working professionals and school children. Sunday visits are also available on appointment basis.
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. BOOKING SECTION ─── */}
      <section className="booking-section-warm section-padding" id="booking">
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">Schedule Your Visit</span>
            <h2 className="section-title">Book an Appointment with <em>Dr. Maheswari</em></h2>
            <p className="section-desc">
              Choose your treatment, select a convenient date and time and share your contact details. No advance payment needed.
            </p>
          </div>

          <div className="booking-container-card" data-animate="scale">
            <div className="booking-aside">
              <div>
                <h3 className="booking-aside-title">Schedule Your Visit</h3>
                <p className="booking-aside-desc">
                  Select your treatment and preferred time slot. Our clinic coordinator in Porur will confirm your appointment promptly.
                </p>
              </div>

              <div className="booking-contact-items">
                <div className="booking-contact-row">
                  <span className="booking-contact-icon">
                    <Phone size={18} />
                  </span>
                  <div>
                    <div className="booking-contact-label">Call Reception</div>
                    <div className="booking-contact-val"><a href="tel:+919342803217">+91 93428 03217</a></div>
                  </div>
                </div>

                <div className="booking-contact-row">
                  <span className="booking-contact-icon">
                    <MessageCircle size={18} />
                  </span>
                  <div>
                    <div className="booking-contact-label">WhatsApp Helpline</div>
                    <div className="booking-contact-val">
                      <a href="https://wa.me/919342803217" target="_blank" rel="noopener noreferrer">
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                <div className="booking-contact-row">
                  <span className="booking-contact-icon">
                    <MapPin size={18} />
                  </span>
                  <div>
                    <div className="booking-contact-label">Clinic Address</div>
                    <div className="booking-contact-val">
                      1st floor, Kundrathur Main Rd, Jaya Nagar, Porur, Chennai – 600116
                    </div>
                  </div>
                </div>

                <div className="booking-contact-row">
                  <span className="booking-contact-icon">
                    <Clock size={18} />
                  </span>
                  <div>
                    <div className="booking-contact-label">Opening Hours</div>
                    <div className="booking-contact-val">
                      Mon – Sat: 10:00 AM – 10:00 PM (Sunday by appt)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <BookingForm />
          </div>
        </div>
      </section>

      {/* ─── 10. LOCATION SECTION ─── */}
      <section className="location-section-warm section-padding" id="location">
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">How to Find Us</span>
            <h2 className="section-title">Visit Our Clinic in <em>Porur</em></h2>
            <p className="section-desc">
              Located on Kundrathur Main Road in Jaya Nagar, Porur — easily accessible with parking facilities.
            </p>
          </div>

          <div className="location-layout-warm">
            <div className="location-cards-warm" data-animate="slide-right">
              <div className="loc-card-warm">
                <div className="loc-label-warm">Address</div>
                <div className="loc-main-warm">Dr. Mahe's Dentistry</div>
                <div className="loc-sub-warm">1st Floor, Kundrathur Main Road, Jaya Nagar, Porur, Chennai — 600116</div>
              </div>

              <div className="loc-card-warm">
                <div className="loc-label-warm">Direct Contact</div>
                <div className="loc-main-warm"><a href="tel:+919342803217">+91 93428 03217</a></div>
                <div className="loc-sub-warm">Call or message anytime during clinic hours.</div>
              </div>

              <div className="loc-card-warm">
                <div className="loc-label-warm">Consultation Hours</div>
                <div className="loc-main-warm">Monday to Saturday: 10 AM – 10 PM</div>
                <div className="loc-sub-warm" style={{ color: "var(--accent-hover)", fontWeight: 600 }}>
                  Sunday consultations available upon advance request.
                </div>
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Dr.+Mahe%27s+Dentistry,+Jaya+Nagar,+Porur"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <MapPin size={16} />
                <span>Open in Google Maps</span>
              </a>
            </div>

            <div className="map-frame-warm" data-animate="slide-left">
              <iframe
                src="https://storage.googleapis.com/maps-solutions-p888dpsojl/commutes/ws32/commutes.html"
                width="600"
                height="450"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen=""
                referrerPolicy="no-referrer-when-downgrade"
                title="Dr. Mahe's Dentistry Map Location in Porur Chennai"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── 11. CTA SECTION ─── */}
      <section className="cta-section-warm">
        <div className="container" data-animate>
          <span className="section-badge" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--accent)", borderColor: "rgba(255,255,255,0.2)" }}>
            We're Ready for You
          </span>
          <h2 className="cta-title-warm">Experience Dentistry with a <em>Gentle Touch</em></h2>
          <p className="cta-desc-warm">
            Take the first step towards a healthy, confident smile. Book an unhurried consultation with Dr. Maheswari today.
          </p>
          <div className="cta-actions-warm">
            <Link href="/contact#booking" className="btn btn-accent btn-lg">
              Book Your Visit Now
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
