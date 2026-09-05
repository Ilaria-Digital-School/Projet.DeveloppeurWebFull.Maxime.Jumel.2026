"use client";

import Link from "next/link";
import { Container, Nav, Navbar } from "react-bootstrap";

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
    </>
  );
}