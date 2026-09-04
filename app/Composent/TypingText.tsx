"use client";

import { motion, type Variants } from "framer-motion";
import type { CSSProperties } from "react";

type TypingTextProps = {
  text: string;
  style?: CSSProperties;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.04 },
  },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function TypingText({ text, style }: TypingTextProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={text}
      style={style}
      className="font-monospace text-center text-lg-start"
    >
      {Array.from(text).map((character, index) => (
        <motion.span
          key={`${character}-${index}`}
          variants={childVariants}
          style={{ display: "inline-block" }}
          aria-hidden="true"
          className="fw-bold text-white fs-1 fs-lg-2 fs-xl-3"
        >
          {character === " " ? "\u00a0" : character} 
          {/* This is a placeholder for the character */}
        </motion.span>
      ))}
    </motion.div>
  );
}