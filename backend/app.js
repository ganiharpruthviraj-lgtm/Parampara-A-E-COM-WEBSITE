const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const defaultDevOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:8080'
];

// --- Security Headers (helmet) ---
// Sets 11 HTTP headers (X-Frame-Options, HSTS, Content-Security-Policy, etc.)
// that defend against clickjacking, MIME sniffing, XSS, and other common attacks.
app.use(helmet());

// --- CORS ---
app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server, mobile apps, or curl requests with no origin
    if (!origin) return callback(null, true);

    const originsList = allowedOrigins.length > 0 ? allowedOrigins : defaultDevOrigins;
    if (originsList.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy: Origin not allowed by Access-Control-Allow-Origin header'));
  },
  credentials: true
}));

// Skip rate limiting entirely in the test environment.
// express-rate-limit v7: max:0 blocks ALL requests, so we use skip() instead.
const isTestEnv = () => process.env.NODE_ENV === 'test';

// --- Global API Rate Limiter ---
// 100 requests per IP per 15 minutes across all /api/* routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: isTestEnv,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// --- Auth-Specific Rate Limiter ---
// 10 requests per IP per 15 minutes — blocks credential stuffing & brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: isTestEnv,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again after 15 minutes.' }
});

app.use(express.json());

// Routes (with rate limiting applied)
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/products', apiLimiter, require('./routes/products'));
app.use('/api/saathi', apiLimiter, require('./routes/saathi'));

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, '..')));

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

module.exports = app;
