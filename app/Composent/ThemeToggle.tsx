"use client";

import { useSyncExternalStore } from "react";
import { Button } from "react-bootstrap";

function subscribe(callback: () => void) {
  window.addEventListener("theme-change", callback);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => {
    window.removeEventListener("theme-change", callback);
    media.removeEventListener("change", callback);
  };
}

function getSnapshot(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  const attr = document.documentElement.getAttribute("data-bs-theme");
  if (attr === "dark" || attr === "light") return attr;
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getServerSnapshot(): "light" | "dark" {
  return "dark";
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-bs-theme", nextTheme);
    window.dispatchEvent(new Event("theme-change"));
  };

  const isDark = theme === "dark";

  return (
    <Button
      variant={isDark ? "outline-warning" : "outline-primary"}
      size="sm"
      onClick={toggleTheme}
      className={`d-inline-flex align-items-center justify-content-center rounded-circle shadow-sm border-0 ${className}`}
      style={{
        width: "2.5rem",
        height: "2.5rem",
        backgroundColor: isDark ? "rgba(255, 193, 7, 0.15)" : "rgba(13, 110, 253, 0.15)",
        transition: "all 0.3s ease",
      }}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      {isDark ? (
        <i className="bi bi-sun-fill text-warning fs-5" aria-hidden="true" />
      ) : (
        <i className="bi bi-moon-stars-fill text-primary fs-5" aria-hidden="true" />
      )}
    </Button>
  );
}
