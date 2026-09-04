import Link from "next/link";
import { Phone } from "lucide-react";

export const metadata = {
  title: "Dental Crowns & Veneers in Porur, Chennai | Dr. Mahe's Dentistry",
  description: "Restore damaged teeth and enhance your smile with custom Zirconia, e.max crowns and ultra-thin veneers at Dr. Mahe's Dentistry in Porur.",
  keywords: ["zirconia crowns porur", "dental veneers chennai", "e.max crowns porur", "tooth cap dentist porur", "porcelain veneers chennai"],
  alternates: { canonical: '/crowns-veneers' },
  openGraph: {
    title: "Crowns & Veneers | Dr. Mahe's Dentistry Porur",
    description: "Premium restorative and cosmetic dental crowns and porcelain veneers in Porur, Chennai.",
    url: 'https://drmahesdentistry.in/crowns-veneers',
  }
};

export default function CrownsVeneers() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Dental Crowns & Veneers in Porur",
    "description": "Information about custom dental crowns, caps and porcelain veneers at Dr. Mahe's Dentistry in Porur, Chennai."
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
            <span className="breadcrumb-current">Crowns &amp; Veneers</span>
          </nav>
          <span className="page-hero-badge">Protect Strength &amp; Enhance Aesthetics</span>
          <h1 className="page-hero-title-warm">Crowns &amp; <em>Veneers</em> in Porur</h1>
          <p className="page-hero-desc-warm">
            High-strength, biologically compatible restorations crafted from premium Zirconia and e.max porcelain to protect weakened teeth and create a harmonious, radiant smile.
          </p>
          <div className="page-hero-actions-warm">
            <Link href="/contact?service=Crowns%20%26%20Veneers#booking" className="btn btn-primary">
              Book Aesthetic Consultation
            </Link>
            <a href="tel:+919342803217" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Phone size={16} />
              <span>Ask Dr. Maheswari</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── CROWNS VS VENEERS ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '56px', alignItems: 'center' }}>
          <div data-animate="slide-right">
            <span className="section-badge">Understanding Your Options</span>
            <h2 className="section-title" style={{ fontSize: '2.2rem', textAlign: 'left', marginBottom: '16px' }}>
              Crowns vs. Veneers: <em>What's the Difference?</em>
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.85, marginBottom: '20px' }}>
              A <strong>dental crown (or cap)</strong> completely encases a weakened tooth, restoring structural strength after large fillings, fractures, or root canal therapy. A <strong>porcelain veneer</strong> is an ultra-thin ceramic shell bonded to the front surface to correct discoloration, gaps, or chipped edges.
            </p>
            <div className="info-box-warm">
              <strong>Premium Zirconia &amp; e.max:</strong> We work with leading certified dental laboratories using high-translucency CAD/CAM milled ceramics that mimic natural enamel light reflection with zero dark metal margins.
            </div>
          </div>
          <div data-animate="slide-left">
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '4px solid #FFFFFF' }}>
              <img src="/assets/veneers.jpg" alt="Dental Crowns and Porcelain Veneers at Dr. Mahe's Dentistry Porur" width={700} height={500} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROCEDURE STEPS ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">Crafting Your Restoration</span>
            <h2 className="section-title">The Crown &amp; Veneer <em>Process</em></h2>
            <p className="section-desc">Meticulously measured and shade-matched to complement your facial aesthetics.</p>
          </div>

          <div className="steps-list-warm" style={{ maxWidth: '840px', margin: '0 auto' }}>
            <div className="step-item-warm" data-animate>
              <div className="step-num-warm">1</div>
              <div>
                <div className="step-title-warm">Gentle Tooth Preparation</div>
                <div className="step-desc-warm">We carefully prepare the tooth under gentle local numbing, removing only the minimal enamel required for a secure, flush fit.</div>
              </div>
            </div>

            <div className="step-item-warm" data-animate>
              <div className="step-num-warm">2</div>
              <div>
                <div className="step-title-warm">Digital Shade Matching &amp; Scanning</div>
                <div className="step-desc-warm">We capture digital impressions and match the ceramic shade against your natural neighboring teeth in natural daylight.</div>
              </div>
            </div>

            <div className="step-item-warm" data-animate>
              <div className="step-num-warm">3</div>
              <div>
                <div className="step-title-warm">Precision CAD/CAM Lab Fabrication</div>
                <div className="step-desc-warm">Your custom restoration is milled from medical-grade monolithic zirconia or lithium disilicate for maximum edge strength and beauty.</div>
              </div>
            </div>

            <div className="step-item-warm" data-animate>
              <div className="step-num-warm">4</div>
              <div>
                <div className="step-title-warm">Bonding &amp; Bite Optimization</div>
                <div className="step-desc-warm">Dr. Maheswari verifies the aesthetic alignment, checks your chewing bite and permanently bonds the crown or veneer.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="cta-section-warm">
        <div className="container" data-animate>
          <span className="section-badge" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--accent)", borderColor: "rgba(255,255,255,0.2)" }}>
            Aesthetic Harmony
          </span>
          <h2 className="cta-title-warm">Transform Your Smile with <em>Natural Ceramics</em></h2>
          <p className="cta-desc-warm">
            Book a smile consultation with Dr. Maheswari to explore crowns and veneers in Porur.
          </p>
          <div className="cta-actions-warm">
            <Link href="/contact?service=Crowns%20%26%20Veneers#booking" className="btn btn-accent btn-lg">
              Book Aesthetic Consultation
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
