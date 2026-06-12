import Link from "next/link";

export const metadata = {
  title: "Oral Surgery & Extractions in Porur, Chennai | Dr. Mahe's Dentistry",
  description: "Expert oral surgery, wisdom tooth extraction and impacted molar removal at Dr. Mahe's Dentistry in Porur. Painless procedures and rapid recovery.",
  keywords: ["oral surgery porur", "wisdom tooth extraction chennai", "tooth removal porur", "painless extraction dentist"],
  alternates: { canonical: '/oral-surgery' },
  openGraph: {
    title: "Oral Surgery & Extractions | Dr. Mahe's Dentistry",
    description: "Expert wisdom teeth removal and complex extractions.",
    url: 'https://drmahesdentistry.com/oral-surgery',
  }
};

export default function OralSurgery() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Oral Surgery & Wisdom Tooth Extractions",
    "description": "Information about oral surgery procedures at Dr. Mahe's Dentistry."
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span className="breadcrumb-sep">›</span>
            <Link href="/treatments">Treatments</Link><span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">Oral Surgery</span>
          </nav>
          <span className="page-hero-badge">Safe & Painless Removals</span>
          <h1 className="page-hero-title">Oral <em>Surgery</em></h1>
          <p className="page-hero-desc">Expert, minimally invasive surgical procedures for wisdom teeth, severely damaged teeth and complex dental cases in a highly sterile environment.</p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div data-animate="slide-right">
            <h2 className="section-title" style={{ fontSize: '2rem', textAlign: 'left', marginBottom: '16px' }}>When is Oral Surgery Needed?</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px' }}>
              While our primary goal is always to save natural teeth, there are situations where extraction or minor oral surgery is the healthiest choice for your mouth. This includes impacted wisdom teeth that are causing pain, teeth damaged beyond repair, or preparation for orthodontic treatments.
            </p>
            <div className="info-box">
              <strong>Your Comfort is Our Priority:</strong> We understand that the idea of oral surgery can be intimidating. We use advanced local anesthesia and precise surgical techniques to ensure the procedure is entirely painless and your recovery is rapid.
            </div>
          </div>
          <div data-animate="slide-left">
            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <img src="https://images.unsplash.com/photo-1559757175-5700dde675bc?w=700&h=500&fit=crop&q=82" alt="Oral Surgery and Extractions" width={700} height={500} style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Surgical Procedures</span>
            <h2 className="section-title">Common Surgical Treatments</h2>
          </div>
          <div className="benefit-grid">
            <div className="benefit-card" data-animate>
              <div className="benefit-title">Wisdom Tooth Extraction</div>
              <div className="benefit-desc">Removal of third molars that are impacted, growing at the wrong angle, or causing crowding and pain in the back of the mouth.</div>
            </div>
            <div className="benefit-card" data-animate data-delay="100">
              <div className="benefit-title">Simple Extractions</div>
              <div className="benefit-desc">Quick and painless removal of teeth that are severely decayed, fractured below the gum line, or suffering from advanced periodontal disease.</div>
            </div>
            <div className="benefit-card" data-animate data-delay="200">
              <div className="benefit-title">Bone Grafting</div>
              <div className="benefit-desc">A procedure to rebuild and strengthen the jawbone, often performed after an extraction to prepare the site for a future dental implant.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container" data-animate>
          <h2 className="cta-title">Need a Tooth Evaluated?</h2>
          <p className="cta-desc">Book a consultation for a professional assessment and painless treatment options.</p>
          <div className="cta-actions">
            <Link href="/contact#booking" className="btn btn-accent">Book a Consultation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
