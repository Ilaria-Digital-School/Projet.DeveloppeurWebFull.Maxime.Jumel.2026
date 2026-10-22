import { Card, Col, Container, Row } from "react-bootstrap";

export interface ContactInfoItem {
  icon: string;
  title: string;
  text: string;
  href?: string;
  linkLabel?: string;
}

const defaultItems: ContactInfoItem[] = [
  {
    icon: "bi-geo-alt-fill",
    title: "Headquarters",
    text: "27 Division St, 77120 Coulommiers, France",
    href: "https://www.google.com/maps/search/?api=1&query=27+Division+St+77120+Coulommiers",
    linkLabel: "Get directions",
  },
  {
    icon: "bi-envelope-heart",
    title: "Email support",
    text: "contact-me@souflyhub.fr",
    href: "mailto:contact-me@souflyhub.fr",
  },
  {
    icon: "bi-phone-fill",
    title: "Phone",
    text: "+33 6 47 49 75 28",
    href: "tel:+33647497528",
  },
];

type ContactInfoCardsProps = {
  items?: ContactInfoItem[];
};

export default function ContactInfoCards({
  items = defaultItems,
}: ContactInfoCardsProps) {
  return (
    <section>
      <Container className="my-5">
        <Row>
          {items.map((item) => (
            <Col key={item.title} xs={12} md={4} className="mb-5 text-start">
              <Card className="border-0 rounded-4 p-5 mx-auto w-75 h-100">
                <i className={`bi ${item.icon} fs-1`} aria-hidden="true" />
                <h2 className="h3">{item.title}</h2>
                {item.linkLabel ? (
                  <>
                    <p>{item.text}</p>
                    <span>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.linkLabel}
                      </a>
                      <i
                        className="bi bi-arrow-right ms-2 mb-0"
                        aria-hidden="true"
                      />
                    </span>
                  </>
                ) : (
                  <a href={item.href} className="text-body text-decoration-none">
                    {item.text}
                  </a>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}
