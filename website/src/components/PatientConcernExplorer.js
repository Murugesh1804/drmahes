"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Heart, Layers, Smile, Sparkles, Gem, Check, MessageCircle, ArrowRight } from "lucide-react";

const patientConcerns = [
  {
    id: "pain",
    icon: <Zap size={20} strokeWidth={2} />,
    label: "Sudden Toothache or Pain",
    sub: "Need urgent, gentle relief",
    title: "Gentle, Same-Day Relief for Tooth Pain",
    desc: "Tooth pain is exhausting and disruptive. You don't have to suffer through the night or weekend. We offer prompt, gentle evaluation and painless single-sitting root canals or conservative remedies to eliminate pain at the source.",
    highlights: [
      "Immediate pain assessment with ultra-low radiation digital X-rays",
      "Computerized gentle local anesthesia — no sharp sting",
      "Painless single-sitting root canal treatment (RCT) to save your tooth",
      "Emergency slots open Monday through Saturday till 10 PM"
    ],
    recommendedTx: "Painless Root Canal & Emergency Care",
    link: "/root-canal",
    bookingService: "Root Canal Treatment"
  },
  {
    id: "nervous",
    icon: <Heart size={20} strokeWidth={2} />,
    label: "I Feel Nervous & Anxious",
    sub: "Haven't visited in a while",
    title: "A Zero-Judgment, 100% Calm Space",
    desc: "Dental anxiety is real and very common. Whether it's been 6 months or 6 years since your last visit, you will never be lectured, judged, or rushed here. We explain every step in plain words and you are always in complete control.",
    highlights: [
      "Unhurried consultations with Dr. Maheswari before any procedure",
      "You control the pace — stop us anytime with a simple hand raise",
      "Relaxing clinic atmosphere with calming music and gentle touch",
      "Pre-numb comfort gels before any local anesthetic"
    ],
    recommendedTx: "Gentle Consultation & Preventive Care",
    link: "/about",
    bookingService: "Consultation & Check-up"
  },
  {
    id: "missing",
    icon: <Layers size={20} strokeWidth={2} />,
    label: "Missing or Broken Teeth",
    sub: "Want to chew & smile freely",
    title: "Permanent, Lifelike Tooth Replacements",
    desc: "Missing teeth affect how you eat, speak and feel about your smile. Our medical-grade titanium dental implants and custom zirconia crowns fuse seamlessly with your mouth, feeling and functioning just like your natural teeth.",
    highlights: [
      "Biocompatible titanium implants that preserve your natural jawbone",
      "Custom shade-matched porcelain and zirconia crowns for a seamless match",
      "Clear, upfront pricing with no hidden costs",
      "Built for durability to last a lifetime with normal care"
    ],
    recommendedTx: "Dental Implants & Restorations",
    link: "/dental-implants",
    bookingService: "Dental Implants"
  },
  {
    id: "kids",
    icon: <Smile size={20} strokeWidth={2} />,
    label: "Child's First Visit / Kids Care",
    sub: "Gentle pediatric dentistry",
    title: "Fun, Fear-Free Dental Care for Little Smiles",
    desc: "We make your child's dental visit a positive, joyful adventure. From their very first baby tooth to adolescent orthodontic checks, Dr. Maheswari's patient and gentle approach puts kids instantly at ease.",
    highlights: [
      "Fun 'Tell-Show-Do' technique so kids feel safe and curious",
      "Preventive fluoride treatments, cavity fillings & gentle sealants",
      "Habit counseling (thumb-sucking, mouth breathing) in a friendly way",
      "Special milestone rewards and a welcoming kids-friendly vibe"
    ],
    recommendedTx: "Pediatric Dentistry (Pedodontics)",
    link: "/pediatric-dentistry",
    bookingService: "Pediatric Dentistry (Pedodontics)"
  },
  {
    id: "alignment",
    icon: <Sparkles size={20} strokeWidth={2} />,
    label: "Crooked or Crowded Teeth",
    sub: "Braces & Clear Aligners",
    title: "Precision Teeth Straightening for All Ages",
    desc: "Straight teeth aren't just about aesthetics — they make chewing easier and prevent future decay. We provide ceramic braces, self-ligating brackets and clear aligners customized for teens and adults.",
    highlights: [
      "Discreet ceramic braces and invisible clear aligner options",
      "Digital mapping for precise, predictable orthodontic movement",
      "Flexible appointment schedules for school students and working professionals",
      "Customized retention plans for a lasting, aligned smile"
    ],
    recommendedTx: "Orthodontics & Braces",
    link: "/orthodontics",
    bookingService: "Orthodontics (Braces)"
  },
  {
    id: "cosmetics",
    icon: <Gem size={20} strokeWidth={2} />,
    label: "Stained, Chipped or Dull Teeth",
    sub: "Smile makeover & Veneers",
    title: "Subtle, Natural Cosmetic Smile Enhancements",
    desc: "A great smile doesn't look artificial — it looks like the best version of your natural self. We craft ultra-thin porcelain veneers, precision zirconia crowns and gentle teeth whitening to enhance your natural beauty.",
    highlights: [
      "Custom ultra-thin ceramic veneers for chipped or stained teeth",
      "High-translucency zirconia crowns with natural light reflection",
      "Safe, enamel-friendly in-clinic teeth whitening",
      "Comprehensive smile aesthetic evaluation tailored to your facial features"
    ],
    recommendedTx: "Crowns, Veneers & Smile Makeovers",
    link: "/crowns-veneers",
    bookingService: "Crowns & Veneers"
  }
];

export default function PatientConcernExplorer() {
  const [activeConcernId, setActiveConcernId] = useState(patientConcerns[0].id);

  const activeConcern = patientConcerns.find(c => c.id === activeConcernId) || patientConcerns[0];

  return (
    <div className="concern-card-wrap" data-animate="scale">
      <div className="concern-tabs-grid" role="tablist" aria-label="Select patient concern">
        {patientConcerns.map((concern) => {
          const isActive = concern.id === activeConcernId;
          return (
            <button
              key={concern.id}
              role="tab"
              aria-selected={isActive}
              className={`concern-tab-btn ${isActive ? "active" : ""}`}
              onClick={() => setActiveConcernId(concern.id)}
            >
              <div className="concern-tab-icon-wrap">
                {concern.icon}
              </div>
              <div>
                <div className="concern-tab-label">{concern.label}</div>
                <div className="concern-tab-sub">{concern.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="concern-display-box">
        <div>
          <div style={{ fontFamily: "var(--font-handwrite, cursive)", fontSize: "1.45rem", color: "var(--accent-hover)", marginBottom: "4px" }}>
            Tailored Care Pathway ~ Dr. Maheswari
          </div>
          <span className="section-badge" style={{ marginBottom: 12 }}>Recommended Care Plan</span>
          <h3 className="concern-display-title">{activeConcern.title}</h3>
          <p className="concern-display-desc">{activeConcern.desc}</p>

          <div className="concern-highlights">
            {activeConcern.highlights.map((h, i) => (
              <div className="concern-highlight-item" key={i}>
                <Check size={16} strokeWidth={2.5} className="concern-highlight-icon" />
                <span>{h}</span>
              </div>
            ))}
          </div>

          <div className="concern-actions" style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "24px", alignItems: "flex-start" }}>
            <Link
              href={`/contact?service=${encodeURIComponent(activeConcern.bookingService)}#booking`}
              className="btn btn-primary"
            >
              Book for {activeConcern.bookingService.split(" ")[0]}
            </Link>
            <Link href={activeConcern.link} className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span>Learn Procedure Details</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "28px",
          padding: "36px 30px",
          border: "1px solid rgba(184, 151, 114, 0.22)",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          textAlign: "center"
        }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            backgroundColor: "var(--accent-light)",
            color: "var(--accent-hover)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            boxShadow: "var(--shadow-xs)"
          }}>
            {activeConcern.icon}
          </div>
          <div>
            <div style={{ fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent-hover)", fontWeight: 700 }}>
              Primary Specialty
            </div>
            <div style={{ fontSize: "1.12rem", fontWeight: 700, marginTop: "4px" }}>
              {activeConcern.recommendedTx}
            </div>
          </div>
          <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Consultation with Dr. Maheswari includes digital assessment, diagnosis and full treatment roadmap.
          </p>
          <a
            href="https://wa.me/919342803217?text=Hi%20Dr.%20Maheswari,%20I%20have%20a%20question%20about%20my%20teeth"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-sm"
            style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <MessageCircle size={16} />
            <span>Chat with Us on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
