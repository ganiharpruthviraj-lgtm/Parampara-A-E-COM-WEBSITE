const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * @desc    Health check — server, database, and environment status
 * @route   GET /api/health
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }[dbState] || 'unknown';

  // --- Production Readiness Checks ---
  const warnings = [];
  const jwtSecret = process.env.JWT_SECRET || '';
  const googleClientId = process.env.GOOGLE_CLIENT_ID || '';

  const JWT_WEAK_DEFAULTS = [
    'your_jwt_secret_64_character_random_hex_string_here',
    'secret',
    'changeme',
    '',
  ];
  const GOOGLE_PLACEHOLDERS = [
    'YOUR_GOOGLE_CLIENT_ID_GOES_HERE',
    'GOOGLE_CLIENT_ID_PLACEHOLDER',
    'dummy-client-id',
    'YOUR_GOOGLE_CLIENT_ID',
    '',
  ];

  if (JWT_WEAK_DEFAULTS.includes(jwtSecret) || jwtSecret.length < 32) {
    warnings.push('JWT_SECRET is weak or unset. Generate a 64-char hex secret: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  }
  if (GOOGLE_PLACEHOLDERS.includes(googleClientId)) {
    warnings.push('GOOGLE_CLIENT_ID is not configured. Google Sign-In is disabled.');
  }

  const healthy = dbState === 1;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      host: dbState === 1 ? (mongoose.connection.host || 'unknown') : null,
    },
    google_oauth: {
      configured: !GOOGLE_PLACEHOLDERS.includes(googleClientId),
    },
    warnings: warnings.length > 0 ? warnings : undefined,
  });
});

module.exports = router;
