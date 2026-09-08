import type { Metadata } from "next";
import SiteNavbar from "../Composent/SiteNavbar";
import { Container, Row, Col } from "react-bootstrap";
export const metadata: Metadata = {
  title: "Portfolio",
  description: "Portfolio de projets Souflydev, actuellement en développement.",
};

export default function PortfolioPage() {
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
          <div className="position-absolute top-0 start-0 h-100 w-100 bg-black opacity-50" />
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
      <Container fluid className="mt-5 mb-5">
              <Row>
                <Col className="text-start mt-5 mb-5" lg={6} xs={12} xxl={6}>
                  <img src="/images/portfolio/api_rest_ai.webp" alt="" className="img-fluid img-thumbnail" />
                  <h2 className="text-dark">Projets</h2>
                  <p className="text-muted">Liste des projets réalisés.</p>
                </Col>
              </Row>

      </Container>
    </>
  );
}
