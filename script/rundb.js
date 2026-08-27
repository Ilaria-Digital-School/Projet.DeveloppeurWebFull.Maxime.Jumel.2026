const mongoose = require("mongoose");
const db = mongoose.createConnection(process.env.MONGODB_URI);

db.on("connected", () => {
    console.log("🟢=> Database connected to MongoDB");
});

db.on("error", (err) => {
    console.error("🔴=> Erreur connexion MongoDB:", err.message);
});

module.exports = db;