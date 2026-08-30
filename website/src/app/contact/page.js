import Link from "next/link";
import { Suspense } from "react";
import BookingForm from "../../components/BookingForm";
import { Phone, MessageCircle, Mail, MapPin, Clock } from "lucide-react";

export const metadata = {
  title: "Clinic Location & Appointments | Dr. Mahe's Dentistry Porur, Chennai",
  description: "Visit Dr. Mahe's Dentistry on Kundrathur Main Road, Porur, Chennai. Book an appointment online or call +91 93428 03217 for gentle, modern dental care.",
  keywords: ["book dentist appointment porur", "dental appointment chennai", "dr mahe dentistry contact", "dentist porur location", "kundrathur road dental clinic"],
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: "Contact & Book Appointment | Dr. Mahe's Dentistry Porur",
    description: "Visit Dr. Mahe's Dentistry on Kundrathur Main Road, Porur, Chennai. Book your dental appointment online.",
    url: 'https://drmahesdentistry.com/contact',
  }
};

export default function Contact() {
  return (
    <>
      {/* ─── PAGE HERO ─── */}
      <section className="page-hero-warm">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">Contact &amp; Clinic Hours</span>
          </nav>
          <span className="page-hero-badge">We're Here For You</span>
          <h1 className="page-hero-title-warm">Visit Our Clinic in <em>Porur</em></h1>
          <p className="page-hero-desc-warm">
            Easily schedule your visit online with Dr. Maheswari, reach us via WhatsApp, or drop by our clinic on Kundrathur Main Road.
          </p>
          <div className="page-hero-actions-warm">
            <a href="tel:+919342803217" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Phone size={16} />
              <span>Call Reception: +91 93428 03217</span>
            </a>
            <a
              href="https://wa.me/919342803217?text=Hi%20Dr.%20Maheswari,%20I%20would%20like%20to%20book%20an%20appointment"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <MessageCircle size={16} />
              <span>WhatsApp Us Directly</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── BOOKING SECTION ─── */}
      <section className="booking-section-warm section-padding" id="booking">
        <div className="container">
          <div className="booking-container-card" data-animate="scale">
            <div className="booking-aside">
              <div>
                <span className="section-badge" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--accent)", borderColor: "rgba(255,255,255,0.2)", marginBottom: "14px" }}>
                  Simple Online Booking
                </span>
                <h2 className="booking-aside-title">Schedule Your Visit</h2>
                <p className="booking-aside-desc">
                  Select your treatment and preferred time slot. No advance fees required — we will confirm your appointment via phone or WhatsApp.
                </p>
              </div>

              <div className="booking-contact-items">
                <div className="booking-contact-row">
                  <span className="booking-contact-icon">
                    <Phone size={18} />
                  </span>
                  <div>
                    <div className="booking-contact-label">Phone &amp; Urgent Queries</div>
                    <div className="booking-contact-val"><a href="tel:+919342803217">+91 93428 03217</a></div>
                  </div>
                </div>

                <div className="booking-contact-row">
                  <span className="booking-contact-icon">
                    <Mail size={18} />
                  </span>
                  <div>
                    <div className="booking-contact-label">Email Inquiries</div>
                    <div className="booking-contact-val"><a href="mailto:smile@drmahesdentistry.in">smile@drmahesdentistry.in</a></div>
                  </div>
                </div>

                <div className="booking-contact-row">
                  <span className="booking-contact-icon">
                    <MapPin size={18} />
                  </span>
                  <div>
                    <div className="booking-contact-label">Address</div>
                    <div className="booking-contact-val">1st floor, Kundrathur Main Rd, Jaya Nagar, Porur, Chennai – 600116</div>
                  </div>
                </div>

                <div className="booking-contact-row">
                  <span className="booking-contact-icon">
                    <Clock size={18} />
                  </span>
                  <div>
                    <div className="booking-contact-label">Consultation Hours</div>
                    <div className="booking-contact-val">
                      Mon – Sat: 10:00 AM – 10:00 PM<br />
                      <span style={{ color: "var(--accent)", fontSize: "0.82rem" }}>Sunday: On Appointment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Loading appointment form...</div>}>
              <BookingForm />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ─── ARRIVAL & TRANSIT GUIDELINES ─── */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header" data-animate>
            <span className="section-badge">Easy Directions</span>
            <h2 className="section-title">Getting to Our Clinic in <em>Porur</em></h2>
            <p className="section-desc">
              Conveniently situated on Kundrathur Main Road, accessible from all surrounding neighborhoods in West Chennai.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "48px" }}>
            <div className="loc-card-warm" data-animate data-delay="100">
              <div className="loc-label-warm">Bus &amp; Public Transit</div>
              <div className="loc-main-warm">Easily Accessible by MTC Buses</div>
              <p className="loc-sub-warm">
                Frequent buses run along Kundrathur Main Road and Porur junction from Guindy, Vadapalani, Poonamallee, and Tambaram.
              </p>
            </div>

            <div className="loc-card-warm" data-animate data-delay="200">
              <div className="loc-label-warm">Parking &amp; Arrival</div>
              <div className="loc-main-warm">Dedicated Vehicle Parking</div>
              <p className="loc-sub-warm">
                Comfortable parking space available for both two-wheelers and four-wheelers directly at the building premises.
              </p>
            </div>

            <div className="loc-card-warm" data-animate data-delay="300">
              <div className="loc-label-warm">Nearby Areas Served</div>
              <div className="loc-main-warm">Within 10-15 Minutes From:</div>
              <p className="loc-sub-warm">
                Mugalivakkam, Ramapuram, Iyyappanthangal, Manapakkam, Valasaravakkam, Mangadu, and Kundrathur.
              </p>
            </div>
          </div>

          {/* Map layout */}
          <div className="location-layout-warm">
            <div className="location-cards-warm" data-animate="slide-right">
              <div className="loc-card-warm">
                <div className="loc-label-warm">Exact Address</div>
                <div className="loc-main-warm">Dr. Mahe's Dentistry</div>
                <div className="loc-sub-warm">1st floor, Kundrathur Main Rd, Jaya Nagar, Porur, Chennai — 600116</div>
              </div>

              <div className="loc-card-warm">
                <div className="loc-label-warm">Evening Appointments</div>
                <div className="loc-main-warm">Open till 10:00 PM</div>
                <div className="loc-sub-warm">
                  Designed so you never have to take leave from work or pull children out of school for a dental checkup.
                </div>
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Dr.+Mahe%27s+Dentistry,+Jaya+Nagar,+Porur"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <MapPin size={16} />
                <span>Navigate on Google Maps</span>
              </a>
            </div>

            <div className="map-frame-warm" data-animate="slide-left">
              <iframe
                src="https://storage.googleapis.com/maps-solutions-p888dpsojl/commutes/ws32/commutes.html"
                width="600"
                height="450"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen=""
                referrerPolicy="no-referrer-when-downgrade"
                title="Dr. Mahe's Dentistry Map Location in Porur Chennai"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
