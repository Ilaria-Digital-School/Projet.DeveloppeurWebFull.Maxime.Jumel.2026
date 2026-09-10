const cookieParser = require("cookie-parser");
const session = require("express-session");
const express = require("express");
const app = express();
const config = require("../config");
const port = config.port;
const path = require("path");
const chalk = require("chalk");

<<<<<<< HEAD
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com 'unsafe-inline'; style-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com 'unsafe-inline'; img-src 'self' data: https://i.pravatar.cc; font-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; connect-src 'self'; form-action 'self';");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

=======
>>>>>>> origin/dev
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.use(session({
  secret: config.session?.secret || process.env.SESSION_SECRET || "default_session_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 60 * 1000,
  },
}));

const scriptRun = (portToUse = port) => {
    const server = app.listen(portToUse, () => {
        console.log(chalk.green(`🟢=> Server running on http://localhost:${portToUse}`));
    });
    console.log("🟢=> Server is ready!");
    return server;
};

module.exports = { port, scriptRun, app, cookieParser };

