const User = require("../models/User");

// Raisons pour lesquelles une session authentifiée n'a plus le droit d'accéder au site.
const DENIAL_REASONS = {
    BANNED: "banned",
    INACTIVE: "inactive",
    UNVERIFIED: "unverified",
    MISSING: "missing",
    STALE_SESSION: "stale",
    ANONYMOUS: "anonymous"
};

const isJsonRequest = (req) => (
    req.originalUrl.startsWith("/api") ||
    req.xhr ||
    req.headers.accept?.includes("json")
);


const rejectUnauthenticated = (req, res) => {
    if (isJsonRequest(req)) {
        return res.status(403).json({
            success: false,
            message: "Accès refusé. Vous n'êtes pas connecté."
        });
    }
    return res.redirect("/login");
};

const rejectUnauthorized = (req, res, message) => {
    if (isJsonRequest(req)) {
        return res.status(403).json({ success: false, message });
    }
    return res.redirect("/login");
};

const destroySession = (req) => new Promise((resolve) => {
    if (!req.session) return resolve();
    req.session.destroy(() => resolve());
});

const clearSession = (req) => {
    if (!req.session) return;
    req.session.isAuth = false;
    req.session.role = undefined;
    req.session.user = undefined;
};

const syncSession = (req, user) => {
    req.session.role = user.role;
    req.session.user = {
        id: user._id,
        pseudo: user.pseudo,
        email: user.email,
        role: user.role,
        avatar: user.avatar || ""
    };
    req.session.sessionVersion = user.sessionVersion || 0;
};

/**
 * Charge le compte derriere la session et renvoie la raison du refus si l'acces
 * doit etre coupe. Le resultat est memorise sur la requete (`req.currentUser`)
 * afin que les middlewares de role ne relisent pas le compte une seconde fois.
 */
const getCurrentUser = async (req) => {
    if (Object.prototype.hasOwnProperty.call(req, "currentUser")) {
        return req.currentUser;
    }

    const userId = req.session?.user?.id;
    if (!req.session?.isAuth || !userId) {
        req.currentUser = { user: null, reason: DENIAL_REASONS.ANONYMOUS };
        return req.currentUser;
    }

    const user = await User.findById(userId).select(
        "pseudo email role status emailVerified isBan banReason bannedAt avatar sessionVersion"
    );

    if (!user) {
        clearSession(req);
        req.currentUser = { user: null, reason: DENIAL_REASONS.MISSING };
        return req.currentUser;
    }

    // Le bannissement prime sur tout le reste : l'acces est coupe immediatement,
    // sans attendre l'expiration de la session.
    if (user.isBan) {
        req.currentUser = { user: null, reason: DENIAL_REASONS.BANNED, banReason: user.banReason || "", bannedAt: user.bannedAt };
        return req.currentUser;
    }

    if (!user.emailVerified) {
        req.currentUser = { user: null, reason: DENIAL_REASONS.UNVERIFIED };
        return req.currentUser;
    }

    if (user.status !== "active") {
        req.currentUser = { user: null, reason: DENIAL_REASONS.INACTIVE };
        return req.currentUser;
    }

    // Un changement de mot de passe incrémente `sessionVersion` : toute session
    // ouverte avec l'ancien mot de passe est cassée ici.
    if ((req.session.sessionVersion || 0) !== (user.sessionVersion || 0)) {
        await destroySession(req);
        req.currentUser = { user: null, reason: DENIAL_REASONS.STALE_SESSION };
        return req.currentUser;
    }

    // Synchronise les droits en session avec la valeur actuelle en base.
    syncSession(req, user);
    req.currentUser = { user, reason: null };
    return req.currentUser;
};

/**
 * Coupe l'acces des comptes bannis, desactive ou non verifies sur TOUTES les
 * requetes. A monter juste apres la session, avant le routeur.
 */
const enforceAccountStatus = async (req, res, next) => {
    // Visiteur non connecte : rien a verifier, aucun acces a couper.
    if (!req.session?.isAuth || !req.session?.user) {
        return next();
    }

    let state;
    try {
        state = await getCurrentUser(req);
    } catch (error) {
        console.error("Erreur verification du statut du compte:", error);
        // On ne bloque pas la navigation sur une panne de base : fail-open,
        // les routes protegees par role reverifieront statiquement.
        return next();
    }

    if (!state.reason || state.reason === DENIAL_REASONS.ANONYMOUS) {
        return next();
    }

    // Un compte banni ne garde plus aucune session : la deconnexion est
    // immediate et definitive cote serveur. Une session obsolete (mot de passe
    // change) est detruite elle aussi.
    if (state.reason !== DENIAL_REASONS.STALE_SESSION) {
        await destroySession(req);
    }
    res.clearCookie(req.app.get("sessionCookieName") || "soufly.sid", { path: "/" });

    if (state.reason === DENIAL_REASONS.BANNED) {
        if (isJsonRequest(req)) {
            return res.status(403).json({
                success: false,
                errcode: 403,
                message: "Ce compte a été suspendu."
            });
        }
        return res.status(403).render("banned", {
            banReason: state.banReason,
            bannedAt: state.bannedAt,
            contactEmail: process.env.SUPPORT_EMAIL || "contact@souflyhub.fr"
        });
    }

    if (isJsonRequest(req)) {
        return res.status(403).json({
            success: false,
            errcode: 403,
            message: state.reason === DENIAL_REASONS.UNVERIFIED
                ? "Veuillez confirmer votre adresse email avant de continuer."
                : "Votre compte n'est pas actif."
        });
    }
    return res.redirect("/login");
};

const withCurrentUser = (checkAccess, deniedMessage) => async (req, res, next) => {
    try {
        const { user } = await getCurrentUser(req);
        if (!user) {
            return rejectUnauthenticated(req, res);
        }
        if (!checkAccess(user)) {
            return rejectUnauthorized(req, res, deniedMessage);
        }
        return next();
    } catch (error) {
        console.error("Erreur vérification des droits:", error);
        return res.status(500).json({
            success: false,
            message: "Impossible de vérifier les droits de l'utilisateur."
        });
    }
};

const isAdmin = withCurrentUser(
    (user) => user.role === "admin" || user.role === "developper",
    "Accès refusé. Réservé aux administrateurs."
);

const isDevelopper = withCurrentUser(
    (user) => user.role === "developper" || user.role === "admin",
    "Accès réservé aux développeurs."
);

const isClient = withCurrentUser(
    () => true,
    "Accès refusé. Vous n'êtes pas connecté."
);

module.exports = {
    isAdmin,
    isDevelopper,
    isDev: isDevelopper,
    isClient,
    enforceAccountStatus,
    getCurrentUser,
    DENIAL_REASONS
};