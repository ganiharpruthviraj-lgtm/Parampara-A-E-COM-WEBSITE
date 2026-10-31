# STATE

## Current Phase
- Milestone: 2 — Artisan Commerce
- Status: ✅ **100% Shipped & Verified**

## Completed Milestones
- ✅ **Milestone 1: Production Hardening** (All 5 phases shipped)
  - Phase 1 — Security Hardening (JWT 64-char threshold, CORS whitelist, .env.example)
  - Phase 2 — SEO & Open Graph (title + meta description + OG + Twitter on all 17 pages)
  - Phase 3 — Performance: Asset Compression (WebP served throughout, PNGs under budget)
  - Phase 4 — CI/CD: Test Gate (npm test runs on Node 18.x + 20.x matrix before deploy)
  - Phase 5 — Render Keep-Alive (keep-alive.js + GH Actions cron every 10 min)

- ✅ **Milestone 2: Artisan Commerce** (All 3 phases shipped)
  - Phase 6 — Razorpay Checkout, Webhooks & Automated 70% Artisan Payouts
    - Official `razorpay` Node SDK installed in backend
    - Dedicated `razorpayService.js` supporting live & sandbox simulation modes
    - Integrated Razorpay Standard Checkout SDK into `checkout.html` and `js/checkout.js`
    - Automated 70% direct artisan payout via RazorpayX (`POST /api/orders/:id/payout` and `POST /api/orders/payout`)
    - Dedicated Razorpay Webhook receiver (`POST /webhook/razorpay` and `POST /api/orders/webhook`) with HMAC-SHA256 signature verification
    - Helmet CSP headers updated in `backend/app.js` for Razorpay domains
    - `.env.example` files updated with complete Razorpay & RazorpayX variables
    - 12/12 Jest tests passing in `backend/tests/orders.test.js`
  - Phase 7 — Production SMS Gateway & Mobile Authentication (US-07)
    - Fast2SMS (India domestic) and Twilio (global fallback) dual SMS gateways with zero-downtime offline simulation mode
    - Anti-spam rate limiting (5 requests per 10 minutes) on OTP dispatch
    - Phone authentication endpoints (`POST /api/auth/phone/send-otp` & `POST /api/auth/phone/verify-otp`) with automatic MongoDB user provisioning and 30-day JWT issuance
    - Automated SMS notifications dispatched on order status transitions (`Dispatched`, `Delivered`) and 70% direct artisan payout credits
    - 11/11 Jest tests passing in `backend/tests/sms.test.js`
  - Phase 8 — Shipping & Logistics API Integration (India Post / Shiprocket)
    - India Post Speed Post & Shiprocket multi-carrier rate calculator across 28 states & UTs
    - Automated AWB generation (`IP\d{9}IN` Speed Post format) & rural artisan cluster pickup dispatch
    - Courier webhook endpoint (`POST /api/shipping/webhook`) for live delivery state syncing
    - Public order tracking portal ([`track.html`](file:///d:/ankush/track.html) & [`js/track.js`](file:///d:/ankush/js/track.js))
    - Dynamic checkout PIN code calculation badge & transit estimation
    - Artisan dashboard dispatch booking with direct tracking integration
    - 10/10 Jest tests passing in `backend/tests/shipping.test.js`

## Blockers
(none)

## Next
- Milestone 3 Planning: Multi-lingual Vernacular Voice & Mobile Experience
