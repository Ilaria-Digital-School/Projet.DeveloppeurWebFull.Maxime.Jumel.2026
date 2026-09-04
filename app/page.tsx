"use client";

import TypingText from "./Composent/TypingText";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Container, Row, Col, Button } from "react-bootstrap";

function App() {
  return (
    <>
      <header className="bg-dark" data-bs-theme="dark" role="banner">
        {/* Navigation Bar */}
        <Navbar bg="dark" variant="dark" expand="lg" data-bs-theme="dark">
          <Container fluid className="px-3 px-lg-5">
            {/* Logo / Brand */}
            <Navbar.Brand
              className="fw-bold text-white fs-4"
              href="/"
              aria-label="Retour à l'accueil SOULFYDEV"
            >
              <span className="text-success fw-bold">SOUFLY</span>DEV
            </Navbar.Brand>

            {/* Bouton Hamburger Mobile */}
            <Navbar.Toggle
              aria-controls="navbarNav"
              aria-label="Ouvrir ou fermer le menu de navigation"
            />

            {/* Contenu collapsible du menu */}
            <Navbar.Collapse id="navbarNav">
              <Nav className="mx-auto gap-2 gap-lg-4 my-3 my-lg-0 text-center text-lg-start">
                <Nav.Link href="/" active className="fw-bold">
                  Home
                </Nav.Link>
                <Nav.Link href="/pages" className="fw-bold text-white-50">
                  Pages
                </Nav.Link>
                <Nav.Link href="/portfolio" className="fw-bold text-white-50">
                  Portfolio
                </Nav.Link>
                <Nav.Link href="/blog" className="fw-bold text-white-50">
                  Blog
                </Nav.Link>
                <Nav.Link href="/contact" className="fw-bold text-white-50">
                  Contact
                </Nav.Link>
              </Nav>

              {/* Menu Recherche */}
              <Nav className="text-center text-lg-start">
                <Nav.Link
                  href="#"
                  aria-label="Search"
                  className="fw-bold text-white-50"
                >
                  <i className="bi bi-search bg-dark" aria-hidden="true"></i>
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>

      <main className="content overflow-hidden">
        <section className="hero-content bg-dark text-white d-flex align-items-center">
          <Container fluid className="p-0 ps-lg-5">
            {/* Hauteur adaptée en mobile, 100vh uniquement sur desktop (lg) */}
            <Row className="align-items-center g-0 min-vh-lg-100 flex-column-reverse flex-lg-row pt-3 pt-lg-0">
              {/* Colonne Texte */}
              <Col
                lg={6}
                xs={12}
                className="px-4 py-4 py-lg-0 text-center text-lg-start"
                data-aos="fade-right"
                data-aos-delay="300"
                data-aos-duration="700"
              >
                <h1 className="fw-bold display-5 display-lg-3 mb-3">
                  We Make{" "}
                  <span className="text-secondary">Creative things</span>
                  <br className="d-none d-sm-inline" /> Everyday
                </h1>
                <p className="lead text-secondary mb-4 mx-auto mx-lg-0 col-12 col-md-10">
                  We are a digital agency that helps create immersive and
                  engaging user experiences.
                </p>
                <Button
                  variant="warning"
                  href="/contact"
                  className="text-dark fw-bold px-4 py-3 shadow"
                  role="button"
                >
                  Contactez-nous
                </Button>
              </Col>

              {/* Colonne Image (Remontée juste sous la navbar en mobile) */}
              <Col
                lg={6}
                xs={12}
                className="px-3 px-lg-0"
                data-aos="fade-left"
                data-aos-delay="300"
                data-aos-duration="700"
              >
                <div className="w-100 position-relative" style={{ minHeight: "700px", maxHeight: "900px" }}>
                  <img
                    src="/images/upload/souflydev.webp"
                    alt="SouflyDev Hero"
                    className="w-100 h-auto rounded-4 rounded-lg-start-5 rounded-lg-0"
                    style={{
                      objectFit: "cover",
                      maxHeight: "900px",
                    }}
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <section className="contact-info bg-dark mx-auto p-4 text-white m-0 justify-content-center text-center">
          <Container fluid className="p-0 px-lg-5">
            <div className="row g-0 text-center py-5 px-3 text-lg-start" style={{ maxWidth: "1000px", margin: "0 auto" }}>
              <div className="col-lg-6 col-12">
                <p className="shimmer-text">45 avenue johanes brams</p>
                <p className="shimmer-text">75017 Paris</p>
              </div>
              <div className="col-lg-6 col-12">
                <p className="shimmer-text fw-bold">01 40 00 00 42</p>
                <p className="shimmer-text fw-bold">[EMAIL_ADDRESS]</p>
              </div>
            </div>
          </Container>
        </section>
        <div className="bg-primary text-center py-5">
          <TypingText text="Développement Web" style={{ color: "white" }} />
        </div>
        
        <section className="services bg-light text-dark py-5">
          <Container fluid className="p-2 px-lg-5">
            <div className="row g-0 text-center py-5 px-5 text-lg-start">
              <div className="col-lg-6 col-12 mb-5 mb-lg-0">
                <i
                  className="bi bi-gear-fill fs-1 text-success mb-3"
                  aria-hidden="true"
                ></i>
                <h2 className="fw-bold display-6 mb-3">Développement Web</h2>
                <p className="text-secondary">
                  Nous créons des sites web modernes et performants, adaptés à
                  vos besoins et à votre image de marque.
                </p>
              </div>
              <div className="col-lg-6 col-12 mb-5 mb-lg-0">
                <i
                  className="bi bi-lightning-fill fs-1 text-success mb-3"
                  aria-hidden="true"
                ></i>
                <h2 className="fw-bold display-6 mb-3">Marketing Digital</h2>
                <p className="text-secondary">
                  Nous offrons une large gamme de services pour vous aider à
                  atteindre vos objectifs.
                </p>
              </div>
              <div className="col-lg-6 col-12 mb-5 mb-lg-0">
                <i
                  className="bi bi-people-fill fs-1 text-success mb-5"
                  aria-hidden="true"
                ></i>
                <h2 className="fw-bold display-6 mb-3">
                  Nos Seo optimisées avec analytics
                </h2>
                <p className="text-secondary">
                  Nos stratégies de référencement naturel sont conçues pour
                  améliorer votre visibilité en ligne et attirer plus de
                  visiteurs qualifiés.
                </p>
              </div>
              <div className="col-lg-6 col-12 mb-5 mb-lg-0">
                <i
                  className="bi bi-people-fill fs-1 text-success mb-3"
                  aria-hidden="true"
                ></i>
                <h2 className="fw-bold display-6 mb-3">Security</h2>
                <p className="text-secondary">
                  Nous mettons en place des mesures de sécurité robustes pour
                  protéger vos données et votre infrastructure.
                </p>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}

export default App;
