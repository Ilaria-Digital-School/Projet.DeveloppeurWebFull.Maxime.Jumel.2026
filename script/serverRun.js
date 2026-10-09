const cookieParser = require("cookie-parser");
const session = require("express-session");
const express = require("express");
const app = express();
const config = require("../config");
const port = config.port;
const path = require("path");
const chalk = require("chalk");
const { exposeCookieConsent, router: cookieRouter } = require("../middleware/cookieManager");
const { securityHeaders } = require("../middleware/securityHeaders");
const { enforceAccountStatus } = require("../middleware/authMiddleware");

const sessionSecret = config.session?.secret || process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error("SESSION_SECRET doit être défini pour sécuriser les sessions et les cookies.");
}

if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "soufly.sid";
// Les middlewares qui doivent supprimer le cookie de session le retrouvent ici.
app.set("sessionCookieName", SESSION_COOKIE_NAME);


app.disable("x-powered-by");
app.use(securityHeaders);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.use(cookieParser(sessionSecret));
app.use(session({
    name: SESSION_COOKIE_NAME,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    }
}));

// Couture immediate : un compte banni perd l'acces sur la requete suivante,
// partout (pages ET API), et sa session est detruite cote serveur.
// Doit rester avant le routeur et apres express.static pour ne pas
// imposer un acces Mongo sur les fichiers statiques.
app.use(enforceAccountStatus);

app.use(exposeCookieConsent);
app.use("/api/cookies", cookieRouter);

// ──────────────────────────────────────────────
// security.txt (RFC 9116) — canal de signalement
// ──────────────────────────────────────────────
const SECURITY_TXT = [
    `Contact: mailto:${process.env.SECURITY_CONTACT_EMAIL || "security@souflyhub.fr"}`,
    "Preferred-Languages: fr, en",
    "Canonical: /.well-known/security.txt",
    "Expires: 2027-12-31T23:59:59.000Z"
].join("\n");

const sendSecurityTxt = (req, res) => res.type("text/plain").send(SECURITY_TXT);
app.get("/.well-known/security.txt", sendSecurityTxt);
app.get("/security.txt", sendSecurityTxt);

const scriptRun = (portToUse = port) => {
    const server = app.listen(portToUse, () => {
        console.log(chalk.green(`🟢=> Server running on http://localhost:${portToUse}`));
    });
    console.log("🟢=> Server is ready!");
    
    return server;
};

module.exports = { port, scriptRun, app, cookieParser };
