const express = require('express');
const cors = require('cors');
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
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/saathi', require('./routes/saathi'));

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, '..')));

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

module.exports = app;
