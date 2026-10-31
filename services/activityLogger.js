const ActivityLog = require("../models/ActivityLog");

const recordActivity = async ({ type, action, description, actor, metadata } = {}) => {
    try {
        await ActivityLog.create({
            type,
            action,
            description,
            actor,
            metadata
        });
    } catch (error) {
        // Journaliser ne doit pas masquer l'opération principale, mais l'échec
        // doit rester visible côté serveur pour permettre un diagnostic.
        console.error("Erreur écriture journal d'activité:", error);
    }
};

module.exports = { recordActivity };
