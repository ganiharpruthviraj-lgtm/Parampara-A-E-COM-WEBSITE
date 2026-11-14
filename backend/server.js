/**
 * ============================================================================
 * FILE: backend/server.js
 * MODULE: Server Runtime Bootstrap
 * PROJECT: Parampara — Sovereign Indian Heritage & GI Craft Marketplace
 * ============================================================================
 * 
 * PURPOSE:
 * Entry point and HTTP server cluster bootstrap for the Parampara backend API.
 * 
 * KEY RESPONSIBILITIES & CAPABILITIES:
 * - Loads environment variables from root and local .env files
 * - Initializes 3-tier resilient MongoDB database connection via connectDB()
 * - Binds Express application cluster to process.env.PORT or port 5000
 * - Provides clean startup logging and port listening confirmation
 * 
 * HOW TO EXPLAIN THIS FILE IN AN INTERVIEW / VIVA:
 * "This is the server entry point. It loads environment variables with dotenv, initializes our 3-tier resilient database connection, and starts the Express HTTP server listening on port 5000."
 * ============================================================================
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Parampara Web Server running on http://localhost:${PORT}`);
});
