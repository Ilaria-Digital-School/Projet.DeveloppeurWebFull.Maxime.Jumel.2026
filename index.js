const express = require('express');
const app = express();
const PORT = process.env.API_PORT || 3001;
const mongoose = require('mongoose');
const role = require('./middleware/role');
const User = require('./Models/Users');
const Ticket = require('./Models/TicketUser');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { authenticate, issueToken, clearToken } = require('./middleware/auth');

const isStr = (v, max = 254) => typeof v === 'string' && v.length <= max;
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10);
const publicUser = (u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    roles: u.roles,
    solde: u.solde,
    tickets: Array.isArray(u.tickets) ? u.tickets.length : 0,
    genre: u.genre,
    language: u.language,
    currency: u.currency,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts, please try again later' },
});

app.disable('x-powered-by');
app.use(helmet({
    contentSecurityPolicy: { directives: { 'upgrade-insecure-requests': null } },
}));

app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));
// The React app runs on another origin (Vite dev server by default) and authenticates with the cookie,
// so it must call fetch/axios with credentials ('include' / withCredentials: true).
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3001').split(',');
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(authenticate);




mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/steamtools').then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
});


app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.json({ message: 'Steamtools API', docs: '/api/v1' });
});


app.get('/api/v1' , (req, res) => {
    res.json({ message: 'Welcome to the API!' });
});
app.get('/api/v1/health', (req, res) => {
   try {
    // Perform health checks here (e.g., database connection, external services)
    // If all checks pass, return a healthy status
    res.json({ status: 'healthy' });
   } catch (error) {
    // If any health check fails, return an unhealthy status
    res.status(500).json({ status: 'unhealthy', error: error.message });
   }
    
});
app.get('/api/v1/ping', (req, res) => {
    const startTime = process.hrtime.bigint();

    res.on('finish', () => {
        const ms = Number(process.hrtime.bigint() - startTime) / 1e6;
        console.log(`Response time: ${ms.toFixed(2)}ms`);
    });

   
    res.json({ message: 'pong'  });
});
app.get('/api/v1/users', role('admin'),  async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});
app.get('/api/v1/user/:id', role('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});
app.get('/api/v1/tickets', role('admin'), async (req, res) => {
    try {
        const tickets = await Ticket.find();
        if (!tickets || tickets.length === 0) {
            return res.status(404).json({ message: 'Tickets not found' });
        }
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tickets', error: error.message });
    }
});
app.post('/api/v1/login', authLimiter, async (req, res) => {
    const { username, password } = req.body;
    if (!isStr(username) || !isStr(password, 72) || !username || !password) {
        return res.status(400).json({ message: 'Invalid request' });
    }
    try {
        const user = await User.findOne({ username });
        const ok = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
        if (!user || !ok || user.IsBanned) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        user.lastLogin = new Date();
        await user.save();
        issueToken(res, user);
        res.json({ message: 'Login successful', user: publicUser(user) });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});

app.get('/api/v1/me', (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    res.json({ user: publicUser(req.user) });
});

app.post('/api/v1/logout', (req, res) => {
    clearToken(res);
    res.json({ message: 'Logged out' });
});

app.post('/api/v1/register', authLimiter, async (req, res) => {
    const { username, email, password, confirmPassword, address, postalCode, city, phone, birthdate, gender, language, currency } = req.body;
    const fields = [username, email, password, confirmPassword, address, postalCode, city, phone, birthdate, gender, language, currency];
    if (!fields.every(f => f === undefined || isStr(f))) {
        return res.status(400).json({ message: 'Invalid request' });
    }
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email and password are required' });
    }
    if (!/^[\w.-]{3,30}$/.test(username)) {
        return res.status(400).json({ message: 'Username must be 3-30 characters (letters, digits, . _ -)' });
    }
    if (password.length < 8 || password.length > 72) {
        return res.status(400).json({ message: 'Password must be 8-72 characters' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }
    try {
        // Explicit whitelist: roles, solde, IsVerified, etc. can never be set by the client.
        const newUser = new User({
            username,
            email: email.trim().toLowerCase(),
            password,
            adress: address,
            postcode: postalCode,
            city,
            contactNumber: phone,
            birthdate: birthdate || null,
            genre: gender,
            language,
            currency,
        });
        await newUser.save();
        issueToken(res, newUser);
        res.status(201).json({ message: 'User registered successfully', user: publicUser(newUser) });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Username or email already in use' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Invalid data' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error during registration' });
    }
});
