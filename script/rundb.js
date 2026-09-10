const mongoose = require("mongoose");
<<<<<<< HEAD
const db = mongoose.createConnection(process.env.MONGO_URL);
=======
const db = mongoose.createConnection(process.env.MONGODB_URI);
>>>>>>> origin/dev

db.on("connected", () => {
    console.log("🟢=> Database connected to MongoDB");
});

db.on("error", (err) => {
    console.error("🔴=> Erreur connexion MongoDB:", err.message);
});

module.exports = db;