import Link from "next/link";

export const metadata = {
  title: "Painless Root Canal Treatment in Porur, Chennai | Dr. Mahe's Dentistry",
  description: "Save your infected tooth with a painless, single-sitting root canal treatment at Dr. Mahe's Dentistry in Porur. Book an appointment today.",
  keywords: ["root canal treatment porur", "painless rct chennai", "single sitting root canal porur", "endodontist chennai"],
  alternates: { canonical: '/root-canal' },
  openGraph: {
    title: "Root Canal Treatment | Dr. Mahe's Dentistry",
    description: "Painless, single-sitting endodontic therapy.",
    url: 'https://drmahesdentistry.com/root-canal',
  }
};

export default function RootCanal() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Root Canal Treatment Procedure",
    "description": "Information about root canal treatments at Dr. Mahe's Dentistry."
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span className="breadcrumb-sep">›</span>
            <Link href="/treatments">Treatments</Link><span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">Root Canal Treatment</span>
          </nav>
          <span className="page-hero-badge">Save Your Natural Tooth</span>
          <h1 className="page-hero-title">Painless <em>Root Canal</em> Treatment</h1>
          <p className="page-hero-desc">Don't let tooth pain disrupt your life. Our advanced single-sitting root canal treatments are fast, highly effective and virtually painless.</p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div data-animate="slide-right">
            <h2 className="section-title" style={{ fontSize: '2rem', textAlign: 'left', marginBottom: '16px' }}>Why Do I Need a Root Canal?</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px' }}>
              A root canal is necessary when the soft inner tissue of the tooth (the pulp) becomes infected or inflamed due to deep decay, repeated dental procedures, or a crack in the tooth. Without treatment, the tissue surrounding the tooth will become infected and abscesses may form.
            </p>
            <div className="info-box">
              <strong>The myth of pain:</strong> Many people fear root canals, but with modern anesthesia and rotary endodontics, the procedure is no more painful than getting a standard filling!
            </div>
          </div>
          <div data-animate="slide-left">
            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=700&h=500&fit=crop&q=82" alt="Root Canal Treatment" style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">The Process</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-desc">Our streamlined root canal procedure is designed to save your tooth quickly and comfortably.</p>
          </div>
          <div className="steps-list" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="step-item" data-animate>
              <div className="step-num">1</div>
              <div>
                <div className="step-title">Diagnosis & Anesthesia</div>
                <div className="step-desc">We take an X-ray to see the shape of the root canals and determine if there are any signs of infection. Local anesthesia is then administered to numb the area.</div>
              </div>
            </div>
            <div className="step-item" data-animate>
              <div className="step-num">2</div>
              <div>
                <div className="step-title">Pulp Removal</div>
                <div className="step-desc">An opening is made in the crown of the tooth and the infected pulp is completely removed using specialized micro-instruments.</div>
              </div>
            </div>
            <div className="step-item" data-animate>
              <div className="step-num">3</div>
              <div>
                <div className="step-title">Cleaning & Filling</div>
                <div className="step-desc">The hollow area is thoroughly cleaned, disinfected and filled with a biocompatible material called gutta-percha.</div>
              </div>
            </div>
            <div className="step-item" data-animate>
              <div className="step-num">4</div>
              <div>
                <div className="step-title">Restoration (Crown)</div>
                <div className="step-desc">Because a tooth that needs a root canal is often weakened, a dental crown is placed over it to protect it and restore it to full function.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Common Symptoms</span>
            <h2 className="section-title">Signs You Might Need an RCT</h2>
          </div>
          <div className="benefit-grid">
            <div className="benefit-card" data-animate>
              <div className="benefit-title">Severe Toothache</div>
              <div className="benefit-desc">Pain while chewing or applying pressure to the tooth is a strong indicator of an infection.</div>
            </div>
            <div className="benefit-card" data-animate data-delay="100">
              <div className="benefit-title">Lingering Sensitivity</div>
              <div className="benefit-desc">Prolonged sensitivity to heat or cold, even after the hot or cold element has been removed.</div>
            </div>
            <div className="benefit-card" data-animate data-delay="200">
              <div className="benefit-title">Swollen Gums</div>
              <div className="benefit-desc">A recurring or persistent pimple on the gums, or tenderness and swelling near the painful tooth.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container" data-animate>
          <h2 className="cta-title">Experiencing Tooth Pain?</h2>
          <p className="cta-desc">Don't wait until it gets worse. Contact us immediately for a gentle and effective root canal treatment.</p>
          <div className="cta-actions">
            <Link href="/contact#booking" className="btn btn-accent">Book an Appointment</Link>
          </div>
        </div>
      </section>
    </>
  );
}
