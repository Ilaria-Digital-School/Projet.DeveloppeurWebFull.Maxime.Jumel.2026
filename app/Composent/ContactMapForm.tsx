import { Col, Container, Row } from "react-bootstrap";
import ContactForm from "./ContactForm";

const MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d21020.384280924303!2d3.0712362249498333!3d48.80960407750392!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e8b0cab161e73f%3A0xc745547de035ea2c!2s77120%20Coulommiers!5e0!3m2!1sfr!2sfr!4v1781185429487!5m2!1sfr!2sfr";

export default function ContactMapForm() {
  return (
    <Container
      fluid
      as="section"
      className="py-5"
      data-bs-theme="light"
      style={{ backgroundColor: "#f2ff02", marginTop: "5rem" }}
    >
      <Row className="g-0 align-items-stretch">
        <Col xs={12} md={6} style={{ minHeight: 350 }}>
          <iframe
            title="Carte - Coulommiers"
            src={MAP_SRC}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-100 h-100 border-0"
            style={{ minHeight: 350 }}
          />
        </Col>
        <Col
          xs={12}
          md={6}
          className="d-flex flex-column justify-content-center p-4 p-md-5"
        >
          <ContactForm />
        </Col>
      </Row>
    </Container>
  );
}
