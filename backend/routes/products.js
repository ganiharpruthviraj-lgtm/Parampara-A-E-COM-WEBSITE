const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');

// Master GI database as guaranteed catalog source
let GI_DATA = [];
try {
  GI_DATA = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/gi-database.json'), 'utf-8')
  );
} catch (e) {
  console.warn('Could not load gi-database.json:', e.message);
}

// Load Karnataka dataset
let KARNATAKA_DATA = [];
try {
  const karnatakaPath = path.join(__dirname, '../../data/karnataka-products.json');
  if (fs.existsSync(karnatakaPath)) {
    KARNATAKA_DATA = JSON.parse(fs.readFileSync(karnatakaPath, 'utf-8'));
  }
} catch (e) {
  console.warn('Could not load karnataka-products.json:', e.message);
}

// Format GI item or Karnataka product into full product schema
function giToProduct(item) {
  const name = item.title || item.name;
  const imageUrl = item.image || item.imageUrl;
  const giTag = item.giTag || (item.giTagged ? 'GI Registered' : 'Heritage Craft');
  const artisan = item.artisan || item.applicant || 'Master Artisan Guild';
  const district = item.originHub || item.district || item.state;

  return {
    _id: item.id || item._id,
    id: item.id || item._id,
    title: name,
    name: name,
    state: item.state || 'Karnataka',
    region: item.region || 'South India',
    craft: item.craft || giTag,
    category: item.category || 'Handicrafts',
    price: item.price || 4200,
    currency: item.currency || 'INR',
    imageUrl: imageUrl,
    image: imageUrl,
    giTag: giTag,
    badge: giTag,
    description: item.description,
    artisan: artisan,
    originHub: item.originHub || district,
    artisanCount: item.artisanCount || 2500,
    district: district,
    rating: item.rating || 4.8,
    inStock: item.inStock !== false,
    giNumber: item.giNumber || giTag,
    registrationYear: item.registrationYear || 2015,
    exportEligible: item.exportEligible !== false,
    giTagged: true
  };
}

// @desc    Get all products (with search/filters)
// @route   GET /api/products
router.get('/', async (req, res) => {
  try {
    const { q, category, state, minPrice, maxPrice } = req.query;

    // If MongoDB is connected and ready, query it
    if (mongoose.connection.readyState === 1) {
      try {
        let query = {};
        if (q) query.$text = { $search: q };
        if (category) {
          const regexStr = '^' + category.replace(/[eé]/g, '[eé]') + '$';
          query.category = { $regex: regexStr, $options: 'i' };
        }
        if (state) {
          const statePattern = state.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\b(and|&)\b/gi, '(and|&)');
          query.state = { $regex: statePattern, $options: 'i' };
        }
        if (minPrice || maxPrice) {
          query.price = {};
          if (minPrice) query.price.$gte = Number(minPrice);
          if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const products = await Product.find(query).maxTimeMS(2000);
        if (products && products.length > 0) {
          return res.json({ count: products.length, products });
        }
      } catch (dbErr) {
        console.warn('DB query timed out or failed, falling back to GI master catalog:', dbErr.message);
      }
    }

    // High-performance fallback from master catalog
    let list = GI_DATA.map(giToProduct);

    if (state && state.trim()) {
      const statePattern = state.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\b(and|&)\b/gi, '(and|&)');
      const stateRegex = new RegExp(statePattern, 'i');
      list = list.filter(p => stateRegex.test(p.state));
    }

    if (category && category.trim() && category.toLowerCase() !== 'all') {
      const catTerm = category.toLowerCase().trim();
      list = list.filter(p => 
        p.category.toLowerCase().includes(catTerm) ||
        (catTerm.includes('textile') && p.category.toLowerCase().includes('textile')) ||
        (catTerm.includes('pottery') && p.category.toLowerCase().includes('pottery')) ||
        (catTerm.includes('jewel') && p.category.toLowerCase().includes('jewel')) ||
        (catTerm.includes('paint') && p.category.toLowerCase().includes('paint')) ||
        (catTerm.includes('wood') && p.category.toLowerCase().includes('wood')) ||
        (catTerm.includes('metal') && p.category.toLowerCase().includes('metal'))
      );
    }

    if (q && q.trim()) {
      const qTerms = q.toLowerCase().trim().split(/\s+/);
      list = list.filter(p => {
        const text = `${p.name} ${p.craft} ${p.state} ${p.category} ${p.district} ${p.description}`.toLowerCase();
        return qTerms.every(t => text.includes(t));
      });
    }

    if (minPrice) list = list.filter(p => p.price >= Number(minPrice));
    if (maxPrice) list = list.filter(p => p.price <= Number(maxPrice));

    res.json({ count: list.length, products: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const product = await Product.findById(req.params.id).maxTimeMS(2000);
        if (product) return res.json(product);
      } catch (err) {}
    }

    const giItem = GI_DATA.find(item => item.id === req.params.id || item.giNumber === req.params.id);
    if (giItem) {
      return res.json(giToProduct(giItem));
    }

    res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
