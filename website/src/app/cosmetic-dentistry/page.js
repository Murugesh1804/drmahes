import Link from "next/link";

export const metadata = {
  title: "Cosmetic Dentistry & Smile Makeovers in Porur | Dr. Mahe's Dentistry",
  description: "Transform your smile with cosmetic dentistry at Dr. Mahe's Dentistry in Porur. We offer veneers, teeth whitening, composite bonding and full smile makeovers.",
  keywords: ["cosmetic dentist porur", "smile makeover chennai", "teeth whitening porur", "porcelain veneers chennai", "composite bonding"],
  alternates: { canonical: '/cosmetic-dentistry' },
  openGraph: {
    title: "Cosmetic Dentistry | Dr. Mahe's Dentistry",
    description: "Porcelain veneers, bonding and whitening treatments.",
    url: 'https://drmahesdentistry.com/cosmetic-dentistry',
  }
};

export default function CosmeticDentistry() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Cosmetic Dentistry Services",
    "description": "Information about smile makeovers and cosmetic dentistry at Dr. Mahe's Dentistry."
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span className="breadcrumb-sep">›</span>
            <Link href="/treatments">Treatments</Link><span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">Cosmetic Dentistry</span>
          </nav>
          <span className="page-hero-badge">Crafting Radiant Smiles</span>
          <h1 className="page-hero-title">Cosmetic <em>Dentistry</em></h1>
          <p className="page-hero-desc">Elevate your confidence with a custom smile makeover. From whitening to porcelain veneers, we design smiles that look stunning and entirely natural.</p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div data-animate="slide-right">
            <h2 className="section-title" style={{ fontSize: '2rem', textAlign: 'left', marginBottom: '16px' }}>The Power of a Beautiful Smile</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px' }}>
              Your smile is one of the first things people notice about you. Cosmetic dentistry focuses on improving the appearance of your mouth, teeth and smile. Whether you want to fix a chipped tooth, brighten your enamel, or completely redesign your smile, we have the artistic eye and technical expertise to achieve your goals.
            </p>
            <div className="info-box">
              <strong>Customized for You:</strong> Every smile makeover begins with a detailed consultation. We analyze your facial proportions, skin tone and dental structure to design a smile that is uniquely yours.
            </div>
          </div>
          <div data-animate="slide-left">
            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <img src="https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=700&h=500&fit=crop&q=82" alt="Cosmetic Dentistry" style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Our Services</span>
            <h2 className="section-title">Cosmetic Treatments We Provide</h2>
          </div>
          <div className="benefit-grid">
            <div className="benefit-card" data-animate>
              <div className="benefit-title">Porcelain Veneers</div>
              <div className="benefit-desc">Ultra-thin, custom-made shells of tooth-colored porcelain designed to cover the front surface of teeth. They dramatically improve the color, shape, size, or length of your teeth.</div>
            </div>
            <div className="benefit-card" data-animate data-delay="100">
              <div className="benefit-title">Professional Teeth Whitening</div>
              <div className="benefit-desc">Safe and highly effective bleaching treatments that can lift deep stains and brighten your smile by several shades in just one visit.</div>
            </div>
            <div className="benefit-card" data-animate data-delay="200">
              <div className="benefit-title">Composite Bonding</div>
              <div className="benefit-desc">A tooth-colored resin material is applied and hardened with a special light, bonding it to the tooth to restore or improve your smile quickly and affordably.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container" data-animate>
          <h2 className="cta-title">Ready for Your Dream Smile?</h2>
          <p className="cta-desc">Book a cosmetic consultation today and let us show you what's possible.</p>
          <div className="cta-actions">
            <Link href="/contact#booking" className="btn btn-accent">Book a Smile Makeover</Link>
          </div>
        </div>
      </section>
    </>
  );
}
