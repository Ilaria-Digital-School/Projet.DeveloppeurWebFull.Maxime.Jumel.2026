import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import seoData from "./seo.json";
import { TooltipProvider } from "@/components/ui/tooltip";

// Styles CSS
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
  metadataBase: new URL("https://production.souflyhub.fr"),
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
        url: "https://assets.souflyhub.dev/images/upload/souflydev.webp",
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
    images: ["https://assets.souflyhub.dev/images/upload/souflydev.webp"],
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
      data-bs-theme="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-bs-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <TooltipProvider>{children}</TooltipProvider>
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