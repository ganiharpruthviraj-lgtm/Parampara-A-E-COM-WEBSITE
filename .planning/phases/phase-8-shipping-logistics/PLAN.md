# Phase 8: Shipping & Logistics API Integration (India Post / Shiprocket)

## Goal
Integrate live postal rate calculations by delivery PIN code, automated courier pickup scheduling from rural artisan clusters, AWB generation, real-time courier tracking, and an interactive tracking portal.

## Requirements Covered
- **US-08**: Logistics & Tracking (India Post / Shiprocket)

## Work Completed

### 1. Postal Zone Directory & Shipping Service
- Created [`backend/services/shippingService.js`](file:///d:/ankush/backend/services/shippingService.js) providing:
  - Complete 28 States & 8 Union Territories postal circle mapping (PIN prefix 11-85).
  - Categorization into `Metro`, `Tier-1`, `Rest of India`, and `Remote/Special` (Jammu & Kashmir, Ladakh, Northeast 8 states, Andaman & Nicobar, Lakshadweep).
  - PIN code validation & geographical zone resolution (`resolvePincode`).
  - Tiered shipping rate engine (`calculateShippingRates`) supporting both `standard` (India Post Speed Post - 100% all-India coverage) and `express` (Shiprocket Air courier) with remote-area surcharges, fragile craft handling, and free shipping over ₹1,999.
  - Automated AWB generation (`IP` + 9 digits + `IN`) and rural artisan cluster pickup dispatch scheduling (`createShipmentAndPickup`).
  - Live checkpoint tracking simulation & carrier metadata (`getTrackingDetails`).
  - Courier webhook event ingestion and state transitions (`handleCourierWebhook`).

### 2. Shipping REST API
- Created [`backend/routes/shipping.js`](file:///d:/ankush/backend/routes/shipping.js) with endpoints:
  - `POST /api/shipping/calculate-rates`: Computes exact rates and transit days for a PIN code and weight.
  - `GET /api/shipping/pincode/:pincode`: Validates PIN code, returns city, state, zone, and courier serviceability.
  - `POST /api/shipping/create-shipment`: Authenticated endpoint to generate AWB and schedule pickup.
  - `GET /api/shipping/track/:awb`: Public lookup for package tracking timeline and checkpoint history.
  - `POST /api/shipping/webhook`: Carrier webhook receiver for status updates (`OUT_FOR_PICKUP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `RTO`).
- Mounted `/api/shipping` in [`backend/app.js`](file:///d:/ankush/backend/app.js) with rate limiting.

### 3. Order Model & Lifecycle Integration
- Updated [`backend/models/Order.js`](file:///d:/ankush/backend/models/Order.js) schema:
  - `courierPartner` (`India Post Speed Post` | `Shiprocket` | `Blue Dart` | `Delhivery`).
  - `awb`: Unique postal tracking code.
  - `trackingUrl`: Direct carrier tracking link.
  - `estimatedDeliveryDate`: Date timestamp based on postal zone transit metrics.
  - `pickupDetails`: Sub-document containing `scheduledDate`, `clusterLocation`, `pickupToken`, and `status`.
  - `shippingTimeline`: Event array tracking stage timestamps, status code, location, and notes.
- Updated [`backend/routes/orders.js`](file:///d:/ankush/backend/routes/orders.js):
  - In `PUT /api/orders/:id/status`, transitioning to `Dispatched` automatically generates an AWB, schedules rural cluster pickup, and assigns courier tracking data if not already set.
  - Added `POST /api/orders/:id/dispatch` for artisan direct dispatch booking with custom weight and pickup notes.
  - Added `GET /api/orders/:id/tracking` to fetch detailed order shipping milestones.

### 4. Public Order Tracking Portal
- Created [`track.html`](file:///d:/ankush/track.html):
  - Accessible directly at `/track.html` with optional `?awb=` or `?order=` query parameters.
  - Modern design featuring an AWB search bar, courier badges, current stage progress card, dynamic interactive milestone tracker, and audit log of movement checkpoints.
- Created [`js/track.js`](file:///d:/ankush/js/track.js):
  - Client controller fetching from `/api/shipping/track/:awb` with seamless fallback for simulated/offline orders.

### 5. Frontend Checkout & Artisan Dashboard Integration
- In [`checkout.html`](file:///d:/ankush/checkout.html):
  - Added `#pincode-feedback` status badge for real-time PIN code verification.
  - Updated shipping method selectors to dynamic transit badges (Speed Post vs. Air Express).
- In [`js/checkout.js`](file:///d:/ankush/js/checkout.js):
  - Added debounced PIN code rate lookup calling `/api/shipping/calculate-rates`.
  - Dynamically updates shipping options, transit estimates, and total cart price.
- In [`artisan-dashboard.html`](file:///d:/ankush/artisan-dashboard.html) & [`js/artisan-dashboard.js`](file:///d:/ankush/js/artisan-dashboard.js):
  - Dispatched orders display clickable AWB tracking links opening `track.html?awb=...`.
  - Added direct "Schedule Rural Pickup" button that calls `/api/orders/:id/dispatch` to auto-schedule India Post / Shiprocket pickups from artisan villages.

### 6. Environment & Configuration
- Documented in [`.env.example`](file:///d:/ankush/.env.example) and [`backend/.env.example`](file:///d:/ankush/backend/.env.example):
  - `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`
  - `INDIA_POST_CLIENT_ID`, `INDIA_POST_API_KEY`
  - `SHIPPING_WEBHOOK_SECRET`

### 7. Verification & Automated Tests
- Created [`backend/tests/shipping.test.js`](file:///d:/ankush/backend/tests/shipping.test.js) covering 10 test scenarios:
  - PIN code validation & remote zone surcharge logic (Himalayan / Northeast pincodes).
  - Rate calculations for standard vs. express tiers, free shipping thresholds.
  - India Post Speed Post AWB generation format matching `/^IP\d{9}IN$/`.
  - Rural artisan pickup scheduling.
  - Live tracking checkpoints lookup.
  - Carrier webhook event ingestion and order timeline append.
  - Order dispatch endpoint (`POST /api/orders/:id/dispatch`).
- Full test run verified: **67/67 passing tests** across 7 test suites.

