# 📜 Parampara — Codebase Architecture & Viva Explainer Guide

> **Quick Reference Guide for Project Demonstrations, Faculty Reviews, and Technical Viva**  
> *Project: Parampara — Sovereign Indian Heritage & Geographical Indication (GI) Craft Marketplace*  
> *Academic Year: 2026–27 | Sanjay Ghodawat University, Kolhapur*

---

## 🧭 How to Use This Guide
Whenever an examiner, faculty member, or interviewer points to any file in the repository and asks:
> *"What does this file do? What is its role in the system?"*

You can directly refer to the corresponding summary below or look at the **standardized comment header** at the very top of that file in the codebase. Every coding file contains:
1. **Module Name & Architecture Layer**
2. **Core Purpose**
3. **Key Responsibilities & Capabilities**
4. **"HOW TO EXPLAIN THIS FILE IN AN INTERVIEW / VIVA"** verbatim speech prompt.

---

## 🏛️ System Architecture at a Glance

```
[ Client View / Browser ] (HTML5 + Tailwind CSS + Vanilla JS)
        │
        ▼ (HTTPS REST / JSON API)
[ Reverse Proxy & CDN ] (Vercel Edge Network / Render Cloud Routing)
        │
        ▼
[ Express 5.x Server ] (:5000)
   ├── Security Middleware (Helmet, CORS, Express-Rate-Limit)
   ├── Domain Routers (/api/auth, /api/products, /api/artisans, /api/orders, /api/shipping, /api/gi)
   ├── Auxiliary Services (PDFKit Deeds, Fast2SMS Alerts, Razorpay HMAC, YouPI Settlement)
        │
        ▼
[ 3-Tier Resilient Persistence ]
   ├── [Primary] MongoDB Atlas Cloud Replica Set
   ├── [Failover 1] Local MongoDB Instance (localhost:27017)
   └── [Failover 2] In-Memory Mock Store (Zero-Downtime Guarantee)
```

---

## 📂 1. Backend Core & Configuration

| File | Module Name | One-Sentence Viva Explanation |
| :--- | :--- | :--- |
| [`backend/server.js`](backend/server.js) | Server Runtime Bootstrap | Loads `.env` configuration, establishes the 3-tier resilient MongoDB connection, and starts the Express server listening on port 5000. |
| [`backend/app.js`](backend/app.js) | Express App & Middleware | Aggregates enterprise security headers (Helmet), CORS whitelisting, rate limiting, and mounts all modular `/api` routes. |
| [`backend/config/db.js`](backend/config/db.js) | Database Connection Manager | Implements our 3-tier resilient database connection pipeline (Atlas $\rightarrow$ Local $\rightarrow$ In-Memory) guaranteeing zero server crashes. |
| [`backend/middleware/auth.js`](backend/middleware/auth.js) | JWT & Role Authentication | Intercepts protected requests, verifies cryptographic Bearer JWT tokens, and attaches `req.user` with role authorization. |
| [`backend/seed.js`](backend/seed.js) | Catalog & Artisan Seeder | Populates MongoDB with 71+ certified GI crafts across all 28 states and profiles of 58+ living master craftspeople. |

---

## 🗄️ 2. Data Models (Mongoose ODM)

| File | Model Name | One-Sentence Viva Explanation |
| :--- | :--- | :--- |
| [`backend/models/User.js`](backend/models/User.js) | User / Patron Model | Defines user credentials, saved heirloom collections, and uses Bcrypt with 10 salt rounds to hash passwords in pre-save hooks. |
| [`backend/models/Product.js`](backend/models/Product.js) | GI Craft Product Model | Stores statutory GI application numbers, artisan attribution, materials, and compound `$text` search indexes for sub-millisecond queries. |
| [`backend/models/Order.js`](backend/models/Order.js) | Acquisition Order Model | Tracks orders, delivery dossiers, payment status, India Post AWB tracking, and explicitly records the **70% direct artisan remuneration share**. |

---

## 🛣️ 3. Backend REST API Routers (`backend/routes/`)

| File | Endpoint Mount | One-Sentence Viva Explanation |
| :--- | :--- | :--- |
| [`backend/routes/artisans.js`](backend/routes/artisans.js) | `/api/artisans` | Returns verified profiles of 58+ master artisans, Shilp Gurus, physical portraits, and national geographic filters. |
| [`backend/routes/orders.js`](backend/routes/orders.js) | `/api/orders` | Calculates 70% direct artisan payouts, verifies bank UTRs and Razorpay HMAC signatures, triggers PDF deed generation, and sends SMS alerts. |
| [`backend/routes/products.js`](backend/routes/products.js) | `/api/products` | Powers full-text catalog search, regional 28-state filters, price sliders, and product inventory checks. |
| [`backend/routes/auth.js`](backend/routes/auth.js) | `/api/auth` | Manages patron registration, password login, JWT token issuance, Google OAuth token verification, and SMS OTP verification. |
| [`backend/routes/shipping.js`](backend/routes/shipping.js) | `/api/shipping` | Implements India Post Speed Post rate calculations across 19,000+ PIN codes and tracks live AWB consignment milestones. |
| [`backend/routes/gi.js`](backend/routes/gi.js) | `/api/gi` | Queries Government of India Geographical Indications records to verify statutory craft registration tags and historical origins. |
| [`backend/routes/chat.js`](backend/routes/chat.js) | `/api/chat` | Powers Parampara Mitra, our AI shopping assistant using Levenshtein distance typo tolerance and budget parsing. |
| [`backend/routes/saathi.js`](backend/routes/saathi.js) | `/api/saathi` | Powers Saathi, our cultural docent AI using offline RAG over GI knowledge bases to answer heritage and authenticity questions. |
| [`backend/routes/health.js`](backend/routes/health.js) | `/api/health` | Diagnostic monitoring endpoint reporting server uptime, memory usage, and active database mode (`connected`/`in-memory`). |

---

## ⚙️ 4. Backend Auxiliary Services (`backend/services/`)

| File | Service Name | One-Sentence Viva Explanation |
| :--- | :--- | :--- |
| [`backend/services/pdfInvoiceService.js`](backend/services/pdfInvoiceService.js) | PDFKit Deed Compiler | Dynamically generates 300 DPI vector Certified GI Provenance Deeds and tax invoices with embedded QR verification codes. |
| [`backend/services/razorpayService.js`](backend/services/razorpayService.js) | Razorpay Gateway Svc | Manages official Razorpay payment orders and cryptographically verifies HMAC-SHA256 signatures to prevent tampering. |
| [`backend/services/smsService.js`](backend/services/smsService.js) | Fast2SMS Alert Svc | Dispatches transactional SMS notifications for order confirmations, India Post AWB tracking, and direct bank payouts. |
| [`backend/services/shippingService.js`](backend/services/shippingService.js) | India Post Logistics Svc | Computes domestic freight based on parcel weight slabs and postal zones, and formats 13-character Indian AWB codes (`IP...IN`). |
| [`backend/services/youpiService.js`](backend/services/youpiService.js) | YouPI & UTR Settlement | Validates 12-digit Indian Bank UTR transaction references to ratify direct UPI and NEFT transfers. |
| [`backend/services/emailService.js`](backend/services/emailService.js) | Transactional Email Svc | Dispatches password reset tokens and order summary emails formatted in Parampara's royal sovereign palette. |

---

## 🖥️ 5. Frontend JavaScript Controllers (`js/`)

| File | Primary Page | One-Sentence Viva Explanation |
| :--- | :--- | :--- |
| [`js/map-interactive.js`](js/map-interactive.js) | `index.html` | Powers the interactive SVG map of India at 60FPS using vector DOM paths and Web Audio harmonic chimes on state hover. |
| [`js/artisans.js`](js/artisans.js) | `artisans.html` | Controls the National Artisan Directory, debounced live search, 6-region filters, and the interactive Master Dossier modal. |
| [`js/checkout.js`](js/checkout.js) | `checkout.html` | Manages the Curated Acquisition Salon, calculates 70% direct artisan payouts on screen, renders dynamic UPI QR codes, and verifies UTRs. |
| [`js/auth.js`](js/auth.js) | Global / All | Manages client JWT tokens in `localStorage`, updates navbar profile badges, and enforces route protection. |
| [`js/profile.js`](js/profile.js) | `profile.html` | Renders collector acquisition history, live India Post tracking progress, and provides one-click PDF deed downloads. |
| [`js/youpi.js`](js/youpi.js) | `checkout.html` | Client adapter for UPI settlements, opening the payment sheet and submitting 12-digit UTR numbers to the backend. |
| [`js/saathi.js`](js/saathi.js) | `saathi.html` | Drives the Saathi conversational AI interface, streaming answers on craft authenticity and cultural heritage. |
| [`js/track.js`](js/track.js) | `track.html` | Parses 13-character AWB numbers and renders an interactive step-by-step India Post shipment progress timeline. |
| [`js/components.js`](js/components.js) | Global / Shared | Generates reusable header, footer, craft card, and toast components across pages. |
| [`js/nav.js`](js/nav.js) | Global / Shared | Manages responsive navbar behavior, mobile hamburger drawer transitions, and cart counter badges. |
| [`js/widget.js`](js/widget.js) | Global / Shared | Provides floating interactive widgets, such as ambient sound effects and the quick Saathi AI launcher. |
| [`sw.js`](sw.js) | PWA / Offline | Service Worker caching critical stylesheets, fonts, and assets for offline presentation resilience. |

---

## 🌐 6. Primary User-Facing Views (HTML Pages)

| File | Page Name | One-Sentence Viva Explanation |
| :--- | :--- | :--- |
| [`index.html`](index.html) | Main Discovery Portal | The homepage featuring the interactive 28-state SVG India map, hero mosaic, trust telemetry, and curated craft collections. |
| [`artisans.html`](artisans.html) | National Artisan Directory | National gallery showcasing 58+ verified master craftspeople across all 28 states with authentic physical portraits and award dossiers. |
| [`checkout.html`](checkout.html) | Sovereign Acquisition Salon | Certified checkout displaying live 70% direct artisan payouts, packaging choices, dynamic UPI QR codes, and PDF deed downloads. |
| [`about.html`](about.html) | Brand Heritage & Mission | Explains our cultural mission, statutory protection under the GI Act of 1999, and our transparent 70% remuneration model. |
| [`artisan-dashboard.html`](artisan-dashboard.html) | Artisan Guild Portal | Operational portal for master craftspeople and cooperatives to inspect orders, track inventory, and view bank credits. |
| [`cart.html`](cart.html) | Curated Vault View | Standalone cart view allowing collectors to review items, adjust quantities, and inspect estimated artisan remuneration. |
| [`collection.html`](collection.html) | Saved Heirlooms Gallery | Authenticated private gallery displaying the collector's bookmarked and saved masterpieces. |
| [`product-jaipur-pottery.html`](product-jaipur-pottery.html) | Jaipur Pottery Spotlight | Dedicated craft feature documenting the non-clay quartz technique of Jaipur Blue Pottery and Master Gopal Saini's studio. |
| [`masterpiece.html`](masterpiece.html) | Dynamic Provenance Studio | Universal detail view rendering any craft heirloom dynamically by ID with statutory GI proof and artisan credits. |
| [`profile.html`](profile.html) | Collector Account & Archive | Profile dashboard displaying order history, live India Post tracking progress, and downloadable Certified GI Deeds. |
| [`search.html`](search.html) | Catalog Search & Filter | Catalog browsing page with full-text search, regional state dropdowns, craft category chips, and price sliders. |
| [`login.html`](login.html) | Authentication Portal | Dual-tab interface supporting sign-in, account creation, mobile SMS OTP, and Google OAuth. |
| [`saathi.html`](saathi.html) | Saathi AI Salon | Dedicated conversational testing salon for the Saathi domain-grounded cultural guide. |
| [`track.html`](track.html) | Shipment Tracking View | Public consignment tracking view rendering live India Post dispatch timelines for any given AWB. |

---

## 🧪 7. Automated Test Suites (`backend/tests/` — 98/98 Tests Passing)

| Test File | Test Suite Focus | Key Verifications |
| :--- | :--- | :--- |
| [`artisans.test.js`](backend/tests/artisans.test.js) | Artisan Directory API | Validates 58 master artisan profiles, regional filtering, and physical portrait URLs (7 tests). |
| [`orders.test.js`](backend/tests/orders.test.js) | Orders & Financial Escrow | Validates exact 70% artisan payout math, 12-digit UTR checks, and Razorpay HMAC signatures (22 tests). |
| [`products.test.js`](backend/tests/products.test.js) | Catalog & Search Engine | Validates full-text search, pagination, category filters, and state tags (14 tests). |
| [`shipping.test.js`](backend/tests/shipping.test.js) | India Post Logistics Svc | Validates PIN code serviceability, weight slab pricing, and AWB generation (11 tests). |
| [`auth.test.js`](backend/tests/auth.test.js) | Authentication & Bcrypt | Validates password hashing, JWT token issuance, and duplicate email rejections (18 tests). |
| [`sms.test.js`](backend/tests/sms.test.js) | Transactional SMS Alerts | Validates order confirmation, AWB dispatch, and payout notification message builders (15 tests). |
| [`gi.test.js`](backend/tests/gi.test.js) | Statutory GI Verification | Validates official GI tag numbers against Ministry of Commerce registration data (5 tests). |
| [`health.test.js`](backend/tests/health.test.js) | Health & Diagnostics | Validates uptime, memory telemetry, and database connectivity state (3 tests). |
| [`middleware.test.js`](backend/tests/middleware.test.js) | Security Headers & CORS | Validates Helmet security headers, CORS origin filtering, and express-rate-limiters (3 tests). |

---

## 💡 Quick Tips for Viva & Oral Demonstrations

1. **If asked: "Where is the 70% payout enforced?"**
   - **Frontend:** [`js/checkout.js`](js/checkout.js) calculates `Math.round(baseGuildValue * 0.70)` and updates `#summary-artisan-payout` live on the ledger.
   - **Backend:** [`backend/routes/orders.js`](backend/routes/orders.js) re-calculates `calculateArtisanPayout(orderItems)` server-side to guarantee client tampering is impossible.

2. **If asked: "How does the system prevent counterfeits?"**
   - Every product in [`backend/models/Product.js`](backend/models/Product.js) requires an official Ministry of Textiles GI application number (e.g. `GI Application #JP-84`).
   - The platform provides interactive 3-step authenticity tests and issues a vector PDF Certified GI Deed via [`backend/services/pdfInvoiceService.js`](backend/services/pdfInvoiceService.js) with embedded QR verification.

3. **If asked: "What happens if MongoDB Atlas goes down?"**
   - Point to [`backend/config/db.js`](backend/config/db.js). Explain our 3-tier resilient failover architecture: if Atlas times out, it connects to local MongoDB; if local DB is unreachable, it seamlessly switches to an in-memory mock store so the user experience is never broken.
