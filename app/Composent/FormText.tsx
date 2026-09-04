"use client";

import { motion, type Variants } from "framer-motion";
import type { CSSProperties, FormEvent } from "react";

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
        <form className="form-text text-dark" style={style} onSubmit={handleSubmit}>
            <motion.h2
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                aria-label={text}
                className="fw-bold fs-2 mb-4"
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

            <div className="d-flex align-items-center border-bottom border-dark">
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
                    className="form-control border-0 rounded-0 px-0 shadow-none"
                />
                <button
                    type="submit"
                    className="btn border-0 rounded-0 fs-2 lh-1 px-0"
                    aria-label="S'inscrire à la newsletter"
                >
                    <span aria-hidden="true">↗</span>
                </button>
            </div>

            <p className="fw-bold mt-4 mb-0">
                By signing up to receive emails from Motto, you agree to our{" "}
                <a href="/privacy" className="text-dark">
                    Privacy Policy
                </a>
                . We treat your info responsibly.
            </p>    
        </form>
        <section className="form-text text-dark mt-5" style={style}>
            <h5 className="fw-bold mt-5 mb-0">
                Contact Us
            </h5>
            <span className="fw-bold mt-2 mb-5">
                <strong>15 rue de la Paix</strong>
                <br />
                <strong>75002 Paris</strong>
                <br />
                <a href="mailto:contact-me@souflyhub.fr" className="text-dark">
                    contact-me@souflyhub.fr
                </a>
            </span>
        </section>
        </>
   );
}