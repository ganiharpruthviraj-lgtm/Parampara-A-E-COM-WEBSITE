const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
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
router.post('/login', async (req, res) => {
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

    const isCollected = user.collections.includes(productId);

    if (isCollected) {
      user.collections = user.collections.filter(id => id.toString() !== productId);
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

module.exports = router;
