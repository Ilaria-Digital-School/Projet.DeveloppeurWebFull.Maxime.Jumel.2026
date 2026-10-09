const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 3000
    },
    // Nom d'icône bootstrap-icons, ex. "bi-code-slash".
    icon: {
        type: String,
        required: true,
        trim: true,
        maxlength: 60
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

CategorySchema.pre("save", function () {
    this.updatedAt = new Date();
});

// Index unique avec collation : « Développement Web » et « developpement web »
// sont.refusés comme doublon, y compris en cas de course entre deux requêtes.
CategorySchema.index({ name: 1 }, { unique: true, collation: { locale: "fr", strength: 2 } });

module.exports = mongoose.model("Category", CategorySchema);