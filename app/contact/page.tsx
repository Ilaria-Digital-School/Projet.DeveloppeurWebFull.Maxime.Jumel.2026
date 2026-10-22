import type { Metadata } from "next";
import Footer from "../Composent/Footer";
import ContactHero from "../Composent/ContactHero";
import ContactInfoCards from "../Composent/ContactInfoCards";
import ContactMapForm from "../Composent/ContactMapForm";
import ContactBanner from "../Composent/ContactBanner";
import SiteNavbar2 from "../Composent/SiteNavbar2";

export const metadata: Metadata = {
  title: "Souflydev | Contact Web & Mobile Developer",
  description:
    "Contact Souflydev for modern websites, mobile applications, and digital solutions tailored to your business needs.",
};

export default function ContactPage() {
  return (
    <>
      <SiteNavbar2 />
      <main>
        <ContactHero />
        <ContactInfoCards />
        <ContactMapForm />
        <ContactBanner />
      </main>
      <Footer />
    </>
  );
}
