const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../Models/Users');

const COOKIE_NAME = 'token';
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

let SECRET = process.env.JWT_SECRET;
if (!SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production');
    }
    SECRET = crypto.randomBytes(48).toString('hex');
    console.warn('JWT_SECRET not set: using a random secret, sessions will not survive a restart');
}

const cookieOptions = () => ({
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_TTL_MS,
});

const issueToken = (res, user) => {
    const token = jwt.sign({ sub: user.id }, SECRET, { algorithm: 'HS256', expiresIn: TOKEN_TTL_MS / 1000 });
    res.cookie(COOKIE_NAME, token, cookieOptions());
};

const clearToken = (res) => {
    res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
};

// Populates req.user from the signed cookie; always reloads the user so bans and role changes apply immediately.
const authenticate = async (req, res, next) => {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return next();
    try {
        const payload = jwt.verify(token, SECRET, { algorithms: ['HS256'] });
        const user = await User.findById(payload.sub).select('-password');
        if (user && !user.IsBanned) req.user = user;
    } catch {
        // invalid or expired token: treat as anonymous
    }
    next();
};

const requireAuth = (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    next();
};

module.exports = { authenticate, requireAuth, issueToken, clearToken };
