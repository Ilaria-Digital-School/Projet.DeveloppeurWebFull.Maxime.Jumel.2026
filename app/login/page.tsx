"use client";

import * as React from "react";
import Link from "next/link";
import { Container, Row, Col } from "react-bootstrap";
import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SiteNavbar from "../Composent/SiteNavbar";
import { Alert } from "@/components/ui/alert";

type FormStatus = "idle" | "loading" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [status, setStatus] = React.useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");

  const isLoading = status === "loading";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!EMAIL_PATTERN.test(email)) {
      setStatus("error");
      setErrorMessage("Veuillez saisir une adresse e-mail valide.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setErrorMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");
  }

  return (
    <>
      <SiteNavbar />
      
      <main className="d-flex align-items-center py-5">
        <Container fluid>
          <Row className="justify-content-center">
            <Col md={6} lg={5} xl={4} className="d-flex flex-column justify-content-center">
              <Card className="w-100">
                <CardHeader>
                  <CardTitle className="fs-4">Connexion</CardTitle>
                  <CardDescription>
                    Accédez à votre espace pour suivre vos projets.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} noValidate className="d-flex flex-column gap-3">
                    <div className="d-grid gap-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="position-relative">
                        <Mail
                          aria-hidden="true"
                          className="position-absolute top-50 translate-middle-y ms-3 text-body-secondary"
                          style={{ width: "1rem", height: "1rem", left: 0 }}
                        />
                        <Input
                          id="login-email"
                          type="email"
                          autoComplete="email"
                          placeholder="m@example.com"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          disabled={isLoading}
                          required
                          className="ps-5"
                          aria-invalid={status === "error"}
                        />
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <div className="d-flex align-items-center justify-content-between gap-2">
                        <Label htmlFor="login-password">Mot de passe</Label>
                        <Link href="/contact" className="small text-decoration-none">
                          Mot de passe oublié ?
                        </Link>
                      </div>
                      <div className="position-relative">
                        <Lock
                          aria-hidden="true"
                          className="position-absolute top-50 translate-middle-y ms-3 text-body-secondary"
                          style={{ width: "1rem", height: "1rem", left: 0 }}
                        />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          disabled={isLoading}
                          required
                          className="ps-5 pe-5"
                          aria-invalid={status === "error"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((visible) => !visible)}
                          disabled={isLoading}
                          className="btn btn-sm btn-link position-absolute top-50 translate-middle-y end-0 me-1 text-body-secondary"
                          style={{ textDecoration: "none" }}
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                          aria-pressed={showPassword}
                        >
                          {showPassword ? (
                            <EyeOff aria-hidden="true" style={{ width: "1rem", height: "1rem" }} />
                          ) : (
                            <Eye aria-hidden="true" style={{ width: "1rem", height: "1rem" }} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="form-check">
                      <input
                        id="login-remember"
                        type="checkbox"
                        className="form-check-input"
                        style={{ width: "1.15em", height: "1.15em", marginTop: "0.2em" }}
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                        disabled={isLoading}
                      />
                      <label className="form-check-label small" htmlFor="login-remember">
                        Se souvenir de moi
                      </label>
                    </div>

                    {status === "error" && (
                      <Alert variant="destructive">
                        <CircleAlert
                          aria-hidden="true"
                          style={{ width: "1rem", height: "1rem" }}
                        />
                        {errorMessage}
                      </Alert>
                    )}

                    <Button type="submit" disabled={isLoading} className="w-100">
                      {isLoading ? (
                        <>
                          <LoaderCircle
                            aria-hidden="true"
                            className="animate-spin"
                            style={{ width: "1rem", height: "1rem" }}
                          />
                          Connexion…
                        </>
                      ) : (
                        <>
                          Se connecter
                          <ArrowRight aria-hidden="true" style={{ width: "1rem", height: "1rem" }} />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>

                <CardFooter className="flex-col gap-2">
                  <Button variant="outline" className="w-100">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      style={{ width: "1rem", height: "1rem" }}
                      fill="currentColor"
                    >
                      <path d="M12.24 10.285H14.4v3.858h-2.16zm-.714 0H9.6v3.858h1.926zM8.1 18.43h2.166v-2.723H8.1zm-.714 0H5.22v-2.723h2.166zm7.254 0h2.166v-2.723h-2.166zm-.714 0H9.6v-2.723h3.24zM8.1 15.12h2.166v-2.722H8.1zm-.714 0H5.22v-2.722h2.166zm7.254 0h2.166v-2.722h-2.166zm-.714 0H9.6v-2.722h3.24zm-9.054 0h2.166V9.6H4.83zm-.714 0H2.55V9.6h1.566zm14.508 0h2.166V9.6h-2.166zm-.714 0h-1.566V9.6h1.566zM4.83 8.4h2.166V5.676H4.83zm-.714 0H2.55V5.676h1.566zm14.508 0h2.166V5.676h-2.166zm-.714 0h-1.566V5.676h1.566zM12 6.6H9.6v1.566h2.13V6.6zm0-1.044H9.6V4.5h2.13v1.056zM4.83 2.4l16.686 16.686-1.014 1.014L3.816 3.414z" />
                    </svg>
                    Se connecter avec Google
                  </Button>

                  <p className="mb-0 text-center small text-body-secondary">
                    Pas encore de compte ?{" "}
                    <Link href="/register" className="text-decoration-none fw-medium">
                      Créer un compte
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
}
