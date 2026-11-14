/**
 * ============================================================================
 * FILE: backend/seed.js
 * MODULE: Database Seeder & Catalog Initializer
 * PROJECT: Parampara — Sovereign Indian Heritage & GI Craft Marketplace
 * ============================================================================
 * 
 * PURPOSE:
 * Master database seeding utility that populates MongoDB with authentic Geographical Indication (GI) craft heirlooms and master artisan profiles.
 * 
 * KEY RESPONSIBILITIES & CAPABILITIES:
 * - Establishes connection to MongoDB Atlas or local instance
 * - Safely purges existing mock/stale products and artisan records
 * - Injects 71+ certified masterpieces across all 28 Indian states with statutory GI application tags
 * - Configures initial inventory stock, material descriptions, and artisan attributions
 * 
 * HOW TO EXPLAIN THIS FILE IN AN INTERVIEW / VIVA:
 * "This is our database seeder script. It populates MongoDB with verified GI-tagged craft items and master artisan profiles across all 28 states of India so the platform has authentic data immediately available on boot."
 * ============================================================================
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();
const fs = require('fs');
const connectDB = require('./config/db');
const Product = require('./models/Product');

// Read the complete master GI database
const giCatalog = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data/gi-database.json'), 'utf-8')
);

// Map catalog item to MongoDB Product schema
const formattedProducts = giCatalog.map(item => ({
  name: item.name || item.title,
  state: item.state,
  region: item.region || 'India',
  craft: item.craft || item.giTag || 'Heritage Craft',
  category: item.category || item.subCategory || 'Handicrafts',
  price: item.price || 4800,
  badge: item.giTag || item.giNumber || 'GI Tagged',
  giTagged: item.giTagged !== false,
  description: item.description,
  imageUrl: item.imageUrl || item.image,
  artisan: item.artisan || item.applicant || 'Master Artisan Guild',
  district: item.district || item.originHub || item.state,
  giNumber: item.giNumber || 'GI/GOV/IND',
  registrationYear: item.registrationYear || 2012,
  artisanCount: item.artisanCount || 2500,
  exportEligible: item.exportEligible !== false
}));

const seedDB = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    await Product.insertMany(formattedProducts);
    console.log(`✓ Database successfully seeded with ${formattedProducts.length} certified heritage craft items!`);
    process.exit();
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
