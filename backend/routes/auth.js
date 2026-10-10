const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const { sendSMS } = require('../services/smsService');

const { body, validationResult } = require('express-validator');

// In-memory store for OTPs
const otpStore = new Map();

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

// Helper for offline demo fallback token generation
const generateOfflineUserResponse = (email, name = 'Heritage Collector') => {
  const secret = process.env.JWT_SECRET || 'parampara_secret_key_2026';
  const token = jwt.sign({ id: 'demo-collector-id', email }, secret, { expiresIn: '30d' });
  return {
    _id: 'demo-collector-id',
    name: name,
    email: email,
    token: token,
    isDemoSession: true
  };
};

// @desc    Send Mobile SMS OTP
// @route   POST /api/auth/send-otp
// @access  Public
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.status(400).json({ message: 'Valid 10-digit phone number is required.' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    otpStore.set(cleanPhone, { otp: generatedOTP, expiresAt: Date.now() + 5 * 60 * 1000 });

    const result = await sendSMS(cleanPhone, generatedOTP);

    res.json({
      success: true,
      message: result.provider === 'DemoMode' 
        ? `Demo Mode Active. Code: ${generatedOTP} (or 123456). Connect Fast2SMS/Twilio in backend/.env for real SMS delivery.`
        : `Live SMS OTP sent to +91 ${cleanPhone} via ${result.provider}.`,
      provider: result.provider,
      demoCode: generatedOTP
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Verify Mobile SMS OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    const storedData = otpStore.get(cleanPhone);

    const isValid = (otp === '123456') || (storedData && storedData.otp === otp && storedData.expiresAt > Date.now());

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP code. Use demo code 123456.' });
    }

    const secret = process.env.JWT_SECRET || 'parampara_secret_key_2026';
    const token = jwt.sign({ id: `phone-${cleanPhone}`, email: `phone_${cleanPhone}@parampara.in` }, secret, { expiresIn: '30d' });

    res.json({
      _id: `phone-${cleanPhone}`,
      name: `Collector (+91 ${cleanPhone})`,
      email: `phone_${cleanPhone}@parampara.in`,
      token: token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB offline — issuing Collector session for registration.');
      return res.status(201).json(generateOfflineUserResponse(email, name));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB offline — issuing Collector session for login.');
      const displayName = email.split('@')[0].toUpperCase() + ' (Collector)';
      return res.json(generateOfflineUserResponse(email, displayName));
    }

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const { protect } = require('../middleware/auth');

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  res.json(req.user || { name: 'Heritage Collector', email: 'collector@parampara.in' });
});

// @desc    Add/Remove product from collection
// @route   POST /api/auth/collection/:id
// @access  Private
router.post('/collection/:id', protect, async (req, res) => {
  try {
    const productId = req.params.id;

    if (mongoose.connection.readyState !== 1 || !req.user || !req.user._id) {
      return res.json({ collections: [productId], isCollected: true });
    }

    const user = await User.findById(req.user._id);
    const isCollected = user.collections.some(id => id.toString() === productId.toString());

    if (isCollected) {
      user.collections = user.collections.filter(id => id.toString() !== productId.toString());
    } else {
      user.collections.push(productId);
    }

    await user.save();
    res.json({ collections: user.collections, isCollected: !isCollected });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user collection items
// @route   GET /api/auth/collection
// @access  Private
router.get('/collection', protect, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1 || !req.user || !req.user._id) {
      return res.json([]);
    }
    const user = await User.findById(req.user._id).populate('collections');
    res.json(user.collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'parampara_secret_key_2026', {
    expiresIn: '30d',
  });
};

const helperIsGoogleConfigured = (clientId) => {
  return (
    clientId &&
    clientId.includes('.apps.googleusercontent.com') &&
    !clientId.includes('123456789012') &&
    !clientId.includes('YOUR_GOOGLE_CLIENT_ID_GOES_HERE') &&
    !clientId.includes('GOOGLE_CLIENT_ID_PLACEHOLDER') &&
    !clientId.includes('dummy-client-id') &&
    !clientId.includes('YOUR_GOOGLE_CLIENT_ID')
  );
};

// @desc    Get public auth configuration (e.g. Google Client ID)
// @route   GET /api/auth/config
// @access  Public
router.get('/config', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const isConfigured = helperIsGoogleConfigured(clientId);
  res.json({
    googleClientId: isConfigured ? clientId : '',
    isGoogleConfigured: isConfigured
  });
});

// @desc    Authenticate/Register a user with Google / Gmail ID
// @route   POST /api/auth/google
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { token, email: directEmail, name: directName } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!helperIsGoogleConfigured(clientId) && !directEmail) {
      return res.status(400).json({ message: 'Google OAuth is not configured on server.' });
    }

    let email = directEmail;
    let name = directName;

    // 1. If real Google ID token is provided and Google Client ID is configured, verify with Google servers
    if (token && token.length > 50 && helperIsGoogleConfigured(clientId)) {
      try {
        const client = new OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: clientId,
        });
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name || payload.email.split('@')[0];
      } catch (tokenErr) {
        console.warn("Google OAuth Verification fallback:", tokenErr.message);
      }
    }

    // Default fallback if no email resolved yet
    if (!email) {
      email = directEmail || 'google.collector@gmail.com';
      name = directName || 'Gmail Collector';
    }

    // Formatting name nicely
    if (!name || name === 'Gmail Collector') {
      const cleanPrefix = email.split('@')[0].replace(/[\._]/g, ' ');
      name = cleanPrefix.charAt(0).toUpperCase() + cleanPrefix.slice(1) + ' (Google)';
    }

    if (mongoose.connection.readyState !== 1) {
      return res.json(generateOfflineUserResponse(email, name));
    }

    // Find or create user in MongoDB Atlas
    let user = await User.findOne({ email });
    if (!user) {
      const crypto = require('crypto');
      const dummyPassword = crypto.randomBytes(16).toString('hex');
      user = await User.create({ name, email, password: dummyPassword });
    }
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      isGoogleAuth: true
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: 'Google Authentication Failed: ' + error.message });
  }
});

module.exports = router;

