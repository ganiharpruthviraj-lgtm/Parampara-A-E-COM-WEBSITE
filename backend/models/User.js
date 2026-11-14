/**
 * ============================================================================
 * FILE: backend/models/User.js
 * MODULE: User Account Domain Model
 * PROJECT: Parampara — Sovereign Indian Heritage & GI Craft Marketplace
 * ============================================================================
 * 
 * PURPOSE:
 * Mongoose schema and entity model defining patron accounts, authentication credentials, and saved collections.
 * 
 * KEY RESPONSIBILITIES & CAPABILITIES:
 * - Defines user attributes: name, email, passwordHash, role, phone, and savedCollection
 * - Implements pre-save middleware hook hashing passwords with Bcrypt (10 salt rounds)
 * - Provides matchPassword() instance method for constant-time password verification
 * - Maintains indexed unique constraints on user email addresses
 * 
 * HOW TO EXPLAIN THIS FILE IN AN INTERVIEW / VIVA:
 * "This is the Mongoose schema for user accounts. It defines fields like email, hashed password, role, and curated collections, and includes a pre-save hook that hashes passwords using Bcrypt with 10 salt rounds."
 * ============================================================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['user', 'artisan', 'admin'],
    default: 'user'
  },
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  phone: {
    type: String,
    default: null,
    match: [/^[6-9]\d{9}$/, 'Please add a valid 10-digit Indian mobile number']
  },
  avatarUrl: {
    type: String,
    default: null
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  shippingAddress: {
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
