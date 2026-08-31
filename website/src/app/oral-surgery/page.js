import Link from "next/link";
import { Phone } from "lucide-react";

export const metadata = {
  title: "Oral Surgery & Wisdom Tooth Extractions in Porur, Chennai | Dr. Mahe's Dentistry",
  description: "Expert, minimally invasive oral surgery and wisdom tooth removal at Dr. Mahe's Dentistry in Porur. Painless procedures, gentle recovery, and sterile protocols.",
  keywords: ["oral surgery porur", "wisdom tooth extraction chennai", "tooth removal porur", "painless extraction dentist porur"],
  alternates: { canonical: '/oral-surgery' },
  openGraph: {
    title: "Oral Surgery & Extractions | Dr. Mahe's Dentistry Porur",
    description: "Expert wisdom teeth removal and complex extractions in Porur, Chennai.",
    url: 'https://drmahesdentistry.in/oral-surgery',
  }
};

export default function OralSurgery() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Oral Surgery & Wisdom Tooth Extractions in Porur",
    "description": "Information about oral surgery procedures and painless wisdom teeth extractions at Dr. Mahe's Dentistry in Porur, Chennai."
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ─── PAGE HERO ─── */}
      <section className="page-hero-warm">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span className="breadcrumb-sep">›</span>
            <Link href="/treatments">Treatments</Link><span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">Oral Surgery &amp; Wisdom Tooth</span>
          </nav>
          <span className="page-hero-badge">Safe &amp; Minimally Invasive</span>
          <h1 className="page-hero-title-warm">Oral Surgery &amp; <em>Wisdom Teeth</em></h1>
          <p className="page-hero-desc-warm">
            Gentle extractions and impacted molar removals performed in a sterile environment with modern anesthesia and supportive post-operative care.
          </p>
          <div className="page-hero-actions-warm">
            <Link href="/contact?service=Oral%20Surgery#booking" className="btn btn-primary">
              Book Evaluation
            </Link>
            <a href="tel:+919342803217" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Phone size={16} />
              <span>Call Reception</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── OVERVIEW & COMFORT PROMISE ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '56px', alignItems: 'center' }}>
          <div data-animate="slide-right">
            <span className="section-badge">Comfort First</span>
            <h2 className="section-title" style={{ fontSize: '2.2rem', textAlign: 'left', marginBottom: '16px' }}>
              Gentle Removals with <em>Fast Healing</em>
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.85, marginBottom: '20px' }}>
              While our primary philosophy is always to save natural teeth whenever possible, impacted wisdom teeth or severely fractured roots can cause damage to adjacent healthy molars. We use minimally invasive microsurgical techniques to keep surrounding bone and tissue preserved.
            </p>
            <div className="info-box-warm">
              <strong>Pain-Free Local Numbing:</strong> Before any extraction, the entire area is thoroughly numbed with topical gel and localized anesthesia. You will feel zero sharp pain during the procedure.
            </div>
          </div>
          <div data-animate="slide-left">
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '4px solid #FFFFFF' }}>
              <img src="/assets/OralSurgery.jpg" alt="Oral Surgery and Wisdom Tooth Extraction at Dr. Mahe's Dentistry Porur" width={700} height={500} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMMON PROCEDURES ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">Procedures Offered</span>
            <h2 className="section-title">Common Oral Surgical <em>Treatments</em></h2>
            <p className="section-desc">Handled with precision, sterilization, and dedicated after-care instructions.</p>
          </div>

          <div className="benefit-grid-warm">
            <div className="benefit-card-warm" data-animate>
              <div className="benefit-icon-warm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg>
              </div>
              <h3 className="benefit-title-warm">Impacted Wisdom Tooth Removal</h3>
              <p className="benefit-desc-warm">Safe removal of third molars trapped under the gums or growing horizontally toward neighboring teeth.</p>
            </div>

            <div className="benefit-card-warm" data-animate data-delay="100">
              <div className="benefit-icon-warm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h3 className="benefit-title-warm">Severely Damaged Root Extraction</h3>
              <p className="benefit-desc-warm">Minimally invasive extraction of teeth broken below the gumline that cannot be safely restored.</p>
            </div>

            <div className="benefit-card-warm" data-animate data-delay="200">
              <div className="benefit-icon-warm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="benefit-title-warm">Socket Preservation &amp; Healing</h3>
              <p className="benefit-desc-warm">Biocompatible healing membranes to protect the extraction site and prepare the bone for future implants.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="cta-section-warm">
        <div className="container" data-animate>
          <span className="section-badge" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--accent)", borderColor: "rgba(255,255,255,0.2)" }}>
            Gentle Surgical Care
          </span>
          <h2 className="cta-title-warm">Have a Painful Wisdom Tooth?</h2>
          <p className="cta-desc-warm">
            Book an examination with digital X-ray at Dr. Mahe's Dentistry in Porur to evaluate your options.
          </p>
          <div className="cta-actions-warm">
            <Link href="/contact?service=Oral%20Surgery#booking" className="btn btn-accent btn-lg">
              Book Evaluation
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
