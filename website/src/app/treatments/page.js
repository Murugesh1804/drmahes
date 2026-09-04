import Link from "next/link";
import { Check, Phone, MessageCircle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Comprehensive Dental Treatments in Porur",
  description: "Explore our complete range of gentle, advanced dental treatments in Porur, Chennai — painless root canals, dental implants, braces, pediatric dentistry, veneers and oral surgery.",
  keywords: ["dental treatments porur", "dental services chennai", "implants root canal orthodontics porur", "cosmetic dentistry porur"],
  alternates: {
    canonical: '/treatments',
  },
  openGraph: {
    title: "Dental Treatments | Dr. Mahe's Dentistry Porur",
    description: "Explore complete dental treatments at Dr. Mahe's Dentistry in Porur, Chennai.",
    url: 'https://drmahesdentistry.in/treatments',
  }
};

export default function Treatments() {
  const treatmentsData = [
    {
      name: 'Dental Implants',
      badge: 'Permanent Replacement',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 2C8.5 2 7 5 7 7c0 2.5 1.5 4 3 5v3H9a1 1 0 0 0 0 2h1v2a1 1 0 0 0 2 0v-2h1a1 1 0 0 0 0-2h-1v-3c1.5-1 3-2.5 3-5 0-2-1.5-5-5-5z" /><path d="M10 7c0-1.7 1-3 2-3s2 1.3 2 3" /></svg>,
      desc: 'Lifelike tooth replacement using biocompatible medical titanium fixtures. Preserves natural jawbone density and restores full chewing ability for life.',
      img: '/assets/dental implant.jpg',
      page: '/dental-implants',
      meta: 'Lifetime Durability · Fixed'
    },
    {
      name: 'Painless Root Canal Treatment',
      badge: 'Single Sitting Available',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>,
      desc: 'Gentle endodontic therapy using micro-rotary files and digital imaging to eliminate infection, remove pain and save your natural tooth in one visit.',
      img: '/assets/root canal treament.jpg',
      page: '/root-canal',
      meta: 'Pain-Free · Same Day'
    },
    {
      name: 'Orthodontics & Braces',
      badge: 'Clear Aligners & Ceramic',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="8" width="18" height="8" rx="2" /><line x1="7" y1="8" x2="7" y2="16" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="17" y1="8" x2="17" y2="16" /><line x1="3" y1="12" x2="21" y2="12" /></svg>,
      desc: 'Discreet ceramic brackets, self-ligating braces and custom clear aligners for children, teenagers and adults to achieve balanced facial aesthetics.',
      img: '/assets/braces.jpg',
      page: '/orthodontics',
      meta: 'All Ages · Custom Alignment'
    },
    {
      name: 'Pediatric Dentistry (Pedodontics)',
      badge: 'Child Friendly & Gentle',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 2a5 5 0 0 1 5 5c0 3.5-3.5 7-5 10-1.5-3-5-6.5-5-10a5 5 0 0 1 5-5z" /><circle cx="12" cy="7" r="1.5" /></svg>,
      desc: 'Specialized dental care for toddlers, kids and teens. Preventive sealants, gentle cavity treatment, habit counseling and fun milestone checkups.',
      img: '/assets/pedo.jpg',
      page: '/pediatric-dentistry',
      meta: 'Fear-Free · Kids First'
    },
    {
      name: 'Crowns & Veneers',
      badge: 'Zirconia & Porcelain',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M2 20h20M5 20V8l3.5 4L12 3l3.5 9L19 8v12" /></svg>,
      desc: 'Ultra-thin porcelain veneers and high-translucency zirconia crowns crafted to restore discolored, worn, or chipped teeth with natural beauty.',
      img: '/assets/veneers.jpg',
      page: '/crowns-veneers',
      meta: 'Seamless Natural Match'
    },
    {
      name: 'Oral Surgery & Wisdom Teeth',
      badge: 'Safe & Minimally Invasive',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" /></svg>,
      desc: 'Expert surgical removal of impacted wisdom teeth, complex extractions and minor soft-tissue procedures with gentle anesthesia and quick recovery.',
      img: '/assets/OralSurgery.jpg',
      page: '/oral-surgery',
      meta: 'Gentle Extractions'
    },
  ];

  const delays = ["100", "200", "300", "100", "200", "300"];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "@id": "https://drmahesdentistry.in/#dentist",
    "name": "Dr. Mahe's Dentistry",
    "url": "https://drmahesdentistry.in/treatments",
    "telephone": "+919342803217",
    "medicalSpecialty": "Dentistry",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1st Floor, Kundrathur Main Road, Jaya Nagar, Porur",
      "addressLocality": "Chennai",
      "postalCode": "600116",
      "addressCountry": "IN"
    },
    "availableService": treatmentsData.map(tx => ({
      "@type": "MedicalProcedure",
      "name": tx.name,
      "description": tx.desc,
      "url": `https://drmahesdentistry.in${tx.page}`
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── PAGE HERO ─── */}
      <section className="page-hero-warm">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">All Treatments</span>
          </nav>
          <span className="page-hero-badge">Clinical Excellence with Empathy</span>
          <h1 className="page-hero-title-warm">Dental Treatments in <em>Porur</em></h1>
          <p className="page-hero-desc-warm">
            From routine checkups to complex aesthetic and restorative rehabilitations, every treatment is delivered with modern precision and genuine care for your comfort.
          </p>
        </div>
      </section>

      {/* ─── TREATMENTS GRID ─── */}
      <section className="treatments-section section-padding">
        <div className="container">
          <div className="treatments-grid">
            {treatmentsData.map((tx, i) => (
              <div className="tx-card-warm" key={tx.name} data-animate data-delay={delays[i]}>
                <div className="tx-card-img-wrap">
                  <img src={tx.img} width={700} height={420} alt={`${tx.name} at Dr. Mahe's Dentistry Porur`} loading="lazy" />
                  <span className="tx-card-badge">{tx.badge}</span>
                </div>
                <div className="tx-card-body">
                  <h2 className="tx-card-name" style={{ fontSize: "1.25rem" }}>{tx.name}</h2>
                  <p className="tx-card-desc">{tx.desc}</p>
                  <div className="tx-card-meta">
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>{tx.meta}</span>
                    <Link href={tx.page} className="tx-card-link">
                      <span>Procedure Guide</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── UNSURE WHAT YOU NEED? CONSULTATION GUIDE ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="consult-cta-grid" style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "var(--radius-lg)",
            padding: "48px 44px",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-md)",
          }} data-animate="scale">
            <div>
              <span className="section-badge">Not Sure What You Need?</span>
              <h2 className="section-title" style={{ fontSize: "2.2rem", textAlign: "left", marginBottom: "14px" }}>
                Book an Honest, <em>Zero-Pressure</em> Consultation
              </h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.85, marginBottom: "20px" }}>
                You don't need to diagnose your own teeth. Dr. Maheswari will carefully examine your mouth with digital imaging, explain what is happening and present your options clearly so you can decide what fits your goals and budget.
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link href="/contact#booking" className="btn btn-primary">
                  Book Initial Exam &amp; X-Ray
                </Link>
                <a
                  href="https://wa.me/919342803217?text=Hi%20Dr.%20Maheswari,%20I%20am%20not%20sure%20which%20treatment%20I%20need"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <MessageCircle size={16} />
                  <span>Ask a Question on WhatsApp</span>
                </a>
              </div>
            </div>

            <div style={{
              backgroundColor: "var(--bg-warm-tint)",
              borderRadius: "var(--radius)",
              padding: "28px 24px",
              border: "1px solid var(--accent-border)",
              textAlign: "left"
            }}>
              <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "12px", color: "var(--primary)" }}>
                Included in Your First Consultation:
              </div>
              <ul style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Check size={16} strokeWidth={2.5} style={{ color: "var(--accent-hover)", flexShrink: 0 }} />
                  <span>High-definition digital X-ray scan</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Check size={16} strokeWidth={2.5} style={{ color: "var(--accent-hover)", flexShrink: 0 }} />
                  <span>Intraoral visual check &amp; gum health review</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Check size={16} strokeWidth={2.5} style={{ color: "var(--accent-hover)", flexShrink: 0 }} />
                  <span>Transparent cost estimate &amp; treatment roadmap</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Check size={16} strokeWidth={2.5} style={{ color: "var(--accent-hover)", flexShrink: 0 }} />
                  <span>Zero pressure to start treatment on the spot</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="cta-section-warm">
        <div className="container" data-animate>
          <span className="section-badge" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--accent)", borderColor: "rgba(255,255,255,0.2)" }}>
            Compassionate Dentistry
          </span>
          <h2 className="cta-title-warm">Ready to Restore Your <em>Healthy Smile?</em></h2>
          <p className="cta-desc-warm">
            Appointments are available throughout the week in Porur. We look forward to meeting you.
          </p>
          <div className="cta-actions-warm">
            <Link href="/contact#booking" className="btn btn-accent btn-lg">
              Book Your Appointment
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
