"use client";

import { Card, Container, Row, Col, Button } from "react-bootstrap";

export interface ProjectCardItem {
  src: string;
  alt: string;
  title: string;
  text: string;
}

interface ContainerComposentProps {
  items?: ProjectCardItem[];
  src?: string;
  alt?: string;
  title?: string;
  text?: string;
}

export default function ContainerComposent(props: ContainerComposentProps) {
  const cards: ProjectCardItem[] =
    props.items && props.items.length > 0
      ? props.items
      : props.src
      ? [
          {
            src: props.src,
            alt: props.alt || "",
            title: props.title || "Titre par défaut",
            text:
              props.text ||
              "Texte par défaut pour la carte. Vous pouvez remplacer ce texte par le contenu souhaité.",
          },
        ]
      : [
          {
            src: "/images/portfolio/api_rest_ai.webp",
            alt: "API REST & IA",
            title: "API REST & IA",
            text: "Développement d'une API REST intelligente connectée à des modèles IA.",
          },
          {
            src: "/images/portfolio/ecommerce_pwa.webp",
            alt: "E-Commerce PWA",
            title: "E-Commerce PWA",
            text: "Application web progressive pour la vente en ligne réactive et rapide.",
          },
          {
            src: "/images/portfolio/database_Management.webp",
            alt: "Gestion de base de données",
            title: "Database Management",
            text: "Système complet de gestion et modélisation de bases de données.",
          },
          {
            src: "/images/portfolio/security_sol.webp",
            alt: "Solutions de sécurité",
            title: "Security Solutions",
            text: "Protocoles de sécurité, gestion des identités et protection des données.",
          },
        ];

  return (
    <Container fluid className="mt-5 mb-5 px-4">
      <Row xs={1} md={2} lg={3} className="g-4">
        {cards.map((card, idx) => (
          <Col key={idx}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Img
                variant="top"
                src={card.src || "/images/Erreur/default.webp"}
                alt={card.alt}
                style={{ height: "220px", objectFit: "cover" }}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title className="fw-bold">
                  {card.title || "Titre par défaut"}
                </Card.Title>
                <Card.Text className="text-body-secondary flex-grow-1">
                  {card.text ||
                    "Texte par défaut pour la carte. Vous pouvez remplacer ce texte par le contenu souhaité."}
                </Card.Text>
                <Button
                  variant="primary"
                  className="mt-3 align-self-start"
                  data-bs-toggle="modal"
                  data-bs-target="#projectModal"
                >
                  En savoir plus
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
