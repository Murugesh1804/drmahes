import Link from "next/link";
import { Phone } from "lucide-react";

export const metadata = {
  title: "Dental Implants in Porur, Chennai",
  description: "Restore missing teeth permanently with biocompatible titanium dental implants at Dr. Mahe's Dentistry in Porur. Painless procedure with lifetime durability.",
  keywords: ["dental implants porur", "tooth replacement chennai", "implant dentist porur", "titanium implants chennai"],
  alternates: { canonical: '/dental-implants' },
  openGraph: {
    title: "Dental Implants | Dr. Mahe's Dentistry Porur",
    description: "Permanent, natural-looking tooth replacements with biocompatible titanium implants.",
    url: 'https://drmahesdentistry.in/dental-implants',
  }
};

export default function DentalImplants() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Dental Implants Procedure in Porur",
    "description": "Permanent tooth replacement using biocompatible titanium dental implants at Dr. Mahe's Dentistry in Porur, Chennai."
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
            <span className="breadcrumb-current">Dental Implants</span>
          </nav>
          <span className="page-hero-badge">Permanent Missing Teeth Replacement</span>
          <h1 className="page-hero-title-warm">Dental <em>Implants</em> in Porur</h1>
          <p className="page-hero-desc-warm">
            Eat, speak and smile with complete natural confidence. Biocompatible titanium tooth roots topped with precision custom crowns designed to last a lifetime.
          </p>
          <div className="page-hero-actions-warm">
            <Link href="/contact?service=Dental%20Implants#booking" className="btn btn-primary">
              Book Implant Consultation
            </Link>
            <a href="tel:+919342803217" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Phone size={16} />
              <span>Call for Queries</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── OVERVIEW & WHY IT MATTERS ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '56px', alignItems: 'center' }}>
          <div data-animate="slide-right">
            <span className="section-badge">How Implants Work</span>
            <h2 className="section-title" style={{ fontSize: '2.2rem', textAlign: 'left', marginBottom: '16px' }}>
              The Gold Standard for <em>Missing Teeth</em>
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.85, marginBottom: '22px' }}>
              A dental implant replaces both the visible crown and the invisible root beneath your gums. Made of medical-grade titanium that naturally fuses with your jawbone (osseointegration), it becomes a permanent part of your anatomy.
            </p>
            <div className="info-box-warm">
              <strong>Why Implants Beat Bridges &amp; Dentures:</strong> Bridges require grinding down healthy neighboring teeth and dentures often slip. Implants stand completely on their own, preserve your natural jawbone volume and never decay.
            </div>
          </div>
          <div data-animate="slide-left">
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '4px solid #FFFFFF' }}>
              <img src="/assets/dental implant.jpg" alt="Dental Implants Procedure at Dr. Mahe's Dentistry Porur" width={700} height={500} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROCEDURE STEPS ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">Step by Step</span>
            <h2 className="section-title">The Implant Journey: <em>Clear &amp; Predictable</em></h2>
            <p className="section-desc">Every step is carefully planned with digital imaging for zero discomfort and optimal healing.</p>
          </div>

          <div className="steps-list-warm" style={{ maxWidth: '840px', margin: '0 auto' }}>
            <div className="step-item-warm" data-animate>
              <div className="step-num-warm">1</div>
              <div>
                <div className="step-title-warm">3D Digital Assessment &amp; Bone Evaluation</div>
                <div className="step-desc-warm">We take high-definition digital X-rays to assess jawbone density and map out the exact micro-placement angle.</div>
              </div>
            </div>

            <div className="step-item-warm" data-animate>
              <div className="step-num-warm">2</div>
              <div>
                <div className="step-title-warm">Gentle Implant Placement</div>
                <div className="step-desc-warm">The biocompatible titanium fixture is gently placed into the bone under pain-free localized anesthesia. Most patients report feeling only mild vibration.</div>
              </div>
            </div>

            <div className="step-item-warm" data-animate>
              <div className="step-num-warm">3</div>
              <div>
                <div className="step-title-warm">Natural Integration (Osseointegration)</div>
                <div className="step-desc-warm">Over the healing period, your natural bone fuses securely with the implant, creating a foundation as solid as a real tooth root.</div>
              </div>
            </div>

            <div className="step-item-warm" data-animate>
              <div className="step-num-warm">4</div>
              <div>
                <div className="step-title-warm">Custom Shade-Matched Crown</div>
                <div className="step-desc-warm">A handcrafted porcelain or zirconia crown is securely placed on the implant, perfectly matching the shade and shape of your natural teeth.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── KEY PATIENT BENEFITS ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">Patient Benefits</span>
            <h2 className="section-title">Why Patients Choose <em>Dental Implants</em></h2>
          </div>

          <div className="benefit-grid-warm">
            <div className="benefit-card-warm" data-animate>
              <div className="benefit-icon-warm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C8.5 2 7 5 7 7c0 2.5 1.5 4 3 5v3H9a1 1 0 0 0 0 2h1v2a1 1 0 0 0 2 0v-2h1a1 1 0 0 0 0-2h-1v-3c1.5-1 3-2.5 3-5 0-2-1.5-5-5-5z" /></svg>
              </div>
              <h3 className="benefit-title-warm">Feels 100% Natural</h3>
              <p className="benefit-desc-warm">Eat your favorite foods, bite into crunchy apples and smile freely without any worry of slipping or clicking.</p>
            </div>

            <div className="benefit-card-warm" data-animate data-delay="100">
              <div className="benefit-icon-warm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
              </div>
              <h3 className="benefit-title-warm">Preserves Facial Structure</h3>
              <p className="benefit-desc-warm">Prevents the bone loss and facial sunkenness that naturally happens when a tooth is missing for extended periods.</p>
            </div>

            <div className="benefit-card-warm" data-animate data-delay="200">
              <div className="benefit-icon-warm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <h3 className="benefit-title-warm">Lifetime Durability</h3>
              <p className="benefit-desc-warm">With standard brushing, flossing and routine dental cleanings, titanium implants are built to last your entire life.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="cta-section-warm">
        <div className="container" data-animate>
          <span className="section-badge" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--accent)", borderColor: "rgba(255,255,255,0.2)" }}>
            Regain Your Smile
          </span>
          <h2 className="cta-title-warm">Ready to Replace Missing Teeth for <em>Good?</em></h2>
          <p className="cta-desc-warm">
            Book an implant assessment with Dr. Maheswari. We'll evaluate your bone health and present your options clearly.
          </p>
          <div className="cta-actions-warm">
            <Link href="/contact?service=Dental%20Implants#booking" className="btn btn-accent btn-lg">
              Book Implant Assessment
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
