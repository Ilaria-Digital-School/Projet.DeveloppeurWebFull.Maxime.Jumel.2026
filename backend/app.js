require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const color = require('chalk').default;
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./Models/User');

const app = express();
const port = process.env.PORT || 3445;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === '') {
  throw new Error('JWT_SECRET manquant dans le fichier .env');
}

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(passport.initialize());

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');

passport.use(new LocalStrategy({ usernameField: 'email' }, async (rawEmail, password, done) => {
  try {
    const email = normalizeEmail(rawEmail);
    if (!EMAIL_REGEX.test(email) || typeof password !== 'string') {
      return done(null, false, { message: 'Invalid credentials.' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return done(null, false, { message: 'Invalid credentials.' });
    }
    if (user.isBan) {
      return done(null, false, { message: 'Account banned.' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

app.get('/', (req, res) => {
  res.redirect('https://souflyhub.dev');
});

app.post('/api/login', passport.authenticate('local', { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user.id, role: req.user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Logged in successfully', token });
});

const requireAuth = async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).select('pseudo email role isBan solde credits prj cmd ticket');
    if (!user || user.isBan) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

app.get('/api/me', requireAuth, (req, res) => {
  const { id, pseudo, email, role, solde, credits, prj, cmd, ticket } = req.user;
  res.json({ id, pseudo, email, role, solde, credits, prj, cmd, ticket });
});

app.post('/api/registers', async (req, res) => {
  const { pseudo, password } = req.body;
  const email = normalizeEmail(req.body.email);
  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Invalid email address (must contain @ and a domain)' });
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: 'Password must be between 8 and 72 characters' });
  }
  try {
    await User.create({
      pseudo: typeof pseudo === 'string' && pseudo.trim() ? pseudo.trim() : email.split('@')[0],
      email,
      password: await bcrypt.hash(password, 10),
    });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(err.code === 11000 ? 409 : 400).json({ error: err.message });
  }
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mabase').then(() => {
  console.log(color.green('Connected to MongoDB'));
}).catch((err) => {
  console.error(color.red(`Error connecting to MongoDB: ${err}`));
});

app.listen(port, () => {
  console.log(color.green(`Server is running on port ${port}`));
});
