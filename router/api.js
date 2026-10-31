const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const User = require("../models/User");
const NewLetter = require("../models/NewLetter");
const bcrypt = require("bcryptjs");
const Project = require('../models/Project');
const Article = require('../models/Article');  
const ActivityLog = require("../models/ActivityLog");
const crypto = require("crypto");
const multer = require("multer");
const {
    isClient,
    isDev,
    isAdmin,
    isAuthenticated,
    isTicketAgent
} = require("../middleware/authMiddleware");
const { getRecaptchaConfig, verifyRecaptcha } = require("../middleware/recaptcha");
const { recordActivity } = require("../services/activityLogger");
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require("../services/mailer");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pseudoPattern = /^[A-Za-z0-9_.-]{3,30}$/;
const passwordRequirements = [
    { pattern: /[a-z]/, message: "Le mot de passe doit contenir au moins une lettre minuscule" },
    { pattern: /[A-Z]/, message: "Le mot de passe doit contenir au moins une lettre majuscule" },
    { pattern: /[0-9]/, message: "Le mot de passe doit contenir au moins un chiffre" },
    { pattern: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/, message: "Le mot de passe doit contenir au moins un caractère spécial" }
];

const validatePassword = (password) => {
    if (typeof password !== "string") {
        return "Les champs fournis sont invalides";
    }
    if (password.length < 6 || password.length > 128) {
        return "Le mot de passe doit contenir entre 6 et 128 caractères";
    }
    const requirement = passwordRequirements.find(({ pattern }) => !pattern.test(password));
    return requirement?.message || null;
};

const validateCredentials = ({ email, password, pseudo }, includePseudo = false) => {
    if (typeof email !== "string" || typeof password !== "string" || (includePseudo && typeof pseudo !== "string")) {
        return "Les champs fournis sont invalides";
    }
    if (email.length > 254 || !emailPattern.test(email)) {
        return "Adresse email invalide";
    }
    if (includePseudo && !pseudoPattern.test(pseudo)) {
        return "Le pseudo doit contenir entre 3 et 30 caractères alphanumériques";
    }
    return validatePassword(password);
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
        if (allowedTypes.has(file.mimetype)) {
            return cb(null, true);
        }
        cb(new Error("Seuls les fichiers JPEG, PNG ou WebP sont acceptés."));
    }
});

const imageDataUri = (file) => (
    file?.buffer && file.mimetype
        ? `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
        : ""
);

// Routes GET — Pages publiques
router.get("/", async (req, res) => {
    try {
        const [projects, articles] = await Promise.all([
            Project.find().sort({ createdAt: -1 }).lean(),
            Article.find().sort({ createdAt: -1 }).lean()
        ]);
        
        res.render("index", { 
            user: req.session?.user || null, 
            projects,
            articles
        });
    } catch (error) {
        console.error(error);
        res.render("index", { 
            user: req.session?.user || null, 
            projects: [],
            articles: []
        });
    }
});

router.get("/about", (req, res) => {
    res.render("about", { user: req.session?.user || null });
});

router.get("/blog", async (req, res) => {
    try {
        const selectedCategory = typeof req.query.category === "string"
            ? req.query.category.trim()
            : "";
        const [articles, categories] = await Promise.all([
            Article.find(selectedCategory ? { category: selectedCategory } : {})
                .collation(NAME_COLLATION)
                .sort({ createdAt: -1 })
                .lean(),
            Category.find().sort({ name: 1 }).lean()
        ]);
        return res.render("blog", {
            user: req.session?.user || null,
            articles,
            categories,
            selectedCategory
        });
    } catch (error) {
        console.error("Erreur chargement du blog:", error);
        return res.status(500).render("blog", {
            user: req.session?.user || null,
            articles: [],
            categories: [],
            selectedCategory: "",
            loadError: true
        });
    }
});

router.get("/contact", (req, res) => {
    res.render("contact", {
        user: req.session?.user || null,
        contactTicket: req.session?.contactTicket || null
    });
});

router.post("/contact", (req, res) => {
    const fullName = typeof req.body?.["full-name"] === "string"
        ? req.body["full-name"].trim()
        : "";
    const email = typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    const subject = typeof req.body?.subject === "string"
        ? req.body.subject.trim()
        : "";
    const message = typeof req.body?.message === "string"
        ? req.body.message.trim()
        : "";

    if (!fullName || fullName.length > 120 || !emailPattern.test(email) || email.length > 254 ||
        !subject || subject.length > 120 || !message || message.length > 3000) {
        return res.status(400).render("contact", {
            user: req.session?.user || null,
            contactTicket: null,
            contactError: "Veuillez renseigner correctement tous les champs du formulaire."
        });
    }

    req.session.contactTicket = {
        id: crypto.randomUUID(),
        fullName,
        email,
        title: subject,
        message,
        status: "open",
        createdAt: new Date()
    };

    return res.render("contact", {
        user: req.session?.user || null,
        contactTicket: req.session.contactTicket,
        contactSuccess: "Votre ticket temporaire a bien été créé dans votre session."
    });
});

router.get("/portfolio", async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 }).lean();
        res.render("portfolio", { user: req.session?.user || null, projects });
    } catch (error) {
        console.error("Erreur chargement du portfolio:", error);
        res.status(500).render("portfolio", { user: req.session?.user || null, projects: [], loadError: true });
    }
});

router.get("/project", async (req, res) => {
    try {
        const project = req.query.id
            ? await Project.findById(req.query.id).lean()
            : await Project.findOne().sort({ createdAt: -1 }).lean();
        if (!project) return res.status(404).render("project", { user: req.session?.user || null, project: null });
        res.render("project", { user: req.session?.user || null, project });
    } catch (error) {
        console.error("Erreur chargement du projet:", error);
        res.status(404).render("project", { user: req.session?.user || null, project: null });
    }
});

router.post("/projects", isAdmin, upload.single("image"), async (req, res) => {
    try {
        const { title, description, projectType, client, location, budget, duration, result } = req.body || {};
        const normalizedTitle = typeof title === "string" ? title.trim() : "";
        const normalizedDescription = typeof description === "string" ? description.trim() : "";
        if (!normalizedTitle || normalizedTitle.length > 160 || !normalizedDescription || normalizedDescription.length > 5000) {
            return res.status(400).json({ success: false, message: "Le titre et la description sont obligatoires." });
        }
        const project = await Project.create({
            title: normalizedTitle,
            description: normalizedDescription,
            imageUrl: imageDataUri(req.file),
            projectType: typeof projectType === "string" ? projectType.trim() : "",
            client: typeof client === "string" ? client.trim() : "",
            location: typeof location === "string" ? location.trim() : "",
            budget: typeof budget === "string" ? budget.trim() : "",
            duration: typeof duration === "string" ? duration.trim() : "",
            result: typeof result === "string" ? result.trim() : ""
        });
        if (!req.xhr && !req.headers.accept?.includes("json")) return res.redirect("/dashboard?success=project_created");
        res.status(201).json({ success: true, project });
    } catch (error) {
        console.error("Erreur création du projet:", error);
        res.status(500).json({ success: false, message: "Impossible de créer le projet." });
    }
});

router.get("/page", (req, res) => {
    res.render("page", { user: req.session?.user || null });
});
// Ajouter un article avec image stockée directement dans MongoDB.
router.post("/articles", isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, description, category } = req.body || {};
    const normalizedTitle = typeof title === "string" ? title.trim() : "";
    const normalizedDescription = typeof description === "string" ? description.trim() : "";
    const normalizedCategory = typeof category === "string" ? category.trim() : "";
    const image = imageDataUri(req.file) || (typeof req.body?.image === "string" ? req.body.image.trim() : "");

    if (!normalizedTitle || normalizedTitle.length > 160 ||
        !normalizedDescription || normalizedDescription.length > 5000 ||
        !normalizedCategory || normalizedCategory.length > 80 || !image) {
      return res.status(400).json({
        success: false,
        message: "Le titre, la description, la catégorie et l'image sont obligatoires."
      });
    }
    
    const newArticle = new Article({
      title: normalizedTitle,
      description: normalizedDescription,
      image,
      category: normalizedCategory,
      date: new Date().toLocaleDateString()
    });

    await newArticle.save();
    if (!req.xhr && !req.headers.accept?.includes("json")) {
      return res.redirect("/dashboard?success=article_created");
    }
    res.json({ success: true, article: newArticle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/articles/:id", isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, description, category } = req.body || {};
    const patch = {
      title: typeof title === "string" ? title.trim() : "",
      description: typeof description === "string" ? description.trim() : "",
      category: typeof category === "string" ? category.trim() : ""
    };
    if (!patch.title || patch.title.length > 160 || !patch.description ||
        patch.description.length > 5000 || !patch.category || patch.category.length > 80) {
      return res.status(400).json({ success: false, message: "Les champs de l'article sont invalides." });
    }
    if (req.file) patch.image = imageDataUri(req.file);
    const article = await Article.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
    if (!article) return res.status(404).json({ success: false, message: "Article introuvable." });
    return res.json({ success: true, article });
  } catch (error) {
    console.error("Erreur modification article:", error);
    return res.status(500).json({ success: false, message: "Impossible de modifier l'article." });
  }
});

router.delete("/articles/:id", isAdmin, async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: "Article introuvable." });
    return res.json({ success: true, message: "Article supprimé." });
  } catch (error) {
    console.error("Erreur suppression article:", error);
    return res.status(500).json({ success: false, message: "Impossible de supprimer l'article." });
  }
});
// newletter routes
const newsletterToken = (email) => crypto
    .createHmac("sha256", process.env.SESSION_SECRET || process.env.JWT_SECRET)
    .update(email)
    .digest("hex");
const newsletterUnsubscribeUrl = (email) =>
    `${(process.env.APP_URL || "").replace(/\/$/, "")}/unsubscribe?email=${encodeURIComponent(email)}&token=${newsletterToken(email)}`;

router.get("/unsubscribe", async (req, res) => {
    const email = typeof req.query.email === "string" ? req.query.email.trim().toLowerCase() : "";
    const token = typeof req.query.token === "string" ? req.query.token : "";
    const expected = email ? newsletterToken(email) : "";
    const valid = expected.length === token.length &&
        crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
    if (!valid) {
        return res.status(400).send("Lien de désinscription invalide.");
    }
    await NewLetter.deleteOne({ email });
    return res.send("Vous êtes désinscrit de la newsletter. Votre adresse a été supprimée.");
});
router.post("/subscribe", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), async (req, res) => {
    const email = req.body?.email?.trim().toLowerCase();

    if (req.body?.consent !== "1") {
        return res.json({ success: false, message: "Veuillez accepter de recevoir la newsletter." });
    }

    if (!email || !emailPattern.test(email)) {
        return res.json({ success: false, message: "Adresse email invalide." });
    }

    try {
        const existing = await NewLetter.findOne({ email });

        if (existing) {
            return res.json({ success: false, message: "Vous êtes déjà inscrit." });
        }

        const newLetter = new NewLetter({ email, consentAt: new Date() });
        await newLetter.save();

        // Tu peux envoyer un mail de bienvenue ici si tu veux
        try {
            await sendWelcomeEmail({ email, unsubscribeUrl: newsletterUnsubscribeUrl(email) });
        } catch (emailError) {
            console.error("Erreur envoi mail bienvenue:", emailError);
        }

        res.json({ success: true, message: "Merci pour votre inscription !" });

    } catch (error) {
        console.error("Erreur inscription newsletter:", error);
        res.json({ success: false, message: "Erreur serveur." });
    }
});


// register routes
router.get("/register", (req, res) => {
    res.render("register", { recaptchaSiteKey: getRecaptchaConfig().siteKey });
});

router.get("/verify-email", async (req, res) => {
    const rawToken = typeof req.query.token === "string" ? req.query.token : "";
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    try {
        const user = await User.findOne({
            emailVerificationToken: tokenHash,
            emailVerificationExpiresAt: { $gt: new Date() }
        }).select("+emailVerificationToken +emailVerificationExpiresAt");

        if (!user) {
            return res.status(400).render("verify-email", {
                success: false,
                message: "Ce lien est invalide ou a expiré."
            });
        }

        user.emailVerified = true;
        user.status = "active";
        user.emailVerificationToken = undefined;
        user.emailVerificationExpiresAt = undefined;
        await user.save();

        return res.render("verify-email", {
            success: true,
            message: "Votre adresse email est confirmée. Votre compte est maintenant activé."
        });
    } catch (error) {
        console.error("Erreur vérification email:", error);
        return res.status(500).render("verify-email", {
            success: false,
            message: "Une erreur est survenue pendant la vérification."
        });
    }
});

router.post("/register", verifyRecaptcha("register"), async (req, res) => {
    const { email, pseudo, password, acceptTerms } = req.body || {};
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : email;
    const normalizedPseudo = typeof pseudo === "string" ? pseudo.trim() : pseudo;
    if (acceptTerms !== true) {
        return res.status(400).json({ message: "Vous devez accepter les CGU et la politique de confidentialité.", errcode: 400, success: false });
    }
    try {
        const validationError = validateCredentials({ email: normalizedEmail, pseudo: normalizedPseudo, password }, true);
        if (validationError) {
            return res.status(400).json({ message: validationError, errcode: 400, success: false });
        }

        const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { pseudo: normalizedPseudo }]
        });
        if (existingUser) {
            if (!existingUser.emailVerified && existingUser.email === normalizedEmail) {
                const verificationToken = crypto.randomBytes(32).toString("hex");
                existingUser.emailVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
                existingUser.emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
                if (password) {
                    existingUser.password = await bcrypt.hash(password, 12);
                }
                await existingUser.save();
                await sendVerificationEmail({ email: normalizedEmail, token: verificationToken });
                return res.status(200).json({
                    message: "Compte en attente de validation. Un nouvel email de vérification vous a été envoyé.",
                    errcode: 200,
                    success: true,
                    redirect: "/login"
                });
            }
            const message = existingUser.email === normalizedEmail
                ? "Cette adresse email est déjà utilisée"
                : "Ce pseudo est déjà utilisé";
            return res.status(409).json({ message, errcode: 409, success: false });
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const passwordHash = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            email: normalizedEmail,
            pseudo: normalizedPseudo,
            password: passwordHash,
            status: "inactive",
            emailVerified: false,
            emailVerificationToken: crypto.createHash("sha256").update(verificationToken).digest("hex"),
            emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        try {
            await sendVerificationEmail({ email: normalizedEmail, token: verificationToken });
        } catch (mailError) {
            // Si l'envoi de mail échoue, on supprime l'utilisateur non vérifié pour permettre de réessayer
            await User.findByIdAndDelete(newUser._id).catch(() => {});
            throw mailError;
        }

        await recordActivity({
            type: "user",
            action: "Inscription créée",
            description: `Nouveau compte créé pour ${normalizedPseudo}`,
            actor: normalizedPseudo,
            metadata: { email: normalizedEmail, ip: req.ip }
        });

        return res.status(201).json({
            message: "Inscription réussie. Vérifiez votre adresse email pour activer votre compte.",
            errcode: 201,
            success: true,
            redirect: "/login"
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: "Cet email ou ce pseudo est déjà utilisé", errcode: 409, success: false });
        }
        console.error("Erreur register:", error);
        return res.status(500).json({ message: "Erreur serveur lors de l'inscription", errcode: 500, success: false });
    }
});

router.get("/login", (req, res) => {
    res.render("login", { recaptchaSiteKey: getRecaptchaConfig().siteKey });

});

// ──────────────────────────────────────────────
// Réinitialisation du mot de passe
// ──────────────────────────────────────────────

const PASSWORD_RESET_TTL = 60 * 60 * 1000; // 1 heure

// Message volontairement identique que l'email existe ou non : la page ne
// doit jamais révéler quelles adresses sont enregistrées.
const RESET_NEUTRAL_MESSAGE = "Si un compte est associé à cette adresse email, un lien de réinitialisation vient d'être envoyé.";

const hashResetToken = (rawToken) => crypto.createHash("sha256").update(rawToken).digest("hex");

const findUserByValidResetToken = (rawToken) => User.findOne({
    passwordResetToken: hashResetToken(rawToken),
    passwordResetExpiresAt: { $gt: new Date() }
}).select("+passwordResetToken +passwordResetExpiresAt");

router.get("/forgot-password", (req, res) => {
    const sent = req.query.envoye === "1";
    res.render("forgot-password", {
        sent,
        message: sent ? RESET_NEUTRAL_MESSAGE : "",
        email: "",
        recaptchaSiteKey: getRecaptchaConfig().siteKey
    });
});

router.post("/forgot-password", verifyRecaptcha("forgot_password"), async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";

    const respond = () => res.status(200).json({
        success: true,
        message: RESET_NEUTRAL_MESSAGE
    });

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        return respond();
    }

    try {
        const user = await User.findOne({ email });

        // Compte inexistant : on renvoie la même réponse, sans révéler l'information.
        // Le hachage factice évite aussi que le temps de réponse trahisse le cas.
        if (!user) {
            crypto.createHash("sha256").update(email).digest("hex");
            return respond();
        }

        // Un compte banni ne réinitialise pas son mot de passe par email.
        if (user.isBan) {
            return respond();
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetToken = hashResetToken(rawToken);
        user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_TTL);
        await user.save();

        await sendPasswordResetEmail({ email: user.email, pseudo: user.pseudo, token: rawToken });

        return respond();
    } catch (error) {
        console.error("Erreur demande de réinitialisation:", error);
        return respond();
    }
});
// ──────────────────────────────────────────────
// Catégories et services (réservé aux administrateurs)
// ──────────────────────────────────────────────

const Category = require("../models/Category");
const Service = require("../models/Service");

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const badRequest = (res, message) =>
    res.status(400).json({ success: false, errcode: 400, message });

const notFound = (res, entity) =>
    res.status(404).json({ success: false, errcode: 404, message: `${entity} non trouvé${entity === "Catégorie" ? "e" : ""}.` });

const conflict = (res, message) =>
    res.status(409).json({ success: false, errcode: 409, message });

const isValidId = (id) => typeof id === "string" && mongoose.isValidObjectId(id);

// Même collation que l'index unique du modèle : « Développement Web » et
// « developpement web » sont considers comme le meme nom.
const NAME_COLLATION = { locale: "fr", strength: 2 };

/**
 * Charge le catalogue groupe : [{ ...categorie, services: [...] }].
 * Partage entre la vitrine publique et les modals d'administration du dashboard.
 */
const loadServiceCatalogue = async () => {
    const categories = await Category.find().sort({ name: 1 }).lean();
    const services = await Service.find().populate("category", "name icon").sort({ name: 1 }).lean();

    return categories.map((category) => ({
        ...category,
        services: services.filter(
            (service) => String(service.category?._id || service.category) === String(category._id)
        )
    }));
};
const findCategoryByName = (name, excludeId) =>
    Category.findOne({ name, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }).collation(NAME_COLLATION);

/**
 * Vérifie qu'une création fournit bien tous les champs requis. Sans cela,
 * une validation de schéma mongoose remonterait en 500 au lieu d'un 400.
 */
const requireFields = (body, fields) => {
    for (const key of fields) {
        if (!isNonEmptyString(body[key])) {
            return `Champ "${key}" requis.`;
        }
    }
    return null;
};

/**
 * Construit le patch à partir des champs présents dans le corps de la requête.
 * Rejette les valeurs vides : `PUT` sert à modifier, pas à effacer.
 */
const buildPatch = (body, fields) => {
    const patch = {};
    for (const key of fields) {
        const value = body[key];
        if (value === undefined) continue;
        if (!isNonEmptyString(value)) return { error: `Champ "${key}" invalide.` };
        patch[key] = value.trim();
    }
    if (Object.keys(patch).length === 0) {
        return { error: "Aucune donnée à mettre à jour." };
    }
    return { patch };
};

// Vitrine publique du catalogue. L'interface d'administration vit dans les
// modals, rendus uniquement pour un administrateur ou un developpeur.
router.get("/services", async (req, res) => {
    const role = req.session?.user?.role;
    const isManager = role === "admin";

    try {
        const categories = await loadServiceCatalogue();

        return res.render("services", { user: req.session?.user || null, isManager, categories });
    } catch (error) {
        console.error("Erreur chargement des services:", error);
        return res.status(500).render("services", {
            user: req.session?.user || null,
            isManager,
            categories: [],
            loadError: true
        });
    }
});

router.post("/create-category", isAdmin, async (req, res) => {
    const { name, description, icon } = req.body || {};

    const missing = requireFields({ name, description, icon }, ["name", "description", "icon"]);
    if (missing) return badRequest(res, missing);

    const { error, patch } = buildPatch({ name, description, icon }, ["name", "description", "icon"]);
    if (error) return badRequest(res, error);

    try {
        const existing = await findCategoryByName(patch.name);
        if (existing) {
            return conflict(res, "Cette catégorie existe déjà.");
        }

        const newCategory = new Category(patch);
        await newCategory.save();

        return res.status(201).json({ success: true, message: "Catégorie créée avec succès.", redirect: "/services" });
    } catch (error) {
        // Doublonattrapé par l'index unique (-course entre deux requêtes).
        if (error?.code === 11000) {
            return conflict(res, "Cette catégorie existe déjà.");
        }
        console.error("Erreur création catégorie:", error);
        return res.status(500).json({ success: false, errcode: 500, message: "Impossible de créer la catégorie." });
    }
});

router.put("/update-category/:id", isAdmin, async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "Identifiant invalide.");

    const { error, patch } = buildPatch(req.body || {}, ["name", "description", "icon"]);
    if (error) return badRequest(res, error);

    try {
        if (patch.name) {
            const duplicate = await findCategoryByName(patch.name, id);
            if (duplicate) {
                return conflict(res, "Cette catégorie existe déjà.");
            }
        }

        const updated = await Category.findByIdAndUpdate(id, patch, {
            new: true,
            runValidators: true
        });
        if (!updated) return notFound(res, "Catégorie");

        return res.status(200).json({ success: true, message: "Catégorie mise à jour avec succès." });
    } catch (error) {
        if (error?.code === 11000) {
            return conflict(res, "Cette catégorie existe déjà.");
        }
        console.error("Erreur mise à jour catégorie:", error);
        return res.status(500).json({ success: false, errcode: 500, message: "Impossible de mettre à jour la catégorie." });
    }
});

router.delete("/delete-category/:id", isAdmin, async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "Identifiant invalide.");

    try {
        // On refuse de supprimer une catégorie encore utilisée : cela laisserait
        // des services orphelins.
        if (await Service.exists({ category: id })) {
            return conflict(res, "Cette catégorie contient encore des services.");
        }

        const deleted = await Category.findByIdAndDelete(id);
        if (!deleted) return notFound(res, "Catégorie");

        return res.status(200).json({ success: true, message: "Catégorie supprimée avec succès." });
    } catch (error) {
        console.error("Erreur suppression catégorie:", error);
        return res.status(500).json({ success: false, errcode: 500, message: "Impossible de supprimer la catégorie." });
    }
});

router.post("/create-service", isAdmin, async (req, res) => {
    const { name, description, categoryId } = req.body || {};

    const missing = requireFields({ name, description, categoryId }, ["name", "description", "categoryId"]);
    if (missing) return badRequest(res, missing);

    const { error, patch } = buildPatch({ name, description }, ["name", "description"]);
    if (error) return badRequest(res, error);

    if (!isNonEmptyString(categoryId) || !isValidId(categoryId.trim())) {
        return badRequest(res, "Catégorie invalide.");
    }

    try {
        const category = await Category.findById(categoryId.trim());
        if (!category) return notFound(res, "Catégorie");

        const newService = new Service({ ...patch, category: category._id });
        await newService.save();

        return res.status(201).json({ success: true, message: "Service créé avec succès.", redirect: "/services" });
    } catch (error) {
        console.error("Erreur création service:", error);
        return res.status(500).json({ success: false, errcode: 500, message: "Impossible de créer le service." });
    }
});

router.put("/update-service/:id", isAdmin, async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "Identifiant invalide.");

    const { name, description, categoryId } = req.body || {};
    const { error, patch } = buildPatch({ name, description }, ["name", "description"]);
    if (error) return badRequest(res, error);

    if (categoryId !== undefined) {
        if (!isNonEmptyString(categoryId) || !isValidId(categoryId.trim())) {
            return badRequest(res, "Catégorie invalide.");
        }
        patch.category = categoryId.trim();
    }

    try {
        if (patch.category) {
            const category = await Category.findById(patch.category);
            if (!category) return notFound(res, "Catégorie");
        }

        const updated = await Service.findByIdAndUpdate(id, patch, {
            new: true,
            runValidators: true
        });
        if (!updated) return notFound(res, "Service");

        return res.status(200).json({ success: true, message: "Service mis à jour avec succès." });
    } catch (error) {
        console.error("Erreur mise à jour service:", error);
        return res.status(500).json({ success: false, errcode: 500, message: "Impossible de mettre à jour le service." });
    }
});

router.delete("/delete-service/:id", isAdmin, async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) return badRequest(res, "Identifiant invalide.");

    try {
        const deleted = await Service.findByIdAndDelete(id);
        if (!deleted) return notFound(res, "Service");

        return res.status(200).json({ success: true, message: "Service supprimé avec succès." });
    } catch (error) {
        console.error("Erreur suppression service:", error);
        return res.status(500).json({ success: false, errcode: 500, message: "Impossible de supprimer le service." });
    }
});

// Page de confirmation apres un reinitialisation reussie. Declaree avant
// `/reset-password/:token` pour ne pas etre capturee par le parametre.
router.get("/reset-password/termine", (req, res) => {
    res.render("reset-password", {
        valid: false,
        error: "",
        token: "",
        message: "Mot de passe mis à jour. Vous pouvez vous connecter avec votre nouveau mot de passe."
    });
});

router.get("/reset-password/:token", async (req, res) => {
    const rawToken = typeof req.params.token === "string" ? req.params.token : "";

    if (!/^[a-f0-9]{64}$/i.test(rawToken)) {
        return res.status(400).render("reset-password", {
            valid: false,
            error: "Ce lien est invalide.",
            token: "",
            message: ""
        });
    }

    try {
        const user = await findUserByValidResetToken(rawToken);
        if (!user) {
            return res.status(400).render("reset-password", {
                valid: false,
                error: "Ce lien est invalide ou a expiré.",
                token: "",
                message: ""
            });
        }
        return res.render("reset-password", { valid: true, error: "", token: rawToken, message: "" });
    } catch (error) {
        console.error("Erreur lecture du jeton de réinitialisation:", error);
        return res.status(500).render("reset-password", {
            valid: false,
            error: "Une erreur est survenue. Réessayez plus tard.",
            token: "",
            message: ""
        });
    }
});

router.post("/reset-password/:token", async (req, res) => {
    const rawToken = typeof req.params.token === "string" ? req.params.token : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const confirmation = typeof req.body?.confirmation === "string" ? req.body.confirmation : "";

    const fail = (error, status = 400) => res.status(status).json({
        success: false,
        errcode: status,
        message: error
    });

    if (!/^[a-f0-9]{64}$/i.test(rawToken)) {
        return fail("Ce lien est invalide.");
    }

    if (password !== confirmation) {
        return fail("Les deux mots de passe ne correspondent pas.");
    }

    const validationError = validatePassword(password);
    if (validationError) {
        return fail(validationError);
    }

    try {
        const user = await findUserByValidResetToken(rawToken);
        if (!user) {
            return fail("Ce lien est invalide ou a expiré.");
        }

        user.password = await bcrypt.hash(password, 12);
        // Jeton à usage unique.
        user.passwordResetToken = undefined;
        user.passwordResetExpiresAt = undefined;
        // Invalide toutes les sessions déjà ouvertes avec l'ancien mot de passe.
        user.sessionVersion = (user.sessionVersion || 0) + 1;
        user.updatedAt = new Date();
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Mot de passe mis à jour.",
            redirect: "/reset-password/termine"
        });
    } catch (error) {
        console.error("Erreur réinitialisation du mot de passe:", error);
        return res.status(500).json({
            success: false,
            errcode: 500,
            message: "Une erreur est survenue pendant la réinitialisation."
        });
    }
});
router.post("/login", verifyRecaptcha("login"), async (req, res) => {
    const { email, password } = req.body || {};
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : email;
    try {
        const validationError = validateCredentials({ email: normalizedEmail, password });
        if (validationError) {
            return res.status(400).json({ message: validationError, errcode: 400, success: false });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect", errcode: 401, success: false });
        }

        if (user.isBan) {
            return res.status(403).json({ message: "Ce compte a été suspendu", errcode: 403, success: false });
        }

        if (!user.emailVerified || user.status !== "active") {
            return res.status(403).json({ message: "Veuillez confirmer votre adresse email avant de vous connecter", errcode: 403, success: false });
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
        req.session.sessionVersion = user.sessionVersion || 0;
        await recordActivity({
            type: "auth",
            action: "Connexion réussie",
            description: `Connexion de ${user.pseudo}`,
            actor: user.pseudo,
            metadata: { userId: String(user._id), ip: req.ip }
        });

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

// Toutes les ressources API sont privées par défaut; les contrôles de rôle restent spécifiques aux routes sensibles.
router.use("/api", isAuthenticated);

router.post("/api/quotes", isClient, async (req, res) => {
    const { title, description, service, budget, desiredDate } = req.body || {};
    const normalizedTitle = typeof title === "string" ? title.trim() : "";
    const normalizedDescription = typeof description === "string" ? description.trim() : "";
    const normalizedService = typeof service === "string" ? service.trim() : "";
    const parsedBudget = budget === "" || budget === undefined ? undefined : Number(budget);
    const requestedDate = desiredDate ? new Date(desiredDate) : undefined;

    if (!normalizedTitle || normalizedTitle.length > 120 || !normalizedDescription || normalizedDescription.length > 3000 || !normalizedService || normalizedService.length > 80) {
        return res.status(400).json({ success: false, errcode: 400, message: "Veuillez renseigner correctement le titre, le service et la description." });
    }
    if (parsedBudget !== undefined && (!Number.isFinite(parsedBudget) || parsedBudget < 0 || parsedBudget > 1000000)) {
        return res.status(400).json({ success: false, errcode: 400, message: "Le budget doit être un montant valide." });
    }
    if (requestedDate && Number.isNaN(requestedDate.getTime())) {
        return res.status(400).json({ success: false, errcode: 400, message: "La date souhaitée est invalide." });
    }

    try {
        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.status(401).json({ success: false, errcode: 401, message: "Session invalide." });
        }

        user.quoteRequests.push({
            title: normalizedTitle,
            description: normalizedDescription,
            service: normalizedService,
            budget: parsedBudget,
            desiredDate: requestedDate,
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await user.save();

        if (!req.xhr && !req.headers.accept?.includes("json")) {
            return res.redirect("/dashboard?success=quote_created");
        }
        return res.status(201).json({
            success: true,
            message: "Votre pré-demande de projet a bien été envoyée.",
            redirect: "/dashboard"
        });
    } catch (error) {
        console.error("Erreur création devis:", error);
        return res.status(500).json({ success: false, errcode: 500, message: "Impossible d'enregistrer la demande de devis." });
    }
});

router.post("/api/article-requests", isClient, async (req, res) => {
    const { title, category, format, description, budget, desiredDate } = req.body || {};
    const normalizedTitle = typeof title === "string" ? title.trim() : "";
    const normalizedCategory = typeof category === "string" ? category.trim() : "";
    const normalizedFormat = typeof format === "string" ? format.trim() : "";
    const normalizedDescription = typeof description === "string" ? description.trim() : "";
    const parsedBudget = budget === "" || budget === undefined ? undefined : Number(budget);
    const requestedDate = desiredDate ? new Date(desiredDate) : undefined;

    if (
        !normalizedTitle || normalizedTitle.length > 120 ||
        !normalizedCategory || normalizedCategory.length > 80 ||
        !normalizedFormat || normalizedFormat.length > 80 ||
        !normalizedDescription || normalizedDescription.length > 3000
    ) {
        return res.status(400).json({
            success: false,
            errcode: 400,
            message: "Veuillez renseigner correctement le sujet, la catégorie, le format et le brief."
        });
    }
    if (parsedBudget !== undefined && (!Number.isFinite(parsedBudget) || parsedBudget < 0 || parsedBudget > 1000000)) {
        return res.status(400).json({
            success: false,
            errcode: 400,
            message: "Le budget doit être un montant valide."
        });
    }
    if (requestedDate && Number.isNaN(requestedDate.getTime())) {
        return res.status(400).json({
            success: false,
            errcode: 400,
            message: "La date souhaitée est invalide."
        });
    }

    try {
        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.status(401).json({ success: false, errcode: 401, message: "Session invalide." });
        }

        user.quoteRequests.push({
            title: normalizedTitle,
            description: `[Catégorie : ${normalizedCategory}] [Format : ${normalizedFormat}] ${normalizedDescription}`,
            service: "Article",
            budget: parsedBudget,
            desiredDate: requestedDate,
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await user.save();

        if (!req.xhr && !req.headers.accept?.includes("json")) {
            return res.redirect("/dashboard?success=article_request_created");
        }
        return res.status(201).json({
            success: true,
            message: "Votre pré-demande d'article a bien été envoyée.",
            redirect: "/dashboard"
        });
    } catch (error) {
        console.error("Erreur création pré-demande d'article:", error);
        return res.status(500).json({
            success: false,
            errcode: 500,
            message: "Impossible d'enregistrer la pré-demande d'article."
        });
    }
});

router.post("/api/admin/quotes/:userId/:quoteId/status", isAdmin, async (req, res) => {
    const allowedStatuses = new Set(["pending", "reviewing", "sent", "accepted", "declined"]);
    const { status, adminNote } = req.body || {};
    if (!allowedStatuses.has(status)) {
        return res.status(400).json({ success: false, errcode: 400, message: "Statut de devis invalide." });
    }

    try {
        const user = await User.findById(req.params.userId);
        const quote = user?.quoteRequests?.id(req.params.quoteId);
        if (!quote) {
            return res.status(404).json({ success: false, errcode: 404, message: "Demande de devis introuvable." });
        }

        quote.status = status;
        if (typeof adminNote === "string") quote.adminNote = adminNote.trim().slice(0, 2000);
        quote.updatedAt = new Date();
        await user.save();
        return res.redirect("/dashboard");
    } catch (error) {
        console.error("Erreur mise à jour devis:", error);
        return res.status(500).json({ success: false, errcode: 500, message: "Impossible de mettre à jour le devis." });
    }
});

router.post("/api/orders/create", isAdmin, async (req, res) => {
    const { name, client_name: clientName, description, price, quantity, status } = req.body || {};
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedClientName = typeof clientName === "string" ? clientName.trim() : "";
    const normalizedDescription = typeof description === "string" ? description.trim() : "";
    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);
    const allowedStatuses = new Set(["En cours", "Complété", "En attente", "Annulé"]);

    if (
        !normalizedName ||
        normalizedName.length > 160 ||
        !normalizedClientName ||
        normalizedClientName.length > 120 ||
        !normalizedDescription ||
        normalizedDescription.length > 3000 ||
        !Number.isFinite(parsedPrice) ||
        parsedPrice < 0 ||
        !Number.isFinite(parsedQuantity) ||
        !Number.isInteger(parsedQuantity) ||
        parsedQuantity < 1 ||
        parsedQuantity > 100000 ||
        (status !== undefined && !allowedStatuses.has(status))
    ) {
        return res.status(400).json({
            success: false,
            errcode: 400,
            message: "Les informations de la commande sont invalides."
        });
    }

    try {
        const client = await User.findOne({
            pseudo: normalizedClientName,
            role: { $in: ["user", "client"] }
        });
        if (!client) {
            return res.status(404).json({
                success: false,
                errcode: 404,
                message: "Client introuvable."
            });
        }

        const now = new Date();
        const order = {
            id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: normalizedName,
            description: normalizedDescription,
            client_name: client.pseudo,
            price: Math.round(parsedPrice * 100) / 100,
            quantity: parsedQuantity,
            total_price: Math.round(parsedPrice * parsedQuantity * 100) / 100,
            status: status || "En cours",
            created_at: now,
            updated_at: now
        };

        client.orders.push(order);
        await client.save();

        if (!req.xhr && !req.headers.accept?.includes("json")) {
            return res.redirect("/dashboard?success=order_created");
        }
        return res.status(201).json({
            success: true,
            errcode: 201,
            message: "Commande créée avec succès.",
            redirect: "/dashboard"
        });
    } catch (error) {
        console.error("Erreur création commande:", error);
        return res.status(500).json({
            success: false,
            errcode: 500,
            message: "Impossible de créer la commande."
        });
    }
});

// Admin : Mettre à jour le statut d'une commande
router.post("/api/orders/:orderId/status", isAdmin, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body || {};
        const allowedStatuses = new Set(["En cours", "Complété", "En attente", "Annulé"]);

        if (!status || !allowedStatuses.has(status)) {
            return res.status(400).json({ success: false, errcode: 400, message: "Statut invalide." });
        }

        const client = await User.findOne({ "orders.id": orderId });
        if (!client) {
            return res.status(404).json({ success: false, errcode: 404, message: "Commande introuvable." });
        }

        const order = client.orders.find(o => o.id === orderId);
        if (!order) {
            return res.status(404).json({ success: false, errcode: 404, message: "Commande introuvable." });
        }

        order.status = status;
        order.updated_at = new Date();
        await client.save();

        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(200).json({ success: true, message: "Statut mis à jour avec succès.", status });
        }
        return res.redirect("/dashboard?success=order_updated");
    } catch (error) {
        console.error("Erreur mise à jour statut commande:", error);
        return res.status(500).json({ success: false, errcode: 500, message: "Erreur serveur lors de la mise à jour." });
    }
});

// Admin : Supprimer une commande
router.post("/api/orders/:orderId/delete", isAdmin, async (req, res) => {
    try {
        const { orderId } = req.params;
        const client = await User.findOne({ "orders.id": orderId });
        if (!client) {
            return res.status(404).json({ success: false, errcode: 404, message: "Commande introuvable." });
        }

        client.orders = client.orders.filter(o => o.id !== orderId);
        await client.save();

        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(200).json({ success: true, message: "Commande supprimée avec succès." });
        }
        return res.redirect("/dashboard?success=order_deleted");
    } catch (error) {
        console.error("Erreur suppression commande:", error);
        return res.status(500).json({ success: false, errcode: 500, message: "Erreur serveur lors de la suppression." });
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

        // L'image est conservée dans MongoDB sous forme de data URI.
        if (req.file) {
            userDoc.avatar = imageDataUri(req.file);
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
router.get("/dashboard", isClient, async (req, res) => {
    try {
        // La session a ete resynchronisee avec la base par isClient.
        const user = req.session.user;
        let tickets = [];
        let quotes = [];
        let orders = [];
        let clients = [];
        let articles = [];
        let projects = [];
        // Déclarée hors du bloc admin : la vue dashboard lit `allUsers` pour tous les rôles.
        let allUsers = [];
        let stats = {
            totalRevenue: 0,
            totalMembers: 0,
            totalOrders: 0,
            activeOrders: 0
        };
        let activityLogs = [];

        if (user.role === "admin" || user.role === "developper") {
            [activityLogs, articles, projects, allUsers] = await Promise.all([
                ActivityLog.find().sort({ createdAt: -1 }).limit(12).lean(),
                Article.find().sort({ createdAt: -1 }).lean(),
                Project.find().sort({ createdAt: -1 }).lean(),
                User.find({}).lean()
            ]);
            clients = allUsers.filter(u => u.role === "user" || u.role === "client");

            allUsers.forEach(u => {
                if (u.orders && u.orders.length > 0) {
                    u.orders.forEach(order => orders.push({
                        ...order,
                        userId: u._id,
                        client_name: u.pseudo
                    }));
                }
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
                if (u.quoteRequests && u.quoteRequests.length > 0) {
                    u.quoteRequests.forEach(quote => quotes.push({
                        ...quote,
                        _id: quote._id,
                        userId: u._id,
                        client_name: u.pseudo,
                        client_email: u.email
                    }));
                }
            });

            tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            stats.totalMembers = allUsers.length;
            stats.totalOrders = orders.length;
            stats.activeOrders = orders.filter(order => order.status === "En cours" || order.status === "En attente").length;
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
            if (clientDoc && clientDoc.quoteRequests) {
                quotes = clientDoc.quoteRequests.slice().reverse();
            }
            if (clientDoc && clientDoc.orders) {
                orders = clientDoc.orders.slice().reverse();
            }
        }

        res.render("dashboard", {
            user,
            orders,
            clients,
            allUsers: allUsers || [],
            stats,
            tickets,
            quotes,
            categories: await loadServiceCatalogue(),
            articles
            , projects,
            activityLogs
        });
    } catch (error) {
        console.error("Erreur chargement dashboard:", error);
        res.render("dashboard", {
            user: req.session.user,
            orders: [],
            clients: [],
            allUsers: [],
            stats: {
                totalRevenue: 0,
                totalMembers: 0,
                totalOrders: 0,
                activeOrders: 0
            },
            tickets: [],
            quotes: [],
            projects: [],
            categories: [],
            articles: [],
            activityLogs: []
        });
    }
});

// Admin : Répondre à un ticket client
router.post("/api/admin/tickets/:userId/:ticketId/reply", isTicketAgent, async (req, res) => {
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
router.post("/api/admin/tickets/:userId/:ticketId/delete", isTicketAgent, async (req, res) => {
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

// Admin : Mettre à jour un utilisateur (rôle, statut, avatar, finances, mot de passe, ban, emailVerified)
router.post("/api/admin/users/update", isAdmin, async (req, res) => {
    try {
        const {
            userId,
            pseudo,
            email,
            role,
            status,
            solde,
            credits,
            avatar,
            emailVerified,
            isBan,
            banReason,
            password
        } = req.body || {};

        if (!userId) {
            return res.status(400).json({ success: false, errcode: 400, message: "ID utilisateur requis." });
        }

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ success: false, errcode: 404, message: "Utilisateur introuvable." });
        }

        // Vérification unicité pseudo
        if (pseudo && pseudo.trim() !== targetUser.pseudo) {
            const existingPseudo = await User.findOne({ pseudo: pseudo.trim(), _id: { $ne: targetUser._id } });
            if (existingPseudo) {
                return res.status(400).json({ success: false, errcode: 400, message: "Ce pseudo est déjà utilisé." });
            }
            targetUser.pseudo = pseudo.trim();
        }

        // Vérification unicité email
        if (email && email.trim().toLowerCase() !== targetUser.email) {
            const existingEmail = await User.findOne({ email: email.trim().toLowerCase(), _id: { $ne: targetUser._id } });
            if (existingEmail) {
                return res.status(400).json({ success: false, errcode: 400, message: "Cette adresse email est déjà utilisée." });
            }
            targetUser.email = email.trim().toLowerCase();
        }

        // Rôle
        const allowedRoles = ["user", "admin", "developper"];
        if (role && allowedRoles.includes(role)) {
            targetUser.role = role;
        }

        // Statut
        const allowedStatuses = ["active", "inactive"];
        if (status && allowedStatuses.includes(status)) {
            targetUser.status = status;
        }

        // Solde et crédits
        if (solde !== undefined && !isNaN(Number(solde))) {
            targetUser.solde = Math.max(0, Number(solde));
        }

        if (credits !== undefined && !isNaN(Number(credits))) {
            targetUser.credits = Math.max(0, parseInt(credits, 10));
        }

        // Avatar
        if (typeof avatar === "string") {
            targetUser.avatar = avatar.trim();
        }

        // Email vérifié & Ban
        targetUser.emailVerified = emailVerified === true || emailVerified === "true" || emailVerified === "on";
        const shouldBan = isBan === true || isBan === "true" || isBan === "on";
        const reason = typeof banReason === "string" ? banReason.trim().slice(0, 300) : "";

        if (shouldBan && !targetUser.isBan) {
            targetUser.bannedAt = new Date();
        }
        if (!shouldBan && targetUser.isBan) {
            targetUser.bannedAt = undefined;
        }
        targetUser.isBan = shouldBan;
        // Le motif n'a de sens que si le compte est banni.
        targetUser.banReason = shouldBan ? reason : "";

        // Nouveau mot de passe
        if (password && typeof password === "string" && password.trim().length >= 6) {
            targetUser.password = await bcrypt.hash(password.trim(), 12);
        }

        targetUser.updatedAt = new Date();
        await targetUser.save();

        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(200).json({
                success: true,
                message: `Utilisateur "${targetUser.pseudo}" mis à jour avec succès !`,
                user: {
                    id: targetUser._id,
                    pseudo: targetUser.pseudo,
                    email: targetUser.email,
                    role: targetUser.role,
                    status: targetUser.status,
                    isBan: targetUser.isBan,
                    banReason: targetUser.banReason
                }
            });
        }
        return res.redirect("/dashboard?success=user_updated");
    } catch (error) {
        console.error("Erreur mise à jour utilisateur admin:", error);
        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(500).json({ success: false, errcode: 500, message: "Erreur serveur lors de la mise à jour." });
        }
        return res.redirect("/dashboard?error=server_error");
    }
});

// Admin : Bannir ou débannir rapidement un utilisateur
router.post("/api/admin/users/:userId/toggle-ban", isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const targetUser = await User.findById(userId);

        if (!targetUser) {
            return res.status(404).json({ success: false, errcode: 404, message: "Utilisateur introuvable." });
        }

        targetUser.isBan = !targetUser.isBan;
        // Un debannissement remet le compteur du motif a zero.
        if (targetUser.isBan) {
            targetUser.bannedAt = new Date();
        } else {
            targetUser.bannedAt = undefined;
            targetUser.banReason = "";
        }
        targetUser.updatedAt = new Date();
        await targetUser.save();

        const msg = targetUser.isBan
            ? `L'utilisateur "${targetUser.pseudo}" a été banni.`
            : `L'utilisateur "${targetUser.pseudo}" a été débanni.`;

        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(200).json({
                success: true,
                isBan: targetUser.isBan,
                message: msg
            });
        }
        return res.redirect("/dashboard?success=ban_updated");
    } catch (error) {
        console.error("Erreur toggle ban:", error);
        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(500).json({ success: false, errcode: 500, message: "Erreur serveur lors du bannissement." });
        }
        return res.redirect("/dashboard?error=server_error");
    }
});

// ticket system router client
router.get("/client/ticket", isAuthenticated, async (req, res) => {
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

        let tickets = user.ticketClient || [];
        const isTicketStaff = user.role === "admin" || user.role === "developper";
        if (isTicketStaff) {
            const users = await User.find({ "ticketClient.0": { $exists: true } })
                .select("pseudo email ticketClient")
                .lean();
            tickets = users.flatMap(ticketUser => (ticketUser.ticketClient || []).map(ticket => ({
                ...ticket,
                userId: ticketUser._id,
                client_name: ticketUser.pseudo,
                client_email: ticketUser.email
            }))).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        res.render("ticketclient", {
            user,
            tickets,
            canCreateTicket: !isTicketStaff,
            isTicketStaff,
            messages: {
                error: errorMsg,
                success: successMsg
            }
        });
    } catch (error) {
        console.error("Erreur affichage tickets:", error);
        res.redirect(req.session.user?.role === "developper" ? "/client/ticket" : "/dashboard");
    }
});
router.get("/api/tickets/views/:id", isAuthenticated, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user.id);
        if (!currentUser) {
            return res.status(401).json({ success: false, message: "Non autorisé" });
        }

        let owner = currentUser;
        let ticket = currentUser.ticketClient.id(req.params.id) ||
            currentUser.ticketClient.find(t => t._id.toString() === req.params.id);

        if (!ticket && (currentUser.role === "admin" || currentUser.role === "developper")) {
            owner = await User.findOne({ "ticketClient._id": req.params.id });
            ticket = owner?.ticketClient?.id(req.params.id);
        }
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket non trouvé" });
        }

        return res.status(200).json({
            success: true,
            ticket,
            owner: {
                id: owner._id,
                pseudo: owner.pseudo,
                email: owner.email
            }
        });
    } catch (error) {
        console.error("Erreur récupération ticket:", error);
        return res.status(500).json({ success: false, message: "Erreur serveur" });
    }
});
router.post("/api/tickets/:id/update", isTicketAgent, async (req, res) => {
    try {
        const id = req.params.id || req.body.id;
        const { title, message, status } = req.body;
        if (!id) {
            return res.redirect("/client/ticket?error=missing_id");
        }

        const currentUser = await User.findById(req.session.user.id);
        if (!currentUser) {
            return res.redirect("/login");
        }

        let user = currentUser;
        let ticket = currentUser.ticketClient.id(id) ||
            currentUser.ticketClient.find(t => t._id.toString() === id);
        if (!ticket && (currentUser.role === "admin" || currentUser.role === "developper")) {
            user = await User.findOne({ "ticketClient._id": id });
            ticket = user?.ticketClient?.id(id);
        }
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
router.post("/api/tickets/:id/reply", isAuthenticated, async (req, res) => {
    try {
        const id = req.params.id;
        const { replyMessage } = req.body;
        if (!id || !replyMessage) {
            return res.redirect("/client/ticket?error=empty_reply");
        }

        const currentUser = await User.findById(req.session.user.id);
        if (!currentUser) {
            return res.redirect("/login");
        }

        let user = currentUser;
        let ticket = currentUser.ticketClient.id(id) ||
            currentUser.ticketClient.find(t => t._id.toString() === id);

        if (!ticket && (currentUser.role === "admin" || currentUser.role === "developper")) {
            user = await User.findOne({ "ticketClient._id": id });
            ticket = user?.ticketClient?.id(id);
        }
        if (!ticket) {
            return res.redirect("/client/ticket?error=ticket_not_found");
        }

        const isStaff = currentUser.role === 'admin' || currentUser.role === 'developper';

        if (!ticket.replies) ticket.replies = [];
        ticket.replies.push({
            sender: currentUser.pseudo || "Client",
            role: currentUser.role || "user",
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
