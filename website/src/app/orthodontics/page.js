import Link from "next/link";
import { Phone } from "lucide-react";

export const metadata = {
  title: "Orthodontics, Braces & Clear Aligners in Porur, Chennai | Dr. Mahe's Dentistry",
  description: "Straighten your teeth with ceramic braces, metal braces, or clear aligners at Dr. Mahe's Dentistry in Porur. Customized alignment for children, teens and adults.",
  keywords: ["braces porur", "orthodontics chennai", "clear aligners porur", "ceramic braces chennai", "teeth alignment porur"],
  alternates: { canonical: '/orthodontics' },
  openGraph: {
    title: "Orthodontics & Braces | Dr. Mahe's Dentistry Porur",
    description: "Customized orthodontic alignment for children, teens and adults.",
    url: 'https://drmahesdentistry.in/orthodontics',
  }
};

export default function Orthodontics() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Orthodontic Treatments & Braces in Porur",
    "description": "Information about braces and clear aligners at Dr. Mahe's Dentistry in Porur, Chennai."
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
            <span className="breadcrumb-current">Orthodontics &amp; Braces</span>
          </nav>
          <span className="page-hero-badge">Harmonious Smile Alignment</span>
          <h1 className="page-hero-title-warm">Orthodontics &amp; <em>Braces</em> in Porur</h1>
          <p className="page-hero-desc-warm">
            Achieve a straight, healthy and confident smile. Custom ceramic brackets, self-ligating systems and invisible clear aligners for all ages.
          </p>
          <div className="page-hero-actions-warm">
            <Link href="/contact?service=Orthodontics%20(Braces)#booking" className="btn btn-primary">
              Book Orthodontic Consultation
            </Link>
            <a href="tel:+919342803217" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Phone size={16} />
              <span>Talk to Doctor</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── WHY ORTHODONTICS ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '56px', alignItems: 'center' }}>
          <div data-animate="slide-right">
            <span className="section-badge">More Than Aesthetics</span>
            <h2 className="section-title" style={{ fontSize: '2.2rem', textAlign: 'left', marginBottom: '16px' }}>
              Why Straight Teeth <em>Matter</em>
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.85, marginBottom: '20px' }}>
              Crooked or crowded teeth are difficult to brush and floss thoroughly, leading to plaque buildup, gum disease and premature wear. Orthodontic alignment creates an even bite that protects your teeth for a lifetime while elevating your facial harmony.
            </p>
            <div className="info-box-warm">
              <strong>Never Too Late for Adults:</strong> Healthy teeth can be moved at any age. Over 40% of our orthodontic patients in Porur are working adults who chose ceramic braces or clear aligners for discrete, comfortable straightening.
            </div>
          </div>
          <div data-animate="slide-left">
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '4px solid #FFFFFF' }}>
              <img src="/assets/braces.jpg" alt="Orthodontics and Braces at Dr. Mahe's Dentistry Porur" width={700} height={500} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── TREATMENT OPTIONS ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">Treatment Options</span>
            <h2 className="section-title">Types of Braces &amp; <em>Aligners</em> We Offer</h2>
            <p className="section-desc">We tailor the orthodontic system to match your lifestyle, aesthetic preference and timeline.</p>
          </div>

          <div className="benefit-grid-warm">
            <div className="benefit-card-warm" data-animate>
              <div className="benefit-icon-warm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="8" width="18" height="8" rx="2" /><line x1="7" y1="8" x2="7" y2="16" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="17" y1="8" x2="17" y2="16" /></svg>
              </div>
              <h3 className="benefit-title-warm">Ceramic &amp; Tooth-Colored Braces</h3>
              <p className="benefit-desc-warm">Translucent ceramic brackets blend in with your natural enamel, offering powerful alignment with subtle, discrete aesthetics.</p>
            </div>

            <div className="benefit-card-warm" data-animate data-delay="100">
              <div className="benefit-icon-warm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /></svg>
              </div>
              <h3 className="benefit-title-warm">Invisible Clear Aligners</h3>
              <p className="benefit-desc-warm">Removable, transparent custom trays. Eat whatever you like, brush normally and straighten your teeth without wires or brackets.</p>
            </div>

            <div className="benefit-card-warm" data-animate data-delay="200">
              <div className="benefit-icon-warm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <h3 className="benefit-title-warm">Self-Ligating Metal Braces</h3>
              <p className="benefit-desc-warm">Modern, low-friction brackets that move teeth gently with fewer adjustment appointments and easier cleaning for school kids and teens.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="cta-section-warm">
        <div className="container" data-animate>
          <span className="section-badge" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--accent)", borderColor: "rgba(255,255,255,0.2)" }}>
            Begin Your Smile Journey
          </span>
          <h2 className="cta-title-warm">Ready for a Straight, <em>Confident Smile?</em></h2>
          <p className="cta-desc-warm">
            Book an orthodontic assessment with Dr. Maheswari to discover the best alignment plan for you or your child.
          </p>
          <div className="cta-actions-warm">
            <Link href="/contact?service=Orthodontics%20(Braces)#booking" className="btn btn-accent btn-lg">
              Book Orthodontic Consultation
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
