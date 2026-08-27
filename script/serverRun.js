const cookieParser = require("cookie-parser");
const session = require("express-session");
const express = require("express");
const app = express();
const config = require("../config");
const port = config.port;
const path = require("path");
const chalk = require("chalk");

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

