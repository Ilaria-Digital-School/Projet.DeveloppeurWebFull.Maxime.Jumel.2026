const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const path = require("path");
const multer = require("multer");
const { isClient, isDev, isAdmin } = require("../middleware/authMiddleware");

// Configuration stockage Multer pour les uploads dans public/uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/uploads"));
    },
    
    fileFilter: (req, file, cb) => {
        const allowedExt = [".webp"];
        const fileExt = path.extname(file.originalname).toLowerCase();
        const isAllowedExt = allowedExt.includes(fileExt);
        
        if (isAllowedExt) {
            return cb(null, true);
        }
        
        cb(new Error("Seuls les fichiers .webp sont acceptés."));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, "avatar-" + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        const isWebp = file.mimetype === "image/webp" && path.extname(file.originalname).toLowerCase() === ".webp";
        if (isWebp) {
            return cb(null, true);
        }
        cb(new Error("Seuls les fichiers .webp sont acceptés."));
    }
});

// Routes GET — Pages publiques
router.get("/", (req, res) => {
    res.render("index", { user: req.session?.user || null });
});

router.get("/about", (req, res) => {
    res.render("about", { user: req.session?.user || null });
});

router.get("/blog", (req, res) => {
    res.render("blog", { user: req.session?.user || null });
});

router.get("/contact", (req, res) => {
    res.render("contact", { user: req.session?.user || null });
});

router.get("/portfolio", (req, res) => {
    res.render("portfolio", { user: req.session?.user || null });
});

router.get("/project", (req, res) => {
    res.render("project", { user: req.session?.user || null });
});

router.get("/page", (req, res) => {
    res.render("page", { user: req.session?.user || null });
});


// register routes
router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", async (req, res, next) => {
    const { email, pseudo, password } = req.body;
    try {
        if (!email || !pseudo || !password) {
            return res.status(400).json({ message: "Tous les champs sont requis", errcode: 400, success: false });
        }

        const emailExiste = await User.findOne({ email });
        if (emailExiste) {
            return res.status(400).json({ message: "Cet email est déjà utilisé", errcode: 400, success: false });
        }

        const pseudoExiste = await User.findOne({ pseudo });
        if (pseudoExiste) {
            return res.status(400).json({ message: "Ce pseudo est déjà utilisé", errcode: 400, success: false });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Mot de passe trop court (min 6 caractères)", errcode: 400, success: false });
        }
        if (!password.match(/[a-z]/)) {
            return res.status(400).json({ message: "Le mot de passe doit contenir au moins une lettre minuscule", errcode: 400, success: false });
        }
        if (!password.match(/[A-Z]/)) {
            return res.status(400).json({ message: "Le mot de passe doit contenir au moins une lettre majuscule", errcode: 400, success: false });
        }
        if (!password.match(/[0-9]/)) {
            return res.status(400).json({ message: "Le mot de passe doit contenir au moins un chiffre", errcode: 400, success: false });
        }
        if (!password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)) {
            return res.status(400).json({ message: "Le mot de passe doit contenir au moins un caractère spécial", errcode: 400, success: false });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            pseudo,
            password: passwordHash,
            role: "user"
        });

        await user.save();
        return res.status(200).json({ 
            message: "Utilisateur enregistré avec succès ! Redirection...", 
            errcode: 200, 
            success: true,
            redirect: "/login"
        });
    } catch (error) {
        console.error("Erreur register:", error);
        return res.status(500).json({ message: "Erreur serveur lors de l'inscription", errcode: 500, success: false });
    }
});

router.get("/login", (req, res) => {
    res.render("login");

});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Veuillez remplir tous les champs", errcode: 400, success: false });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect", errcode: 401, success: false });
        }

        if (user.isBan) {
            return res.status(403).json({ message: "Ce compte a été suspendu", errcode: 403, success: false });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect", errcode: 401, success: false });
        }

        req.session.isAuth = true;
        req.session.role = user.role;
        req.session.user = {
            id: user._id,
            pseudo: user.pseudo,
            email: user.email,
            role: user.role,
            avatar: user.avatar || ""
        };

        return res.status(200).json({ 
            message: "Connexion réussie ! Redirection...", 
            errcode: 200, 
            success: true,
            redirect: "/dashboard" 
        });
    } catch (error) {
        console.error("Erreur login:", error);
        return res.status(500).json({ message: "Erreur serveur lors de la connexion", errcode: 500, success: false });
    }
});
router.post("/profile/update/:id", isClient, upload.single("avatar"), async (req, res) => {
    try {
        const sessionUser = req.session.user;
        const targetId = req.params.id || sessionUser.id;

        // Seul l'utilisateur lui-même ou un admin/dev peut modifier ce profil
        if (sessionUser.id !== targetId && sessionUser.role !== "admin" && sessionUser.role !== "developper") {
            return res.status(403).json({ message: "Accès refusé", errcode: 403, success: false });
        }

        const { email, pseudo, password } = req.body;
        const userDoc = await User.findById(targetId);
        if (!userDoc) {
            return res.status(404).json({ message: "Utilisateur introuvable", errcode: 404, success: false });
        }

        if (email && email !== userDoc.email) {
            const emailTaken = await User.findOne({ email, _id: { $ne: targetId } });
            if (emailTaken) {
                return res.status(400).json({ message: "Cet email est déjà utilisé", errcode: 400, success: false });
            }
            userDoc.email = email;
        }

        if (pseudo && pseudo !== userDoc.pseudo) {
            const pseudoTaken = await User.findOne({ pseudo, _id: { $ne: targetId } });
            if (pseudoTaken) {
                return res.status(400).json({ message: "Ce pseudo est déjà utilisé", errcode: 400, success: false });
            }
            userDoc.pseudo = pseudo;
        }

        if (password && password.trim() !== "") {
            if (password.length < 6) {
                return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères", errcode: 400, success: false });
            }
            userDoc.password = await bcrypt.hash(password, 10);
        }

        // Upload de l'image de profil
        if (req.file) {
            userDoc.avatar = "/uploads/" + req.file.filename;
        }

        userDoc.updatedAt = new Date();
        await userDoc.save();

        // Mettre à jour la session si l'utilisateur met à jour son propre profil
        if (sessionUser.id === targetId) {
            req.session.user.pseudo = userDoc.pseudo;
            req.session.user.email = userDoc.email;
            req.session.user.avatar = userDoc.avatar;
        }

        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(200).json({ 
                message: "Profil mis à jour avec succès !", 
                errcode: 200, 
                success: true, 
                redirect: "/dashboard",
                avatar: userDoc.avatar
            });
        }
        return res.redirect("/dashboard?success=profile_updated");
    } catch (error) {
        console.error("Erreur profile:", error);
        return res.status(500).json({ message: `Erreur: ${error.message || "Erreur serveur"}`, errcode: 500, success: false });
    }
});
router.get("/dashboard", async (req, res) => {
    if (!req.session?.isAuth || !req.session?.user) {
        return res.redirect("/login");
    }

    try {
        const user = req.session.user;
        let tickets = [];
        let clients = [];
        let stats = {
            totalRevenue: 0,
            totalMembers: 0,
            totalOrders: 0,
            activeOrders: 0
        };

        if (user.role === "admin" || user.role === "developper") {
            const allUsers = await User.find({});
            clients = allUsers.filter(u => u.role === "user" || u.role === "client");

            allUsers.forEach(u => {
                if (u.ticketClient && u.ticketClient.length > 0) {
                    u.ticketClient.forEach(t => {
                        tickets.push({
                            _id: t._id,
                            userId: u._id,
                            client_name: u.pseudo,
                            client_email: u.email,
                            title: t.title,
                            subject: t.title,
                            message: t.message,
                            status: t.status,
                            createdAt: t.createdAt,
                            created_at: t.createdAt,
                            updatedAt: t.updatedAt,
                            replies: t.replies || []
                        });
                    });
                }
            });

            tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            stats.totalMembers = allUsers.length;
            stats.totalOrders = 0;
            stats.activeOrders = tickets.filter(t => t.status === "open" || t.status === "pending").length;
        } else {
            const clientDoc = await User.findById(user.id);
            if (clientDoc && clientDoc.ticketClient) {
                tickets = clientDoc.ticketClient.map(t => ({
                    _id: t._id,
                    userId: clientDoc._id,
                    client_name: clientDoc.pseudo,
                    client_email: clientDoc.email,
                    title: t.title,
                    subject: t.title,
                    message: t.message,
                    status: t.status,
                    createdAt: t.createdAt,
                    created_at: t.createdAt,
                    updatedAt: t.updatedAt,
                    replies: t.replies || []
                })).reverse();
            }
        }

        res.render("dashboard", {
            user,
            orders: [],
            clients,
            stats,
            tickets
        });
    } catch (error) {
        console.error("Erreur chargement dashboard:", error);
        res.render("dashboard", {
            user: req.session.user,
            orders: [],
            clients: [],
            stats: {},
            tickets: []
        });
    }
});

// Admin : Répondre à un ticket client
router.post("/api/admin/tickets/:userId/:ticketId/reply", isAdmin, async (req, res) => {
    try {
        const { userId, ticketId } = req.params;
        const { replyMessage, status } = req.body;
        if (!replyMessage) {
            return res.redirect("/dashboard?error=empty_reply");
        }

        const clientUser = await User.findById(userId);
        if (!clientUser) {
            return res.redirect("/dashboard?error=client_not_found");
        }

        const ticket = clientUser.ticketClient.id(ticketId) || clientUser.ticketClient.find(t => t._id.toString() === ticketId);
        if (!ticket) {
            return res.redirect("/dashboard?error=ticket_not_found");
        }

        if (!ticket.replies) ticket.replies = [];
        ticket.replies.push({
            sender: req.session.user?.pseudo || "Support Admin",
            role: req.session.user?.role || "admin",
            message: replyMessage,
            createdAt: new Date()
        });

        ticket.status = status || "repondu";
        ticket.updatedAt = new Date();

        await clientUser.save();
        return res.redirect("/dashboard?success=replied");
    } catch (error) {
        console.error("Erreur réponse admin ticket:", error);
        return res.redirect("/dashboard?error=server_error");
    }
});

// Admin : Supprimer un ticket client (POST — convention REST)
router.post("/api/admin/tickets/:userId/:ticketId/delete", isAdmin, async (req, res) => {
    try {
        const { userId, ticketId } = req.params;
        const clientUser = await User.findById(userId);
        if (!clientUser) {
            if (req.xhr || req.headers.accept?.includes("json")) {
                return res.status(404).json({ success: false, errcode: 404, message: "Utilisateur introuvable" });
            }
            return res.redirect("/dashboard?error=client_not_found");
        }

        const ticketExists = clientUser.ticketClient.some(t => t._id.toString() === ticketId);
        if (!ticketExists) {
            if (req.xhr || req.headers.accept?.includes("json")) {
                return res.status(404).json({ success: false, errcode: 404, message: "Ticket introuvable" });
            }
            return res.redirect("/dashboard?error=ticket_not_found");
        }

        clientUser.ticketClient = clientUser.ticketClient.filter(t => t._id.toString() !== ticketId);
        clientUser.ticket = clientUser.ticketClient.length;
        await clientUser.save();

        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(200).json({ success: true, message: "Ticket supprimé avec succès" });
        }
        return res.redirect("/dashboard?success=ticket_deleted");
    } catch (error) {
        console.error("Erreur suppression ticket:", error);
        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(500).json({ success: false, errcode: 500, message: "Erreur serveur" });
        }
        return res.redirect("/dashboard?error=server_error");
    }
});
// ticket system router client
router.get("/client/ticket", isClient, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.redirect("/login");

        let errorMsg = null;
        if (req.query.error === 'missing_fields') errorMsg = "Veuillez remplir tous les champs.";
        else if (req.query.error === 'empty_reply') errorMsg = "Le message de réponse ne peut pas être vide.";
        else if (req.query.error === 'ticket_not_found') errorMsg = "Ticket introuvable.";
        else if (req.query.error === 'server_error') errorMsg = "Une erreur serveur est survenue.";

        let successMsg = null;
        if (req.query.success === 'replied') successMsg = "Votre réponse a été envoyée avec succès !";
        else if (req.query.success === 'updated') successMsg = "Le statut du ticket a été mis à jour.";
        else if (req.query.success === 'ticket_created') successMsg = "Ticket créé avec succès !";

        res.render("ticketclient", {
            user,
            tickets: user.ticketClient || [],
            messages: {
                error: errorMsg,
                success: successMsg
            }
        });
    } catch (error) {
        console.error("Erreur affichage tickets:", error);
        res.redirect("/dashboard");
    }
});
router.get("/api/tickets/views/:id", isClient, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.status(401).json({ success: false, message: "Non autorisé" });
        }

        const ticket = user.ticketClient.id(req.params.id) || user.ticketClient.find(t => t._id.toString() === req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket non trouvé" });
        }

        return res.status(200).json({ success: true, ticket });
    } catch (error) {
        console.error("Erreur récupération ticket:", error);
        return res.status(500).json({ success: false, message: "Erreur serveur" });
    }
});
router.post("/api/tickets/:id/update", isAdmin, async (req, res) => {
    try {
        const id = req.params.id || req.body.id;
        const { title, message, status } = req.body;
        if (!id) {
            return res.redirect("/client/ticket?error=missing_id");
        }

        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.redirect("/login");
        }

        const ticket = user.ticketClient.id(id) || user.ticketClient.find(t => t._id.toString() === id);
        if (!ticket) {
            return res.redirect("/client/ticket?error=ticket_not_found");
        }

        if (status) ticket.status = status;
        if (title) ticket.title = title;
        if (message) ticket.message = message;
        ticket.updatedAt = new Date();

        await user.save();

        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(200).json({ success: true, message: "Ticket mis à jour avec succès" });
        }
        return res.redirect("/client/ticket?success=updated");
    } catch (error) {
        console.error("Erreur mise à jour ticket:", error);
        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(500).json({ success: false, message: "Erreur serveur" });
        }
        return res.redirect("/client/ticket?error=server_error");
    }
});

// Répondre à un ticket (avec statut automatique)
router.post("/api/tickets/:id/reply", isClient, async (req, res) => {
    try {
        const id = req.params.id;
        const { replyMessage } = req.body;
        if (!id || !replyMessage) {
            return res.redirect("/client/ticket?error=empty_reply");
        }

        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.redirect("/login");
        }

        const ticket = user.ticketClient.id(id) || user.ticketClient.find(t => t._id.toString() === id);
        if (!ticket) {
            return res.redirect("/client/ticket?error=ticket_not_found");
        }

        const isStaff = user.role === 'admin' || user.role === 'developper';

        if (!ticket.replies) ticket.replies = [];
        ticket.replies.push({
            sender: user.pseudo || "Client",
            role: user.role || "user",
            message: replyMessage,
            createdAt: new Date()
        });

        // Mise à jour automatique du statut :
        // - Si un staff répond : statut passe à "open" (répondu / en cours)
        // - Si le client répond : statut passe à "pending" (en attente du support)
        ticket.status = isStaff ? "open" : "pending";
        ticket.updatedAt = new Date();

        await user.save();
        return res.redirect("/client/ticket?success=replied");
    } catch (error) {
        console.error("Erreur réponse ticket:", error);
        return res.redirect("/client/ticket?error=server_error");
    }
});

router.post("/api/tickets/create", isClient, async (req, res) => {
    try {
        const { title, message } = req.body;
        if (!title || !message) {
            return res.redirect("/client/ticket?error=missing_fields");
        }

        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.redirect("/login");
        }

        user.ticketClient.push({
            title,
            email: user.email,
            message,
            status: "open",
            createdAt: new Date(),
            updatedAt: new Date()
        });
        user.ticket = user.ticketClient.length;

        await user.save();
        res.redirect("/client/ticket");
    } catch (error) {
        console.error("Erreur création ticket:", error);
        res.redirect("/client/ticket?error=server_error");
    }
});

router.get("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy(() => {
            res.redirect("/login");
        });
    } else {
        res.redirect("/login");
    }
});

module.exports = router;
