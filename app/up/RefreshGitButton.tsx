"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Status = "idle" | "purging" | "done" | "skipped" | "error";

interface PurgeResponse {
  meta?: { purged?: boolean };
}

/**
 * Purge le cache serveur (tag GitHub) puis relit la page : c'est le point
 * d'entrée manuel du système de cache, utile après un commit ou un push.
 */
export default function RefreshGitButton() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [isNavigating, startTransition] = useTransition();

  const purge = async () => {
    setStatus("purging");

    try {
      const response = await fetch("/api/git?refresh=1", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(String(response.status));
      }

      const payload = (await response.json()) as PurgeResponse;

      // L'API applique un délai de 30 s entre deux purges : on le reflète à l'écran
      // plutôt que d'annoncer une purge qui n'a pas eu lieu.
      setStatus(payload.meta?.purged === false ? "skipped" : "done");
      startTransition(() => router.refresh());
    } catch {
      setStatus("error");
    }

    window.setTimeout(() => setStatus("idle"), 4000);
  };

  const label = {
    idle: "Rafraîchir",
    purging: "Purge du cache…",
    done: "Cache purgé",
    skipped: "Déjà purgé récemment",
    error: "Échec de la purge",
  }[status];

  return (
    <button
      type="button"
      onClick={purge}
      disabled={status === "purging" || isNavigating}
      className={`btn btn-sm ${
        status === "error" ? "btn-outline-danger" : "btn-outline-info"
      } fw-semibold`}
      aria-live="polite"
    >
      {label}
    </button>
  );
}
