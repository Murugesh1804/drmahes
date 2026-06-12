import { Open_Sans, Poppins } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollAnimations from "../components/ScrollAnimations";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  metadataBase: new URL('https://drmahesdentistry.com'),
  title: {
    default: "Dr. Mahe's Dentistry — Advanced Dental Care, Porur, Chennai",
    template: "%s | Dr. Mahe's Dentistry",
  },
  description: "Visit Dr. Mahe's Dentistry in Porur, Chennai. Dr. Maheswari offers expert dental implants, painless root canals, braces, cosmetic dentistry and oral surgery with advanced dental care. Book today!",
  keywords: ["dentist porur chennai", "dental clinic porur", "dr maheswari dentist", "dental implants chennai", "root canal porur", "orthodontics braces chennai", "best dentist in porur", "pediatric dentist chennai"],
  authors: [{ name: "Dr. Maheswari", url: "https://drmahesdentistry.com/about" }],
  creator: "Dr. Maheswari",
  publisher: "Dr. Mahe's Dentistry",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Dr. Mahe's Dentistry — Advanced Dental Care, Porur, Chennai",
    description: "Visit Dr. Mahe's Dentistry in Porur, Chennai. Dr. Maheswari offers expert dental implants, painless root canals, braces, cosmetic dentistry and oral surgery.",
    url: 'https://drmahesdentistry.com',
    siteName: "Dr. Mahe's Dentistry",
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dr. Mahe's Dentistry — Porur, Chennai",
    description: "Expert dental care in Porur, Chennai. Dr. Maheswari offers complete family dentistry, implants and root canals.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${openSans.variable} ${poppins.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <ScrollAnimations />
      </body>
    </html>
  );
}
