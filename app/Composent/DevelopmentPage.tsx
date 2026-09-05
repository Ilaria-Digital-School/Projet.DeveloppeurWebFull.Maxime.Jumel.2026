import Link from "next/link";
import SiteNavbar from "./SiteNavbar";

interface DevelopmentPageProps {
  title: string;
  description: string;
}

export default function DevelopmentPage({
  title,
  description,
}: DevelopmentPageProps) {
  return (
    <>
      <SiteNavbar />
      <main className="min-vh-100 d-flex align-items-center justify-content-center bg-dark px-4 py-5 text-center text-white">
        <section className="development-page">
          <p className="mb-3 text-success fw-bold text-uppercase">Souflydev</p>
          <h1 className="display-4 fw-bold mb-3">{title}</h1>
          <p className="lead text-white-50 mb-4">{description}</p>
          <Link href="/" className="btn btn-warning fw-bold px-4 py-3">
            Retour à l&apos;accueil
          </Link>
        </section>
      </main>
    </>
  );
}
