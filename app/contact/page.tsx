'use server';

import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez-nous pour toute question.",
};
export default function ContactPage() {
  return (
    <>
    <main className="container py-5">
      <h1>Contactez-nous</h1>
      <p>Nous serons heureux d&apos;échanger avec vous.</p>
    </main>
</>  
);

}
