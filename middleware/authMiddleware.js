const isAdmin = (req, res, next) => {
    if (req.session?.isAuth && (req.session.role === "admin" || req.session.role === "developper")) {
        console.log("🟢 Admin/Dev autorisé:", req.session.user?.pseudo || req.session.role);
        return next();
    }
    console.log("🔴 Accès refusé - Non admin");
    if (req.originalUrl.startsWith("/api") || req.xhr || req.headers.accept?.includes("json")) {
        return res.status(403).json({ success: false, message: "Accès refusé. Réservé aux administrateurs." });
    }
    return res.redirect("/login");
};

const isDevelopper = (req, res, next) => {
    if (req.session?.isAuth && (req.session.role === "developper" || req.session.role === "admin")) {
        return next();
    }
    if (req.originalUrl.startsWith("/api") || req.xhr || req.headers.accept?.includes("json")) {
        return res.status(403).json({ success: false, message: "Accès réservé aux développeurs." });
    }
    return res.redirect("/login");
};

const isClient = (req, res, next) => {
    if (req.session?.isAuth) {
        console.log("🟢 Client autorisé:", req.session.user?.pseudo || req.session.role);
        return next();
    }
    console.log("🔴 Accès refusé - Non connecté");
    if (req.originalUrl.startsWith("/api") || req.xhr || req.headers.accept?.includes("json")) {
        return res.status(403).json({ success: false, message: "Accès refusé. Vous n'êtes pas connecté." });
    }
    return res.redirect("/login");
};

module.exports = {
    isAdmin,
    isDevelopper,
    isDev: isDevelopper,
    isClient
};