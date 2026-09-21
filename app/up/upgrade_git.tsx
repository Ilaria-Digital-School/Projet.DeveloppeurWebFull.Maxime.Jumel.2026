import SiteNavbar from "../Composent/SiteNavbar";
import { Col, Container, Row, Badge } from "react-bootstrap";
import type { BranchCommit, BranchInfo } from "./github";
import CommitList from "./CommitList";
import RefreshGitButton from "./RefreshGitButton";

interface DevelopmentPageProps {
  title: string;
  description: string;
  version?: number;
  tag?: string;
  branch?: string;
  /** Données live renvoyées par l'API GitHub (null si indisponible). */
  info?: BranchInfo | null;
  /** Derniers commits de la branche, du plus récent au plus ancien. */
  commits?: BranchCommit[];
  /** Durée de vie du cache serveur, en secondes. */
  cacheSeconds?: number;
}

const commitDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

export default function GitUpload({
  version,
  title,
  description,
  tag,
  branch,
  info,
  commits = [],
  cacheSeconds,
}: DevelopmentPageProps) {
  return (
    <>
      <SiteNavbar />

      {/* Hero banner */}
      <div className="bg-dark text-white py-4 border-bottom border-secondary">
        <Container>
          <Row className="align-items-center">
            <Col xs={12} md={8}>
              <small className="text-secondary text-uppercase fw-semibold letter-spacing-1">
                Templates de développement
              </small>
              <h1 className="display-5 fw-bold mt-1 mb-0">{title}</h1>
            </Col>
            <Col xs={12} md={4} className="mt-3 mt-md-0 text-md-end">
              {version !== undefined && (
                <Badge bg="primary" className="fs-6 px-3 py-2">
                  v{version}
                </Badge>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Meta bar */}
      {(branch || tag) && (
        <div className="bg-dark border-bottom border-secondary py-2">
          <Container>
            <div className="d-flex flex-wrap gap-3">
              {branch && (
                <span className="text-secondary d-flex align-items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm-2.25.75a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.492 2.492 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25z" />
                  </svg>
                  <code className="text-info">{branch}</code>
                </span>
              )}
              {tag && (
                <span className="text-secondary d-flex align-items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M6.5 0a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zM3 1.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-9z" />
                  </svg>
                  <code className="text-warning">{tag}</code>
                </span>
              )}
            </div>
          </Container>
        </div>
      )}

      {/* Main content */}
      <main
        className="min-vh-100 bg-dark text-white"
        data-bs-theme="dark"
      >
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col xs={12} lg={8}>

              {/* Description card */}
              <div className="bg-secondary bg-opacity-10 border border-secondary rounded-3 p-4 mb-4">
                <h2 className="h6 text-secondary text-uppercase fw-semibold mb-2">
                  Description
                </h2>
                <p className="text-light mb-0 fs-5 lh-base">{description}</p>
              </div>

              {/* Info grid */}
              <Row className="g-3">
                {version !== undefined && (
                  <Col xs={12} sm={4}>
                    <div className="bg-secondary bg-opacity-10 border border-secondary rounded-3 p-3 h-100">
                      <div className="text-secondary small fw-semibold mb-1">Version</div>
                      <div className="text-white fw-bold">{version}</div>
                    </div>
                  </Col>
                )}
                {branch && (
                  <Col xs={12} sm={4}>
                    <div className="bg-secondary bg-opacity-10 border border-secondary rounded-3 p-3 h-100">
                      <div className="text-secondary small fw-semibold mb-1">Branche</div>
                      <code className="text-info">{branch}</code>
                    </div>
                  </Col>
                )}
                {tag && (
                  <Col xs={12} sm={4}>
                    <div className="bg-secondary bg-opacity-10 border border-secondary rounded-3 p-3 h-100">
                      <div className="text-secondary small fw-semibold mb-1">Tag</div>
                      <code className="text-warning">{tag}</code>
                    </div>
                  </Col>
                )}
              </Row>

              {/* Dernier commit, lu en direct depuis l'API GitHub */}
              {info && (
                <div className="bg-secondary bg-opacity-10 border border-secondary rounded-3 p-4 mt-4">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                    <h2 className="h6 text-secondary text-uppercase fw-semibold mb-0">
                      Dernier commit
                    </h2>
                    <a
                      href={info.commitsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="link-info small fw-semibold text-decoration-none"
                    >
                      Historique de la branche
                    </a>
                  </div>

                  <p className="text-light fs-5 mb-3">{info.message}</p>

                  <div className="d-flex flex-wrap align-items-center gap-3 small text-secondary">
                    <a
                      href={info.commitUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="badge text-bg-dark border border-secondary font-monospace text-decoration-none"
                    >
                      {info.shortSha}
                    </a>
                    <span>
                      {info.authorName}
                      {info.authorLogin && ` (@${info.authorLogin})`}
                    </span>
                    <span>{commitDateFormatter.format(new Date(info.committedAt))}</span>
                  </div>

                  <div className="d-flex flex-wrap gap-3 small text-secondary mt-3">
                    {info.commitCount !== null && (
                      <span>
                        {info.commitCount} commit{info.commitCount > 1 ? "s" : ""} sur{" "}
                        <code className="text-info">{info.branch}</code>
                      </span>
                    )}
                    <span>
                      Dépôt{" "}
                      <a
                        href={info.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="link-info text-decoration-none"
                      >
                        {info.repo}
                      </a>
                    </span>
                  </div>
                </div>
              )}

              <CommitList
                commits={commits}
                branch={info?.branch ?? branch}
                commitsUrl={info?.commitsUrl}
              />

              {cacheSeconds !== undefined && (
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-4 small text-secondary">
                  <span>
                    Données GitHub servies par le cache du serveur
                    {cacheSeconds > 0 &&
                      ` (relecture toutes les ${Math.round(cacheSeconds / 60)} min)`}
                    .
                  </span>
                  <RefreshGitButton />
                </div>
              )}

            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
}