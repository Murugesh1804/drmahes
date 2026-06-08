import Link from "next/link";

export const metadata = {
  title: "Dental Implants in Porur, Chennai | Dr. Mahe's Dentistry",
  description: "Get permanent, natural-looking tooth replacements with dental implants at Dr. Mahe's Dentistry in Porur. Book your consultation today.",
  keywords: ["dental implants porur", "tooth replacement chennai", "implant dentist porur", "titanium implants chennai"],
  alternates: { canonical: '/dental-implants' },
  openGraph: {
    title: "Dental Implants | Dr. Mahe's Dentistry",
    description: "Permanent, natural-looking tooth replacements.",
    url: 'https://drmahesdentistry.com/dental-implants',
  }
};

export default function DentalImplants() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Dental Implants Procedure",
    "description": "Information about dental implants at Dr. Mahe's Dentistry."
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span className="breadcrumb-sep">›</span>
            <Link href="/treatments">Treatments</Link><span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">Dental Implants</span>
          </nav>
          <span className="page-hero-badge">Missing Teeth Replacement</span>
          <h1 className="page-hero-title">Dental <em>Implants</em></h1>
          <p className="page-hero-desc">Restore your smile, confidence and chewing ability with permanent, natural-looking dental implants using advanced biocompatible materials.</p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div data-animate="slide-right">
            <h2 className="section-title" style={{ fontSize: '2rem', textAlign: 'left', marginBottom: '16px' }}>What are Dental Implants?</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px' }}>
              Dental implants are the most advanced and natural-looking solution for replacing missing teeth. They consist of a medical-grade titanium screw that acts as an artificial tooth root, securely placed into the jawbone and topped with a custom-crafted dental crown.
            </p>
            <div className="info-box">
              <strong>Why it matters:</strong> Unlike removable dentures, implants prevent bone loss and do not require altering adjacent healthy teeth (like bridges do). They are permanently fixed and designed to last a lifetime with proper care.
            </div>
          </div>
          <div data-animate="slide-left">
            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <img src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=700&h=500&fit=crop&q=82" alt="Dental Implants" style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">The Process</span>
            <h2 className="section-title">Implant Procedure Steps</h2>
            <p className="section-desc">Our implant procedures are precisely planned and performed with maximum comfort in mind.</p>
          </div>
          <div className="steps-list" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="step-item" data-animate>
              <div className="step-num">1</div>
              <div>
                <div className="step-title">Initial Consultation & 3D Scan</div>
                <div className="step-desc">We thoroughly assess your jawbone health using digital diagnostics to precisely plan the placement of the implant.</div>
              </div>
            </div>
            <div className="step-item" data-animate>
              <div className="step-num">2</div>
              <div>
                <div className="step-title">Implant Placement</div>
                <div className="step-desc">The biocompatible titanium implant is carefully and painlessly placed into your jawbone under local anesthesia.</div>
              </div>
            </div>
            <div className="step-item" data-animate>
              <div className="step-num">3</div>
              <div>
                <div className="step-title">Healing (Osseointegration)</div>
                <div className="step-desc">Over a few months, the implant naturally fuses with your bone, creating a solid and immovable foundation.</div>
              </div>
            </div>
            <div className="step-item" data-animate>
              <div className="step-num">4</div>
              <div>
                <div className="step-title">Custom Crown Placement</div>
                <div className="step-desc">A premium, shade-matched porcelain or zirconia crown is securely attached to the implant, completing your new smile.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Why Choose Implants</span>
            <h2 className="section-title">Benefits of Dental Implants</h2>
          </div>
          <div className="benefit-grid">
            <div className="benefit-card" data-animate>
              <div className="benefit-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C8.5 2 7 5 7 7c0 2.5 1.5 4 3 5v3H9a1 1 0 0 0 0 2h1v2a1 1 0 0 0 2 0v-2h1a1 1 0 0 0 0-2h-1v-3c1.5-1 3-2.5 3-5 0-2-1.5-5-5-5z" /></svg>
              </div>
              <div className="benefit-title">Natural Look & Feel</div>
              <div className="benefit-desc">Implants mimic the structure of natural teeth, blending perfectly with your existing smile.</div>
            </div>
            <div className="benefit-card" data-animate data-delay="100">
              <div className="benefit-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
              </div>
              <div className="benefit-title">Preserves Jawbone</div>
              <div className="benefit-desc">The titanium root stimulates the jawbone, preventing the bone loss that naturally occurs when teeth are missing.</div>
            </div>
            <div className="benefit-card" data-animate data-delay="200">
              <div className="benefit-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <div className="benefit-title">Long-Lasting Solution</div>
              <div className="benefit-desc">With good oral hygiene, dental implants are highly durable and can last a lifetime without needing replacement.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container" data-animate>
          <h2 className="cta-title">Ready to Restore Your Smile?</h2>
          <p className="cta-desc">Book a consultation with Dr. Maheswari to find out if dental implants are the right solution for you.</p>
          <div className="cta-actions">
            <Link href="/contact#booking" className="btn btn-accent">Book a Consultation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
