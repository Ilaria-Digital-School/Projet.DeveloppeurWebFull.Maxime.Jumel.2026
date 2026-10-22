type BlogHeroProps = {
  title?: string;
  text?: string;
};

export default function BlogHero({
  title = "My Blog",
  text = "The articles published here are written by the founder of SoulfyDev. You can find all my latest updates, my projects and my blog posts right here. The blog was created to share my knowledge, my discoveries and my experiences with you. Whether it’s about development, infrastructure, tutorials or insights from my own experience, each article aims to offer something useful and inspiring.",
}: BlogHeroProps) {
  return (
    <div
      className="container-fluid bg-dark"
      data-bs-theme="dark"
      style={{ minHeight: "80vh", display: "flex", alignItems: "center" }}
    >
      <div className="w-100 py-5 mx-auto text-center">
        <div className="row align-items-center justify-content-center">
          <div className="col-12 col-md-6 col-lg-4 d-flex align-items-center justify-content-center">
            <h1 className="text-white fs-1 fw-bold">{title}</h1>
          </div>
          <div className="col-12 col-md-6 col-lg-8 d-flex align-items-center justify-content-center">
            <p className="text-white fs-5 text-start" style={{ maxWidth: "50rem" }}>
              {text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
