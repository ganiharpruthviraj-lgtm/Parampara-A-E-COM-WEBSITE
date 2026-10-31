# Parampara — Roadmap

## Milestone 1: Production Hardening
**Status:** ✅ Complete  
**Goal:** Raise audit score 63 → 85+/100. Fix security, SEO, performance, CI gaps.

---

### Phase 1 — Security Hardening
**Status:** ✅ Complete  
**Requirement:** US-01  
**Deliverables:**
- ✅ Strong `JWT_SECRET` (64-char) documented in `.env.example` — generation command included
- ✅ CORS restricted to whitelist in `backend/app.js` — dynamic origin function with `.vercel.app`, `.onrender.com`, `.github.io` wildcard support
- ✅ `.env.example` fully documenting all env vars including `RENDER_URL`

### Phase 2 — SEO & Open Graph
**Status:** ✅ Complete  
**Requirement:** US-02  
**Deliverables:**
- ✅ Unique `<title>` on all 17 HTML pages
- ✅ `<meta name="description">` on all 17 pages
- ✅ OG tags (`og:title`, `og:description`, `og:image`) on all 17 pages
- ✅ Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`) on all 17 pages
- ✅ `register.html` OG/Twitter tags added (was the only missing page)

### Phase 3 — Performance: Asset Compression
**Status:** ✅ Complete  
**Requirement:** US-03  
**Deliverables:**
- ✅ `favicon.png` = 5.6 KB (well under 10 KB target)
- ✅ `assets/artisan_impact.webp` = 130 KB (under 200 KB); all HTML references `.webp`
- ✅ `assets/master_potter_artisan.webp` = 83 KB (under 200 KB); all HTML references `.webp`
- ✅ No CSS or JS references to oversized `.png` originals confirmed

### Phase 4 — CI/CD: Add Test Gate
**Status:** ✅ Complete  
**Requirement:** US-04  
**Deliverables:**
- ✅ `.github/workflows/ci.yml` runs `npm --prefix backend test` before deploy
- ✅ Matrix: Node 18.x + 20.x
- ✅ Deploy blocked on test failure

### Phase 5 — Render Keep-Alive
**Status:** ✅ Complete  
**Requirement:** US-05  
**Deliverables:**
- ✅ `scripts/keep-alive.js` pings Render URL every 10 minutes
- ✅ `.github/workflows/keep-alive.yml` cron runs every 10 minutes
- ✅ `.env.example` documents `RENDER_URL` variable
- ✅ `scripts/keep-alive.js` reads `RENDER_URL` from environment

---

## Milestone 2: Artisan Commerce
**Status:** 🚀 Active  
**Goal:** Direct digital commerce, verified payment integrity, and automated 70% artisan payouts.

### Phase 6 — Razorpay Checkout, Webhooks & Automated 70% Artisan Payouts
**Status:** ✅ Complete  
**Requirement:** US-06  
**Deliverables:**
- ✅ Official `razorpay` Node SDK installed in `backend/package.json`
- ✅ Dedicated `services/razorpayService.js` for order creation, signature validation, webhooks, and RazorpayX payouts
- ✅ Razorpay standard Checkout modal integration into `checkout.html` and `js/checkout.js`
- ✅ Automated 70% direct artisan disbursement (`POST /api/orders/:id/payout` and `POST /api/orders/payout`)
- ✅ Razorpay Webhook receiver (`POST /webhook/razorpay` and `POST /api/orders/webhook`) with HMAC SHA-256 verification
- ✅ Helmet CSP updated in `backend/app.js` with Razorpay CDN and API origins
- ✅ `.env.example` in backend and root updated with Razorpay and RazorpayX credentials
- ✅ 12/12 Jest tests passing in `backend/tests/orders.test.js`

### Phase 7 — Production SMS Gateway
**Status:** 📋 Ready for Planning  
**Requirement:** US-07  
- Fast2SMS / Twilio production SMS delivery for physical mobile OTP and dispatch alerts

### Phase 8 — Shipping & Logistics API
**Status:** ✅ Complete  
**Requirement:** US-08  
**Deliverables:**
- ✅ India Post Speed Post & Shiprocket multi-carrier rate calculation across all 28 Indian states & UTs
- ✅ Automated AWB generation (`IP\d{9}IN` Speed Post format) & rural artisan cluster pickup dispatch
- ✅ Carrier webhook endpoint (`POST /api/shipping/webhook`) for live delivery state syncing
- ✅ Public order tracking portal ([`track.html`](file:///d:/ankush/track.html) & [`js/track.js`](file:///d:/ankush/js/track.js))
- ✅ Dynamic checkout PIN code calculation badge & transit estimation
- ✅ Artisan dashboard dispatch booking with direct tracking integration
- ✅ 10/10 Jest tests passing in `backend/tests/shipping.test.js` (67/67 overall suite)

---

## Milestone 3: PWA & Offline (Q3 2027)
**Status:** 🔒 Locked  
- Service Worker + Web App Manifest
- On-device GI barcode scanner
- Multilingual audio support
