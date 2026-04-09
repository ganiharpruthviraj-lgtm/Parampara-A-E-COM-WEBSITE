require('dotenv').config();
const connectDB = require('./config/db');
const Product = require('./models/Product');

const products = [
  {
    name: 'Royal Meenakari Choker',
    state: 'Jaipur, Rajasthan',
    region: 'North India',
    craft: 'Enamel Jewelry',
    category: 'Jewery & Ornaments',
    price: 96000,
    badge: 'Master Artisan',
    giTagged: true,
    description: 'A timeless masterpiece of Rajasthani craftsmanship, featuring intricate hand-painted enamel and semi-precious stones.',
    imageUrl: 'https://picsum.photos/seed/re/600/800',
    artisan: 'Gopal Saini'
  },
  {
    name: 'Zari-Work Crimson Saree',
    state: 'Varanasi, Uttar Pradesh',
    region: 'North India',
    craft: 'Banarasi Brocade',
    category: 'Textiles & Weaves',
    price: 186000,
    badge: 'Master Artisan',
    giTagged: true,
    description: 'Handwoven with pure silk and silver-dipped zari threads, this saree represents centuries of weaving tradition.',
    imageUrl: 'https://picsum.photos/seed/saree/600/800',
    artisan: 'Mustafa Ahmed'
  },
  {
    name: 'Azure Floral Vase',
    state: 'Blue Pottery, Jaipur',
    region: 'North India',
    craft: 'Quartz Pottery',
    category: 'Pottery & Ceramics',
    price: 24800,
    description: 'Vibrant blue pottery made from quartz, raw glaze, and sodium sulphate. A unique non-clay craft of the Pink City.',
    imageUrl: 'https://picsum.photos/seed/vase/600/800',
    artisan: 'Suresh Kumar'
  },
  {
    name: 'Dokra Metallic Figurine',
    state: 'Bastar, Chhattisgarh',
    region: 'Central India',
    craft: 'Lost Wax Casting',
    category: 'Home Decor',
    price: 15500,
    description: 'Ancient tribal metal craft using the non-ferrous lost-wax casting technique. Every piece is unique.',
    imageUrl: 'https://picsum.photos/seed/dokra/600/800',
    artisan: 'Budhilal Dewangan'
  },
  {
    name: 'Hand-Painted Pattachitra',
    state: 'Raghurajpur, Odisha',
    region: 'East India',
    craft: 'Pattachitra Painting',
    category: 'Art & Paintings',
    price: 42000,
    description: 'Traditional scroll painting on cloth, using natural pigments derived from stones and shells.',
    imageUrl: 'https://picsum.photos/seed/paint/600/800',
    artisan: 'Bhaskar Mohapatra'
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    await Product.insertMany(products);
    console.log('✓ Database seeded with premium crafts!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
