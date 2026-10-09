const mongoose = require("mongoose");
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;

mongoose.connect(mongoUri);

mongoose.connection.on("connected", () => {
    console.log("🟢=> Database connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
    console.error("🔴=> Erreur connexion MongoDB:", err.message);
});

module.exports = mongoose.connection;