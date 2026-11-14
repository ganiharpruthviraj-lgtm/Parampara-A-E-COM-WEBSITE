const fs = require('fs');
const path = require('path');

// File Explanation Dictionary
const FILE_METADATA = {
  // === BACKEND CORE ===
  'backend/server.js': {
    type: 'js',
    name: 'backend/server.js',
    module: 'Server Runtime Bootstrap',
    purpose: 'Entry point and HTTP server cluster bootstrap for the Parampara backend API.',
    responsibilities: [
      'Loads environment variables from root and local .env files',
      'Initializes 3-tier resilient MongoDB database connection via connectDB()',
      'Binds Express application cluster to process.env.PORT or port 5000',
      'Provides clean startup logging and port listening confirmation'
    ],
    viva: 'This is the server entry point. It loads environment variables with dotenv, initializes our 3-tier resilient database connection, and starts the Express HTTP server listening on port 5000.'
  },

  'backend/app.js': {
    type: 'js',
    name: 'backend/app.js',
    module: 'Express Application & Middleware Aggregator',
    purpose: 'Configures Express application, security middleware pipeline, CORS policies, rate limiting, and mounts modular REST API route controllers.',
    responsibilities: [
      'Applies Helmet HTTP security headers for content-security and frameguard protection',
      'Configures CORS origin whitelisting for local development and production Vercel/Render deployments',
      'Enforces express-rate-limit to protect against brute-force and denial-of-service attempts',
      'Mounts 8 domain-specific REST route handlers under /api (auth, products, artisans, orders, shipping, gi, chat, health)',
      'Provides global 404 handler and central error response middleware'
    ],
    viva: 'This file is the main Express application setup. It configures the security middleware pipeline—such as Helmet, CORS whitelisting, rate limiting, and gzip compression—and aggregates all modular REST API routes under the /api namespace.'
  },

  'backend/seed.js': {
    type: 'js',
    name: 'backend/seed.js',
    module: 'Database Seeder & Catalog Initializer',
    purpose: 'Master database seeding utility that populates MongoDB with authentic Geographical Indication (GI) craft heirlooms and master artisan profiles.',
    responsibilities: [
      'Establishes connection to MongoDB Atlas or local instance',
      'Safely purges existing mock/stale products and artisan records',
      'Injects 71+ certified masterpieces across all 28 Indian states with statutory GI application tags',
      'Configures initial inventory stock, material descriptions, and artisan attributions'
    ],
    viva: 'This is our database seeder script. It populates MongoDB with verified GI-tagged craft items and master artisan profiles across all 28 states of India so the platform has authentic data immediately available on boot.'
  },

  'backend/config/db.js': {
    type: 'js',
    name: 'backend/config/db.js',
    module: 'Resilient Database Connection Manager',
    purpose: 'Manages MongoDB connectivity implementing a 3-tier automatic failover architecture (Cloud Atlas -> Local MongoDB -> In-Memory Store).',
    responsibilities: [
      'Attempts primary TLS connection to MongoDB Atlas cloud replica set',
      'Gracefully degrades to local MongoDB instance (mongodb://localhost:27017/parampara) if cloud connection times out',
      'Falls back to an in-memory mock store if no database daemon is reachable, preventing server crash',
      'Exports active database connection state and ping diagnostic metrics'
    ],
    viva: 'This file implements our 3-tier resilient database architecture. It attempts to connect to MongoDB Atlas first, falls back to a local MongoDB instance if offline, and finally uses an in-memory mock store. This guarantees zero server crashes during viva demonstrations or network drops.'
  },

  'backend/middleware/auth.js': {
    type: 'js',
    name: 'backend/middleware/auth.js',
    module: 'JWT Authentication & Role-Based Access Control',
    purpose: 'Protects private REST endpoints by verifying JSON Web Token (JWT) signatures and enforcing user role permissions.',
    responsibilities: [
      'Extracts Bearer token from incoming HTTP Authorization header',
      'Cryptographically verifies token validity using JWT_SECRET',
      'Fetches authenticated user record from database and attaches to req.user',
      'Provides authorize() middleware to restrict administrative or artisan-only endpoints'
    ],
    viva: 'This is our authentication middleware. It intercepts protected API requests, verifies the cryptographic signature of the Bearer JWT token, attaches the user object to req.user, and rejects unauthorized access with 401/403 status codes.'
  },

  'backend/models/User.js': {
    type: 'js',
    name: 'backend/models/User.js',
    module: 'User Account Domain Model',
    purpose: 'Mongoose schema and entity model defining patron accounts, authentication credentials, and saved collections.',
    responsibilities: [
      'Defines user attributes: name, email, passwordHash, role, phone, and savedCollection',
      'Implements pre-save middleware hook hashing passwords with Bcrypt (10 salt rounds)',
      'Provides matchPassword() instance method for constant-time password verification',
      'Maintains indexed unique constraints on user email addresses'
    ],
    viva: 'This is the Mongoose schema for user accounts. It defines fields like email, hashed password, role, and curated collections, and includes a pre-save hook that hashes passwords using Bcrypt with 10 salt rounds.'
  },

  'backend/models/Product.js': {
    type: 'js',
    name: 'backend/models/Product.js',
    module: 'Certified GI Craft Masterpiece Model',
    purpose: 'Mongoose schema modeling authentic Geographical Indication (GI) handicrafts and artisan attributions.',
    responsibilities: [
      'Defines craft attributes: name, state, craftType, giNumber, price, stock, artisanId, and images',
      'Stores statutory provenance data including material origins, authenticity tests, and regional cluster',
      'Establishes compound $text indexes on name, craftType, and state for rapid full-text catalog queries',
      'Maintains validation rules preventing zero or negative pricing and invalid GI tags'
    ],
    viva: 'This schema models our certified craft heirlooms. It stores statutory GI numbers, price, stock, and artisan references, and includes compound text indexes on name, craft, and state for sub-millisecond search performance.'
  },

  'backend/models/Order.js': {
    type: 'js',
    name: 'backend/models/Order.js',
    module: 'Acquisition Order & Escrow Settlement Model',
    purpose: 'Mongoose schema capturing sovereign acquisitions, delivery dossiers, 70% direct artisan payouts, and logistics tracking.',
    responsibilities: [
      'Stores ordered craft items, quantities, and individual guild values',
      'Computes and records the exact 70% direct artisan remuneration share for escrow audit',
      'Tracks settlement state (PENDING, PAID, DISBURSED) and payment rails (YouPI UTR / Razorpay)',
      'Records India Post Speed Post 13-character AWB consignment tracking identifiers',
      'Maintains reference links to generated Certified GI Deed PDF documents'
    ],
    viva: 'This model tracks our end-to-end acquisition orders. It stores the patron address, ordered crafts, payment method, 12-digit UTR, India Post AWB tracking number, and specifically records the 70% direct artisan share for escrow auditing.'
  },

  // === BACKEND ROUTES ===
  'backend/routes/artisans.js': {
    type: 'js',
    name: 'backend/routes/artisans.js',
    module: 'National Artisan Directory API Router',
    purpose: 'Provides REST endpoints to query 58+ verified master craftspeople, Shilp Gurus, and National Awardees across India.',
    responsibilities: [
      'GET /api/artisans: Returns filtered list of artisans by state, geographic region, or craft category',
      'GET /api/artisans/stats: Returns national telemetry (total masters, states represented, direct payout ratio)',
      'GET /api/artisans/:id: Fetches detailed individual Master Dossier with physical portrait, award bio, and atelier tools'
    ],
    viva: 'This router provides the API for our National Master Artisan Directory. It returns verified profiles of 58+ craftspeople across all 28 states, their physical portraits, awards, and GI registration tags.'
  },

  'backend/routes/auth.js': {
    type: 'js',
    name: 'backend/routes/auth.js',
    module: 'Authentication & Identity API Router',
    purpose: 'Handles patron identity workflows including email registration, password login, Google OAuth, and SMS OTP verification.',
    responsibilities: [
      'POST /api/auth/register: Registers new patron with validated email, phone, and Bcrypt hashed password',
      'POST /api/auth/login: Authenticates credentials and returns signed JWT access token',
      'POST /api/auth/google: Verifies Google Identity Services ID token via google-auth-library OAuth2Client',
      'POST /api/auth/send-sms-otp & /verify-sms-otp: Manages mobile 6-digit OTP verification',
      'POST /api/auth/forgot-password & /reset-password: Secure password reset flow with cryptographic tokens'
    ],
    viva: 'This route handles all identity operations—user registration with Bcrypt hashing, JWT issuance, Google OAuth token verification, and SMS OTP verification.'
  },

  'backend/routes/orders.js': {
    type: 'js',
    name: 'backend/routes/orders.js',
    module: 'Order Fulfillment & Payment Ratification Router',
    purpose: 'Core transaction engine calculating 70% direct artisan payouts, verifying payment settlements, and triggering GI deed generation.',
    responsibilities: [
      'POST /api/orders: Creates new order, validates item stocks, computes 70% artisan share and shipping fees',
      'POST /api/orders/verify-payment: Ratifies order upon receiving valid 12-digit bank UTR or Razorpay HMAC signature',
      'Triggers PDFKit Certified GI Deed PDF generation and stores binary buffer',
      'Dispatches transactional SMS alerts to patron and artisan mobile numbers upon ratification',
      'GET /api/orders/my-orders: Returns authenticated user acquisition history with live consignment tracking'
    ],
    viva: 'This is the core financial and order fulfillment router. It calculates the 70% direct artisan payout, verifies bank UTR references and Razorpay signatures, locks escrow, triggers India Post AWB generation, and generates the certified GI deed.'
  },

  'backend/routes/products.js': {
    type: 'js',
    name: 'backend/routes/products.js',
    module: 'Craft Catalog & Search API Router',
    purpose: 'Powers craft discovery, full-text catalog search, regional state filtering, and stock inquiries.',
    responsibilities: [
      'GET /api/products: Executes compound queries supporting $text search, state, category, price range, and pagination',
      'GET /api/products/:id: Retrieves single masterpiece with full material origins and authenticity proof',
      'GET /api/products/state/:stateName: Returns all certified crafts registered to a specific Indian state'
    ],
    viva: 'This router powers our product catalog. It handles searching and filtering across India 28 states, utilizing MongoDB compound text indexes for instant search results.'
  },

  'backend/routes/shipping.js': {
    type: 'js',
    name: 'backend/routes/shipping.js',
    module: 'India Post Speed Post Logistics Router',
    purpose: 'Calculates domestic shipping charges across 19,000+ PIN codes and tracks Speed Post consignment status.',
    responsibilities: [
      'POST /api/shipping/calculate: Computes zonal freight cost based on parcel weight slabs and postal PIN codes',
      'GET /api/shipping/track/:awb: Returns live tracking timeline milestones for a given 13-character AWB',
      'Validates 6-digit Indian PIN codes against domestic postal circles'
    ],
    viva: 'This route handles shipping logistics. It computes India Post Speed Post charges based on weight slabs and destination zones, and simulates live AWB tracking milestones.'
  },

  'backend/routes/gi.js': {
    type: 'js',
    name: 'backend/routes/gi.js',
    module: 'Statutory GI Registry Verification Router',
    purpose: 'Queries Government of India Geographical Indications records to verify authentic craft registration numbers.',
    responsibilities: [
      'GET /api/gi/verify/:giNumber: Validates statutory registration tag and returns official registration year and state',
      'GET /api/gi/directory: Returns complete index of registered Indian handicrafts by state and craft class'
    ],
    viva: 'This router provides statutory verification for GI tags. It lets clients verify GI numbers, ensuring crafts are legally authenticated against Government of India registries.'
  },

  'backend/routes/chat.js': {
    type: 'js',
    name: 'backend/routes/chat.js',
    module: 'Parampara Mitra AI Concierge Router',
    purpose: 'AI shopping concierge supporting fuzzy craft recommendations and typo-tolerant search using Levenshtein distance.',
    responsibilities: [
      'POST /api/chat: Parses patron craft queries, applies typo tolerance, and returns matching certified crafts',
      'Extracts budget constraints, target states, and craft categories from natural language inputs'
    ],
    viva: 'This route powers Parampara Mitra, our shopping assistant. It uses fuzzy matching and budget parsing to recommend authentic crafts directly to buyers.'
  },

  'backend/routes/saathi.js': {
    type: 'js',
    name: 'backend/routes/saathi.js',
    module: 'Saathi Cultural Docent RAG Router',
    purpose: 'Domain-grounded AI cultural guide providing historical, technical, and authenticity answers without external API costs.',
    responsibilities: [
      'POST /api/saathi/chat: Queries local GI registry knowledge bases and generates grounded cultural answers',
      'Explains craft techniques, GI test steps (e.g. burn test for pure silk), and master artisan lineages'
    ],
    viva: 'This route powers Saathi, our cultural docent AI. It runs an offline RAG engine over GI knowledge bases to explain craft heritage and authenticity tests without third-party API dependencies.'
  },

  'backend/routes/health.js': {
    type: 'js',
    name: 'backend/routes/health.js',
    module: 'System Diagnostic & Health Check Router',
    purpose: 'Exposes server uptime, system metrics, and database connectivity diagnostic for monitoring and keep-alive pings.',
    responsibilities: [
      'GET /api/health: Returns 200 OK with server uptime, memory usage, timestamp, and active database mode',
      'Used by Render cloud keep-alive timers and automated CI/CD deployment checks'
    ],
    viva: 'This is our health diagnostic endpoint used by uptime monitors, load balancers, and Render keep-alive pings to verify server and database health.'
  },

  // === BACKEND SERVICES ===
  'backend/services/pdfInvoiceService.js': {
    type: 'js',
    name: 'backend/services/pdfInvoiceService.js',
    module: 'PDFKit Vector Deed & Invoice Compiler',
    purpose: 'Generates high-resolution vector Certified GI Provenance Deeds and tax invoices at 300 DPI.',
    responsibilities: [
      'Compiles A4 PDF document containing Ministry of Textiles crest, GI application numbers, and artisan lineage',
      'Generates dynamic QR verification code linking to the live digital deed on the web',
      'Itemizes financial values: craft guild subtotal, 70% direct artisan share, packaging, and transit fees',
      'Returns printable vector PDF binary buffer for immediate browser download or attachment'
    ],
    viva: 'This service uses PDFKit to dynamically generate tamper-evident, print-ready Certified GI Provenance Deeds and invoices with embedded QR codes upon payment ratification.'
  },

  'backend/services/razorpayService.js': {
    type: 'js',
    name: 'backend/services/razorpayService.js',
    module: 'Razorpay Gateway & Signature Verification Service',
    purpose: 'Integrates official Razorpay payment SDK and validates webhook/checkout HMAC-SHA256 signatures.',
    responsibilities: [
      'Creates Razorpay order instances with currency conversion (INR to paise)',
      'Cryptographically verifies payment signatures: HMAC-SHA256(order_id + payment_id, secret)',
      'Prevents replay attacks and verifies webhook payload authenticity in production and test environments'
    ],
    viva: 'This service communicates with Razorpay APIs. It creates orders and verifies HMAC-SHA256 signatures to cryptographically prevent payment tampering.'
  },

  'backend/services/smsService.js': {
    type: 'js',
    name: 'backend/services/smsService.js',
    module: 'Transactional SMS Alert Service',
    purpose: 'Dispatches real-time mobile SMS alerts for order ratification, Speed Post dispatch, and artisan bank payouts.',
    responsibilities: [
      'Formats transactional SMS alerts adhering to Indian DLT communication standards',
      'Integrates Fast2SMS gateway REST API with automatic graceful demo/console fallback',
      'Sends instant AWB tracking link to patron and payout credit notification to master artisan'
    ],
    viva: 'This service sends transactional SMS notifications to patrons and master artisans for order confirmation, India Post dispatch, and bank payouts.'
  },

  'backend/services/shippingService.js': {
    type: 'js',
    name: 'backend/services/shippingService.js',
    module: 'India Post Speed Post Freight Service',
    purpose: 'Implements the domestic India Post rate matrix and generates authentic 13-character AWB identifiers.',
    responsibilities: [
      'Categorizes Indian destinations into Local, State, Metro, and National postal circles',
      'Calculates postage based on weight brackets (500g base + incremental slabs)',
      'Generates standardized Indian Speed Post AWB tracking numbers (e.g. IP721218489IN)'
    ],
    viva: 'This service implements the domestic India Post rate chart, calculating postage based on parcel weight and postal zones, and generates official AWB tracking identifiers.'
  },

  'backend/services/youpiService.js': {
    type: 'js',
    name: 'backend/services/youpiService.js',
    module: 'YouPI & Bank UTR Settlement Service',
    purpose: 'Validates 12-digit Indian Bank UTR transaction references and manages UPI settlement state transitions.',
    responsibilities: [
      'Enforces strict 12-digit numeric validation on bank transaction references (UTR)',
      'Transitions order states from AWAITING_PAYMENT to PAID upon successful UTR ratification',
      'Maintains idempotent settlement records preventing duplicate UTR reuse'
    ],
    viva: 'This service handles direct UPI and bank UTR settlements, validating 12-digit transaction references to confirm funds transfer before ratifying orders.'
  },

  'backend/services/emailService.js': {
    type: 'js',
    name: 'backend/services/emailService.js',
    module: 'Transactional Email Service',
    purpose: 'Sends HTML format transactional emails for password resets, order deeds, and account notices.',
    responsibilities: [
      'Formats responsive HTML emails styled with Parampara sovereign palette',
      'Dispatches password reset links with secure time-limited tokens',
      'Provides fallback logging when SMTP credentials are not configured in development'
    ],
    viva: 'This service handles transactional emails such as password reset instructions and digital invoice copies.'
  },

  // === FRONTEND JS CONTROLLERS ===
  'js/artisans.js': {
    type: 'js',
    name: 'js/artisans.js',
    module: 'National Artisan Directory Client Controller',
    purpose: 'Drives interactivity on artisans.html: debounced search, 6-region filtering, 28-state selector, and Master Dossier modal rendering.',
    responsibilities: [
      'Renders responsive gallery cards for 58+ master craftspeople from data/artisans.json with embedded fallback',
      'Implements real-time debounced text search filtering across artisan names, crafts, states, and titles in <10ms',
      'Syncs URL query parameters (?state=, ?q=) allowing deep-linking from map and product pages',
      'Controls interactive Master Dossier modal displaying physical portrait, craft tools, bio, and 70% payout pledge'
    ],
    viva: 'This client script powers the National Artisan Directory. It handles debounced search, state and region filters, deep-linking, and renders the Master Dossier modal showing physical portraits and artisan honors.'
  },

  'js/checkout.js': {
    type: 'js',
    name: 'js/checkout.js',
    module: 'Sovereign Patron Acquisition Salon Controller',
    purpose: 'Drives checkout.html: manages curated vault ledger, 70% direct artisan payout calculation, dynamic UPI QR canvas, and deed download.',
    responsibilities: [
      'Manages cart items in localStorage with interactive [- 1 +] quantity adjustments and live re-calculation',
      'Computes and renders the 70% direct artisan remuneration share live in the sticky ledger',
      'Renders dynamic UPI payment QR code on HTML5 canvas with order total and VPA handle',
      'Validates 12-digit bank UTR numbers and interfaces with Razorpay official checkout SDK',
      'Provides debounced floating toast notifications with strict height auto-guards and clean DOM dismissal'
    ],
    viva: 'This is the checkout controller. It dynamically updates cart totals, calculates the 70% artisan payout in real time, generates dynamic UPI QR codes, verifies bank UTRs, and triggers PDF deed downloads.'
  },

  'js/map-interactive.js': {
    type: 'js',
    name: 'js/map-interactive.js',
    module: 'Ultra-Dynamic 60FPS Interactive India Craft Map Engine',
    purpose: 'Powers the SVG vector map on index.html: provides state hover effects, Web Audio sound effects, and deep-linking to state craft dossiers.',
    responsibilities: [
      'Binds mouseenter and mouseleave listeners across all 28 Indian state SVG vector paths',
      'Animates state boundaries in burnished gold (#B8860B) and dynamically updates state telemetry popover',
      'Plays micro-synthesized harmonic chimes using Web Audio API on state interactions',
      'Navigates patrons to states.html?state=... or search.html upon state selection'
    ],
    viva: 'This script powers our interactive SVG map of India. It uses SVG DOM events and the Web Audio API to deliver a 60FPS visual and auditory experience when exploring regional crafts.'
  },

  'js/auth.js': {
    type: 'js',
    name: 'js/auth.js',
    module: 'Client Authentication & Session Manager',
    purpose: 'Manages user authentication state, JWT storage, route protection, and navigation bar profile monograms.',
    responsibilities: [
      'Stores and retrieves JWT access tokens and user profile data in localStorage',
      'Enforces route protection guards redirecting unauthenticated users from collection.html and profile.html to login.html',
      'Updates top navigation bar dynamically showing user monogram, name, and sign-out triggers',
      'Initializes Google Identity Services (GIS) One-Tap login client'
    ],
    viva: 'This script manages user authentication on the frontend, storing JWT tokens, enforcing route guards, and rendering user profile badges.'
  },

  'js/profile.js': {
    type: 'js',
    name: 'js/profile.js',
    module: 'Patron Sanctuary & Collection Controller',
    purpose: 'Drives profile.html: renders acquisition order history, live India Post tracking timeline, and saved masterpiece collections.',
    responsibilities: [
      'Fetches patron acquisition records from /api/orders/my-orders with cached fallback',
      'Renders visual step-by-step India Post Speed Post tracking milestones for each order',
      'Provides one-click download buttons for Certified GI Deed PDF documents',
      'Manages patron avatar uploads and sanctuary address profile editing'
    ],
    viva: 'This script controls the user profile page, rendering their order history, live India Post tracking progress, and saved heirloom collections.'
  },

  'js/youpi.js': {
    type: 'js',
    name: 'js/youpi.js',
    module: 'YouPI UPI Gateway Client Adapter',
    purpose: 'Client integration for YouPI settlement flows, dynamic QR display, VPA copying, and 12-digit UTR submission.',
    responsibilities: [
      'Opens sovereign YouPI payment sheet modal with dynamic order totals',
      'Renders UPI deep-links for native smartphone apps (GPay, PhonePe, Paytm, BHIM)',
      'Provides clipboard helper to copy the official artisan guild VPA',
      'Submits captured 12-digit bank UTR to the backend verification endpoint'
    ],
    viva: 'This is our client adapter for UPI payments, providing dynamic QR display and UTR submission.'
  },

  'js/saathi.js': {
    type: 'js',
    name: 'js/saathi.js',
    module: 'Saathi AI Cultural Docent Chat Controller',
    purpose: 'Drives the conversational AI chat interface in saathi.html, providing streaming responses on craft authenticity.',
    responsibilities: [
      'Manages chat conversation session and message rendering bubbles',
      'Dispatches user prompts to /api/saathi/chat and streams domain-grounded responses',
      'Provides interactive prompt chips for craft history, GI testing, and artisan discovery'
    ],
    viva: 'This script drives the Saathi AI chat interface, handling conversational inquiries about craft history and authenticity.'
  },

  'js/track.js': {
    type: 'js',
    name: 'js/track.js',
    module: 'Shipment Tracking Page Controller',
    purpose: 'Drives track.html: validates 13-character AWB format and renders live India Post consignment status.',
    responsibilities: [
      'Parses AWB tracking code from URL query parameter or manual search input',
      'Queries /api/shipping/track/:awb and displays structured courier timeline',
      'Shows originating artisan cluster, transit hubs, and expected delivery date'
    ],
    viva: 'This script drives our consignment tracking page, rendering an India Post dispatch timeline for any given AWB number.'
  },

  'sw.js': {
    type: 'js',
    name: 'sw.js',
    module: 'Progressive Web App Service Worker',
    purpose: 'Enables offline asset caching and fast subsequent page loads using Service Worker APIs.',
    responsibilities: [
      'Pre-caches critical core assets (CSS, logos, fonts, offline fallback pages)',
      'Implements cache-first strategy for static assets and network-first strategy for API calls',
      'Ensures the application renders gracefully even during temporary connectivity drops'
    ],
    viva: 'This service worker provides offline caching for key static assets, ensuring fast page loads and offline resilience.'
  },

  // === PRIMARY HTML VIEWS ===
  'index.html': {
    type: 'html',
    name: 'index.html',
    module: 'Main Heritage Portal & Landing Page',
    purpose: 'The central discovery portal of Parampara featuring the interactive 28-state SVG India map, hero craft mosaic, and certified telemetry.',
    responsibilities: [
      'Renders the interactive SVG vector map of India with real-time state hover feedback and Web Audio chimes',
      'Displays sovereign trust telemetry: 28 states, 58+ master artisans, 100% statutory GI verification, 70% direct payout pledge',
      'Features curated regional masterpieces and craft spotlights linking directly into acquisition salons',
      'Provides responsive navigation bar with search, cart drawer, and collector authentication state'
    ],
    viva: 'This is our homepage. It features our custom interactive 28-state SVG map of India, live craft telemetry, and curated showcases of verified master craftspeople.'
  },

  'artisans.html': {
    type: 'html',
    name: 'artisans.html',
    module: 'National Master Artisan Directory View',
    purpose: 'Comprehensive national directory showcasing 58+ verified master craftspeople, Shilp Gurus, and National Awardees across all 28 states.',
    responsibilities: [
      'Displays high-definition physical documentary portraits for all 58 living master artisans',
      'Provides 6-region navigation tabs (North, South, East, West, Central, North-East) and 28-state filter selector',
      'Features debounced live search and URL query synchronization (?state=Rajasthan)',
      'Hosts the interactive Master Dossier Modal showing artisan biographies, ancestral tools, and certified craft links'
    ],
    viva: 'This is the National Artisan Directory page. It features 58+ living master craftspeople across all 28 states of India with real documentary portraits, regional filters, and interactive dossier inspection modals.'
  },

  'checkout.html': {
    type: 'html',
    name: 'checkout.html',
    module: 'Sovereign Patron Acquisition Salon View',
    purpose: 'The certified checkout view where collectors configure their vault, review the 70% direct artisan share, and ratify acquisitions.',
    responsibilities: [
      'Presents sticky Curated Vault Ledger displaying real-time 70% direct artisan payout calculations',
      'Provides customizable packaging options (Raw Silk Coffer vs Lokta Paper) and transit protocols',
      'Integrates multi-rail payment: YouPI dynamic UPI QR code, 12-digit UTR input, and official Razorpay SDK',
      'Triggers instant download of the official Certified GI Provenance Deed (PDF) upon payment confirmation'
    ],
    viva: 'This is our checkout page, designed as a Sovereign Acquisition Salon. It exposes live financial transparency by calculating the exact 70% artisan payout on screen, renders dynamic UPI QR codes, and downloads certified PDF deeds.'
  },

  'about.html': {
    type: 'html',
    name: 'about.html',
    module: 'Heritage Story & Cultural Manifesto View',
    purpose: 'Presents Parampara’s founding mission, fair-trade economic transparency pledge, and the science of statutory GI authentication.',
    responsibilities: [
      'Articulates the core mission: preserving traditional craftsmanship and empowering generational artisans',
      'Explains the legal foundation of the Geographical Indications of Goods Act, 1999',
      'Breaks down the 70% direct artisan remuneration model versus conventional aggregator markups'
    ],
    viva: 'This page explains our brand narrative, statutory GI backing under the 1999 Act, and our fair-trade commitment to direct artisan remuneration.'
  },

  'artisan-dashboard.html': {
    type: 'html',
    name: 'artisan-dashboard.html',
    module: 'Master Artisan & Guild Management Portal',
    purpose: 'Dedicated operational portal for master artisans and cooperative managers to view incoming orders and direct bank credits.',
    responsibilities: [
      'Displays live tally of incoming orders, dispatch schedules, and inventory stock counts',
      'Shows transparent record of 70% direct escrow disbursements credited to the artisan guild bank account',
      'Allows craftspeople to generate India Post Speed Post dispatch slips and rural pickup requests'
    ],
    viva: 'This is the Artisan Guild Portal where craftspeople and cooperatives manage inventory, view incoming patron acquisitions, and track direct bank payouts.'
  },

  'product-jaipur-pottery.html': {
    type: 'html',
    name: 'product-jaipur-pottery.html',
    module: 'Craft Feature Spotlight: Jaipur Blue Pottery',
    purpose: 'In-depth craft provenance and detail view for the GI-tagged Jaipur Blue Pottery Fluted Urn by Master Gopal Saini.',
    responsibilities: [
      'Documents the unique non-clay composition (quartz stone powder, fuller earth, gum, sodium carbonate)',
      'Presents Master Gopal Saini (Shilp Guru) studio biography and lineage dating to Maharaja Sawai Ram Singh II',
      'Lists statutory GI registration proof (GI Application #JP-84) and interactive 3-step authenticity tests',
      'Provides direct "Add to Curated Vault" and "Acquire Now" acquisition buttons'
    ],
    viva: 'This is a feature spotlight page demonstrating how individual crafts are presented with complete material provenance, artisan biography, and statutory GI verification tests.'
  },

  'profile.html': {
    type: 'html',
    name: 'profile.html',
    module: 'Patron Sanctuary & Collection Archive View',
    purpose: 'Authenticated user profile page displaying order history, live courier tracking, and saved collections.',
    responsibilities: [
      'Displays historical acquisition orders with item details, prices, and ratified UTR codes',
      'Renders live step-by-step India Post Speed Post tracking timeline for dispatched parcels',
      'Allows patrons to re-download Certified GI Deeds and invoices at any time'
    ],
    viva: 'This is the patron profile page where logged-in collectors view their order history, track shipments with India Post, and access their certified provenance deeds.'
  },

  'login.html': {
    type: 'html',
    name: 'login.html',
    module: 'Collector Authentication & Registration Portal',
    purpose: 'Dual-tab authentication interface supporting email/password sign-in, collector registration, SMS OTP, and Google OAuth.',
    responsibilities: [
      'Provides animated tab switching between Sign In and Register views',
      'Integrates Google One-Tap / Identity Services OAuth authentication',
      'Supports phone number sign-in with 6-digit SMS verification code',
      'Includes password recovery modal with real-time feedback'
    ],
    viva: 'This is the authentication page supporting dual-tab sign-in and registration, Google OAuth, and SMS OTP verification.'
  },

  'saathi.html': {
    type: 'html',
    name: 'saathi.html',
    module: 'Saathi AI Cultural Docent Salon View',
    purpose: 'Dedicated conversational interface for interacting with the Saathi domain-grounded cultural guide.',
    responsibilities: [
      'Provides full-screen chat interface with historical craft docent prompts',
      'Answers questions on craft techniques, counterfeit detection, and GI certification',
      'Connects directly to /api/saathi/chat'
    ],
    viva: 'This page provides a dedicated conversational interface for our AI cultural docent, Saathi.'
  },

  'search.html': {
    type: 'html',
    name: 'search.html',
    module: 'Masterpiece Catalog & Discovery View',
    purpose: 'Comprehensive catalog search interface with dynamic text search, regional filters, and price range sliders.',
    responsibilities: [
      'Provides full-text search input with real-time catalog filtering',
      'Includes state dropdown, craft category chips, and price sliders',
      'Renders responsive craft product cards with GI tags and direct cart additions'
    ],
    viva: 'This is our catalog search page supporting full-text search, state and category filters, and price sliders across all 28 states.'
  },

  'track.html': {
    type: 'html',
    name: 'track.html',
    module: 'Public Consignment Tracking View',
    purpose: 'Universal shipment tracking interface for India Post Speed Post consignments.',
    responsibilities: [
      'Validates 13-character Indian Speed Post AWB tracking numbers',
      'Fetches and renders real-time tracking milestones from /api/shipping/track/:awb',
      'Displays delivery estimates, originating rural clusters, and transit updates'
    ],
    viva: 'This is our public consignment tracking page, rendering an India Post dispatch timeline for any given AWB number.'
  }
};

function formatHeader(meta) {
  if (meta.type === 'js') {
    return `/**
 * ============================================================================
 * FILE: ${meta.name}
 * MODULE: ${meta.module}
 * PROJECT: Parampara — Sovereign Indian Heritage & GI Craft Marketplace
 * ============================================================================
 * 
 * PURPOSE:
 * ${meta.purpose}
 * 
 * KEY RESPONSIBILITIES & CAPABILITIES:
${meta.responsibilities.map(r => ` * - ${r}`).join('\n')}
 * 
 * HOW TO EXPLAIN THIS FILE IN AN INTERVIEW / VIVA:
 * "${meta.viva}"
 * ============================================================================
 */
`;
  } else if (meta.type === 'html') {
    return `<!--
============================================================================
PAGE: ${meta.name}
MODULE: ${meta.module}
PROJECT: Parampara — Sovereign Indian Heritage & GI Craft Platform
============================================================================

PURPOSE:
${meta.purpose}

KEY FEATURES & CAPABILITIES:
${meta.responsibilities.map(r => `- ${r}`).join('\n')}

HOW TO EXPLAIN THIS PAGE IN AN INTERVIEW / VIVA:
"${meta.viva}"
============================================================================
-->
`;
  }
  return '';
}

let updatedCount = 0;

for (const [relPath, meta] of Object.entries(FILE_METADATA)) {
  const fullPath = path.resolve(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ Skipped (file not found): ${relPath}`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Check if our standardized header is already present
  if (content.includes(`FILE: ${meta.name}`) || content.includes(`PAGE: ${meta.name}`)) {
    console.log(`ℹ️ Already has explanation header: ${relPath}`);
    continue;
  }

  // Generate header
  const header = formatHeader(meta);

  // Prepend header cleanly
  let newContent;
  if (meta.type === 'html') {
    // For HTML, if <!DOCTYPE html> exists, place right after or right before
    newContent = header + '\n' + content;
  } else {
    // For JS, place right at the very top
    newContent = header + '\n' + content;
  }

  fs.writeFileSync(fullPath, newContent, 'utf8');
  console.log(`✓ Added comprehensive explanation header to: ${relPath}`);
  updatedCount++;
}

console.log(`\n🎉 Successfully added explanation headers to ${updatedCount} key coding files!`);
