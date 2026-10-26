# Parampara — Roadmap

## Milestone 1: Production Hardening
**Status:** 🟡 In Progress  
**Goal:** Raise audit score 63 → 85+/100. Fix security, SEO, performance, CI gaps.

---

### Phase 1 — Security Hardening
**Status:** ⬜ Pending  
**Requirement:** US-01  
**Deliverables:**
- Strong `JWT_SECRET` (64-char) documented in `.env.example`
- CORS restricted to whitelist in `backend/app.js`
- `.env.example` fully documenting all env vars

### Phase 2 — SEO & Open Graph
**Status:** ⬜ Pending  
**Requirement:** US-02  
**Deliverables:**
- Unique `<title>` on all 15 HTML pages
- `<meta name="description">` on all 15 pages
- OG tags (`og:title`, `og:description`, `og:image`) on all 15 pages

### Phase 3 — Performance: Asset Compression
**Status:** ⬜ Pending  
**Requirement:** US-03  
**Deliverables:**
- `favicon.png` → compressed to < 10 KB
- `assets/artisan_impact.png` → compressed to < 200 KB
- `assets/master_potter_artisan.png` → compressed to < 200 KB

### Phase 4 — CI/CD: Add Test Gate
**Status:** ⬜ Pending  
**Requirement:** US-04  
**Deliverables:**
- `.github/workflows/ci.yml` runs `npm test` before deploy
- Matrix: Node 18.x + 20.x
- Deploy blocked on test failure

### Phase 5 — Render Keep-Alive
**Status:** ⬜ Pending  
**Requirement:** US-05  
**Deliverables:**
- `scripts/keep-alive.js` pings Render URL every 14 minutes
- GitHub Actions cron job runs keep-alive
- README documents the cold-start solution

---

## Milestone 2: Artisan Commerce (Q1 2027)
**Status:** 🔒 Locked  
- Razorpay live KYC + Payouts API integration
- Fast2SMS / Twilio production credentials
- India Post / Shiprocket shipping API

## Milestone 3: PWA & Offline (Q3 2027)
**Status:** 🔒 Locked  
- Service Worker + Web App Manifest
- On-device GI barcode scanner
- Multilingual audio support
