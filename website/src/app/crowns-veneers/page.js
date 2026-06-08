import Link from "next/link";

export const metadata = {
  title: "Dental Crowns & Veneers in Porur, Chennai | Dr. Mahe's Dentistry",
  description: "Restore damaged teeth and enhance your smile with premium Zirconia and e.max crowns and veneers at Dr. Mahe's Dentistry in Porur.",
  keywords: ["zirconia crowns porur", "dental veneers chennai", "e.max crowns porur", "tooth cap dentist", "porcelain veneers chennai"],
  alternates: { canonical: '/crowns-veneers' },
  openGraph: {
    title: "Crowns & Veneers | Dr. Mahe's Dentistry",
    description: "Premium restorative and cosmetic dental crowns and veneers.",
    url: 'https://drmahesdentistry.com/crowns-veneers',
  }
};

export default function CrownsVeneers() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Dental Crowns & Veneers",
    "description": "Information about dental crowns, caps and veneers at Dr. Mahe's Dentistry."
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span className="breadcrumb-sep">›</span>
            <Link href="/treatments">Treatments</Link><span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">Crowns & Veneers</span>
          </nav>
          <span className="page-hero-badge">Protect & Beautify</span>
          <h1 className="page-hero-title">Crowns & <em>Veneers</em></h1>
          <p className="page-hero-desc">High-strength, aesthetically perfect restorations designed to protect damaged teeth and completely transform your smile.</p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div data-animate="slide-right">
            <h2 className="section-title" style={{ fontSize: '2rem', textAlign: 'left', marginBottom: '16px' }}>What's the Difference?</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px' }}>
              Both crowns and veneers are excellent ways to restore and improve teeth, but they serve different purposes. A <strong>crown</strong> (or cap) covers the entire tooth, providing structural support for teeth that are heavily decayed or have had a root canal. A <strong>veneer</strong> is an ultra-thin layer of porcelain bonded only to the front of the tooth, primarily used for cosmetic enhancements.
            </p>
            <div className="info-box">
              <strong>Premium Materials:</strong> We use only the highest quality, lab-fabricated materials including Zirconia and e.max (Lithium Disilicate), which offer unmatched durability and perfectly mimic the translucency of natural enamel.
            </div>
          </div>
          <div data-animate="slide-left">
            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <img src="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=700&h=500&fit=crop&q=82" alt="Dental Crowns and Veneers" style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Restoration Process</span>
            <h2 className="section-title">How Crowns & Veneers are Made</h2>
          </div>
          <div className="steps-list" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="step-item" data-animate>
              <div className="step-num">1</div>
              <div>
                <div className="step-title">Preparation</div>
                <div className="step-desc">The tooth is gently reshaped to make room for the crown or veneer. For veneers, this involves removing a microscopic layer of enamel from the front.</div>
              </div>
            </div>
            <div className="step-item" data-animate>
              <div className="step-num">2</div>
              <div>
                <div className="step-title">Impression & Shade Matching</div>
                <div className="step-desc">A highly accurate digital or physical impression is taken. We carefully select the exact shade to match your surrounding teeth perfectly.</div>
              </div>
            </div>
            <div className="step-item" data-animate>
              <div className="step-num">3</div>
              <div>
                <div className="step-title">Lab Fabrication</div>
                <div className="step-desc">Our partner dental laboratories use advanced CAD/CAM technology to craft your permanent restoration from premium Zirconia or porcelain.</div>
              </div>
            </div>
            <div className="step-item" data-animate>
              <div className="step-num">4</div>
              <div>
                <div className="step-title">Final Bonding</div>
                <div className="step-desc">The permanent crown or veneer is checked for fit, bite alignment and aesthetics, then permanently bonded to your tooth.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container" data-animate>
          <h2 className="cta-title">Restore Your Smile's Strength</h2>
          <p className="cta-desc">Whether you need to protect a weakened tooth or want a Hollywood smile, we have the solution.</p>
          <div className="cta-actions">
            <Link href="/contact#booking" className="btn btn-accent">Book a Consultation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
