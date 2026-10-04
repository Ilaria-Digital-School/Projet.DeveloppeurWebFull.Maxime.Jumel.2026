const mongoose = require('mongoose');

const NewLetterSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    subscribed: { type: Boolean, default: true },
});

NewLetterSchema.pre('save', async function () {
    this.updatedAt = new Date();
});

module.exports = mongoose.model('NewLetter', NewLetterSchema);