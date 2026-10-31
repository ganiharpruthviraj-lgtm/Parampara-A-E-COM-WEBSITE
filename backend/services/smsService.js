/**
 * Parampara Heritage — Production SMS Gateway Service
 * Supports Fast2SMS (India Domestic Default), Twilio (Global Fallback), and Local Simulation Mode.
 */

// In-memory rate limiting map for OTP requests: Map<phone, { count: number, resetAt: number }>
const rateLimitMap = new Map();

/**
 * Check if phone number is rate-limited (max 5 requests per 10 minutes)
 */
function checkRateLimit(cleanPhone) {
  const now = Date.now();
  const entry = rateLimitMap.get(cleanPhone);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(cleanPhone, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return { allowed: true, remaining: 4 };
  }
  if (entry.count >= 5) {
    const waitSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, waitSec };
  }
  entry.count += 1;
  return { allowed: true, remaining: 5 - entry.count };
}

/**
 * Send Transactional SMS (Fast2SMS route 'q' / Twilio Body)
 */
const sendTransactionalSMS = async (phoneNumber, message) => {
  const formattedPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
  if (formattedPhone.length < 10) {
    return { success: false, message: 'Invalid phone number format.' };
  }
  const cleanPhone = formattedPhone.slice(-10);

  // 1. Fast2SMS (India domestic)
  const fastKey = process.env.FAST2SMS_API_KEY;
  if (fastKey && !fastKey.includes('your_') && !fastKey.includes('placeholder')) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fastKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message: message,
          language: 'english',
          flash: 0,
          numbers: cleanPhone
        })
      });
      const data = await response.json();
      console.log(`📱 Fast2SMS dispatched alert to +91 ${cleanPhone}:`, data);
      return { success: true, provider: 'Fast2SMS', data };
    } catch (err) {
      console.error('Fast2SMS Error:', err.message);
    }
  }

  // 2. Twilio (Global / International)
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  if (twilioSid && twilioAuthToken && twilioPhone && !twilioSid.includes('your_')) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
      const bodyParams = new URLSearchParams({
        To: `+91${cleanPhone}`,
        From: twilioPhone,
        Body: message
      });

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams
      });
      const data = await response.json();
      console.log(`📱 Twilio dispatched alert to +91 ${cleanPhone}:`, data.sid);
      return { success: true, provider: 'Twilio', data };
    } catch (err) {
      console.error('Twilio Error:', err.message);
    }
  }

  // 3. Demo / Local Simulation Mode
  console.log(`\n======================================================`);
  console.log(`📱 [SMS GATEWAY DEMO MODE - TRANSACTIONAL ALERT]`);
  console.log(`Recipient: +91 ${cleanPhone}`);
  console.log(`Message:   ${message}`);
  console.log(`Notice:    Configure FAST2SMS_API_KEY in backend/.env for live mobile delivery.`);
  console.log(`======================================================\n`);

  return {
    success: true,
    provider: 'DemoMode',
    recipient: cleanPhone,
    message: message
  };
};

/**
 * Dispatch 6-Digit OTP SMS
 */
const sendSMS = async (phoneNumber, otpCode) => {
  const formattedPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
  if (formattedPhone.length < 10) {
    return { success: false, message: 'Invalid phone number format.' };
  }
  const cleanPhone = formattedPhone.slice(-10);

  // Rate Limiting Check
  const rateLimit = checkRateLimit(cleanPhone);
  if (!rateLimit.allowed) {
    return {
      success: false,
      rateLimited: true,
      message: `Too many OTP requests. Please wait ${rateLimit.waitSec} seconds before requesting again.`
    };
  }

  // 1. Fast2SMS OTP Route
  const fastKey = process.env.FAST2SMS_API_KEY;
  if (fastKey && !fastKey.includes('your_') && !fastKey.includes('placeholder')) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fastKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otpCode,
          numbers: cleanPhone
        })
      });
      const data = await response.json();
      console.log(`📱 Fast2SMS dispatched OTP to +91 ${cleanPhone}:`, data);
      return { success: true, provider: 'Fast2SMS', data };
    } catch (err) {
      console.error('Fast2SMS Error:', err.message);
    }
  }

  // 2. Twilio OTP Fallback
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  if (twilioSid && twilioAuthToken && twilioPhone && !twilioSid.includes('your_')) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
      const bodyParams = new URLSearchParams({
        To: `+91${cleanPhone}`,
        From: twilioPhone,
        Body: `[Parampara Heritage] Your login verification OTP code is ${otpCode}. Valid for 5 minutes.`
      });

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams
      });
      const data = await response.json();
      console.log(`📱 Twilio dispatched OTP to +91 ${cleanPhone}:`, data.sid);
      return { success: true, provider: 'Twilio', data };
    } catch (err) {
      console.error('Twilio Error:', err.message);
    }
  }

  // 3. Demo / Local Simulation Mode
  console.log(`\n======================================================`);
  console.log(`📱 [SMS GATEWAY DEMO MODE - LOGIN / AUTH OTP]`);
  console.log(`Destination Mobile: +91 ${cleanPhone}`);
  console.log(`Generated OTP Code: ${otpCode}`);
  console.log(`Notice: Add FAST2SMS_API_KEY or TWILIO_ACCOUNT_SID to backend/.env to deliver live SMS.`);
  console.log(`======================================================\n`);

  return {
    success: true,
    provider: 'DemoMode',
    otpCode: otpCode,
    recipient: cleanPhone,
    message: 'Demo mode active. Use code 123456 or generated code.'
  };
};

/**
 * Dispatch Order Shipped SMS
 */
const sendOrderDispatchedSMS = async (phoneNumber, { orderId, awb, courierPartner, trackingUrl }) => {
  const shortId = String(orderId).slice(-6).toUpperCase();
  const carrier = courierPartner || 'India Post Speed Post';
  const trackingMsg = awb ? `AWB: ${awb}` : '';
  const message = `[Parampara] Dhanyawaad! Your GI craft (Order #${shortId}) has been dispatched via ${carrier}. ${trackingMsg}. Track live: https://parampara.in/track.html?awb=${awb || shortId}`;
  return sendTransactionalSMS(phoneNumber, message);
};

/**
 * Dispatch Order Delivered SMS
 */
const sendOrderDeliveredSMS = async (phoneNumber, { orderId, artisanName }) => {
  const shortId = String(orderId).slice(-6).toUpperCase();
  const artisan = artisanName || 'master artisan';
  const message = `[Parampara] Your authentic GI craft (Order #${shortId}) is delivered! 70% direct payment has been disbursed to ${artisan}. Inspect certificate at https://parampara.in/profile.html`;
  return sendTransactionalSMS(phoneNumber, message);
};

/**
 * Dispatch 70% Direct Artisan Payout Confirmation SMS
 */
const sendArtisanPayoutDisbursedSMS = async (phoneNumber, { orderId, amount, utr }) => {
  const shortId = String(orderId).slice(-6).toUpperCase();
  const message = `[Parampara Guild] Payout Alert: ₹${amount} (70% craft share) has been credited directly to your cluster bank account for Order #${shortId}. UTR: ${utr || 'NEFT-COMPLETED'}.`;
  return sendTransactionalSMS(phoneNumber, message);
};

module.exports = {
  sendSMS,
  sendTransactionalSMS,
  sendOrderDispatchedSMS,
  sendOrderDeliveredSMS,
  sendArtisanPayoutDisbursedSMS,
  checkRateLimit
};
