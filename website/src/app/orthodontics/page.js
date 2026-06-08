import Link from "next/link";

export const metadata = {
  title: "Orthodontics & Braces in Porur, Chennai | Dr. Mahe's Dentistry",
  description: "Straighten your teeth with customized metal braces, ceramic braces, or clear aligners at Dr. Mahe's Dentistry in Porur. Perfect smiles for kids, teens and adults.",
  keywords: ["braces porur", "orthodontics chennai", "clear aligners porur", "ceramic braces chennai", "teeth alignment"],
  alternates: { canonical: '/orthodontics' },
  openGraph: {
    title: "Orthodontics & Braces | Dr. Mahe's Dentistry",
    description: "Customized alignment for children, teens and adults.",
    url: 'https://drmahesdentistry.com/orthodontics',
  }
};

export default function Orthodontics() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Orthodontic Treatments & Braces",
    "description": "Information about braces and clear aligners at Dr. Mahe's Dentistry."
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span className="breadcrumb-sep">›</span>
            <Link href="/treatments">Treatments</Link><span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">Orthodontics & Braces</span>
          </nav>
          <span className="page-hero-badge">Align Your Smile</span>
          <h1 className="page-hero-title">Orthodontics & <em>Braces</em></h1>
          <p className="page-hero-desc">Achieve a perfectly straight, confident smile with our customized orthodontic solutions, tailored for every age and lifestyle.</p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div data-animate="slide-right">
            <h2 className="section-title" style={{ fontSize: '2rem', textAlign: 'left', marginBottom: '16px' }}>What is Orthodontics?</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px' }}>
              Orthodontics is a specialized branch of dentistry focused on correcting improperly positioned teeth and jaws. Crooked teeth and teeth that do not fit together correctly are harder to keep clean, are at risk of being lost early due to tooth decay and periodontal disease and cause extra stress on the chewing muscles.
            </p>
            <div className="info-box">
              <strong>It is never too late:</strong> While orthodontic treatment often begins between ages 8 and 14, adult orthodontics is becoming increasingly popular. Healthy teeth can be moved at any age!
            </div>
          </div>
          <div data-animate="slide-left">
            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <img src="https://images.unsplash.com/photo-1588776814546-1ffbb29d6390?w=700&h=500&fit=crop&q=82" alt="Orthodontics and Braces" style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Treatment Options</span>
            <h2 className="section-title">Types of Braces We Offer</h2>
          </div>
          <div className="benefit-grid">
            <div className="benefit-card" data-animate>
              <div className="benefit-title">Traditional Metal Braces</div>
              <div className="benefit-desc">The most common type. They are made of high-grade stainless steel and straighten your teeth using metal brackets and archwires. Modern metal braces are smaller and more comfortable than ever.</div>
            </div>
            <div className="benefit-card" data-animate data-delay="100">
              <div className="benefit-title">Ceramic Braces</div>
              <div className="benefit-desc">Made of clear materials and are therefore less visible on your teeth than metal braces. They are a popular choice for older teenagers and adult patients who have cosmetic concerns.</div>
            </div>
            <div className="benefit-card" data-animate data-delay="200">
              <div className="benefit-title">Clear Aligners</div>
              <div className="benefit-desc">A series of invisible, removable and comfortable acrylic trays that straighten your teeth like braces. Not only are the aligners invisible, they are removable, so you can eat and drink what you want while in treatment.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container" data-animate>
          <h2 className="cta-title">Start Your Journey to a Straight Smile</h2>
          <p className="cta-desc">Schedule an orthodontic consultation today to discuss which option is best for you.</p>
          <div className="cta-actions">
            <Link href="/contact#booking" className="btn btn-accent">Book a Consultation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
