# Phase 7: Production SMS Gateway & Mobile Authentication

## Goal
Implement production-ready SMS delivery for physical mobile OTP login and automated order lifecycle alerts (order dispatched, delivered, and 70% direct artisan payout credited), with dual provider support (Fast2SMS for domestic India, Twilio for global fallback), anti-spam rate limiting, and zero-downtime offline demo simulation mode.

## Requirements Covered
- **US-07**: Production SMS Gateway
  - [x] Fast2SMS / Twilio production gateway wired to authentication and order routes
  - [x] Failover to development mock mode if credentials unset
  - [x] Delivery status logging and rate limiting

---

## Work Completed

### 1. SMS Gateway Service (`backend/services/smsService.js`)
- **Dual-Provider Architecture**:
  - **Fast2SMS**: Native Indian DLTR/OTP route (`https://www.fast2sms.com/dev/bulkV2`) for low-latency delivery across Indian telecom operators.
  - **Twilio**: Global SMS gateway fallback (`https://api.twilio.com/2010-04-01/...`) for international collectors and cross-border notifications.
  - **Smart Demo Mode**: Graceful local simulation when `FAST2SMS_API_KEY` or `TWILIO_ACCOUNT_SID` are unconfigured, printing delivery logs and providing fallback OTP code `123456`.
- **Anti-Spam Rate Limiting**:
  - `checkRateLimit(cleanPhone)`: Limits OTP requests to a maximum of 5 requests per 10 minutes per phone number.
  - Returns HTTP 429 Too Many Requests with seconds countdown if threshold is exceeded.
- **Transactional Alert Methods**:
  - `sendSMS(phone, otp)`: Dispatches 6-digit verification code with 5-minute expiry.
  - `sendTransactionalSMS(phone, message)`: Dispatches transactional system alerts.
  - `sendOrderDispatchedSMS(phone, { orderId, awb, courierPartner, trackingUrl })`: Dispatches dispatch notification with carrier, AWB, and live tracking URL.
  - `sendOrderDeliveredSMS(phone, { orderId, artisanName })`: Dispatches delivery alert confirming that 70% direct proceeds were disbursed to the craft artisan.
  - `sendArtisanPayoutDisbursedSMS(phone, { orderId, amount, utr })`: Dispatches credit alert directly to the artisan village cluster bank account.

### 2. Mobile Phone Authentication Routes (`backend/routes/auth.js`)
- **`POST /api/auth/phone/send-otp`** (and legacy alias `POST /api/auth/send-otp`):
  - Validates 10-digit mobile number.
  - Applies 5-request/10-minute rate limiting.
  - Generates cryptographic 6-digit OTP code and stores in in-memory map with 5-minute TTL.
- **`POST /api/auth/phone/verify-otp`** (and legacy alias `POST /api/auth/verify-otp`):
  - Validates OTP code (or master demo code `123456`).
  - Auto-provisions or retrieves user in MongoDB by phone number (`phone_${cleanPhone}@parampara.in`).
  - Issues signed 30-day JWT authentication token.
  - Deletes single-use OTP from store upon successful verification.

### 3. Automated Order Lifecycle SMS Triggers (`backend/routes/orders.js`)
- **Order Dispatch Alert**:
  - Triggered in `PUT /api/orders/:id/status` (when transitioning to `Dispatched`) and `POST /api/orders/:id/dispatch`.
  - Dispatches SMS to collector containing order ID, courier partner (e.g. India Post Speed Post / Shiprocket), and live tracking link.
- **Order Delivered Alert**:
  - Triggered in `PUT /api/orders/:id/status` (when transitioning to `Delivered`).
  - Dispatches SMS confirming delivery and notifying that 70% direct artisan share has been credited.
- **Artisan Payout Alert**:
  - Triggered in `handleArtisanPayout` (`POST /api/orders/payout` and `POST /api/orders/:id/payout`).
  - Dispatches SMS to artisan cluster with payout amount and transaction UTR.

### 4. Configuration & Environment Documentation
- Updated `backend/.env.example` and `.env.example` with:
  - `FAST2SMS_API_KEY`: API key for Fast2SMS India gateway.
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: Credentials for Twilio SMS gateway.

### 5. Automated Test Suite (`backend/tests/sms.test.js`)
- Created comprehensive test suite covering:
  - Service unit tests (format validation, rate limiter, transactional message formatting).
  - OTP dispatch endpoint and rate-limit HTTP 429 validation.
  - OTP verification, JWT generation, and MongoDB user creation.
  - Automated SMS alert triggers on order status transitions (`Dispatched`, `Delivered`).

---

## Verification & Status
- **Status**: Complete & Verified
- **Milestone 2 Status**: 100% Complete (Phase 4, Phase 5, Phase 6, Phase 7 all shipped).

