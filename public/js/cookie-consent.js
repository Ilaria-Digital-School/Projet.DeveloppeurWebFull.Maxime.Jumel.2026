(() => {
    const banner = document.getElementById("cookie-consent-banner");
    if (!banner) return;

    const preferences = document.getElementById("cookie-preferences");
    const analytics = document.getElementById("cookie-analytics");
    const marketing = document.getElementById("cookie-marketing");

    const showBanner = (consent) => {
        preferences.checked = consent?.preferences === true;
        analytics.checked = consent?.analytics === true;
        marketing.checked = consent?.marketing === true;
        banner.hidden = false;
    };

    const loadConsent = async () => {
        try {
            const response = await fetch("/api/cookies/consent", {
                headers: { Accept: "application/json" },
                credentials: "same-origin"
            });
            if (!response.ok) throw new Error("Impossible de vérifier le consentement.");
            const result = await response.json();
            if (!result.valid) showBanner(result.consent);
        } catch (error) {
            console.error("Erreur validation cookies:", error);
            showBanner({ necessary: true, preferences: false, analytics: false, marketing: false });
        }
    };

    const saveConsent = async (optionalCategories) => {
        const response = await fetch("/api/cookies/consent", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ consent: { ...optionalCategories } })
        });
        if (!response.ok) throw new Error("Le consentement n'a pas pu être enregistré.");
        banner.hidden = true;
    };

    document.getElementById("cookie-reject").addEventListener("click", () => {
        saveConsent({ preferences: false, analytics: false, marketing: false })
            .catch((error) => console.error("Erreur enregistrement cookies:", error));
    });
    document.getElementById("cookie-accept").addEventListener("click", () => {
        saveConsent({
            preferences: preferences.checked,
            analytics: analytics.checked,
            marketing: marketing.checked
        }).catch((error) => console.error("Erreur enregistrement cookies:", error));
    });

    loadConsent();
})();
