import type { Metadata } from "next";
import SiteNavbar from "../Composent/SiteNavbar";
import { Container, Row, Col, Button } from "react-bootstrap";
import ContainerComposent from "../Composent/ContainerComposent";
import Footer from "../Composent/Footer";
export const metadata: Metadata = {
  title: "Portfolio",
  description: "Portfolio de projets Souflydev, actuellement en développement.",
};

export default function PortfolioPage() {
  const portfolioProjects = [
    {
      src: "/images/portfolio/api_rest_ai.webp",
      alt: "API REST & IA",
      title: "API REST & IA",
      text: "Conception et intégration d'API REST avancées connectées à des modèles d'intelligence artificielle.",
    },
    {
      src: "/images/portfolio/ecommerce_pwa.webp",
      alt: "E-Commerce PWA",
      title: "E-Commerce PWA",
      text: "Application web progressive pour une boutique en ligne fluide, réactive et performante.",
    },
    {
      src: "/images/portfolio/database_Management.webp",
      alt: "Database Management",
      title: "Database Management",
      text: "Architecture, modélisation et optimisation de bases de données relationnelles et NoSQL.",
    },
    {
      src: "/images/portfolio/security_sol.webp",
      alt: "Solutions de Sécurité",
      title: "Security Solutions",
      text: "Mise en place de protocoles de sécurité, authentification robuste et protection des données.",
    },
    {
      src: "/images/portfolio/paymentSolu.webp",
      alt: "Solutions de Paiement",
      title: "Payment Solutions",
      text: "Intégration de passerelles de paiement sécurisées et gestion automatisée des transactions.",
    },
    {
      src: "/images/portfolio/bdd_banque.webp",
      alt: "Système Bancaire",
      title: "Système Bancaire",
      text: "Système sécurisé de gestion des flux financiers, transactions bancaires et analyse des comptes.",
    },
  ];

  return (
    <>
      <SiteNavbar />

      <div className="container-fluid p-0">
        <div
          className="position-relative mt-5 d-flex align-items-center justify-content-center text-center"
          style={{
            backgroundImage: "url('/images/img-random/faxe.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "31.25rem",

          }}
        >
          <div className="position-absolute top-0 h-100 w-100 bg-black opacity-50" />
          <section
            className="position-relative mx-auto"
            style={{
              maxWidth: "37.5rem",
              color: "#fff",
              textShadow: "0.125rem 0.125rem 0.25rem rgba(0, 0, 0, 0.5)",
            }}
          >
            <h1
              className="display-4 fw-bold"
              style={{
                fontSize: "4.5rem",
                boxShadow: "#f2ff02 0.1875rem 0.1875rem 0rem 0rem",
              }}
            >
              Portfolio
            </h1>
          </section>
        </div>
      </div>
      <ContainerComposent items={portfolioProjects} />

      <Container fluid className="mt-5 mb-5">
        <Row>
          <Col xl={12} className="text-center mb-4">
              <Button variant="primary" >Voir les projets</Button>
          </Col>
        </Row>
      </Container>

    <Footer/>
    </>
  );
}