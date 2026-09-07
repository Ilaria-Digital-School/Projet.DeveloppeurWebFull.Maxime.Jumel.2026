"use client";

import Link from "next/link";
import Image from "next/image";
import { Container, Row, Col, Card } from "react-bootstrap";
import SiteNavbar from "../Composent/SiteNavbar";
export default function PresencePage() {
  return (
    <>
    <SiteNavbar />
      <main className="min-vh-100 align-items-center justify-content-center bg-light px-4 py-5 text-center text-dark">
        <Container fluid>
          <Row className="flex-lg-row align-items-center justify-content-center">
            <Col
              lg={6}
              className="text-center justify-content-center align-items-center d-flex flex-column pe-lg-5 pe-xl-0"
            >
              <h1 className="display-4 fw-bold mb-5">
                Je suis{" "}
                <span className="text-warning text-decoration-underline display-4 fs-bold">
                  souflydev
                </span>
                <br />
                <strong className="text-success">Developer full stack </strong>
              </h1>
              <p
                className="lead text-dark text-center text-spacer-1 mb-5 fs-5 fw-bold mx-auto"
                style={{ maxWidth: "50rem" }}
              >
                Je suis un développeur full-stack. Je crée des applications web
                modernes et performantes, avec des modèles réutilisables. Je
                suis passionné par le développement web et la technologie. Si
                vous avez besoin d&apos;une solution web ou de services de
                développement, vous pouvez me contacter pour plus
                d&apos;informations. Je développe des applications web qui
                peuvent transformer votre projet en une véritable mine
                d&apos;or.
              </p>
              <div className="d-flex flex-column flex-lg-row gap-3 gap-lg-4 justify-content-center align-items-center">
                <Link
                  href="/"
                  className="btn btn-warning fw-bold px-4 py-3"
                  aria-label="Contactez-moi pour vos projets web et mobile"
                >
                  Contactez-moi
                </Link>
                <Link
                  href="/portfolio"
                  className="btn btn-outline-dark fw-bold px-4 py-3 ms-2 bg-dark text-white"
                  aria-label="Voir mon portfolio de projets web et mobile"
                >
                  Voir mon portfolio
                </Link>
              </div>
            </Col>
            <Col lg={6} xs={12} className="mt-5 mt-lg-0 text-center">
              <Image
                src="/images/upload/souflydev.webp"
                alt="Logo Souflydev portrait"
                width={600}
                height={600}
                sizes="(max-width: 991px) 90vw, 50vw"
                className="img-fluid mx-auto border border-white rounded-unrounded shadow-lg-sm shadow-lg-primary"
                style={{
                  display: "block",
                  width: "100%",
                  maxWidth: "600px",
                  height: "auto",
                  marginInline: "auto",
                }}
              />
            </Col>
          </Row>
        </Container>
        <Container fluid className="px-4 px-lg-5 py-5 text-center text-white mt-5">
          <div className="mx-auto mb-5" style={{ maxWidth: "46rem" }}>
            <p className="text-success text-uppercase fw-bold mb-3">
              Mon expertise
            </p>
            <h2 className="display-5 fw-bold mb-3 text-primary">Why work with me?</h2>
            <p className="lead mb-0 text-center text-warning">
              Des compétences techniques pour donner vie à vos projets digitaux.
            </p>
          </div>

          <Row className="g-4 justify-content-center">
            <Col lg={3} md={6} xs={12}>
              <Card className="h-100 border-0 bg-light text-dark text-start p-4">
                <i className="bi bi-palette2 fs-1 text-success mb-4" aria-hidden="true"></i>
                <Card.Title className="fw-bold">Design UI/UX</Card.Title>
                <Card.Text className="text-secondary mb-0">
                  Des interfaces claires, modernes et pensées pour offrir une
                  expérience agréable sur chaque écran.
                </Card.Text>
              </Card>
            </Col>
            <Col lg={3} md={6} xs={12}>
              <Card className="h-100 border-0 bg-light text-dark text-start p-4">
                <i className="bi bi-code-slash fs-1 text-success mb-4" aria-hidden="true"></i>
                <Card.Title className="fw-bold">Développement web</Card.Title>
                <Card.Text className="text-secondary mb-0">
                  Des applications rapides et évolutives avec des technologies
                  modernes et des composants réutilisables.
                </Card.Text>
              </Card>
            </Col>
            <Col lg={3} md={6} xs={12}>
              <Card className="h-100 border-0 bg-light text-dark text-start p-4">
                <i className="bi bi-phone fs-1 text-success mb-4" aria-hidden="true"></i>
                <Card.Title className="fw-bold">Responsive design</Card.Title>
                <Card.Text className="text-secondary mb-0">
                  Une navigation fluide et une mise en page adaptée aux mobiles,
                  tablettes et ordinateurs
                </Card.Text>
              </Card>
            </Col>
            <Col lg={3} md={6} xs={12}>
              <Card className="h-100 border-0 bg-light text-dark text-start p-4">
                <i className="bi bi-graph-up-arrow fs-1 text-success mb-4" aria-hidden="true"></i>
                <Card.Title className="fw-bold">Performance & SEO</Card.Title>
                <Card.Text className="text-secondary mb-0">
                  Des bases solides pour améliorer la vitesse, la visibilité et
                  les résultats de votre site.
                </Card.Text>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
}
