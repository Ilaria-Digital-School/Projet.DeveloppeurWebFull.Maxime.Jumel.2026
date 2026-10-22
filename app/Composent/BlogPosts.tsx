"use client";

import { useState } from "react";
import { Button, Card, Col, Modal, Row } from "react-bootstrap";

export interface BlogPost {
  src: string;
  alt: string;
  title: string;
  text: string;
  date?: string;
  imageClassName?: string;
}

const defaultPosts: BlogPost[] = [
  {
    src: "https://www.creative-tim.com/blog/content/images/size/w960/wordpress/2017/09/mia-baker-322594.jpg",
    alt: "Illustration de Bootstrap avec logo et code",
    title: "bootstrap",
    text: "Some quick example text to build on the card title and make up the bulk of the card's content.",
  },
  {
    src: "https://up-review.co/storage/exemples-avis-positifs-demande-avis.webp",
    alt: "Illustration d'avis clients positifs et notation étoiles",
    title: "Customer Testimonials",
    text: "Customer testimonials are powerful tools for social proof that boost a company’s credibility.",
    imageClassName: "bg-black",
  },
  {
    src: "https://53.fs1.hubspotusercontent-na1.net/hubfs/53/guide-strategie-marketing-digital.png",
    alt: "Illustration marketing digital avec différents canaux",
    title: "Digital Marketing",
    text: "Today, being visible online is no longer an option, it’s a necessity. Whether you are a",
    imageClassName: "bg-black",
  },
  {
    src: "https://static.vecteezy.com/system/resources/thumbnails/027/205/828/small/web-development-and-coding-3d-illustration-of-web-development-for-website-and-mobile-website-3d-illustration-png.png",
    alt: "Illustration 3D du développement web et du codage",
    title: "Web Development",
    text: "Starting a business is a dream for many, but it requires courage, determination and preparation",
  },
  {
    src: "https://cdn.discordapp.com/assets/content/f1757c16b560072104c78c79c658fd6e0e3b989323139b4e48abe48cfdbfe1fe.png",
    alt: "Illustration sur comment héberger son site web de manière optimale",
    title: "How to host my website",
    text: "Thanks to this partner, discover the best deals on the site souflyhub.com to host your website.",
  },
];

const DEFAULT_DATE = "Published on: March 26, 2024";
const DEFAULT_CONTENT =
  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur veritatis sint dignissimos asperiores autem ipsam non facere qui error, voluptates quidem voluptas rem totam repellat quam voluptate aliquid. Harum, veniam! Consequatur numquam exercitationem vero aliquid? Molestiae inventore, cum dolor odit atque quas nesciunt aspernatur velit totam officiis eligendi iure pariatur rerum.";

type BlogPostsProps = {
  posts?: BlogPost[];
};

export default function BlogPosts({ posts = defaultPosts }: BlogPostsProps) {
  const [selected, setSelected] = useState<BlogPost | null>(null);

  return (
    <>
      <Row xs={1} sm={2} lg={3} className="g-4">
        {posts.map((post) => (
          <Col key={post.title}>
            <Card className="border-0 shadow-sm h-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.src}
                alt={post.alt}
                className={`card-img-top ${post.imageClassName ?? ""}`}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title as="h3" className="h5 fw-bold">
                  {post.title}
                </Card.Title>
                <Card.Text className="text-body-secondary flex-grow-1">
                  {post.text}
                </Card.Text>
                <Button
                  variant="primary"
                  className="fw-bold px-4 py-2 align-self-start rounded-pill"
                  onClick={() => setSelected(post)}
                >
                  Read more
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        show={selected !== null}
        onHide={() => setSelected(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">{selected?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selected.src} alt={selected.alt} className="img-fluid mb-3" />
          )}
          <p className="text-body-secondary text-end mb-3">
            {selected?.date ?? DEFAULT_DATE}
          </p>
          <p style={{ textAlign: "justify" }}>{DEFAULT_CONTENT}</p>
        </Modal.Body>
      </Modal>
    </>
  );
}
