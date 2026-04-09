const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: String, required: true },   
  region: { type: String },                   
  craft: { type: String, required: true },   
  category: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  badge: { type: String },                   
  description: { type: String },
  artisan: { type: String }, 
  giTagged: { type: Boolean, default: false },
  inStock: { type: Boolean, default: true },
}, { timestamps: true });

// Full-text search index
productSchema.index({ name: 'text', craft: 'text', state: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
