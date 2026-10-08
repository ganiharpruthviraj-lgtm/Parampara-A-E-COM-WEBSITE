const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');

// Master GI database as guaranteed catalog source
const GI_DATA = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/gi-database.json'), 'utf-8')
);

// Format GI item into full product schema
function giToProduct(gi) {
  return {
    _id: gi.id,
    name: gi.name,
    state: gi.state,
    region: gi.region,
    craft: gi.craft,
    category: gi.subCategory || gi.category,
    price: gi.price || 18500,
    imageUrl: gi.imageUrl,
    badge: gi.giTagged ? 'GI Registered' : 'Heritage Craft',
    description: gi.description,
    artisan: gi.applicant,
    artisanCount: gi.artisanCount,
    district: gi.district,
    giNumber: gi.giNumber,
    registrationYear: gi.registrationYear,
    exportEligible: gi.exportEligible,
    giTagged: gi.giTagged !== false,
    inStock: true
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
        if (state) query.state = { $regex: state, $options: 'i' };
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
      const stateTerm = state.toLowerCase().trim();
      list = list.filter(p => p.state.toLowerCase().includes(stateTerm));
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
