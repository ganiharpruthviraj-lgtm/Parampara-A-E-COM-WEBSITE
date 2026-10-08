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
// Configured to permit required CDN assets, Google Sign-In SDK, and fonts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://cdn.tailwindcss.com",
          "https://accounts.google.com",
          "https://cdnjs.cloudflare.com",
          "https://unpkg.com"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdnjs.cloudflare.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://cdnjs.cloudflare.com"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://assets.ls-assets.com",
          "https://cdn-icons-png.flaticon.com",
          "https://picsum.photos",
          "https://*.googleusercontent.com"
        ],
        connectSrc: [
          "'self'",
          "http://localhost:5000",
          "http://127.0.0.1:5000",
          "https://accounts.google.com",
          "https://parampara-a-e-com-website-1.onrender.com"
        ],
        frameSrc: [
          "'self'",
          "https://accounts.google.com"
        ]
      }
    }
  })
);

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
// 100 requests per IP per 15 minutes across general /api/* routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: isTestEnv,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// --- Auth-Specific Rate Limiter ---
// 30 requests per IP per 15 minutes for login/register endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skip: isTestEnv,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again after 15 minutes.' }
});

app.use(express.json());

// --- Startup Production Readiness Warnings ---
(function checkProductionReadiness() {
  const warnings = [];
  const jwtSecret = process.env.JWT_SECRET || '';
  const googleClientId = process.env.GOOGLE_CLIENT_ID || '';

  if (!jwtSecret || jwtSecret.length < 32 || jwtSecret === 'your_jwt_secret_64_character_random_hex_string_here') {
    warnings.push('⚠️  JWT_SECRET is weak or not set. Generate one: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  }
  if (['YOUR_GOOGLE_CLIENT_ID_GOES_HERE', 'GOOGLE_CLIENT_ID_PLACEHOLDER', 'dummy-client-id', 'YOUR_GOOGLE_CLIENT_ID', ''].includes(googleClientId)) {
    warnings.push('ℹ️  GOOGLE_CLIENT_ID is not configured — Google Sign-In will be disabled.');
  }
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.ALLOWED_ORIGINS) {
      warnings.push('⚠️  ALLOWED_ORIGINS is not set in production — CORS will use dev defaults.');
    }
  }
  if (warnings.length > 0) {
    console.warn('\n╔══════════════════════════════════════════════╗');
    console.warn('║       PARAMPARA PRODUCTION READINESS         ║');
    console.warn('╚══════════════════════════════════════════════╝');
    warnings.forEach(w => console.warn(w));
    console.warn('');
  }
})();

// Apply rate limiters appropriately
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/google', authLimiter);
app.use('/api/health', require('./routes/health'));  // No rate limit — used by uptime monitors
app.use('/api/auth', apiLimiter, require('./routes/auth'));
app.use('/api/products', apiLimiter, require('./routes/products'));
app.use('/api/saathi', apiLimiter, require('./routes/saathi'));
app.use('/api/gi', apiLimiter, require('./routes/gi'));

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, '..')));

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

module.exports = app;
