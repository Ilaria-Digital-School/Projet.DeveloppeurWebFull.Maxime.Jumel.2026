require("dotenv").config();

module.exports = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET,
    mongoUrl: process.env.MONGO_URL,
    sessionSecret: process.env.SESSION_SECRET,
    emailMode: process.env.EMAIL_MODE || "console",
    smtpHost: process.env.SMTP_HOST,
    smtpPort: Number(process.env.SMTP_PORT) || 587,
    smtpSecure: process.env.SMTP_SECURE === "true",
    smtpFamily: Number(process.env.SMTP_FAMILY) || 4,
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
    mailFrom: process.env.MAIL_FROM,
    appUrl: process.env.APP_URL,
    session: {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 60 * 60 * 1000,
        }
    }
};