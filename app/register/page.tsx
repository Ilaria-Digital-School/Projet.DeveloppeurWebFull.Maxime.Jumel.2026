"use client";

import * as React from "react";
import Link from "next/link";
import { Container, Row, Col } from "react-bootstrap";
import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle, Lock, Mail, User } from "lucide-react";
import { Alert } from "@/components/ui/alert";
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

type FormStatus = "idle" | "loading" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export default function RegisterPage() {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [status, setStatus] = React.useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");

  const isLoading = status === "loading";

  function fail(message: string) {
    setStatus("error");
    setErrorMessage(message);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (fullName.trim().length < 2) {
      fail("Veuillez indiquer votre nom complet.");
      return;
    }

    if (!EMAIL_PATTERN.test(email)) {
      fail("Veuillez saisir une adresse e-mail valide.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      fail(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
      return;
    }

    if (password !== confirmPassword) {
      fail("Les deux mots de passe ne correspondent pas.");
      return;
    }

    if (!acceptedTerms) {
      fail("Vous devez accepter les conditions d'utilisation pour continuer.");
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
            <Col md={7} lg={6} xl={5} className="d-flex flex-column justify-content-center">
              <Card className="w-100">
                <CardHeader>
                  <CardTitle className="fs-4">Créer un compte</CardTitle>
                  <CardDescription>
                    Créez votre compte pour accéder à votre espace et suivre vos projets.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} noValidate className="d-flex flex-column gap-3">
                    <div className="d-grid gap-2">
                      <Label htmlFor="register-name">Nom complet</Label>
                      <div className="position-relative">
                        <User
                          aria-hidden="true"
                          className="position-absolute top-50 translate-middle-y ms-3 text-body-secondary"
                          style={{ width: "1rem", height: "1rem", left: 0 }}
                        />
                        <Input
                          id="register-name"
                          type="text"
                          autoComplete="name"
                          placeholder="Jean Dupont"
                          value={fullName}
                          onChange={(event) => setFullName(event.target.value)}
                          disabled={isLoading}
                          required
                          className="ps-5"
                        />
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <Label htmlFor="register-email">Email</Label>
                      <div className="position-relative">
                        <Mail
                          aria-hidden="true"
                          className="position-absolute top-50 translate-middle-y ms-3 text-body-secondary"
                          style={{ width: "1rem", height: "1rem", left: 0 }}
                        />
                        <Input
                          id="register-email"
                          type="email"
                          autoComplete="email"
                          placeholder="m@example.com"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          disabled={isLoading}
                          required
                          className="ps-5"
                        />
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <Label htmlFor="register-password">Mot de passe</Label>
                      <div className="position-relative">
                        <Lock
                          aria-hidden="true"
                          className="position-absolute top-50 translate-middle-y ms-3 text-body-secondary"
                          style={{ width: "1rem", height: "1rem", left: 0 }}
                        />
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          disabled={isLoading}
                          required
                          aria-describedby="register-password-hint"
                          className="ps-5 pe-5"
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
                      <p id="register-password-hint" className="mb-0 small text-body-secondary">
                        {MIN_PASSWORD_LENGTH} caractères minimum.
                      </p>
                    </div>

                    <div className="d-grid gap-2">
                      <Label htmlFor="register-confirm">Confirmer le mot de passe</Label>
                      <div className="position-relative">
                        <Lock
                          aria-hidden="true"
                          className="position-absolute top-50 translate-middle-y ms-3 text-body-secondary"
                          style={{ width: "1rem", height: "1rem", left: 0 }}
                        />
                        <Input
                          id="register-confirm"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          disabled={isLoading}
                          required
                          className="ps-5"
                          aria-invalid={
                            confirmPassword.length > 0 && confirmPassword !== password
                          }
                        />
                      </div>
                    </div>

                    <div className="form-check">
                      <input
                        id="register-terms"
                        type="checkbox"
                        className="form-check-input"
                        style={{ width: "1.15em", height: "1.15em", marginTop: "0.2em" }}
                        checked={acceptedTerms}
                        onChange={(event) => setAcceptedTerms(event.target.checked)}
                        disabled={isLoading}
                      />
                      <label className="form-check-label small" htmlFor="register-terms">
                        J&apos;accepte les conditions d&apos;utilisation et la politique de
                        confidentialité.
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
                          Création…
                        </>
                      ) : (
                        <>
                          Créer mon compte
                          <ArrowRight aria-hidden="true" style={{ width: "1rem", height: "1rem" }} />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>

                <CardFooter className="flex-col gap-2">
                  <p className="mb-0 text-center small text-body-secondary">
                    Vous avez déjà un compte ?{" "}
                    <Link href="/login" className="text-decoration-none fw-medium">
                      Se connecter
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
