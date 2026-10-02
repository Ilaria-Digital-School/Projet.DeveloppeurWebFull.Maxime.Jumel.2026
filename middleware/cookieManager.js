const express = require("express");

const router = express.Router();
const CONSENT_COOKIE = "cookie_consent";
const CONSENT_VERSION = "1";
const CONSENT_MAX_AGE = 180 * 24 * 60 * 60 * 1000;
const CONSENT_CATEGORIES = ["necessary", "preferences", "analytics", "marketing"];

const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/"
};

const emptyConsent = () => ({
    version: CONSENT_VERSION,
    necessary: true,
    preferences: false,
    analytics: false,
    marketing: false
});

const normalizeConsent = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const consent = emptyConsent();
    for (const category of CONSENT_CATEGORIES) {
        if (category !== "necessary" && value[category] !== undefined && typeof value[category] !== "boolean") {
            return null;
        }
        if (category !== "necessary") {
            consent[category] = value[category] === true;
        }
    }
    return consent;
};

const getConsent = (req) => {
    const consent = req.signedCookies?.[CONSENT_COOKIE];
    return normalizeConsent(consent) || emptyConsent();
};

const hasValidConsent = (req) => Boolean(
    req.signedCookies?.[CONSENT_COOKIE] &&
    normalizeConsent(req.signedCookies[CONSENT_COOKIE])
);

const exposeCookieConsent = (req, res, next) => {
    res.locals.cookieConsent = getConsent(req);
    return next();
};

router.get("/consent", (req, res) => {
    return res.json({
        success: true,
        valid: hasValidConsent(req),
        consent: getConsent(req)
    });
});

router.post("/consent", (req, res) => {
    const consent = normalizeConsent(req.body?.consent);
    if (!consent) {
        return res.status(400).json({
            success: false,
            message: "Consentement cookies invalide."
        });
    }

    res.cookie(CONSENT_COOKIE, consent, {
        ...cookieOptions,
        maxAge: CONSENT_MAX_AGE,
        signed: true
    });
    return res.json({ success: true, consent });
});

router.delete("/consent", (req, res) => {
    res.clearCookie(CONSENT_COOKIE, cookieOptions);
    return res.json({ success: true, consent: emptyConsent() });
});

module.exports = {
    CONSENT_COOKIE,
    hasValidConsent,
    exposeCookieConsent,
    router
};
