const https = require("https");

const getRecaptchaConfig = () => ({
    siteKey: process.env.RECAPTCHA_SITE_KEY?.trim() || "",
    secretKey: process.env.RECAPTCHA_SECRET_KEY?.trim() || ""
});

const verifyRecaptcha = (action) => async (req, res, next) => {
    const { secretKey } = getRecaptchaConfig();
    const token = typeof req.body?.recaptchaToken === "string"
        ? req.body.recaptchaToken.trim()
        : "";

    if (!secretKey) {
        if (process.env.NODE_ENV === "production") {
            console.error("RECAPTCHA_SECRET_KEY est requis en production.");
            return res.status(503).json({
                success: false,
                message: "La protection anti-robot est momentanément indisponible."
            });
        }
        return next();
    }

    if (!token) {
        return res.status(400).json({
            success: false,
            message: "La vérification anti-robot est requise."
        });
    }

    const body = new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: req.ip
    }).toString();

    const result = await new Promise((resolve, reject) => {
        const request = https.request({
            hostname: "www.google.com",
            path: "/recaptcha/api/siteverify",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(body)
            },
            timeout: 5000
        }, (response) => {
            let responseBody = "";
            response.setEncoding("utf8");
            response.on("data", chunk => { responseBody += chunk; });
            response.on("end", () => {
                try {
                    resolve(JSON.parse(responseBody));
                } catch (error) {
                    reject(error);
                }
            });
        });
        request.on("timeout", () => request.destroy(new Error("Délai de vérification CAPTCHA dépassé.")));
        request.on("error", reject);
        request.write(body);
        request.end();
    }).catch((error) => {
        console.error("Erreur vérification reCAPTCHA:", error);
        return null;
    });

    if (!result?.success || result.action !== action ||
        (typeof result.score === "number" && result.score < 0.5)) {
        return res.status(403).json({
            success: false,
            message: "La vérification anti-robot a échoué. Réessayez."
        });
    }

    return next();
};

module.exports = { getRecaptchaConfig, verifyRecaptcha };
