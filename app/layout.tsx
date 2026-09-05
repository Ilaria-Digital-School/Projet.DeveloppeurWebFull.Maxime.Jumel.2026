import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import seoData from "./seo.json";

// Styles CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // Ajouté pour que votre icône bi-search fonctionne
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio.souflyhub.fr"),
  title: {
    default: "Souflydev | Développeur Web et Mobile",
    template: "%s | Souflydev",
  },
  description:
    "Souflydev crée des sites web, applications mobiles et expériences digitales modernes et performantes.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Souflydev",
    title: "Souflydev | Développeur Web et Mobile",
    description:
      "Sites web, applications mobiles et expériences digitales conçus pour développer votre activité.",
    images: [
      {
        url: "/images/upload/souflydev.webp",
        width: 900,
        height: 900,
        alt: "Souflydev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Souflydev | Développeur Web et Mobile",
    description:
      "Sites web, applications mobiles et expériences digitales modernes.",
    images: ["/images/upload/souflydev.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": seoData["@context"],
              "@graph": seoData["@graph"],
            }),
          }}
        />
      </body>
    </html>
  );
}