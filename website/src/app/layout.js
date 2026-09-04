import { DM_Sans, Playfair_Display, Caveat } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollAnimations from "../components/ScrollAnimations";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-handwrite",
  weight: ["400", "600", "700"],
});

export const metadata = {
  metadataBase: new URL('https://drmahesdentistry.in'),
  title: {
    default: "Dr. Mahe's Dentistry — Advanced Dental Care, Porur, Chennai",
    template: "%s | Dr. Mahe's Dentistry",
  },
  description: "Dr. Mahe's Dentistry in Porur, Chennai offers expert dental implants, painless root canals, braces and pediatric care. Book your appointment today!",
  keywords: ["dentist porur chennai", "dental clinic porur", "dr maheswari dentist", "dental implants chennai", "root canal porur", "orthodontics braces chennai", "best dentist in porur", "pediatric dentist chennai"],
  authors: [{ name: "Dr. Maheswari", url: "https://drmahesdentistry.in/about" }],
  creator: "Dr. Maheswari",
  publisher: "Dr. Mahe's Dentistry",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/assets/apple-touch-icon.png',
  },
  openGraph: {
    title: "Dr. Mahe's Dentistry — Advanced Dental Care, Porur, Chennai",
    description: "Dr. Mahe's Dentistry in Porur, Chennai offers expert dental implants, painless root canals, braces and pediatric care.",
    url: 'https://drmahesdentistry.in',
    siteName: "Dr. Mahe's Dentistry",
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://drmahesdentistry.in/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "Dr. Mahe's Dentistry — Modern Dental Studio in Porur, Chennai",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dr. Mahe's Dentistry — Porur, Chennai",
    description: "Expert dental care in Porur, Chennai. Dr. Maheswari offers complete family dentistry, implants and root canals.",
    images: ['https://drmahesdentistry.in/assets/og-image.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfairDisplay.variable} ${caveat.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <ScrollAnimations />
      </body>
    </html>
  );
}
