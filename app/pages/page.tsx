import type { Metadata } from "next";
import DevelopmentPage from "../Composent/DevelopmentPage";
import { Button } from "react-bootstrap";

export const metadata: Metadata = {
  title: "Pages",
  description: "Pages Souflydev, actuellement en développement.",
};

export default function PagesPage() {
  return (
    <>
    
  <nav className="navbar navbar-expand-lg bg-body-tertiary">
    <div className="container-fluid px-4 px-lg-5">
      <a className="navbar-brand fw-bold text-dark" href="../index.html" aria-label="Retour à l'accueil - SOULFYDEV">
        <span className="text-success fw-bold">SOUFLY</span>DEV
      </a>

      <Button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Ouvrir ou fermer le menu de navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </Button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav mx-auto gap-4">
          <li className="nav-item">
            <a className="nav-link fw-bold" href="../index.html">Home</a>
          </li>
          <li className="nav-item">
            <a className="nav-link active fw-bold" aria-current="page" href="./page.html">Pages</a>
          </li>
          <li className="nav-item">
            <a className="nav-link fw-bold" href="./portfolio.html">Portfolio</a>
          </li>
          <li className="nav-item">
            <a className="nav-link fw-bold" href="./blog.html">Blog</a>
          </li>
          <li className="nav-item">
            <a className="nav-link fw-bold" href="./contact.html">Contact</a>
          </li>
        </ul>
        <ul className="navbar-nav">
          <li className="nav-item">
            <a
              className="nav-link nav-cta-btn fw-bold text-white bg-dark rounded px-4 py-2"
              href="./contact.html?section=work"
            >WORKS WITH US</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

    </>
  );
}
