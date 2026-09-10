const mongoose = require("mongoose");
const db = mongoose.createConnection(process.env.MONGO_URL);

db.on("connected", () => {
    console.log("🟢=> Database connected to MongoDB");
});

db.on("error", (err) => {
    console.error("🔴=> Erreur connexion MongoDB:", err.message);
});

module.exports = db;