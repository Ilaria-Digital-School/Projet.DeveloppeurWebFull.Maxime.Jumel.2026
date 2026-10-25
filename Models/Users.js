const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'other'
    },
    language: {
        type: String,
        enum: ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'ja'],
        default: 'en'
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'],
        default: 'USD'
    },
    birthdate: {
        type: Date,
        default: null,
    },

    adress: {
        type: String,
        default: '',
    },
    postcode: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: '',
    },
    contactNumber: {
        type: String,
        default: '',
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    roles: {
        type: [String],
        enum: ['user', 'admin', 'moderator', 'funder'],
        default: ['user'],
    },
    lastLogin: {
        type: Date,
        default: null,
    },
    last_ips: {
        type: [String],
        default: [
        
        ],
    },
    solde: {
        type: Number,
        default: 0,
    },
    profile: {
        type: {
            avatar: {
                type: String,
                default: 'default-avatar.png',
                id: {
                    type: String,
                    default: null,
                },
            },
            bio: {
                type: String,
                default: '',
                maxlength: 500,
            },
            location: {
                type: String,
                default: '',
                maxlength: 100,
            },
            socialLinks: {
                type: Map,
                of: String,
            },
        },
        default: {},
    },
    IsBanned: {
        type: Boolean,
        default: false,
    },
    IsVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        default: null,
    },
    verificationTokenExpires: {
        type: Date,
        default: null,
    },
    ResetPasswordToken: {
        type: String,
        default: null,
    },
    ResetPasswordTokenExpires: {
        type: Date,
        default: null,
    },
    rateLimited: {
        type: Boolean,
        default: false,
    },
    RaeteLimitExpires: {
        type: Date,
        default: null,
    },
    tickets: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Ticket',
        status: {
            type: String,
            enum: ['open', 'closed', 'pending'],
            default: 'open'
        },
        objet: {
            type: String,
            default: '',
            maxlength: 300,
            trim: true
        },
        message: {
            type: String,
            default: '',
            maxlength: 1000,
            trim: true

        },
        progress: {
            type: String,
            enum: ['not started', 'in progress', 'completed'],
            default: 'not started'
        },

    },




});
const saltRounds = 10;

userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(saltRounds);
        this.password = await bcrypt.hash(this.password, salt);
    }
});


const User = mongoose.model('User', userSchema);
module.exports = User;