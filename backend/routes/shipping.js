const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const shippingService = require('../services/shippingService');

// In-memory fallback tracking store for offline testing
const inMemoryShipments = new Map();

/**
 * @desc    Calculate live shipping rates and delivery estimates by postal PIN code
 * @route   POST /api/shipping/calculate-rates
 * @access  Public
 */
router.post('/calculate-rates', (req, res) => {
  try {
    const {
      deliveryPincode,
      pickupPincode = '302001',
      weightGrams = 850,
      isCod = false,
      craftValue = 4800
    } = req.body;

    if (!deliveryPincode) {
      return res.status(400).json({ success: false, message: 'Delivery PIN code is required.' });
    }

    const rates = shippingService.calculateShippingRates({
      deliveryPincode,
      pickupPincode,
      weightGrams: Number(weightGrams) || 850,
      isCod: Boolean(isCod),
      craftValue: Number(craftValue) || 4800
    });

    res.json(rates);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @desc    Lookup Indian PIN Code details (City, State, Zone)
 * @route   GET /api/shipping/pincode/:pincode
 * @access  Public
 */
router.get('/pincode/:pincode', (req, res) => {
  const result = shippingService.resolvePincode(req.params.pincode);
  if (!result.valid) {
    return res.status(400).json({ success: false, message: result.message });
  }
  res.json({ success: true, data: result });
});

/**
 * @desc    Book shipment, generate AWB, and schedule automated artisan cluster pickup
 * @route   POST /api/shipping/create-shipment
 * @access  Public / Artisan Guild
 */
router.post('/create-shipment', async (req, res) => {
  try {
    const {
      orderId,
      pickupDetails = {},
      shippingAddress = {},
      orderItems = [],
      totalAmount = 5040,
      provider = 'India Post Speed Post',
      isCod = false
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required to create a shipment.' });
    }

    // 1. Generate verified shipment with Courier engine
    const shipment = await shippingService.createShipmentAndPickup({
      orderId,
      pickupDetails,
      shippingAddress,
      orderItems,
      totalAmount,
      provider,
      isCod
    });

    // 2. Persist to MongoDB if connected
    let updatedOrder = null;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(orderId)) {
      try {
        updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          {
            awb: shipment.awb,
            courierPartner: shipment.courierPartner,
            trackingUrl: shipment.trackingUrl,
            orderStatus: 'Dispatched',
            pickupDetails: shipment.pickupDetails,
            shippingTimeline: shipment.shippingTimeline
          },
          { returnDocument: 'after' }
        );
      } catch (dbErr) {
        console.warn('DB update notice for shipment:', dbErr.message);
      }
    }

    // In-memory caching for resilience
    inMemoryShipments.set(shipment.awb, shipment);
    inMemoryShipments.set(orderId, shipment);

    res.status(201).json({
      success: true,
      message: shipment.message,
      shipment,
      order: updatedOrder || { _id: orderId, orderStatus: 'Dispatched', awb: shipment.awb }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Shipment booking failed: ' + error.message });
  }
});

/**
 * @desc    Track shipment by AWB or Order ID
 * @route   GET /api/shipping/track/:awb
 * @access  Public
 */
router.get('/track/:awb', async (req, res) => {
  try {
    const queryId = req.params.awb;
    let foundOrder = null;

    if (mongoose.connection.readyState === 1) {
      try {
        if (mongoose.Types.ObjectId.isValid(queryId)) {
          foundOrder = await Order.findById(queryId);
        }
        if (!foundOrder) {
          foundOrder = await Order.findOne({ $or: [{ awb: queryId }, { _id: queryId }] });
        }
      } catch (dbErr) {}
    }

    if (!foundOrder && inMemoryShipments.has(queryId)) {
      const cached = inMemoryShipments.get(queryId);
      return res.json({
        success: true,
        data: shippingService.getTrackingDetails(queryId, {
          _id: cached.orderId,
          awb: cached.awb,
          courierPartner: cached.courierPartner,
          orderStatus: 'Dispatched',
          pickupDetails: cached.pickupDetails,
          shippingTimeline: cached.shippingTimeline,
          shippingAddress: cached.deliveryDetails
        })
      });
    }

    const trackingData = shippingService.getTrackingDetails(queryId, foundOrder);
    res.json({ success: true, data: trackingData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Tracking lookup failed: ' + error.message });
  }
});

/**
 * @desc    Courier Tracking Webhook (Shiprocket / India Post)
 * @route   POST /api/shipping/webhook
 * @access  Public (Webhook verified)
 */
router.post('/webhook', async (req, res) => {
  try {
    const result = shippingService.handleCourierWebhook(req.body);
    const { awb, orderStage, timelineEvent } = result;

    if (awb && mongoose.connection.readyState === 1) {
      try {
        await Order.findOneAndUpdate(
          { awb },
          {
            orderStatus: orderStage,
            $push: { shippingTimeline: timelineEvent }
          }
        );
      } catch (dbErr) {
        console.warn('Webhook order update notice:', dbErr.message);
      }
    }

    if (awb && inMemoryShipments.has(awb)) {
      const cached = inMemoryShipments.get(awb);
      cached.shippingTimeline = cached.shippingTimeline || [];
      cached.shippingTimeline.push(timelineEvent);
      inMemoryShipments.set(awb, cached);
    }

    res.json({
      success: true,
      message: `Courier webhook processed for AWB: ${awb}`,
      orderStage
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Courier webhook processing error: ' + error.message });
  }
});

module.exports = router;
