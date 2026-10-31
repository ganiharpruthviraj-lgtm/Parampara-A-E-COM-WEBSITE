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
  giNumber: { type: String },
  stockCount: { type: Number, default: 10 },
  artisanPayoutAmount: { type: Number },
  inStock: { type: Boolean, default: true },
  rating: { type: Number, default: 4.8 },
  numReviews: { type: Number, default: 12 },
  reviews: [
    {
      name: { type: String, required: true },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
      verifiedPurchase: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
}, { timestamps: true });

// Full-text search index
productSchema.index({ name: 'text', craft: 'text', state: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
