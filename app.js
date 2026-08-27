require("dotenv").config();

// ──────────────────────────────────────────────
// Validation des variables d'environnement critiques
// (fail-fast avant tout démarrage)
// ──────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
    console.error("❌ Erreur : JWT_SECRET non défini dans .env");
    process.exit(1);
}
if (!process.env.MONGO_URL) {
    console.error("❌ Erreur : MONGO_URL non défini dans .env");
    process.exit(1);
}

const { app, port, scriptRun, cookieParser } = require("./script/serverRun");
const apiRouter = require("./router/api");
const db = require("./script/rundb");
const rateLimit = require("express-rate-limit");

// ──────────────────────────────────────────────
// Rate Limiting
// ──────────────────────────────────────────────

// Limiteur global : 100 requêtes / 15 min par IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        errcode: 429,
        message: "Trop de requêtes. Veuillez réessayer dans quelques minutes."
    }
});

// Limiteur strict pour les routes d'authentification : 10 tentatives / 15 min
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        errcode: 429,
        message: "Trop de tentatives de connexion. Réessayez dans 15 minutes."
    }
});

// ──────────────────────────────────────────────
// Middlewares
// ──────────────────────────────────────────────
app.use(cookieParser());
app.use(globalLimiter);

// Rate limit strict sur les routes d'auth
app.use("/login", authLimiter);
app.use("/register", authLimiter);

app.use("/", apiRouter);

// ──────────────────────────────────────────────
// Gestion des erreurs 404 — Route non trouvée
// ──────────────────────────────────────────────
app.use((req, res, next) => {
    if (req.originalUrl.startsWith("/api") || req.xhr || req.headers.accept?.includes("json")) {
        return res.status(404).json({
            success: false,
            errcode: 404,
            message: `Route introuvable : ${req.method} ${req.originalUrl}`
        });
    }
    // Rendu EJS si la vue 404 existe, sinon fallback HTML
    res.status(404).render("404", { url: req.originalUrl }, (err) => {
        if (err) {
            return res.status(404).send(`
                <div style="font-family:sans-serif;text-align:center;padding:4rem;">
                    <h1>404 — Page introuvable</h1>
                    <p>La page <code>${req.originalUrl}</code> n'existe pas.</p>
                    <a href="/">← Retour à l'accueil</a>
                </div>
            `);
        }
    });
});

// ──────────────────────────────────────────────
// Gestion globale des erreurs 500
// ──────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("🔴 Erreur serveur :", err.stack || err.message);

    if (req.originalUrl.startsWith("/api") || req.xhr || req.headers.accept?.includes("json")) {
        return res.status(500).json({
            success: false,
            errcode: 500,
            message: process.env.NODE_ENV === "development"
                ? err.message
                : "Une erreur interne est survenue. Veuillez réessayer."
        });
    }

    res.status(500).send(`
        <div style="font-family:sans-serif;text-align:center;padding:4rem;">
            <h1>500 — Erreur serveur</h1>
            <p>Une erreur inattendue s'est produite.</p>
            <a href="/">← Retour à l'accueil</a>
        </div>
    `);
});

// ──────────────────────────────────────────────
// Démarrage du serveur
// ──────────────────────────────────────────────
scriptRun(port);

if (process.env.NODE_ENV === "development") {
    console.log("🟡 Mode développement activé");
    console.log("📡 Port :", port);
    console.log("🗄️  Database :", db.name);
} else if (process.env.NODE_ENV === "production") {
    console.log("🟢 Mode production activé");
    console.log("📡 Port :", port);
    console.log("🗄️  Database :", db.name);
}

