// Si une image ne charge pas, on essaie l'autre source (domaine d'assets <-> fichier local),
// puis une image de remplacement. Les événements "error" ne remontent pas :
// on les écoute en phase de capture sur le document.
(() => {
    const HOST = "https://assets.souflyhub.dev";
    const PLACEHOLDER = "/images/placeholder.svg";

    document.addEventListener("error", (event) => {
        const img = event.target;
        if (!(img instanceof HTMLImageElement)) return;

        const src = img.getAttribute("src") || "";
        const step = Number(img.dataset.fallbackStep || 0);
        if (src.endsWith(PLACEHOLDER) || step >= 2) return;

        let next = null;
        if (step === 0) {
            if (img.dataset.fallback) next = img.dataset.fallback;
            else if (src.startsWith(HOST + "/")) next = src.slice(HOST.length);
            else if (src.startsWith("/images/")) next = HOST + src;
        }
        img.dataset.fallbackStep = String(step + 1);
        img.src = next || PLACEHOLDER;
    }, true);
})();
