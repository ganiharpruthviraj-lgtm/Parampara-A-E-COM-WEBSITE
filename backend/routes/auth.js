const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const { body, validationResult } = require('express-validator');

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

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
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
  res.json(req.user);
});

// @desc    Add/Remove product from collection
// @route   POST /api/auth/collection/:id
// @access  Private
router.post('/collection/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.id;

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
    const user = await User.findById(req.user._id).populate('collections');
    res.json(user.collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const helperIsGoogleConfigured = (clientId) => {
  return (
    clientId &&
    clientId !== 'YOUR_GOOGLE_CLIENT_ID_GOES_HERE' &&
    clientId !== 'GOOGLE_CLIENT_ID_PLACEHOLDER' &&
    clientId !== 'dummy-client-id' &&
    clientId !== 'YOUR_GOOGLE_CLIENT_ID'
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

// @desc    Authenticate/Register a user with Google
// @route   POST /api/auth/google
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!helperIsGoogleConfigured(clientId)) {
      return res.status(400).json({
        message: 'Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID in backend/.env with your Google Cloud Console Client ID.'
      });
    }

    if (!token) {
      return res.status(400).json({ message: 'Google ID Token is required.' });
    }

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;
    
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
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: 'Google Authentication Failed: ' + error.message });
  }
});

module.exports = router;
