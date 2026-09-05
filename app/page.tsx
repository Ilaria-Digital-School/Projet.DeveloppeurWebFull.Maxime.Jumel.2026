"use client";

import TypingText from "./Composent/TypingText";
import FormText from "./Composent/FormText";
import Image from "next/image";
import Link from "next/link";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  ProgressBar,
  Carousel,
} from "react-bootstrap";

function App() {
  return (
    <>
      <header className="bg-dark" data-bs-theme="dark" role="banner">
        {/* Navigation Bar */}
        <Navbar
          bg="dark"
          variant="dark"
          expand="lg"
          data-bs-theme="dark"
          className="site-navbar"
        >
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
                <Nav.Link href="/" active className="fw-bold site-nav-link">
                  Home
                </Nav.Link>
                <Nav.Link href="/pages" className="fw-bold site-nav-link">
                  Pages
                </Nav.Link>
                <Nav.Link href="/portfolio" className="fw-bold site-nav-link">
                  Portfolio
                </Nav.Link>
                <Nav.Link href="/blog" className="fw-bold site-nav-link">
                  Blog
                </Nav.Link>
                <Nav.Link href="/contact" className="fw-bold site-nav-link">
                  Contact
                </Nav.Link>
              </Nav>

              {/* Menu Recherche */}
              <Nav className="text-center text-lg-start">
                <Nav.Link
                  href="#"
                  aria-label="Search"
                  className="fw-bold site-nav-link site-search-link"
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
                md={6}
                className="order-2 order-lg-1 px-4 py-4 py-lg-0 text-center text-lg-start"
                data-aos="fade-right"
                data-aos-delay="300"
                data-aos-duration="700"
              >
                <h1 className="fw-bold display-5 display-lg-3 mb-3 fs-lg-1">
                  We Make{" "}
                  <span className="text-warning">Creative things</span>
                  <br className="d-none d-sm-inline" /> Everyday
                </h1>
                <p className="lead mb-4 mx-auto mx-lg-0 col-12 col-md-10">
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
                md={6}
                className="order-1 order-lg-2 px-3 px-lg-0 text-center text-lg-end"
                data-aos="fade-left"
                data-aos-delay="300"
                data-aos-duration="700"
              >
                <div
                  className="w-100 position-relative"
                  style={{ minHeight: "500px" }}
                >
                  <Image
                    src="/images/upload/souflydev.webp"
                    alt="SouflyDev Hero"
                    width={500}
                    height={500}
                    priority
                    className="rounded-4 rounded-lg-start-5 rounded-lg-0"
                    style={{
                      objectFit: "cover",
                      display: "block",
                      width: "100%",
                      maxWidth: "50rem",
                      height: "auto",
                      marginLeft: "auto",
                      marginRight: 0,
                    }}
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <section className="contact-info bg-dark mx-auto p-4 text-white m-0 justify-content-center text-center">
          <Container fluid className="p-0 px-lg-5">
            <div
              className="row g-0 text-center py-5 px-3 text-lg-start"
              style={{ maxWidth: "1000px", margin: "0 auto" }}
            >
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
          <TypingText text="Développement Web " style={{ color: "white" }} />
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
        <Container
          fluid
          className="py-5 mb-5 mx-auto"
          style={{
            backgroundColor: "#eaff00",
            borderRadius: "2px",
            top: "20px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Row className="g-0 text-center py-5 px-3 text-lg-start">
            <Col lg={6} xs={12}>
              <Image
                src="/images/upload/souflydev.webp"
                alt="Image reference a la photo de profile a souflydev"
                width={900}
                height={900}
                style={{
                  width: "70%",
                  height: "auto",
                  justifyContent: "center",
                  display: "block",
                  margin: "0 auto",
                }}
              />
            </Col>
            <Col lg={6} xs={12}>
              <h2 className="fw-bold display-6 mb-3 text-center fw-bold">
                À propos de nous
              </h2>
              <p
                className="text-secondary mb-3 text-center fw-bold mx-auto my-4"
                style={{ maxWidth: "600px" }}
              >
                Nous sommes une équipe passionnée par le développement web et le
                marketing digital. Notre objectif est de fournir des solutions
                innovantes et efficaces pour aider nos clients à réussir en
                ligne.
              </p>
              <p className="text-secondary mb-3 text-center fw-bold">
                Nous croyons en l&apos;importance de la collaboration et de la
                communication avec nos clients pour comprendre leurs besoins et
                créer des solutions sur mesure.
              </p>
              <div className="d-flex flex-column  gap-2 mt-5">
                <span className="text-secondary mb-5 gap-1">
                  <strong>Compétences :</strong> Développement Web
                  <ProgressBar variant="dark" now={80} />
                </span>
                <span className="text-secondary mb-5 gap-1">
                  <strong>Compétences :</strong> Seo Optimisation AI
                  <ProgressBar variant="dark" now={86} />
                </span>
                <span className="text-secondary mb-5 gap-1">
                  <strong>Compétences :</strong> Marketing Digital
                  <ProgressBar variant="dark" now={75} />
                </span>
                <span className="text-secondary mb-5 gap-1">
                  <strong>Compétences :</strong> Security
                  <ProgressBar variant="dark" now={90} />
                </span>
              </div>
            </Col>
          </Row>
        </Container>
        <Container>
          <div className="text-center">
            <h2 className="fw-bold display-6 mb-3 text-center fw-bold mt-5 mb-5">
              Nos Discover our selected projects
            </h2>
          </div>
          <div
            className="text-center mb-5"
            style={{
              maxWidth: "50rem",
              margin: "0 auto",
              captionSide: "bottom",
            }}
          >
            <Container fluid>
              <Carousel>
                <Carousel.Item>
                  <Carousel.Caption>
                    <h5 className="text-center text-light fw-bold ">
                      Creation de AI assistant chatbot
                    </h5>
                    <p className="text-center text-light">
                      Pour une meilleure expérience utilisateur.
                    </p>
                  </Carousel.Caption>
                  <Image
                    className="d-block w-100"
                    src="/images/projet/menu/projet_1.webp"
                    alt="Project 1"
                    width={800}
                    height={450}
                  />
                </Carousel.Item>
                <Carousel.Item>
                  <Carousel.Caption>
                    <h5 className="text-center">
                      Seo de vente de produits alimentaires
                    </h5>
                    <p>Boutique en ligne pour la vente de Bonbon.</p>
                  </Carousel.Caption>
                  <Image
                    className="d-block w-100"
                    src="/images/projet/menu/projet_2.webp"
                    alt="Project 2"
                    width={800}
                    height={450}
                  />
                </Carousel.Item>
                <Carousel.Item>
                  <Carousel.Caption>
                    <h5 className="text-center text-dark">
                      Vente de produits de livre pour artistes
                    </h5>
                    <p className="text-center text-dark">
                      Boutique en ligne pour la vente de livres pour artistes.
                    </p>
                  </Carousel.Caption>
                  <Image
                    className="d-block w-100"
                    src="/images/projet/menu/projet_3.webp"
                    alt="Project 3"
                    width={800}
                    height={450}
                  />
                </Carousel.Item>
              </Carousel>
            </Container>
          </div>
        </Container>

        <Container className="text-white py-5">
          <div className="border-top border-2 border-light py-4 py-md-5">
            <Row className="align-items-center text-center text-md-start gy-3">
              <Col className="col-12 col-md-2">
                <h3 className="text-dark mb-0">2024</h3>
              </Col>
              <Col className="col-12 col-md-8">
                <h4 className="fw-bold display-6 mb-2 text-dark ">
                  The Blue Design twitter
                </h4>
                <p className="fw-bold text-dark mb-0">
                  We bring to life the most complex projects, specialize
                </p>
              </Col>
              <Col className="col-12 col-md-2">
                <p className="text-dark mb-0">DEVELOPER</p>
              </Col>
            </Row>
          </div>
          <div className="border-top border-2 border-light py-4 py-md-5">
            <Row className="align-items-center text-center text-md-start gy-3">
              <Col className="col-12 col-md-2">
                <h3 className="text-dark mb-0">2022</h3>
              </Col>
              <Col className="col-12 col-md-8">
                <h4 className="fw-bold display-6 mb-2 text-dark ">
                  The Blue Design Google
                </h4>
                <p className="fw-bold text-dark mb-0">
                  We bring to life the most complex projects, specialize
                </p>
              </Col>
              <Col className="col-12 col-md-2">
                <p className="text-dark mb-0">CREATIVE DIRECTOR</p>
              </Col>
            </Row>
          </div>
          <div className="border-top border-2 border-light py-4 py-md-5">
            <Row className="align-items-center text-center text-md-start gy-3">
              <Col className="col-12 col-md-2">
                <h3 className="text-dark mb-0">2019</h3>
              </Col>
              <Col className="col-12 col-md-8">
                <h4 className="fw-bold display-6 mb-2 text-dark ">
                  The Blue Design Jurry
                </h4>
                <p className="fw-bold text-dark mb-0">
                  We bring to life the most complex projects, specialize
                </p>
              </Col>
              <Col className="col-12 col-md-2">
                <p className="text-dark mb-0">ANIMATOR</p>
              </Col>
            </Row>
          </div>
          <div className="border-top border-2 border-light py-4 py-md-5">
            <Row className="align-items-center text-center text-md-start gy-3">
              <Col className="col-12 col-md-2">
                <h3 className="text-dark mb-0">2017</h3>
              </Col>
              <Col className="col-12 col-md-8">
                <h4 className="fw-bold display-6 mb-2 text-dark ">
                  The Blue Design Awards
                </h4>
                <p className="fw-bold text-dark mb-0">
                  We bring to life the most complex projects, specialize
                </p>
              </Col>
              <Col className="col-12 col-md-2">
                <p className="text-dark mb-0">ANIMATOR</p>
              </Col>
            </Row>
          </div>
        </Container>
        <Container>
          <div
            className="container mx-auto align-items-center justify-content-center d-flex mb-5"
            style={{ maxWidth: "800px", height: "450px" }}
          >
            <iframe
              width="798"
              height="449"
              src="https://www.youtube.com/embed/hm7XoVN2tYU"
              title="Le Vent Est Grand ( Aze Max )"
              allow="
          accelerometer;
          autoplay;
          clipboard-write;
          encrypted-media;
          gyroscope;
          picture-in-picture;
          web-share;
        "
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </Container>
        <Container className="text-dark py-5 text-center">
          <h2 className="fw-bold display-6 mb-3 text-center fw-bold mt-5 mb-5">
            Read Our Articles And news
          </h2>
          <Row className="g-0 text-center py-5 px-3 text-lg-start justify-content-center gap-4">
            <Col lg={3} xs={12} md={6} className="mb-5 mb-lg-0">
              <article>
                <Card
                  className="card"
                  style={{ maxWidth: "20rem", minHeight: "20rem" }}
                >
                  <Image
                    src="/images/projet/projet_menu/reload.webp"
                    className="img-fluid"
                    alt="Visuel graphique bleu et blanc pour un projet créatif"
                    width={320}
                    height={320}
                  />
                  <div
                    className="card-body d-flex flex-column position-absolute bottom-0 start-0 end-0 p-4 bg-black bg-opacity-75 text-white"
                    style={{
                      top: 0,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div className="d-flex">
                      <span className="badge mb-2">March 26 2024</span>
                      <span className="badge mb-2">Branding</span>
                    </div>

                    <h3 className="card-title h5 fw-bold start-0">
                      Artificial Intelligence
                    </h3>
                    <p className="card-text">
                      Our artificial intelligence experts will support you in
                      the digital transformation of your business.
                    </p>
                    <a
                      href="#"
                      className="btn start-0 d-block display-6 border-1 border-light text-white"
                      aria-label="Lire l'article : Intelligence Artificielle"
                      data-bs-toggle="modal"
                      data-bs-target="#articleModal"
                    >
                      Read Article
                    </a>
                  </div>
                </Card>
              </article>
            </Col>
            <Col lg={3} xs={12} md={6} className="mb-5 mb-lg-0">
              <article>
                <Card
                  className="card"
                  style={{ maxWidth: "20rem", minHeight: "20rem" }}
                >
                  <Image
                    src="/images/projet/projet_menu/reload.webp"
                    className="img-fluid"
                    alt="Visuel graphique bleu et blanc pour un projet créatif"
                    width={320}
                    height={320}
                  />
                  <div
                    className="card-body d-flex flex-column position-absolute bottom-0 start-0 end-0 p-4 bg-black bg-opacity-75 text-white"
                    style={{
                      top: 0,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div className="d-flex">
                      <span className="badge mb-2">March 26 2024</span>
                      <span className="badge mb-2">Branding</span>
                    </div>

                    <h3 className="card-title h5 fw-bold start-0">
                      Artificial Intelligence
                    </h3>
                    <p className="card-text">
                      Our artificial intelligence experts will support you in
                      the digital transformation of your business.
                    </p>
                    <a
                      href="#"
                      className="btn start-0 d-block display-6 border-1 border-light text-white"
                      aria-label="Lire l'article : Intelligence Artificielle"
                      data-bs-toggle="modal"
                      data-bs-target="#articleModal"
                    >
                      Read Article
                    </a>
                  </div>
                </Card>
              </article>
            </Col>
            <Col lg={3} xs={12} md={6} className="mb-5 mb-lg-0">
              <article>
                <Card
                  className="card"
                  style={{ maxWidth: "20rem", minHeight: "20rem" }}
                >
                  <Image
                    src="/images/projet/projet_menu/reload.webp"
                    className="img-fluid"
                    alt="Visuel graphique bleu et blanc pour un projet créatif"
                    width={320}
                    height={320}
                  />
                  <div
                    className="card-body d-flex flex-column position-absolute bottom-0 start-0 end-0 p-4 bg-black bg-opacity-75 text-white"
                    style={{
                      top: 0,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div className="d-flex">
                      <span className="badge mb-2">March 26 2024</span>
                      <span className="badge mb-2">Branding</span>
                    </div>

                    <h3 className="card-title h5 fw-bold start-0">
                      Artificial Intelligence
                    </h3>
                    <p className="card-text">
                      Our artificial intelligence experts will support you in
                      the digital transformation of your business.
                    </p>
                    <a
                      href="#"
                      className="btn start-0 d-block display-6 border-1 border-light text-white"
                      aria-label="Lire l'article : Intelligence Artificielle"
                      data-bs-toggle="modal"
                      data-bs-target="#articleModal"
                    >
                      Read Article
                    </a>
                  </div>
                </Card>
              </article>
            </Col>
          </Row>
        </Container>
        <Container>
          <Row>
            <Col lg={3} xs={12} md={6}  className="text-center py-1">
              <div className="bg-light text-center py-1 px-5 rounded-4">
                    <Image src="/images/logo/logo_0.webp" alt="Image de logo d'entreprise partenaire" width={240} height={100} />
              </div>
            </Col>
            <Col lg={3} xs={12} md={6}  className="text-center py-1">
              <div className="bg-light text-center py-1 px-5 rounded-4">
                    <Image src="/images/logo/logo_1.webp" alt="Deuxième image de logo d'entreprise partenaire" width={240} height={100} />
              </div>
            </Col>
            <Col lg={3} xs={12} md={6}  className="text-center py-1">
              <div className="bg-light text-center py-1 px-5 rounded-4">
                    <Image src="/images/logo/logo_2.webp" alt="Troisième image de logo d'entreprise partenaire" width={240} height={100} />
              </div>
            </Col>
            <Col lg={3} xs={12} md={6}  className="text-center py-1">
              <div className="bg-light text-center py-1 px-5 rounded-4">
                    <Image src="/images/logo/logo_3.webp" alt="Quatrième image de logo d'entreprise partenaire" width={240} height={100} />
              </div>
            </Col>
            <Col lg={3} xs={12} md={6}  className="text-center py-1">
              <div className="bg-light text-center py-1 px-5 rounded-4">
                    <Image src="/images/logo/logo_4.webp" alt="Cinquième image de logo d'entreprise partenaire" width={240} height={100} />
              </div>
            </Col>
            <Col lg={3} xs={12} md={6}  className="text-center py-1">
              <div className="bg-light text-center py-1 px-5 rounded-4">
                    <Image src="/images/logo/logo_5.webp" alt="Sixième image de logo d'entreprise partenaire" width={240} height={100} />
              </div>
            </Col>
            <Col lg={3} xs={12} md={6}  className="text-center py-1">
              <div className="bg-light text-center py-1 px-5 rounded-4">
                    <Image src="/images/logo/logo_6.webp" alt="Septième image de logo d'entreprise partenaire" width={240} height={100} />
              </div>
            </Col>
            <Col lg={3} xs={12} md={6}  className="text-center py-1">
              <div className="bg-light text-center py-1 px-5 rounded-4">
                    <Image src="/images/logo/logo_7.webp" alt="Huitième image de logo d'entreprise partenaire" width={240} height={100} />
              </div>
            </Col>
          </Row>
        </Container>
        <Container fluid className="bg-warning text-white py-5 text-center mt-5" style={{ maxWidth: "100%", height: "35rem" }}>
          <h2 className="fw-blod display-3 mb-3 text-center fw-bold mt-5 mb-5">
            Lets Create Something Great
          </h2>
          <p className="fw-bold mb-0 text-center fw-bold mt-5 mb-5 text-dark fs-4">
            We shift you from today&apos;s challenges to tomorrow&apos;s opportunities
          </p>
          <Button
                  variant="dark"
                  href="/contact"
                  className="text-white fw-bold px-4 py-3 shadow mt-5"
                  role="button"
                >
                  Contactez-nous
                </Button>
          
        </Container>
      </main>
      <footer className="text-white py-5 text-center">
        <Container fluid className="text-dark w-75">
          <Row>
            <Col md={6} lg={6} xs={12} className="text-center text-md-start mb-3 mb-md-0">
              <FormText />
            </Col>
            <Col md={6} lg={6} xs={12} className="text-center text-md-center mb-3 mb-md-0">
              <div className="text-dark">
                <h5 className="fw-bold mb-3">Links</h5>
                <ul className="list-unstyled">
                  <li>
                    <Link href="/" className="text-dark text-decoration-none">
                      Home
                    </Link>
                  </li>
                  <li>
                    <a href="/pages" className="text-dark text-decoration-none">
                      Pages
                    </a>
                  </li>
                  <li>
                    <a href="/portfolio" className="text-dark text-decoration-none">
                      Portfolio
                    </a>
                  </li>
                  <li>
                    <a href="/blog" className="text-dark text-decoration-none">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="text-dark text-decoration-none">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  );
}
                
export default App;
