# 🏺 Parampara — Indian Cultural Craft & Heritage Artisan Marketplace

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](./LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-orange.svg)]()
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-blue.svg)]()
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express.js-green.svg)]()
[![Database](https://img.shields.io/badge/Database-MongoDB%20%7C%20Mongoose-darkgreen.svg)]()
[![GI Tagged](https://img.shields.io/badge/Crafts-100%25%20GI%20Tagged%20Authentic-red.svg)]()

> **Preserving Traditions, Empowering Artisans.**  
> **Parampara** (*tradition*) is a cultural craft marketplace dedicated to bringing India's authentic heritage crafts, GI-tagged masterpieces, and master artisan stories directly to connoisseurs worldwide through an interactive map-based regional discovery experience.

---

## 🌟 Key Features & Highlights

- 🗺️ **Interactive India State Craft Map**: Discover authentic regional crafts (e.g., Jaipur Blue Pottery, Banarasi Brocade, Kanchipuram Silk, Meenakari Enamel) by exploring an interactive SVG map of India.
- 🎨 **Artisan Dossiers & Masterpiece Narrative**: Deep dive into artisan biographies, national award histories, and centuries-old crafting techniques.
- 🤖 **Saathi AI Heritage Assistant Interface**: A dedicated AI companion UI (`saathi.html`) crafted for guiding users through origin stories, craft authenticity, and customized collection curation.
- 📜 **GI-Tagged Authenticity Verification**: Dedicated badges and verification pipelines guaranteeing 100% authentic Geographical Indication crafts.
- 🔍 **Dynamic Craft Search & Filtering**: Client-side filtering and API-ready full-text search across regions, materials, price ranges, and artisan titles.
- ⚡ **Production-Ready Node/Express REST Backend**: Modular backend with Mongoose ODM models for products, artisans, orders, and authentication (JWT + Bcrypt + Google OAuth client verification).

---

## 📁 Repository Directory Structure

```
Parampara-A-E-COM-WEBSITE/
├── index.html                   # Main Landing Page with Interactive Map & Hero Mosaic
├── about.html                   # Brand Story, Mission & Cultural Heritage Narrative
├── artisans.html                # Master Artisan Profiles & National Awardee Directory
├── collection.html              # Curated User Masterpiece Collections & Saved Items
├── state_categories.html        # Regional Craft Categories & State Filter Portal
├── states.html                  # Interactive State Map Gallery & Regional Dossiers
├── masterpiece.html             # Product Detail & Artisan Narrative Experience
├── product-jaipur-pottery.html  # Highlighted Craft Feature Spotlight (Jaipur Blue Pottery)
├── search.html                  # Advanced Craft Search & Price Filtering Interface
├── login.html                   # User Authentication & Account Access Interface
├── register.html                # New Collector Account Registration Interface
├── saathi.html                  # Saathi AI Cultural Heritage Assistant Interface
├── hero-mosaic.html             # Hero Mosaic Gallery Layout Preview
├── dynamic-homepage.html        # Alternative Dynamic Homepage Layout Variant
├── stitch-preview.html          # UI Design Preview Canvas
├── backend/                     # Node.js & Express REST API Server
│   ├── server.js                # Express Server Entry Point
│   ├── check_db.js              # Database Diagnostic & Connection Test Utility
│   ├── seed.js                  # Initial Database Seeding Script
│   ├── config/                  # Database Configuration (MongoDB Atlas + Local Fallback)
│   ├── middleware/              # Authentication Middleware (JWT Verification)
│   ├── models/                  # Mongoose Schemas (Product, Artisan, User, Order)
│   └── routes/                  # Express REST Routes (/api/auth, /api/products, /api/artisans)
├── css/                         # Custom Stylesheets & Component CSS Tokens
├── js/                          # Frontend Logic & Navigation Scripts
│   ├── auth.js                  # Client-side Auth State & Storage Management
│   └── nav.js                   # Navigation Drawer & Ripple Effects
├── assets/                      # Brand Vectors, SVGs & Visual Media Assets
├── docs/                        # Project Documentation & Media
│   ├── guides/                  # Backend Build Guide & Architectural Roadmaps
│   ├── pitch-decks/             # Investor Presentation Decks & Python Generators
│   └── screenshots/             # UI Verification Screenshots & Preview Media
├── .github/workflows/           # Automated CI/CD Workflows
│   └── deploy.yml               # GitHub Actions Automated Deployment to GitHub Pages
├── LICENSE                      # MIT Open Source License
└── README.md                    # Project Documentation & Quick Start Guide
```

---

## 🚀 Quick Start Guide

### 1. Preview Frontend (Standalone Static Preview)
You can open `index.html` in any browser or use a local static server:
```bash
# Serve frontend using npx serve
npx serve .
```

### 2. Setup the Backend REST API (Node.js & MongoDB)

```bash
# Navigate to the backend directory
cd backend

# Install server dependencies
npm install

# Create a local .env file inside backend/ with:
# MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/parampara
# JWT_SECRET=your_jwt_secret_key_here
# PORT=5000

# Seed database with sample heritage product data
node seed.js

# Start the API server in development mode
npm run dev
```

The Express API will start on `http://localhost:5000/api`.

---

## 🛠️ Tech Stack & Architecture

| Domain | Technology | Purpose |
|---|---|---|
| **Frontend Layout** | Vanilla HTML5 & CSS3 | Clean semantic markup & modern CSS tokens |
| **Styling & UI** | Tailwind CSS & Custom Utility Classes | Glassmorphism, animations & responsive grids |
| **Interactive Engine** | Vanilla JavaScript (ES6+) | SVG map manipulation, mobile reordering, local storage auth state |
| **Backend Runtime** | Node.js & Express.js | Modular RESTful API architecture |
| **Database & ODM** | MongoDB Atlas & Mongoose | Flexible document schemas & `$text` search indexes |
| **Authentication** | JWT, Bcrypt, Google OAuth | Token-based auth pipeline |
| **DevOps & CI/CD** | GitHub Actions | Automated build & deployment to GitHub Pages |

---

## 📜 Express API Endpoints Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | Search & filter products by region, price, craft & category |
| `GET` | `/api/products/:id` | Public | Get full details of a specific masterpiece product |
| `GET` | `/api/artisans` | Public | Retrieve artisan profiles filtered by state and craft |
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials & return JWT |
| `GET` | `/api/auth/profile` | Private | Retrieve authenticated user profile (requires JWT) |

---

## 📄 License & Copyright

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for full text details.

Copyright (c) 2026 **Parampara Heritage Craft Platform (ganiharpruthviraj-lgtm)**
