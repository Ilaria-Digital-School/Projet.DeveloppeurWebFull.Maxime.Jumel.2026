const mongoose = require("mongoose");
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
const db = mongoose.createConnection(mongoUri);

db.on("connected", () => {
    console.log("🟢=> Database connected to MongoDB");
});

db.on("error", (err) => {
    console.error("🔴=> Erreur connexion MongoDB:", err.message);
});

module.exports = db;