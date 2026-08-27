const mongoose = require("mongoose");
const db = require("../script/rundb");


const UserSchema = new mongoose.Schema({
    pseudo: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin", "developper"], default: "user" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isBan: { type: Boolean, default: false },
    last_ip: { type: String },
    last_login: { type: Date, default: Date.now },
    last_logout: { type: Date },
    solde: { type: Number, default: 0 },
    credits: { type: Number, default: 0 },
    avatar: { type: String, default: "" },
    prj: { type: Number, default: 0 },
    cmd: { type: Number, default: 0 },
    ticket: { type: Number, default: 0 },

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

const User = db.model("User", UserSchema);
module.exports = User;
