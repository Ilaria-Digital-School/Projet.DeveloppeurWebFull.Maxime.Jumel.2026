const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    pseudo: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Invalid email address'] },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin", "developper"], default: "user" },
    status: { type: String, enum: ["active", "inactive"], default: "inactive" },
    adress: { type: String, default: "" },
    postcode: { type: Number, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    age: { type: Date, default: null },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpiresAt: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    // Incrémenté à chaque changement de mot de passe : les sessions ouvertes
    // portent la valeur précédente et sont donc invalidées.
    sessionVersion: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isBan: { type: Boolean, default: false },
    banReason: { type: String, default: "", maxlength: 300 },
    bannedAt: { type: Date },
    last_ip: { type: String },
    last_login: { type: Date, default: Date.now },
    last_logout: { type: Date },
    solde: { type: Number, default: 0 },
    credits: { type: Number, default: 0 },
    avatar: { type: String, default: "" },
    prj: { type: Number, default: 0 },
    cmd: { type: Number, default: 0 },
    ticket: { type: Number, default: 0 },

    // --- RGPD ---
    // Consentement aux CGU / politique de confidentialité (preuve : version, date, IP).
    consent: {
        termsAccepted: { type: Boolean, default: false },
        termsVersion: { type: String, default: "" },
        privacyVersion: { type: String, default: "" },
        acceptedAt: { type: Date },
        acceptedIp: { type: String },
    },
    // Consentements optionnels, révocables à tout moment (newsletter, cookies non essentiels).
    marketingConsent: { type: Boolean, default: false },
    marketingConsentAt: { type: Date },
    cookiesConsent: {
        analytics: { type: Boolean, default: false },
        marketing: { type: Boolean, default: false },
        updatedAt: { type: Date },
    },
    // Historique des changements de consentement (traçabilité).
    consentHistory: [{
        type: { type: String, enum: ["terms", "privacy", "marketing", "cookies"], required: true },
        granted: { type: Boolean, required: true },
        version: { type: String, default: "" },
        ip: { type: String },
        at: { type: Date, default: Date.now },
    }],
    // Droit à l'effacement : demande, délai de grâce, anonymisation effective.
    deletionRequestedAt: { type: Date },
    deletionScheduledAt: { type: Date },
    anonymizedAt: { type: Date },
    // Droit d'accès / portabilité : dernière demande d'export des données.
    dataExportRequestedAt: { type: Date },
    dataExportedAt: { type: Date },
    // Durée de conservation : au-delà, le compte inactif est supprimé ou anonymisé.
    retentionUntil: { type: Date },

    orders: [{
        id: { type: String, required: true },
        name: { type: String, required: true, maxlength: 160 },
        description: { type: String, required: true, maxlength: 3000 },
        client_name: { type: String, required: true, maxlength: 120 },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1, max: 100000 },
        total_price: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ["En cours", "Complété", "En attente", "Annulé"],
            default: "En cours"
        },
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now }
    }],

    quoteRequests: [{
        title: { type: String, required: true, maxlength: 120 },
        description: { type: String, required: true, maxlength: 3000 },
        service: { type: String, required: true, maxlength: 80 },
        budget: { type: Number, min: 0, max: 1000000 },
        desiredDate: { type: Date },
        status: { type: String, enum: ["pending", "reviewing", "sent", "accepted", "declined"], default: "pending" },
        adminNote: { type: String, maxlength: 2000, default: "" },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    }],
    // ticket client projects
    ticketClient: [{
        title: { type: String, required: true },
        email: { type: String, lowercase: true, trim: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ["open", "close", "pending", "repondu"], default: "open" },
        replies: [{
            sender: { type: String, default: "Client" },
            role: { type: String, default: "user" },
            message: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }]
    }]
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
module.exports = User;
