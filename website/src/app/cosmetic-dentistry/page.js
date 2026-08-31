import { redirect } from "next/navigation";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/crowns-veneers',
  },
};

export default function CosmeticDentistry() {
  redirect("/crowns-veneers");
}
