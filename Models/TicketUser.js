const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'pending'],
        default: 'open',
    },
    subject: {
        type: String,
        required: true,
        maxlength: 300,
        trim: true,
    },
    message: {
        type: String,
        required: true,
        maxlength: 1000,
        trim: true,
    },
    progress: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed'],
        default: 'not_started',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    modifiedAt: {
        type: Date,
        default: Date.now,
    },

});
exports = mongoose.model('Ticket', TicketSchema);
