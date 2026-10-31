# Parampara — Requirements

## Milestone 1: Production Hardening (✅ Complete)

**Goal:** Raise repo audit score from 63/100 to 85+/100 by fixing security, SEO, performance, and CI gaps.

### US-01 — Security Hardening
- [x] `JWT_SECRET` is ≥ 64 characters (cryptographically random)
- [x] CORS is restricted to whitelisted origins (not `*`)
- [x] `.env.example` documents all required environment variables

### US-02 — SEO & Discoverability
- [x] All 17 HTML pages have a unique `<title>` tag
- [x] All 17 HTML pages have a `<meta name="description">` tag
- [x] All 17 HTML pages have Open Graph & Twitter Card tags

### US-03 — Performance (Asset Optimization)
- [x] `favicon.png` compressed to < 10 KB
- [x] Large images compressed to WebP under 200 KB budget
- [x] HTML & CSS references point to WebP versions

### US-04 — CI/CD Safety Net
- [x] `ci.yml` runs `npm test` in the backend before deploy step
- [x] Deploy step is blocked if tests fail
- [x] Node 18.x and 20.x matrix is tested

### US-05 — Render Cold Start Fix
- [x] A keep-alive ping script pings the Render URL every 10 minutes
- [x] The approach is documented in README & workflows

---

## Milestone 2: Artisan Commerce (🚀 Active)

**Goal:** Direct digital commerce, verified payment integrity, and automated 70% artisan payouts.

### US-06 — Razorpay Checkout, Webhooks & Automated 70% Artisan Payouts
**As** a craft collector and a registered artisan partner,  
**I want** seamless 256-bit encrypted checkout and automated 70% direct disbursement to the artisan upon payment capture,  
**So that** authentic crafts are directly patronized and artisans receive their livelihood without bureaucratic delay.

**Acceptance Criteria:**
- [x] Official `razorpay` Node SDK installed in backend
- [x] Customer checkout opens official Razorpay Checkout modal with order ID, amount, and Parampara branding
- [x] Razorpay payment signatures verified on backend via HMAC-SHA256
- [x] Dedicated `/webhook/razorpay` and `/api/orders/webhook` handles `payment.captured`, `order.paid`, and `payout.processed`
- [x] Automated 70% direct disbursement via RazorpayX (`POST /api/orders/:id/payout`) with UTR and fund account tracking
- [x] Helmet CSP directives updated to permit Razorpay scripts, frames, and analytics
- [x] `.env.example` documents `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_ACCOUNT_NUMBER`
- [x] Full test coverage with passing Jest test suites

### US-07 — Production SMS Gateway
**As** a customer and artisan,  
**I want** instant SMS alerts for login OTPs and order status updates,  
**So that** transactions and craft dispatches are confirmed via physical mobile.

**Acceptance Criteria:**
- [ ] Fast2SMS / Twilio production gateway wired to authentication and order routes
- [ ] Failover to development mock mode if credentials unset
- [ ] Delivery status logging and rate limiting

### US-08 — Logistics & Tracking (India Post / Shiprocket)
**As** a collector,  
**I want** live tracking and certified delivery of my GI-tagged craft,  
**So that** I know exactly when my handcrafted piece will arrive.

**Acceptance Criteria:**
- [x] Live postal rate calculator by pincode
- [x] Automated AWB generation upon artisan dispatch
- [x] Real-time tracking status updates in user profile & public tracker portal
