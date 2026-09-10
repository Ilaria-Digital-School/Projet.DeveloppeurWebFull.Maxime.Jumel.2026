const nodemailer = require("nodemailer");

const requiredMailSettings = ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "MAIL_FROM", "APP_URL"];

const getTransporter = () => {
    const missingSettings = requiredMailSettings.filter((setting) => !process.env[setting]);
    if (missingSettings.length > 0) {
        throw new Error(`Configuration email incomplète: ${missingSettings.join(", ")}`);
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

const sendVerificationEmail = async ({ email, token }) => {
    const verificationUrl = `${process.env.APP_URL.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(token)}`;

    if (process.env.EMAIL_MODE === "console") {
        console.log(`✉️ Vérification email pour ${email}: ${verificationUrl}`);
        return { mode: "console", verificationUrl };
    }

    const transporter = getTransporter();

    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: "Vérifiez votre adresse email",
        text: `Bienvenue ! Confirmez votre adresse email en ouvrant ce lien : ${verificationUrl}\n\nCe lien expire dans 24 heures.`,
        html: `
            <p>Bienvenue !</p>
            <p>Confirmez votre adresse email pour activer votre compte :</p>
            <p><a href="${verificationUrl}">Activer mon compte</a></p>
            <p>Ce lien expire dans 24 heures.</p>
        `
    });

    return { mode: "smtp", verificationUrl };
};

module.exports = { sendVerificationEmail };
