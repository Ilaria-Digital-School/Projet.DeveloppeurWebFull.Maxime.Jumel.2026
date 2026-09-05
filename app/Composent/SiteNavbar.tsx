"use client";

import Link from "next/link";
import { Container, Nav, Navbar } from "react-bootstrap";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/pages", label: "Pages" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function SiteNavbar() {
  const pathname = usePathname();

  return (
    <header className="bg-dark" data-bs-theme="dark" role="banner">
      <Navbar
        bg="dark"
        variant="dark"
        expand="lg"
        data-bs-theme="dark"
        className="site-navbar"
      >
        <Container fluid className="px-3 px-lg-5">
          <Navbar.Brand
            as={Link}
            href="/"
            className="fw-bold text-white fs-4"
            aria-label="Retour à l'accueil SOULFYDEV"
          >
            <span className="text-success fw-bold">SOUFLY</span>DEV
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="main-navigation"
            aria-label="Ouvrir ou fermer le menu de navigation"
          />

          <Navbar.Collapse id="main-navigation">
            <Nav className="mx-auto gap-2 gap-lg-4 my-3 my-lg-0 text-center text-lg-start">
              {navigation.map(({ href, label }) => {
                const isActive =
                  href === "/" ? pathname === "/" : pathname.startsWith(href);

                return (
                  <Nav.Link
                    key={href}
                    as={Link}
                    href={href}
                    active={isActive}
                    aria-current={isActive ? "page" : undefined}
                    className="fw-bold site-nav-link"
                  >
                    {label}
                  </Nav.Link>
                );
              })}
            </Nav>

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
  );
}
