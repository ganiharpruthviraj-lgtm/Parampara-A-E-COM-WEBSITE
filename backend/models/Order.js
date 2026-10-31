const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.Mixed, // Supports ObjectId or string demo ID
      required: true,
      ref: 'User'
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true, default: 1 },
        image: { type: String, default: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61' },
        price: { type: Number, required: true },
        giNumber: { type: String, default: 'GI-AUTHENTIC' },
        artisanName: { type: String, default: 'Verified Heritage Guild' },
        artisanPayoutAmount: { type: Number, required: true }, // 70% direct artisan share
        product: {
          type: String,
          default: 'craft-masterpiece'
        }
      }
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      email: { type: String },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: 'India' },
      phone: { type: String, required: true }
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'Razorpay'
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String }
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    discountPrice: { type: Number, required: true, default: 0.0 },
    artisanSupportContribution: { type: Number, required: true, default: 0.0 }, // Total 70% direct artisan allocation
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    payoutStatus: {
      type: String,
      enum: ['pending', 'queued', 'processing', 'processed', 'reversed', 'failed'],
      default: 'pending'
    },
    payoutResult: {
      id: { type: String },
      payoutId: { type: String },
      amount: { type: Number },
      currency: { type: String, default: 'INR' },
      status: { type: String },
      utr: { type: String },
      disbursementMode: { type: String },
      artisanName: { type: String },
      disbursedAt: { type: String }
    },
    awb: { type: String },
    courierPartner: { type: String, default: 'India Post Speed Post' },
    trackingUrl: { type: String },
    estimatedDeliveryDate: { type: Date },
    pickupDetails: {
      scheduledDate: { type: Date },
      clusterLocation: { type: String },
      pickupToken: { type: String },
      status: {
        type: String,
        enum: ['Pending', 'Scheduled', 'Collected', 'Failed'],
        default: 'Pending'
      }
    },
    shippingTimeline: [
      {
        status: { type: String },
        location: { type: String },
        timestamp: { type: Date, default: Date.now },
        details: { type: String }
      }
    ],
    orderStatus: {
      type: String,
      required: true,
      enum: ['Processing', 'Crafting', 'Handcrafted', 'Inspected', 'Dispatched', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'],
      default: 'Processing'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
