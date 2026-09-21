import Link from "next/link";
import { Container, Row, Col } from "react-bootstrap";
import FormText from "./FormText";
export default function Footer() {
    return (
        <footer className="text-body bg-body-tertiary border-top mt-5 mx-auto text-center py-4" style={{ width: "100%" }}>
        <Container fluid className="text-body w-75">
          <Row>
            <Col md={6} lg={6} xs={12} className="text-center text-md-start mb-4 mb-md-0">
              <FormText />
            </Col>
            <Col md={6} lg={6} xs={12} className="text-center text-md-center mb-3 mb-md-0">
              <div>
                <h5 className="fw-bold mb-3 text-body">Links</h5>
                <ul className="list-unstyled p-3">
                  <li className="mb-2">
                    <Link href="/" className="text-body-secondary text-decoration-none hover-link">
                      Home
                    </Link>
                  </li>
                  <li className="mb-2">
                    <a href="/pages" className="text-body-secondary text-decoration-none hover-link">
                      Pages
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="/portfolio" className="text-body-secondary text-decoration-none hover-link">
                      Portfolio
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="/blog" className="text-body-secondary text-decoration-none hover-link">
                      Blog
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="/contact" className="text-body-secondary text-decoration-none hover-link">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    )
}