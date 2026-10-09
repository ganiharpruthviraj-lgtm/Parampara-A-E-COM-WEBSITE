require('dotenv').config();
const fs = require('fs');
const path = require('path');
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
