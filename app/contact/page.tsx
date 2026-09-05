import type { Metadata } from "next";
import SiteNavbar from "../Composent/SiteNavbar";
export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez-nous pour toute question.",
};
export default function ContactPage() {
  return (
    <>
      <SiteNavbar />
      <main className="container py-5">
        <h1>Contactez-nous</h1>
        <p>Nous serons heureux d&apos;échanger avec vous.</p>
      </main>
    </>
  );
}
