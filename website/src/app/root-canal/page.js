import Link from "next/link";
import { Phone } from "lucide-react";

export const metadata = {
  title: "Painless Root Canal Treatment (RCT) in Porur, Chennai",
  description: "Save your infected tooth with a painless, single-sitting root canal treatment at Dr. Mahe's Dentistry in Porur. Gentle anesthesia, micro-rotary files and fast relief.",
  keywords: ["root canal treatment porur", "painless rct chennai", "single sitting root canal porur", "endodontist chennai", "tooth pain relief porur"],
  alternates: { canonical: '/root-canal' },
  openGraph: {
    title: "Painless Root Canal Treatment | Dr. Mahe's Dentistry Porur",
    description: "Painless, single-sitting endodontic therapy to eliminate tooth pain and preserve your natural tooth.",
    url: 'https://drmahesdentistry.in/root-canal',
  }
};

export default function RootCanal() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Painless Root Canal Treatment in Porur",
    "description": "Information about painless single-sitting root canal treatments at Dr. Mahe's Dentistry in Porur, Chennai."
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
            <span className="breadcrumb-current">Root Canal Treatment</span>
          </nav>
          <span className="page-hero-badge">Save Your Natural Tooth</span>
          <h1 className="page-hero-title-warm">Painless <em>Root Canal</em> Treatment</h1>
          <p className="page-hero-desc-warm">
            Don't let tooth pain disrupt your days and nights. Our advanced single-sitting root canal treatments eliminate pain gently and preserve your natural tooth.
          </p>
          <div className="page-hero-actions-warm">
            <Link href="/contact?service=Root%20Canal%20Treatment#booking" className="btn btn-primary">
              Book Pain Relief Visit
            </Link>
            <a href="tel:+919342803217" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Phone size={16} />
              <span>Call for Emergency Slot</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── WHY RCT & MYTH BUSTER ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '56px', alignItems: 'center' }}>
          <div data-animate="slide-right">
            <span className="section-badge">How It Works</span>
            <h2 className="section-title" style={{ fontSize: '2.2rem', textAlign: 'left', marginBottom: '16px' }}>
              Why Root Canals Don't Hurt <em>Anymore</em>
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.85, marginBottom: '20px' }}>
              When deep cavity bacteria reach the inner pulp and nerve of your tooth, it causes inflammation and severe throbbing pain. A root canal simply removes the infected tissue, cleans the inner canals and seals the tooth safely.
            </p>
            <div className="info-box-warm">
              <strong>The Pain Myth:</strong> Root canals don’t cause pain — they <em>cure</em> pain. With modern computerized local anesthesia and soothing numbing gels, getting a root canal feels no more difficult than getting a simple standard filling.
            </div>
          </div>
          <div data-animate="slide-left">
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '4px solid #FFFFFF' }}>
              <img src="/assets/root canal treament.jpg" alt="Painless Root Canal Treatment at Dr. Mahe's Dentistry Porur" width={700} height={500} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROCEDURE STEPS ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">Single-Sitting Comfort</span>
            <h2 className="section-title">The Root Canal Process: <em>Fast &amp; Calm</em></h2>
            <p className="section-desc">Designed to get you out of pain in a single, relaxed appointment.</p>
          </div>

          <div className="steps-list-warm" style={{ maxWidth: '840px', margin: '0 auto' }}>
            <div className="step-item-warm" data-animate>
              <div className="step-num-warm">1</div>
              <div>
                <div className="step-title-warm">Digital X-Ray &amp; Gentle Numbing</div>
                <div className="step-desc-warm">We apply a topical numbing gel first, followed by gentle localized anesthetic. We test the area to ensure you feel absolutely zero sensation before beginning.</div>
              </div>
            </div>

            <div className="step-item-warm" data-animate>
              <div className="step-num-warm">2</div>
              <div>
                <div className="step-title-warm">Micro-Rotary Pulp Removal</div>
                <div className="step-desc-warm">Using flexible nickel-titanium micro-instruments, Dr. Maheswari carefully removes the inflamed pulp from inside the root canals.</div>
              </div>
            </div>

            <div className="step-item-warm" data-animate>
              <div className="step-num-warm">3</div>
              <div>
                <div className="step-title-warm">Disinfection &amp; Biocompatible Sealing</div>
                <div className="step-desc-warm">The canals are thoroughly flushed with antimicrobial solutions and sealed with biocompatible gutta-percha to prevent future re-infection.</div>
              </div>
            </div>

            <div className="step-item-warm" data-animate>
              <div className="step-num-warm">4</div>
              <div>
                <div className="step-title-warm">Protective Crown Placement</div>
                <div className="step-desc-warm">A strong porcelain or zirconia crown is placed over the treated tooth, protecting it against chewing forces so you can use it normally for decades.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMMON SYMPTOMS ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">Warning Signs</span>
            <h2 className="section-title">Signs You Might Need a <em>Root Canal</em></h2>
          </div>

          <div className="benefit-grid-warm">
            <div className="benefit-card-warm" data-animate>
              <div className="benefit-icon-warm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              </div>
              <h3 className="benefit-title-warm">Throbbing Toothache</h3>
              <p className="benefit-desc-warm">Persistent pain while chewing or biting, or sudden throbbing pain that wakes you up at night.</p>
            </div>

            <div className="benefit-card-warm" data-animate data-delay="100">
              <div className="benefit-icon-warm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </div>
              <h3 className="benefit-title-warm">Lingering Sensitivity</h3>
              <p className="benefit-desc-warm">Sharp pain that lingers for several seconds after drinking hot coffee or eating cold ice cream.</p>
            </div>

            <div className="benefit-card-warm" data-animate data-delay="200">
              <div className="benefit-icon-warm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
              </div>
              <h3 className="benefit-title-warm">Gum Swelling &amp; Tenderness</h3>
              <p className="benefit-desc-warm">A small bump, pimple, or localized swelling on the gums next to the painful tooth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="cta-section-warm">
        <div className="container" data-animate>
          <span className="section-badge" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--accent)", borderColor: "rgba(255,255,255,0.2)" }}>
            Immediate Pain Relief
          </span>
          <h2 className="cta-title-warm">Don't Suffer Through <em>Tooth Pain</em></h2>
          <p className="cta-desc-warm">
            We offer same-day appointments in Porur to diagnose and relieve your tooth pain gently.
          </p>
          <div className="cta-actions-warm">
            <Link href="/contact?service=Root%20Canal%20Treatment#booking" className="btn btn-accent btn-lg">
              Book Pain Relief Appointment
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
