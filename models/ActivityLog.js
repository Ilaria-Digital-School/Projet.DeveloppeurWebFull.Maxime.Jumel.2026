const mongoose = require("mongoose");
const db = require("../script/rundb");

const ActivityLogSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["security", "auth", "system", "content", "user"],
        default: "system"
    },
    action: { type: String, required: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 500 },
    actor: { type: String, default: "Système", maxlength: 120 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: undefined },
    createdAt: { type: Date, default: Date.now, index: true }
});

const ActivityLog = db.model("ActivityLog", ActivityLogSchema);
module.exports = ActivityLog;
