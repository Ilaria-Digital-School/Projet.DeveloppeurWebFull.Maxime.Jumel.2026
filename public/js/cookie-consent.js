(() => {
    const banner = document.getElementById("cookie-consent-banner");
    if (!banner) return;

    const media = document.getElementById("cookie-media");
    const details = document.getElementById("cookie-details");
    let currentMedia = false;

    const loadEmbeds = () => {
        document.querySelectorAll("[data-embed-src]").forEach((box) => {
            const frame = document.createElement("iframe");
            frame.src = box.dataset.embedSrc;
            frame.title = box.dataset.embedTitle || "Contenu embarqué";
            frame.loading = "lazy";
            frame.allowFullscreen = true;
            if (box.dataset.embedAllow) frame.allow = box.dataset.embedAllow;
            frame.referrerPolicy = "strict-origin-when-cross-origin";
            frame.style.cssText = "width:100%;height:100%;min-height:" + (box.dataset.embedRatio ? "0" : "25rem") + ";border:0;";
            if (box.dataset.embedRatio) frame.style.aspectRatio = box.dataset.embedRatio;
            box.replaceWith(frame);
        });
    };

    const openBanner = () => {
        media.checked = currentMedia;
        banner.hidden = false;
        document.getElementById("cookie-reject").focus();
    };

    const loadConsent = async () => {
        try {
            const response = await fetch("/api/cookies/consent", {
                headers: { Accept: "application/json" },
                credentials: "same-origin"
            });
            if (!response.ok) throw new Error("Impossible de vérifier le consentement.");
            const result = await response.json();
            currentMedia = result.consent?.media === true;
            if (currentMedia) loadEmbeds();
            if (!result.valid) openBanner();
        } catch (error) {
            console.error("Erreur validation cookies:", error);
            openBanner();
        }
    };

    const saveConsent = async (mediaChoice) => {
        const response = await fetch("/api/cookies/consent", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ consent: { media: mediaChoice } })
        });
        if (!response.ok) throw new Error("Le consentement n'a pas pu être enregistré.");
        const hadMedia = currentMedia;
        currentMedia = mediaChoice;
        banner.hidden = true;
        if (mediaChoice) loadEmbeds();
        else if (hadMedia) window.location.reload();
    };

    const handle = (mediaChoice) => () =>
        saveConsent(mediaChoice).catch((error) => console.error("Erreur enregistrement cookies:", error));

    document.getElementById("cookie-reject").addEventListener("click", handle(false));
    document.getElementById("cookie-accept").addEventListener("click", handle(true));
    document.getElementById("cookie-save").addEventListener("click", () => handle(media.checked)());

    document.addEventListener("click", (event) => {
        if (event.target.closest("[data-cookie-settings]")) {
            event.preventDefault();
            details.open = true;
            openBanner();
        }
        if (event.target.closest("[data-embed-accept]")) {
            handle(true)();
        }
    });

    loadConsent();
})();
