import Link from "next/link";
import { Container, Row, Col } from "react-bootstrap";
import FormText from "./FormText";
export default function Footer() {
    return (
        <footer className="text-dark bg-light border-top mt-5 mx-auto text-center" style={{width: "100%", paddingTop: "20px", paddingBottom: "20px" }}>
        <Container fluid className="text-dark w-75">
          <Row>
            <Col md={6} lg={6} xs={12} className="text-center text-md-start mb-3 mb-md-0">
              <FormText />
            </Col>
            <Col md={6} lg={6} xs={12} className="text-center text-md-center mb-3 mb-md-0">
              <div className="text-dark">
                <h5 className="fw-bold mb-3">Links</h5>
                <ul className="list-unstyled p-3">
                  <li className="mb-2">
                    <Link href="/" className="text-dark text-decoration-none">
                      Home
                    </Link>
                  </li>
                  <li  className="mb-2">
                    <a href="/pages" className="text-dark text-decoration-none">
                      Pages
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="/portfolio" className="text-dark text-decoration-none">
                      Portfolio
                    </a>
                  </li>
                  <li className="mb-2">
                    <a href="/blog" className="text-dark text-decoration-none">
                      Blog
                    </a>
                  </li>
                  <li className="mb-2">
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
    )
}