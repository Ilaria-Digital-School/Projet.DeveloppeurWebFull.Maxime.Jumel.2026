const User = require("../models/User");

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

const clearSession = (req) => {
    req.session.isAuth = false;
    req.session.role = undefined;
    req.session.user = undefined;
};

const getCurrentUser = async (req) => {
    const userId = req.session?.user?.id;
    if (!req.session?.isAuth || !userId) {
        return null;
    }

    const user = await User.findById(userId).select(
        "pseudo email role status emailVerified isBan avatar"
    );
    if (!user || user.isBan || user.status !== "active" || !user.emailVerified) {
        clearSession(req);
        return null;
    }

    // Synchronise les droits en session avec la valeur actuelle en base.
    req.session.role = user.role;
    req.session.user = {
        id: user._id,
        pseudo: user.pseudo,
        email: user.email,
        role: user.role,
        avatar: user.avatar || ""
    };
    return user;
};

const withCurrentUser = (checkAccess, deniedMessage) => async (req, res, next) => {
    try {
        const user = await getCurrentUser(req);
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
    isClient
};
