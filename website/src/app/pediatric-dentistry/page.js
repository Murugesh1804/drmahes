import Link from "next/link";

export const metadata = {
  title: "Pediatric Dentistry in Porur | Dr. Mahe's Dentistry",
  description: "Gentle and friendly pediatric dental care for kids in Porur, Chennai. Painless cavity fillings, fluoride treatments, preventive care, and habit counseling by Dr. Maheswari.",
  keywords: ["pediatric dentist porur", "kids dental clinic chennai", "pedodontist porur", "child dental care", "pediatric dentistry porur"],
  alternates: { canonical: '/pediatric-dentistry' },
  openGraph: {
    title: "Pediatric Dentistry | Dr. Mahe's Dentistry",
    description: "Gentle, friendly, and compassionate dental care designed specifically for children and teenagers.",
    url: 'https://drmahesdentistry.com/pediatric-dentistry',
  }
};

export default function PediatricDentistry() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Pediatric Dentistry Services",
    "description": "Comprehensive child dental care and pedodontics at Dr. Mahe's Dentistry in Porur, Chennai."
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span className="breadcrumb-sep">›</span>
            <Link href="/treatments">Treatments</Link><span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">Pediatric Dentistry</span>
          </nav>
          <span className="page-hero-badge">Gentle Care for Little Smiles</span>
          <h1 className="page-hero-title">Pediatric <em>Dentistry</em></h1>
          <p className="page-hero-desc">Creating positive, anxiety-free dental experiences for children. From early preventive care to tooth decay treatments, we help your child build healthy habits for life.</p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div data-animate="slide-right">
            <h2 className="section-title" style={{ fontSize: '2rem', textAlign: 'left', marginBottom: '16px' }}>Compassionate Dental Care for Kids</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px' }}>
              A child's early experience with the dentist sets the tone for their lifelong dental health. At Dr. Mahe's Dentistry, we emphasize a gentle, friendly approach that makes children feel safe, relaxed, and excited about taking care of their teeth.
            </p>
            <div className="info-box">
              <strong>Child-Friendly Environment:</strong> We use gentle techniques and clear, simple explanations so kids never feel scared or overwhelmed during their visit.
            </div>
          </div>
          <div data-animate="slide-left">
            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <img src="/assets/pedo.jpg" alt="Pediatric Dentistry - Child Dental Care" width={700} height={500} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Our Services</span>
            <h2 className="section-title">Pediatric Treatments We Offer</h2>
          </div>
          <div className="benefit-grid">
            <div className="benefit-card" data-animate>
              <div className="benefit-title">Preventive Care &amp; Cleanings</div>
              <div className="benefit-desc">Regular check-ups, gentle cleaning, and plaque removal to keep young teeth strong and healthy while teaching proper brushing habits.</div>
            </div>
            <div className="benefit-card" data-animate data-delay="100">
              <div className="benefit-title">Fluoride Varnish &amp; Dental Sealants</div>
              <div className="benefit-desc">Protective applications that shield milk teeth and young permanent molars against cavity-causing bacteria and decay.</div>
            </div>
            <div className="benefit-card" data-animate data-delay="200">
              <div className="benefit-title">Pain-Free Cavity Fillings &amp; Pulpectomy</div>
              <div className="benefit-desc">Gentle restoration for decayed teeth to prevent premature tooth loss and preserve proper jaw alignment.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container" data-animate>
          <h2 className="cta-title">Book Your Child's Dental Visit Today</h2>
          <p className="cta-desc">Give your child the gift of a healthy, confident smile with Dr. Maheswari's gentle pediatric care.</p>
          <div className="cta-actions">
            <Link href="/contact#booking" className="btn btn-accent">Schedule Pediatric Appointment</Link>
          </div>
        </div>
      </section>
    </>
  );
}
