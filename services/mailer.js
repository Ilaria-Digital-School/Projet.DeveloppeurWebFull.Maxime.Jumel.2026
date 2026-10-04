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
        family: Number(process.env.SMTP_FAMILY) || 4,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        },
        tls: {
            rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === "true"
        }
    });
};

const sendWelcomeEmail = async ({ email }) => {
  if (process.env.EMAIL_MODE === "console") {
    console.log(`[WELCOME EMAIL - CONSOLE] To: ${email}`);
    return { mode: "console" };
  }

  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Merci de vous être inscrit à la newsletter !",
    text: "Bonjour,\n\nMerci pour votre inscription à notre newsletter. Nous sommes ravis de vous compter parmi nos abonnés.\n\nÀ bientôt,\nL'équipe Souflydev",
    html: `
      <p>Bonjour,</p>
      <p>Merci pour votre inscription à notre newsletter.</p>
      <p>Nous sommes ravis de vous compter parmi nos abonnés.</p>
      <p>À bientôt,<br>L'équipe Souflydev</p>
    `
  });

  return { mode: "smtp" };
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




const sendPasswordResetEmail = async ({ email, pseudo, token }) => {
    const resetUrl = `${process.env.APP_URL.replace(/\/$/, "")}/reset-password/${token}`;

    if (process.env.EMAIL_MODE === "console") {
        console.log(`🔑 Réinitialisation du mot de passe pour ${email}: ${resetUrl}`);
        return { mode: "console", resetUrl };
    }

    const transporter = getTransporter();

    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: "Réinitialisation de votre mot de passe",
        text: `Bonjour ${pseudo},\n\nPour choisir un nouveau mot de passe, ouvrez ce lien : ${resetUrl}\n\nCe lien est valable 1 heure et ne fonctionne qu'une seule fois. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
        html: `
            <p>Bonjour ${pseudo},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p><a href="${resetUrl}">Choisir un nouveau mot de passe</a></p>
            <p><small>Ce lien est valable 1 heure et ne fonctionne qu'une seule fois.<br>
            Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.</small></p>
        `
    });

    return { mode: "smtp", resetUrl };
};


module.exports = { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail };
