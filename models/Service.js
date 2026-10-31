const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 160
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 3000
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ServiceSchema.pre("save", function () {
    this.updatedAt = new Date();
});

ServiceSchema.index({ category: 1 });

module.exports = mongoose.model("Service", ServiceSchema);