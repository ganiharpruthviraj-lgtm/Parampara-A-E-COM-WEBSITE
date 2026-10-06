# 📜 Changelog

All notable changes to the **Parampara** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]
### Planned
- Dedicated Razorpay / Stripe payment gateway integration for direct artisan checkout.
- Automated WebP image compression pipeline for assets and thumbnails.
- Offline PWA caching with Service Workers for heritage craft dossiers.

---

## [1.1.0] - 2026-10-04
### Added
- **Automated CI/CD Pipeline** (`.github/workflows/ci.yml`): Continuous Integration matrix running on Ubuntu across Node.js `18.x` and `20.x` with automatic npm dependency caching.
- **Automated Backend Testing Suite**: Added Jest and Supertest test suites in `backend/tests/` using `mongodb-memory-server` for zero-dependency isolated testing:
  - `auth.test.js`: Validates registration, duplicate email handling, login validation, and JWT issuing.
  - `middleware.test.js`: Validates token extraction, malformed headers, and expired token rejection.
  - `products.test.js`: Validates catalog retrieval, search queries, and single-item lookups.
- **Input Validation & Sanitization**: Integrated `express-validator` across authentication routes (`/api/auth/register`, `/api/auth/login`) to guard against XSS and malformed payloads.
- **Express App Modularization**: Split server logic into `backend/app.js` (middleware, routes, static handlers) and `backend/server.js` (network listener & database connector) to support clean testing.
- **Environment Templates**: Created comprehensive `.env.example` templates in root and `backend/` with descriptive configuration documentation.
- **Community Governance**: Added `CONTRIBUTING.md` defining setup instructions, Git workflow, coding conventions, and cultural design tokens.
- **Changelog**: Added `CHANGELOG.md` following the Keep a Changelog standard.

### Changed
- **Unified GitHub Pages Deployment** (`.github/workflows/deploy.yml`): Upgraded actions to `actions/configure-pages@v5` and `actions/deploy-pages@v5`, and added `workflow_dispatch` for on-demand manual triggers.
- **Fixed Workflow Race Condition**: Removed conflicting duplicate deployment workflow (`static.yml`).

---

## [1.0.0] - 2026-10-02
### Added
- **Production GA Launch**: Complete multi-page platform celebrating Indian heritage crafts across all 28 states.
- **Interactive SVG India Map**: Fully interactive, vector-based craft map of India (`india.svg` and `js/map-interactive.js`) enabling state-by-state discovery.
- **Master Artisan Profiles**: Dedicated biographical dossiers (`artisans.html`) celebrating national awardees, Shilp Guru recipients, and living craft traditions.
- **Saathi AI Heritage Assistant**: Domain-grounded RAG chatbot (`saathi.html`, `/api/saathi/chat`) backed by a curated GI Registry knowledge base and fair-trade artisan economics calculator.
- **Curated Collector Collections**: Authenticated users can curate and bookmark their favorite masterpieces (`collection.html`).
- **RESTful Authentication API**: Secure registration and login pipeline using `bcryptjs` password hashing, JSON Web Tokens (JWT), and Google OAuth ID token verification.
- **Database Architecture**: Mongoose schemas for `Product` (with `$text` search indexes) and `User` (with password omission and collection references).
- **Responsive Mobile Navigation**: Touch-optimized bottom navigation and drawer menus with haptic-inspired tactile press feedback.

---

## [0.9.0] - 2026-09-20
### Added
- **Dynamic Hero Mosaic**: Integrated responsive heritage mosaic hero section (`hero-mosaic.html`) showcasing handloom and handicraft visuals.
- **CSS Modularization**: Extracted inline style blocks into dedicated page stylesheets under `css/` (`css/about.css`, `css/artisans.css`, `css/collection.css`, `css/index.css`, `css/search.css`).
- **Tactile Button System** (`css/buttons.css`): Universal interactive button styles with active scaling, accessible focus rings, and mobile touch targets.

### Changed
- Refactored mobile hero hierarchy to display taglines first, followed by visual craft mosaics, and concluding with clear call-to-action buttons.

---

## [0.5.0] - 2026-08-20
### Added
- State-wise category portal (`state_categories.html`) and state exploration dossiers (`states.html`).
- GI-tagged authenticity verification tests (e.g. burn test for pure silk, sound test for bell metal, water test for blue pottery).
- Full-text craft search interface (`search.html`) with price filtering and craft technique tags.

---

## [0.1.0] - 2026-04-06
### Added
- Initial project scaffolding for **Parampara** (*परंपरा*).
- Brand identity design, color palettes, and typography selection (`Cormorant Garamond`, `Sora`, `Inter`).
- Core landing page concept with 70% direct artisan payout thesis.
- Initial GitHub Pages deployment workflow.
