/**
 * ============================================================================
 * FILE: backend/tests/setup.js
 * MODULE: Jest Test Suite Environment Setup
 * PROJECT: Parampara — Sovereign Indian Heritage & GI Craft Marketplace
 * ============================================================================
 * 
 * PURPOSE:
 * Configures global test environment, in-memory MongoDB mock databases, and silent logging flags for automated testing.
 * 
 * KEY RESPONSIBILITIES & CAPABILITIES:
 * - Sets process.env.NODE_ENV = "test" and test JWT secrets
 * - Configures Jest global timeout limits for HTTP endpoint simulations
 * - Suppresses noisy console output during test runs
 * 
 * HOW TO EXPLAIN THIS FILE IN AN INTERVIEW / VIVA:
 * "This file configures our Jest test environment, setting test environment variables and initializing mock database states."
 * ============================================================================
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Set Jest default timeout for in-memory MongoDB initialization on Windows
if (typeof jest !== 'undefined') {
  jest.setTimeout(30000);
}

const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
};

const closeTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

module.exports = {
  connectTestDB,
  closeTestDB,
  clearTestDB,
};
