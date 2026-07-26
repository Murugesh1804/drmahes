import Link from "next/link";

export const metadata = {
  title: "Dental Treatments in Porur, Chennai | Dr. Mahe's Dentistry",
  description: "Explore complete dental treatments at Dr. Mahe's Dentistry in Porur, Chennai. We offer implants, root canals, braces, veneers, extractions and preventive care.",
  keywords: ["dental treatments porur", "dental services chennai", "implants root canal orthodontics porur", "cosmetic dentistry porur"],
  alternates: {
    canonical: '/treatments',
  },
  openGraph: {
    title: "Dental Treatments | Dr. Mahe's Dentistry",
    description: "Explore complete dental treatments at Dr. Mahe's Dentistry in Porur, Chennai.",
    url: 'https://drmahesdentistry.com/treatments',
  }
};

export default function Treatments() {
  const treatmentsData = [
    { name: 'Dental Implants', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C8.5 2 7 5 7 7c0 2.5 1.5 4 3 5v3H9a1 1 0 0 0 0 2h1v2a1 1 0 0 0 2 0v-2h1a1 1 0 0 0 0-2h-1v-3c1.5-1 3-2.5 3-5 0-2-1.5-5-5-5z" /><path d="M10 7c0-1.7 1-3 2-3s2 1.3 2 3" /></svg>, desc: 'Permanent, natural-looking tooth replacements using biocompatible titanium fixtures — restoring full function and aesthetics for a lifetime.', img: '/assets/dental implant.jpg', page: '/dental-implants' },
    { name: 'Root Canal Treatment', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>, desc: 'Painless, single-sitting endodontic therapy to save infected teeth, eliminate pain and preserve your natural smile with a high success rate.', img: '/assets/root canal treament.jpg', page: '/root-canal' },
    { name: 'Orthodontics & Braces', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="8" width="18" height="8" rx="2" /><line x1="7" y1="8" x2="7" y2="16" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="17" y1="8" x2="17" y2="16" /><line x1="3" y1="12" x2="21" y2="12" /></svg>, desc: 'Metal, ceramic and self-ligating braces — precisely customized alignment for children, teens and adults of all ages.', img: '/assets/braces.jpg', page: '/orthodontics' },
    { name: 'Pediatric Dentistry (Pedodontics)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2a5 5 0 0 1 5 5c0 3.5-3.5 7-5 10-1.5-3-5-6.5-5-10a5 5 0 0 1 5-5z" /><circle cx="12" cy="7" r="1.5" /></svg>, desc: 'Specialized, gentle dental care for infants, children, and teenagers — preventive care, cavity treatments, and habit counseling.', img: '/assets/pedo.jpg', page: '/pediatric-dentistry' },
    { name: 'Oral Surgery', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" /></svg>, desc: 'Expert removal of wisdom teeth, impacted molars and complex extractions performed with precision and minimal discomfort.', img: '/assets/OralSurgery.jpg', page: '/oral-surgery' },
    { name: 'Crowns & Veneers', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 20h20M5 20V8l3.5 4L12 3l3.5 9L19 8v12" /></svg>, desc: 'Premium zirconia, e.max and metal-ceramic restorations — precision-crafted to protect and beautifully restore damaged or discoloured teeth.', img: '/assets/veneers.jpg', page: '/crowns-veneers' },
  ];

  const delays = ["100", "200", "300", "100", "200", "300"];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "name": "Dr. Mahe's Dentistry Services",
    "availableService": treatmentsData.map(tx => ({
      "@type": "MedicalTest",
      "name": tx.name,
      "description": tx.desc
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">Treatments</span>
          </nav>
          <span className="page-hero-badge">Expert Dental Care</span>
          <h1 className="page-hero-title">All <em>Treatments</em> at Dr. Mahe's Dentistry</h1>
          <p className="page-hero-desc">Explore all treatments at Dr. Mahe's Dentistry in Porur, Chennai. From routine check-ups to advanced smile transformations, we offer a full spectrum of modern care.</p>
        </div>
      </section>

      <section className="treatments-section section-padding">
        <div className="container">
          <div className="treatments-grid">
            {treatmentsData.map((tx, i) => (
              <div className="tx-card" key={tx.name} data-animate data-delay={delays[i]}>
                <div className="tx-img-wrap">
                  <img src={tx.img} width={700} height={420} alt={`${tx.name} Porur Chennai`} loading="lazy" />
                  <div className="tx-img-overlay"></div>
                </div>
                <div className="tx-body">
                  <div className="tx-icon">{tx.icon}</div>
                  <h3 className="tx-name">{tx.name}</h3>
                  <div className="tx-desc">{tx.desc}</div>
                  <Link href={tx.page} className="tx-link">Learn More ➔</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container" data-animate>
          <h2 className="cta-title">Not Sure Which Treatment You Need?</h2>
          <p className="cta-desc">Book a consultation with Dr. Maheswari. She will examine your teeth, explain your options clearly and create a personalised treatment plan.</p>
          <div className="cta-actions">
            <Link href="/contact#booking" className="btn btn-accent">Book a Consultation</Link>
            <a href="tel:+919342803217" className="btn btn-white">Call: +91 93428 03217</a>
          </div>
        </div>
      </section>
    </>
  );
}
