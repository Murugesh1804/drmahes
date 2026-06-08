import Link from "next/link";

export const metadata = {
  title: "About Dr. Maheswari — Dentist in Porur, Chennai | Dr. Mahe's Dentistry",
  description: "Meet Dr. Maheswari, BDS, lead dentist at Dr. Mahe's Dentistry in Porur, Chennai. Learn about our compassionate, patient-first dental care for all ages and book your visit.",
  keywords: ["dr maheswari dentist porur", "dentist porur chennai", "general dentist porur", "dr mahe dentistry about"],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: "About Dr. Maheswari | Dr. Mahe's Dentistry",
    description: "Meet Dr. Maheswari, BDS, lead dentist at Dr. Mahe's Dentistry in Porur, Chennai.",
    url: 'https://drmahesdentistry.com/about',
  }
};

export default function About() {
  const values = [
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: 'International Sterilization Standards', desc: 'Class-B autoclave sterilization. Every instrument is vacuum-packed and opened fresh in front of you — zero compromise on hygiene.' },
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, title: 'Complete Transparency', desc: 'We explain your diagnosis, options and costs clearly before treatment begins. No surprises, no pressure — just honest advice.' },
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, title: 'Digital Diagnostics', desc: 'We use digital X-rays which deliver up to 90% less radiation than traditional films, giving sharper images for more accurate diagnosis.' },
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, title: 'Patient-First Approach', desc: 'We take time to understand your concerns and anxieties. Every treatment pace is set by you — we never rush.' },
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: 'All Ages Welcome', desc: 'From toddlers to seniors — we provide gentle, age-appropriate care for the whole family under one roof.' },
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, title: 'Conveniently Located', desc: 'On Kundrathur Main Road, Porur — easily accessible by bus, auto, cab or private vehicle. Parking available.' },
  ];

  const delays = ["100", "200", "300", "100", "200", "300"];

  return (
    <>
      {/* ─── PAGE HERO ─── */}
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">About</span>
          </nav>
          <span className="page-hero-badge">Our Practice</span>
          <h1 className="page-hero-title">Meet <em>Dr. Maheswari</em></h1>
          <p className="page-hero-desc">Your trusted dentist in Porur, Chennai — bringing compassion, precision and modern dentistry to every patient visit.</p>
        </div>
      </section>

      {/* ─── DOCTOR SECTION ─── */}
      <section className="doctor-section section-padding">
        <div className="container">
          <div className="doctor-layout">
            <div className="doctor-img-wrap" data-animate="slide-left">
              <div className="doctor-img-frame">
                <img src="/assets/dr.mahe.webp" width={1684} height={2528} alt="Dr. Maheswari BDS — General Dentist, Dr. Mahe's Dentistry Porur Chennai" />
              </div>
              <div className="doctor-badge">
                <div className="doctor-badge-label">Qualification</div>
                <div className="doctor-badge-value">BDS — General Dentist</div>
              </div>
            </div>
            <div className="doctor-info" data-animate="slide-right">
              <div className="hero-badge" style={{display:'inline-flex', marginBottom:16}}>Dr. Maheswari · BDS</div>
              <h2 className="doctor-name">Dr. Maheswari</h2>
              <div className="doctor-quals">General &amp; Family Dentist — Porur, Chennai</div>
              <p className="doctor-bio">
                Meet Dr. Maheswari, who brings a patient-first philosophy to every aspect of dental care. With a deep passion for
                creating healthy, confident smiles, she combines clinical precision with genuine empathy — ensuring
                every patient feels comfortable, informed and cared for throughout their treatment.
              </p>
              <p className="doctor-bio">
                From gentle paediatric dentistry and thorough preventive care to advanced root canals and full smile
                makeovers, Dr. Maheswari tailors each treatment plan to the individual's needs, lifestyle and goals.
                Her commitment to transparency means patients always understand exactly what is happening and why.
              </p>
              <div className="doctor-specs">
                <div className="spec-row"><div className="spec-dot"></div>Teeth Cleaning &amp; Preventive Dentistry</div>
                <div className="spec-row"><div className="spec-dot"></div>Root Canal Treatment (Endodontics)</div>
                <div className="spec-row"><div className="spec-dot"></div>Dental Implants &amp; Oral Surgery</div>
                <div className="spec-row"><div className="spec-dot"></div>Orthodontics — Metal &amp; Ceramic Braces</div>
                <div className="spec-row"><div className="spec-dot"></div>Cosmetic Dentistry &amp; Smile Makeovers</div>
                <div className="spec-row"><div className="spec-dot"></div>Crowns, Veneers &amp; Restorations</div>
                <div className="spec-row"><div className="spec-dot"></div>Kids &amp; Family Dental Care</div>
              </div>
              <Link href="/contact#booking" className="btn btn-primary">Book a Consultation with Dr. Maheswari</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CLINIC VALUES ─── */}
      <section className="section-padding" style={{backgroundColor: 'var(--bg-secondary)'}}>
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">Our Philosophy</span>
            <h2 className="section-title">Why Patients Choose Us</h2>
            <p className="section-desc">Everything we do is guided by a commitment to your health, comfort and confidence.</p>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <div className="value-card" key={v.title} data-animate data-delay={delays[i]}>
                <div className="value-icon">{v.icon}</div>
                <h3 className="value-title">{v.title}</h3>
                <div className="value-desc">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <div className="container" data-animate>
          <h2 className="cta-title">Ready to Start Your Smile Journey?</h2>
          <p className="cta-desc">Book a consultation with Dr. Maheswari and take the first step towards a healthier, more confident smile.</p>
          <div className="cta-actions">
            <Link href="/contact#booking" className="btn btn-accent">Book Appointment</Link>
            <a href="tel:+919342803217" className="btn btn-white">Call: +91 93428 03217</a>
          </div>
        </div>
      </section>
    </>
  );
}
