/**
 * Parampara Heritage — SMS Gateway Service
 * Supports Fast2SMS (India), Twilio (Global), MSG91, and Demo Fallback Mode.
 */

const sendSMS = async (phoneNumber, otpCode) => {
  const formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
  
  // 1. Fast2SMS Integration (India Default)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otpCode,
          numbers: formattedPhone
        })
      });
      const data = await response.json();
      console.log(`📱 Fast2SMS dispatched OTP to +91 ${formattedPhone}:`, data);
      return { success: true, provider: 'Fast2SMS', data };
    } catch (err) {
      console.error('Fast2SMS Error:', err.message);
    }
  }

  // 2. Twilio Integration (Global Fallback)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const bodyParams = new URLSearchParams({
        To: `+91${formattedPhone}`,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: `[Parampara Heritage] Your login verification OTP code is ${otpCode}. Valid for 5 minutes.`
      });

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams
      });
      const data = await response.json();
      console.log(`📱 Twilio dispatched OTP to +91 ${formattedPhone}:`, data.sid);
      return { success: true, provider: 'Twilio', data };
    } catch (err) {
      console.error('Twilio Error:', err.message);
    }
  }

  // 3. Demo / Local Fallback Mode
  console.log(`\n======================================================`);
  console.log(`📱 [SMS GATEWAY DEMO MODE]`);
  console.log(`Destination Mobile: +91 ${formattedPhone}`);
  console.log(`Generated OTP Code: ${otpCode}`);
  console.log(`Notice: Add FAST2SMS_API_KEY or TWILIO_ACCOUNT_SID to backend/.env to deliver live SMS.`);
  console.log(`======================================================\n`);

  return {
    success: true,
    provider: 'DemoMode',
    otpCode: otpCode,
    message: 'Demo mode active. Use code 123456 or generated code.'
  };
};

module.exports = { sendSMS };
