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

const sessionSecret = config.session?.secret || process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error("SESSION_SECRET doit être défini pour sécuriser les sessions et les cookies.");
}

if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));


app.disable("x-powered-by");
app.use(securityHeaders);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.use(cookieParser(sessionSecret));
app.use(session({
    name: process.env.SESSION_COOKIE_NAME || "soufly.sid",
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
