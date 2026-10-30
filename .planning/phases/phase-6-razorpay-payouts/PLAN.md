# Phase 6: Razorpay Checkout, Webhooks & Automated 70% Artisan Payouts

## Goal
Integrate official Razorpay Node SDK, customer Checkout modal, webhook verification, and automated 70% direct artisan payouts via RazorpayX.

## Requirements Covered
- **US-06**: Razorpay Checkout, Webhooks & Automated 70% Artisan Payouts

## Work Completed

### 1. Official SDK & Dedicated Service
- Added `razorpay` (`^2.9.8`) to `backend/package.json`.
- Created [`backend/services/razorpayService.js`](file:///d:/ankush/backend/services/razorpayService.js) handling:
  - `createOrder({ amount, currency, receipt, notes })`
  - `verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })`
  - `verifyWebhookSignature(rawBody, signature)`
  - `disburseArtisanPayout({ orderId, amount, artisanName, mode, fundAccount, narration })`
  - Safe fallbacks for sandbox simulation mode when live API credentials are not yet configured.

### 2. Orders & Payout Routes
- In [`backend/routes/orders.js`](file:///d:/ankush/backend/routes/orders.js):
  - Refactored `/api/orders/create-razorpay-order` to use `razorpayService.createOrder`.
  - Refactored `/api/orders/verify-payment` to use `razorpayService.verifyPaymentSignature`.
  - Added `POST /api/orders/payout` and `POST /api/orders/:id/payout` for direct 70% artisan payouts via RazorpayX.
  - Added `POST /api/orders/webhook` and exported `handleRazorpayWebhook` for Razorpay webhooks (`payment.captured`, `order.paid`, `payout.processed`, `payout.reversed`).

### 3. Webhook Receiver & Server Security
- In [`backend/app.js`](file:///d:/ankush/backend/app.js):
  - Added raw body capture in `express.json({ verify: (req, res, buf) => { req.rawBody = buf; } })` for HMAC signature validation.
  - Mounted dedicated `/webhook/razorpay` route.
  - Updated Helmet Content Security Policy to whitelist Razorpay CDN and APIs:
    - `scriptSrc`: `https://checkout.razorpay.com`
    - `connectSrc`: `https://api.razorpay.com`, `https://lumberjack.razorpay.com`
    - `frameSrc`: `https://api.razorpay.com`, `https://checkout.razorpay.com`

### 4. Frontend Checkout Integration
- In [`checkout.html`](file:///d:/ankush/checkout.html):
  - Loaded official Razorpay Checkout SDK `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`.
  - Added "Secured by Razorpay" trust badge in payment header.
  - Added dynamic 70% artisan disbursement receipt confirmation element (`confirm-artisan-payout`).
- In [`js/checkout.js`](file:///d:/ankush/js/checkout.js):
  - Added Razorpay standard Checkout modal launch with branding, theme `#8B0000` (Royal Crimson), prefill customer contact, and error handlers.
  - Automated 70% artisan disbursement call upon payment verification.
  - Dynamic confirmation screen with UTR and direct artisan transfer notification.

### 5. Environment & Documentation
- Documented `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, and `RAZORPAY_ACCOUNT_NUMBER` in [`backend/.env.example`](file:///d:/ankush/backend/.env.example) and [`.env.example`](file:///d:/ankush/.env.example).

### 6. Verification & Automated Tests
- Added test coverage in [`backend/tests/orders.test.js`](file:///d:/ankush/backend/tests/orders.test.js):
  - `POST /api/orders/:id/payout` (70% artisan disbursement)
  - `POST /webhook/razorpay` (`payment.captured` auto-disburses artisan share)
  - `POST /api/orders/webhook` (`payout.processed`)
- All 12 tests passing in `orders.test.js`.
