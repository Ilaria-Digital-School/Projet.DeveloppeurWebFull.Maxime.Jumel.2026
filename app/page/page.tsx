"use client";

import Link from "next/link";
import { Container, Nav, Navbar, Row, Col } from "react-bootstrap";

export default function PresencePage() {
  return (
    <>
      <Navbar expand="lg" bg="body-tertiary" className="px-4 px-lg-5">
        <Container fluid>
          <Navbar.Brand
            as={Link}
            href="/"
            className="fw-bold text-dark"
            aria-label="Retour à l'accueil - SOULFYDEV"
          >
            <span className="text-success fw-bold">SOUFLY</span>DEV
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="main-navigation"
            aria-label="Ouvrir ou fermer le menu de navigation"
          />

          <Navbar.Collapse id="main-navigation">
            <Nav className="mx-auto gap-4">
              <Nav.Link as={Link} href="/" className="fw-bold">
                Home
              </Nav.Link>
              <Nav.Link
                as={Link}
                href="/page"
                active
                className="fw-bold"
                aria-current="page"
              >
                Pages
              </Nav.Link>
              <Nav.Link as={Link} href="/portfolio" className="fw-bold">
                Portfolio
              </Nav.Link>
              <Nav.Link as={Link} href="/blog" className="fw-bold">
                Blog
              </Nav.Link>
              <Nav.Link as={Link} href="/contact" className="fw-bold">
                Contact
              </Nav.Link>
            </Nav>

            <Nav>
              <Nav.Link
                as={Link}
                href="/contact?section=work"
                className="nav-cta-btn fw-bold text-white bg-dark rounded px-4 py-2"
              >
                WORKS WITH US
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <main className="min-vh-100 d-flex align-items-center justify-content-center bg-dark px-4 py-5 text-center text-white">
        <Container fluid>
          <Row className="flex-lg-row align-items-center justify-content-center">
            <Col
              lg={6}
              className="text-center justify-content-center align-items-center d-flex flex-column pe-lg-5 pe-xl-0"
            >
              <h1 className="display-4 fw-bold mb-5">
                Je suis <span className="text-warning text-decoration-underline display-4 fs-bold">souflydev</span><br />
                <strong className="text-success">Developer full stack </strong>
              </h1>
              <p className="lead text-white text-center text-spacer-1 mb-5 fs-5 fw-bold mx-auto" style={{ maxWidth: "50rem" }}>
                Je suis un développeur full-stack. Je crée des applications web
                modernes et performantes, avec des modèles réutilisables. Je
                suis passionné par le développement web et la technologie. Si
                vous avez besoin d'une solution web ou de services de
                développement, vous pouvez me contacter pour plus
                d'informations. Je développe des applications web qui peuvent
                transformer votre projet en une véritable mine d'or.
              </p>
              <Link
                href="/"
                className="btn btn-warning fw-bold px-4 py-3"
                aria-label="Contactez-moi pour vos projets web et mobile"
              >
                Contactez-moi
              </Link>
            </Col>
            <img
              src="/images/upload/souflydev.webp"
              alt="Logo Souflydev portrait"
              className="img-fluid mx-auto border border-white rounded-circle shadow-lg-sm mt-5 mt-lg-0 shadow-lg-primary"
              style={{ maxHeight: "60rem", maxWidth: "60rem", height: "60rem" }}
            />
          </Row>
        </Container>
      </main>
    </>
  );
}
