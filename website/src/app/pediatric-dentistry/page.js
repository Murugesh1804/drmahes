import Link from "next/link";
import { Phone } from "lucide-react";

export const metadata = {
  title: "Gentle Pediatric Dentistry (Kids Dentist) in Porur, Chennai | Dr. Mahe's Dentistry",
  description: "Gentle, fear-free dental care for infants, children, and teenagers at Dr. Mahe's Dentistry in Porur. Cavity prevention, sealants, and friendly checkups.",
  keywords: ["pediatric dentist porur", "kids dentist chennai", "child dental care porur", "fluoride sealants kids chennai", "baby tooth checkup"],
  alternates: { canonical: '/pediatric-dentistry' },
  openGraph: {
    title: "Pediatric Dentistry (Kids Care) | Dr. Mahe's Dentistry Porur",
    description: "Specialized, gentle dental care for toddlers, kids, and teenagers in Porur, Chennai.",
    url: 'https://drmahesdentistry.in/pediatric-dentistry',
  }
};

export default function PediatricDentistry() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Pediatric Dentistry in Porur",
    "description": "Specialized gentle dental care for infants, children, and teens at Dr. Mahe's Dentistry in Porur, Chennai."
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
            <span className="breadcrumb-current">Pediatric Dentistry</span>
          </nav>
          <span className="page-hero-badge">Gentle Care for Growing Smiles</span>
          <h1 className="page-hero-title-warm">Pediatric Dentistry in <em>Porur</em></h1>
          <p className="page-hero-desc-warm">
            We turn dental visits into a positive, happy adventure. Gentle preventive checkups, cavity treatments, and habit coaching designed for infants, kids, and teens.
          </p>
          <div className="page-hero-actions-warm">
            <Link href="/contact?service=Pediatric%20Dentistry%20(Pedodontics)#booking" className="btn btn-primary">
              Book Child's Checkup
            </Link>
            <a href="tel:+919342803217" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Phone size={16} />
              <span>Questions for Dr. Maheswari?</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── WHY CHILD DENTISTRY ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '56px', alignItems: 'center' }}>
          <div data-animate="slide-right">
            <span className="section-badge">Fear-Free Philosophy</span>
            <h2 className="section-title" style={{ fontSize: '2.2rem', textAlign: 'left', marginBottom: '16px' }}>
              Building a Lifetime of <em>Positive Habits</em>
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.85, marginBottom: '20px' }}>
              Baby teeth (milk teeth) are essential placeholders for permanent adult teeth. When a child loses baby teeth prematurely to cavities, permanent teeth can drift into the wrong positions, leading to severe crowding.
            </p>
            <div className="info-box-warm">
              <strong>Our 'Tell-Show-Do' Method:</strong> We never rush or force a child into the chair. Dr. Maheswari explains what each tool does in playful, child-friendly terms, shows it on their hand first, and only proceeds when your child feels happy and safe.
            </div>
          </div>
          <div data-animate="slide-left">
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '4px solid #FFFFFF' }}>
              <img src="/assets/pedo.jpg" alt="Gentle Pediatric Dentistry at Dr. Mahe's Dentistry Porur" width={700} height={500} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── PEDIATRIC SERVICES ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">What We Offer</span>
            <h2 className="section-title">Kids Dental Services in <em>Porur</em></h2>
            <p className="section-desc">Comprehensive oral care tailored specifically to children's growing jaws and teeth.</p>
          </div>

          <div className="benefit-grid-warm">
            <div className="benefit-card-warm" data-animate>
              <div className="benefit-icon-warm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3 className="benefit-title-warm">Fluoride Varnish &amp; Sealants</h3>
              <p className="benefit-desc-warm">Protective mineral coatings painted onto deep molar grooves to shield delicate enamel from cavity-causing sugars and acids.</p>
            </div>

            <div className="benefit-card-warm" data-animate data-delay="100">
              <div className="benefit-icon-warm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>
              </div>
              <h3 className="benefit-title-warm">Gentle Cavity Fillings</h3>
              <p className="benefit-desc-warm">Tooth-colored, biocompatible composite fillings that restore decayed baby teeth quickly and completely pain-free.</p>
            </div>

            <div className="benefit-card-warm" data-animate data-delay="200">
              <div className="benefit-icon-warm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2a5 5 0 0 1 5 5c0 3.5-3.5 7-5 10-1.5-3-5-6.5-5-10a5 5 0 0 1 5-5z"/></svg>
              </div>
              <h3 className="benefit-title-warm">Habit Coaching &amp; Growth Checks</h3>
              <p className="benefit-desc-warm">Gentle guidance for thumb-sucking, tongue thrusting, and mouth breathing to ensure your child's jaw develops symmetrically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="cta-section-warm">
        <div className="container" data-animate>
          <span className="section-badge" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--accent)", borderColor: "rgba(255,255,255,0.2)" }}>
            Joyful Checkups
          </span>
          <h2 className="cta-title-warm">Give Your Child the Gift of a <em>Fear-Free Smile</em></h2>
          <p className="cta-desc-warm">
            Book an introductory checkup with Dr. Maheswari. We make dental care fun and comfortable for your little one.
          </p>
          <div className="cta-actions-warm">
            <Link href="/contact?service=Pediatric%20Dentistry%20(Pedodontics)#booking" className="btn btn-accent btn-lg">
              Book Child's Appointment
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
