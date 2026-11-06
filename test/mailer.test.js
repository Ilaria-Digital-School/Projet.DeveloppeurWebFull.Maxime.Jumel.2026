const test = require("node:test");
const assert = require("node:assert/strict");

const ticket = { fullName: "Ada\r\nBcc: x@y.z", email: "ada@example.com", title: "Salut\nBcc: x", message: "<b>Hello</b>" };

test("sendContactEmail en mode console n'ouvre pas de connexion SMTP", async () => {
    process.env.EMAIL_MODE = "console";
    const { sendContactEmail } = require("../services/mailer");
    const log = console.log;
    console.log = () => {};
    try {
        assert.deepEqual(await sendContactEmail(ticket), { mode: "console" });
    } finally {
        console.log = log;
    }
});

test("sendContactEmail envoie à CONTACT_TO, échappe le HTML et neutralise les en-têtes", async () => {
    const nodemailer = require("nodemailer");
    const sent = [];
    const original = nodemailer.createTransport;
    nodemailer.createTransport = () => ({ sendMail: async (mail) => sent.push(mail) });
    Object.assign(process.env, {
        EMAIL_MODE: "smtp", SMTP_HOST: "h", SMTP_USER: "u", SMTP_PASSWORD: "p",
        MAIL_FROM: "site@example.com", APP_URL: "http://localhost", CONTACT_TO: "moi@example.com"
    });
    try {
        const { sendContactEmail } = require("../services/mailer");
        assert.deepEqual(await sendContactEmail(ticket), { mode: "smtp" });
    } finally {
        nodemailer.createTransport = original;
    }
    assert.equal(sent.length, 1);
    const [mail] = sent;
    assert.equal(mail.to, "moi@example.com");
    assert.doesNotMatch(mail.subject, /[\r\n]/);
    assert.doesNotMatch(mail.replyTo, /[\r\n]/);
    assert.match(mail.html, /&lt;b&gt;Hello&lt;\/b&gt;/);
    assert.doesNotMatch(mail.html, /<b>Hello/);
});

test("sendContactEmail échoue si la configuration SMTP est incomplète", async () => {
    Object.assign(process.env, { EMAIL_MODE: "smtp" });
    delete process.env.SMTP_HOST;
    const { sendContactEmail } = require("../services/mailer");
    await assert.rejects(() => sendContactEmail(ticket), /Configuration email incomplète/);
});
