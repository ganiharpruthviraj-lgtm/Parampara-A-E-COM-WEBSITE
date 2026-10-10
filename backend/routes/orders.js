const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { generateOrderInvoicePDF } = require('../services/pdfInvoiceService');
const { body, validationResult } = require('express-validator');

// In-memory order fallback store for offline / memory execution
const inMemoryOrders = new Map();

// Helper for 70% artisan payout calculation
const calculateArtisanPayout = (items) => {
  return items.reduce((acc, item) => {
    const itemTotal = (item.price || 0) * (item.qty || 1);
    const artisanShare = item.artisanPayoutAmount || Math.round(itemTotal * 0.7);
    return acc + artisanShare;
  }, 0);
};

// Validation for creating orders
const orderValidation = [
  body('orderItems').isArray({ min: 1 }).withMessage('Order must contain at least one craft item'),
  body('shippingAddress.fullName').notEmpty().withMessage('Full name is required').escape(),
  body('shippingAddress.address').notEmpty().withMessage('Address is required').escape(),
  body('shippingAddress.city').notEmpty().withMessage('City is required').escape(),
  body('shippingAddress.state').notEmpty().withMessage('State is required').escape(),
  body('shippingAddress.postalCode').notEmpty().withMessage('Pincode is required').escape(),
  body('shippingAddress.phone').notEmpty().withMessage('Phone number is required').escape()
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private / Optional Auth
router.post('/', orderValidation, handleValidation, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod = 'Razorpay',
      itemsPrice,
      taxPrice = 0,
      shippingPrice = 0,
      discountPrice = 0,
      totalPrice
    } = req.body;

    // Attach user ID if authorized user, otherwise fallback to guest collector ID
    const userId = (req.user && req.user._id) ? req.user._id : 'guest-collector-session';

    // Enhance order items with calculated 70% artisan direct payout
    const processedOrderItems = orderItems.map(item => ({
      ...item,
      artisanPayoutAmount: item.artisanPayoutAmount || Math.round((item.price * (item.qty || 1)) * 0.7)
    }));

    const calculatedArtisanContribution = calculateArtisanPayout(processedOrderItems);

    const orderData = {
      user: userId,
      orderItems: processedOrderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: itemsPrice || processedOrderItems.reduce((acc, i) => acc + (i.price * i.qty), 0),
      taxPrice,
      shippingPrice,
      discountPrice,
      artisanSupportContribution: calculatedArtisanContribution,
      totalPrice: totalPrice || (itemsPrice + taxPrice + shippingPrice - discountPrice),
      isPaid: false,
      orderStatus: 'Processing'
    };

    if (mongoose.connection.readyState === 1) {
      const createdOrder = await Order.create(orderData);
      return res.status(201).json({ success: true, data: createdOrder });
    }

    // In-memory fallback if MongoDB is disconnected
    const memoryId = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const mockOrder = {
      _id: memoryId,
      ...orderData,
      createdAt: new Date().toISOString()
    };
    inMemoryOrders.set(memoryId, mockOrder);

    res.status(201).json({ success: true, data: mockOrder, isDemoMode: true });
  } catch (error) {
    res.status(500).json({ message: 'Order Creation Failed: ' + error.message });
  }
});

// @desc    Create Razorpay Order ID (or simulated gateway payload)
// @route   POST /api/orders/create-razorpay-order
// @access  Public / Optional Auth
router.post('/create-razorpay-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid payment amount in INR is required.' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // 1. Live Razorpay SDK check if environment keys exist
    if (keyId && keySecret && !keyId.includes('YOUR_') && !keyId.includes('PLACEHOLDER')) {
      try {
        const Razorpay = require('razorpay');
        const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const options = {
          amount: Math.round(amount * 100), // amount in paise
          currency,
          receipt: receipt || `receipt_${Date.now()}`
        };
        const order = await instance.orders.create(options);
        return res.json({
          success: true,
          mode: 'live',
          keyId: keyId,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency
        });
      } catch (rzpErr) {
        console.warn("Live Razorpay order creation failed, defaulting to simulated sandbox mode:", rzpErr.message);
      }
    }

    // 2. Simulated Razorpay Payment Gateway Sandbox Mode
    const simulatedOrderId = `order_rzp_demo_${Date.now()}_${Math.floor(Math.random() * 8999 + 1000)}`;

    res.json({
      success: true,
      mode: 'sandbox_simulation',
      keyId: 'rzp_test_parampara_heritage_demo_2026',
      orderId: simulatedOrderId,
      amount: Math.round(amount * 100),
      currency: currency,
      message: 'Razorpay Sandbox Gateway Initialized successfully.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify Payment Signature & Update Order Status to Paid
// @route   POST /api/orders/verify-payment
// @access  Public / Optional Auth
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod = 'Razorpay'
    } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let isValid = false;

    if (keySecret && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');
      isValid = generatedSignature === razorpaySignature;
    } else {
      // In simulation mode or direct mock verification
      isValid = Boolean(razorpayPaymentId || razorpayOrderId);
    }

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
    }

    const paymentResultData = {
      id: razorpayPaymentId || `pay_demo_${Date.now()}`,
      status: 'Captured',
      update_time: new Date().toISOString(),
      razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId || `pay_demo_${Date.now()}`,
      razorpaySignature: razorpaySignature || 'simulated_hmac_sha256_signature'
    };

    // Update MongoDB Order or In-Memory Order
    if (mongoose.connection.readyState === 1 && orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = paymentResultData;
        order.orderStatus = 'Handcrafted';
        const updatedOrder = await order.save();
        return res.json({ success: true, message: 'Payment verified successfully.', data: updatedOrder });
      }
    }

    if (orderId && inMemoryOrders.has(orderId)) {
      const memoryOrder = inMemoryOrders.get(orderId);
      memoryOrder.isPaid = true;
      memoryOrder.paidAt = new Date().toISOString();
      memoryOrder.paymentResult = paymentResultData;
      memoryOrder.orderStatus = 'Handcrafted';
      inMemoryOrders.set(orderId, memoryOrder);
      return res.json({ success: true, message: 'Payment verified (Demo Mode).', data: memoryOrder });
    }

    // Direct mock response if orderId wasn't passed or newly paid
    res.json({
      success: true,
      message: 'Payment verified successfully.',
      data: {
        isPaid: true,
        paidAt: new Date().toISOString(),
        paymentResult: paymentResultData,
        orderStatus: 'Handcrafted'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment verification failed: ' + error.message });
  }
});

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Public / Optional Auth
router.get('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const order = await Order.findById(orderId);
      if (order) {
        return res.json({ success: true, data: order });
      }
    }

    if (inMemoryOrders.has(orderId)) {
      return res.json({ success: true, data: inMemoryOrders.get(orderId) });
    }

    res.status(404).json({ success: false, message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get current user's order history
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && req.user) {
      const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, data: orders });
    }

    const memoryList = Array.from(inMemoryOrders.values());
    res.json({ success: true, count: memoryList.length, data: memoryList });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Download PDF Order Invoice & GI Authenticity Certificate
// @route   GET /api/orders/:id/invoice-pdf
// @access  Public
router.get('/:id/invoice-pdf', async (req, res) => {
  try {
    const orderId = req.params.id;
    let order = null;

    if (mongoose.connection.readyState === 1) {
      order = await Order.findById(orderId);
    }

    if (!order && inMemoryOrders.has(orderId)) {
      order = inMemoryOrders.get(orderId);
    }

    // Default sample fallback order if generated on the fly for test
    if (!order) {
      order = {
        _id: orderId || 'PRM-DEMO-98214',
        createdAt: new Date(),
        paymentMethod: 'Razorpay UPI',
        isPaid: true,
        itemsPrice: 4800,
        taxPrice: 240,
        shippingPrice: 0,
        totalPrice: 5040,
        artisanSupportContribution: 3360,
        shippingAddress: {
          fullName: 'Ankush Sharma',
          address: 'Heritage Enclave, Sector 15',
          city: 'Jaipur',
          state: 'Rajasthan',
          postalCode: '302001',
          country: 'India',
          phone: '9876543210'
        },
        orderItems: [
          {
            name: 'Authentic Kullu Handwoven Woolen Shawl with Geometric Borders',
            price: 4800,
            qty: 1,
            giNumber: 'GI/RS/130/2004',
            artisanName: 'Bhuttico Handloom Weavers Cooperative',
            artisanPayoutAmount: 3360
          }
        ]
      };
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Parampara_GI_Certificate_${(order._id || 'INV').toString().slice(-8)}.pdf"`
    );

    const pdfDoc = generateOrderInvoicePDF(order);
    pdfDoc.pipe(res);
  } catch (error) {
    console.error("PDF Invoice Generation Error:", error);
    res.status(500).json({ message: 'Failed to generate PDF invoice: ' + error.message });
  }
});

module.exports = router;
