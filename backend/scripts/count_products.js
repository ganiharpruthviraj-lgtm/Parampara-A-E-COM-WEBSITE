/**
 * ============================================================================
 * FILE: backend/scripts/count_products.js
 * MODULE: Product Catalog Database Analytics & Viewer
 * PROJECT: Parampara — Sovereign Indian Heritage & GI Craft Marketplace
 * ============================================================================
 * 
 * PURPOSE:
 * Connects directly to MongoDB Atlas to display total product count, state-wise
 * distribution, and itemized product lists with GI tags, prices, and artisans.
 * 
 * USAGE:
 * node backend/scripts/count_products.js          (Shows summary + 20 sample products)
 * node backend/scripts/count_products.js --all    (Shows all products in MongoDB)
 * node backend/scripts/count_products.js --state=Karnataka (Filters by state)
 * ============================================================================
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Product = require('../models/Product');

async function showProductStats() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in backend/.env');
      process.exit(1);
    }

    console.log('🏺 Connecting to Parampara MongoDB Atlas Cluster...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

    const totalCount = await Product.countDocuments();
    
    // Check for CLI arguments
    const isAll = process.argv.includes('--all');
    const stateArg = process.argv.find(a => a.startsWith('--state='));
    const filterState = stateArg ? stateArg.split('=')[1] : null;

    let query = {};
    if (filterState) {
      query.state = new RegExp(filterState, 'i');
    }

    const filteredCount = await Product.countDocuments(query);
    const limit = isAll ? filteredCount : 20;

    const products = await Product.find(query, 'name state craft category price giNumber artisan stock')
      .sort({ state: 1, name: 1 })
      .limit(limit);

    // Aggregate state breakdown
    const stateBreakdown = await Product.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } }
    ]);

    console.log('\n======================================================================');
    console.log(`📦 TOTAL CERTIFIED CRAFT PRODUCTS IN MONGODB: ${totalCount}`);
    console.log('======================================================================');
    
    console.log('\n🗺️  Crafts Distribution Across States in MongoDB:');
    stateBreakdown.forEach((s, idx) => {
      const stateName = (s._id || 'Unassigned').padEnd(25);
      process.stdout.write(`  ${(idx + 1).toString().padStart(2)}. ${stateName}: ${s.count} craft(s)`);
      if ((idx + 1) % 2 === 0 || idx === stateBreakdown.length - 1) process.stdout.write('\n');
      else process.stdout.write('   |   ');
    });

    console.log('\n======================================================================');
    if (filterState) {
      console.log(`🔎 Showing ${products.length} Products for State matching "${filterState}":`);
    } else if (isAll) {
      console.log(`📋 Showing All ${products.length} Products in Database:`);
    } else {
      console.log(`📋 Showing First ${products.length} Products (use --all to see all ${totalCount}):`);
    }
    console.log('----------------------------------------------------------------------');

    products.forEach((p, i) => {
      const priceStr = `₹${(p.price || 0).toLocaleString('en-IN')}`.padStart(9);
      const giStr = (p.giNumber || 'GI Tagged').padEnd(16);
      const stateStr = (p.state || 'India').padEnd(18);
      console.log(` ${(i + 1).toString().padStart(2)}. ${p.name.slice(0, 38).padEnd(38)} | ${stateStr} | ${priceStr} | ${giStr} | By: ${p.artisan}`);
    });

    console.log('======================================================================\n');
    console.log('💡 Quick Tips:');
    console.log('   - To see all products:             node backend/scripts/count_products.js --all');
    console.log('   - To filter by state:              node backend/scripts/count_products.js --state=Karnataka');
    console.log('   - To see in MongoDB Atlas web:     Log into cloud.mongodb.com -> Database "parampara" -> "products"\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error querying database:', err.message);
    process.exit(1);
  }
}

showProductStats();
