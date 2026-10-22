import { Container } from "react-bootstrap";

type ContactHeroProps = {
  title?: string;
  image?: string;
};

export default function ContactHero({
  title = "Contact Our Web and Mobile Development Team",
  image = "https://assets.souflyhub.dev/images/upload/image_contact.webp",
}: ContactHeroProps) {
  return (
    <Container fluid className="p-0">
      <div
        className="text-center mt-5"
        style={{
          backgroundImage: `url('${image}')`,
          height: "43.75rem",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <section
          className="bg-transparent mx-auto"
          style={{
            maxWidth: "37.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            textShadow: "0.125rem 0.125rem 0.25rem rgba(255, 255, 255, 0.5)",
            color: "#fff",
          }}
        >
          <h1
            className="display-4 fw-bold text-black box"
            style={{
              fontSize: "4.5rem",
              boxShadow: "#f2ff02 0.1875rem 0.1875rem 0rem 0rem",
            }}
          >
            {title}
          </h1>
        </section>
      </div>
    </Container>
  );
}
