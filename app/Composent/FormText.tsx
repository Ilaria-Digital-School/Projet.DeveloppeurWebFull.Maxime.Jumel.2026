"use client";

import { motion, type Variants } from "framer-motion";
import type { CSSProperties, FormEvent } from "react";
import Link from "next/link";

type FormTextProps = {
  text?: string;
  style?: CSSProperties;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.025, delayChildren: 0.04 },
  },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function FormText({
  text = "Get valuable strategy, culture and brand insights straight to your inbox",
  style,
}: FormTextProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <>
      <form className="text-body" style={style} onSubmit={handleSubmit}>
        <motion.h2
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          aria-label={text}
          className="fw-bold fs-2 mb-4 text-body"
        >
          {Array.from(text).map((character, index) => (
            <motion.span
              key={`${character}-${index}`}
              variants={childVariants}
              style={{ display: "inline-block" }}
              aria-hidden="true"
            >
              {character === " " ? "\u00a0" : character}
            </motion.span>
          ))}
        </motion.h2>

        <div className="d-flex align-items-center border-bottom border-secondary pb-1">
          <label className="visually-hidden" htmlFor="newsletter-email">
            Votre adresse email
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            placeholder="Your email here"
            autoComplete="email"
            required
            className="form-control bg-transparent text-body border-0 rounded-0 px-0 shadow-none"
          />
          <button
            type="submit"
            className="btn border-0 rounded-0 fs-4 lh-1 px-2 text-body d-flex align-items-center"
            aria-label={"S'inscrire \u00e0 la newsletter"}
          >
            <i className="bi bi-arrow-up-right" aria-hidden="true" />
          </button>
        </div>

        <p className="fw-bold mt-4 mb-0 text-body-secondary">
          By signing up to receive emails from Motto, you agree to our{" "}
          <Link href="/privacy" className="text-body text-decoration-underline">
            Privacy Policy
          </Link>
          . We treat your info responsibly.
        </p>
      </form>

      <section className="text-body mt-5" style={style}>
        <h5 className="fw-bold mt-5 mb-0 text-body">Contact Us</h5>
        <address className="fst-normal fw-bold mt-2 mb-5 d-block text-body-secondary">
          <strong>15 rue de la Paix</strong>
          <br />
          <strong>75002 Paris</strong>
          <br />
          <a
            href="mailto:contact-me@souflyhub.fr"
            className="text-body text-decoration-none"
          >
            contact-me@souflyhub.fr
          </a>
        </address>
      </section>
    </>
  );
}