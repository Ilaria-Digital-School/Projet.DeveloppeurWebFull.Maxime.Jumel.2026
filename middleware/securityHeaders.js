const crypto = require("crypto");

const isProduction = process.env.NODE_ENV === "production";

const CSP_DIRECTIVES = {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    // Bootstrap est charge depuis le CDN jsdelivr (avec SRI). bootstrap-icons et
    // Font Awesome restent servis depuis public/.
    "script-src": ["'self'", "https://cdn.jsdelivr.net"],
    // Inline styles et attributs style= sont utilisés dans toutes les vues.
    "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
    "font-src": ["'self'", "data:"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "connect-src": ["'self'"],
    "frame-src": ["'self'", "https://www.google.com", "https://www.youtube.com"],
    "media-src": ["'self'", "https:"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
    "upgrade-insecure-requests": []
};

const buildCsp = (nonce, { upgradeInsecureRequests = false } = {}) => {
    const directives = Object.entries(CSP_DIRECTIVES)
        .map(([directive, values]) => {
            const parts = [directive];
            if (values.length > 0) {
                parts.push(...values);
            }
            if (directive === "script-src" && nonce) {
                parts.push(`'nonce-${nonce}'`);
            }
            return parts.join(" ");
        })
        .join("; ");

    if (!upgradeInsecureRequests) {
        return directives.replace(/;?\s*upgrade-insecure-requests/, "");
    }

    return directives;
};

const securityHeaders = (req, res, next) => {
    const nonce = crypto.randomBytes(16).toString("base64");

    // Exposé aux vues EJS pour les <script>/<style> inline.
    res.locals.cspNonce = nonce;

    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";

    res.setHeader("Content-Security-Policy", buildCsp(nonce, { upgradeInsecureRequests: isProduction }));
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", [
        "accelerometer=()",
        "camera=()",
        "geolocation=(self)",
        "gyroscope=()",
        "magnetometer=()",
        "microphone=()",
        "payment=()",
        "usb=()"
    ].join(", "));
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
    res.removeHeader("X-Powered-By");
    res.removeHeader("Server");

    // HSTS uniquement sur connexion chiffrée, sinon le navigateur l'ignorerait.
    if (isProduction && isSecure) {
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }

    return next();
};

module.exports = { securityHeaders, CSP_DIRECTIVES };