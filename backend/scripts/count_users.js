/**
 * Parampara Heritage — User & Collector Analytics Reporter
 * Usage: node backend/scripts/count_users.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

async function showUserStats() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in backend/.env');
      process.exit(1);
    }

    console.log('🏺 Connecting to Parampara MongoDB Atlas Cluster...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

    const totalCount = await User.countDocuments();
    const users = await User.find({}, 'name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    console.log('\n======================================================');
    console.log(`📊 TOTAL REGISTERED USERS / COLLECTORS: ${totalCount}`);
    console.log('======================================================');
    console.log('Latest 20 Registered Accounts:');
    
    users.forEach((u, i) => {
      const dateStr = u.createdAt ? new Date(u.createdAt).toLocaleString('en-IN') : 'N/A';
      console.log(` ${i + 1}. ${u.name.padEnd(25)} | ${u.email.padEnd(35)} | ${dateStr}`);
    });
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error querying database:', err.message);
    process.exit(1);
  }
}

showUserStats();
