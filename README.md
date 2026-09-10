# 🏺 Parampara — Indian Cultural Craft & Heritage Artisan Marketplace

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](./LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-orange.svg)](#)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20CDN%20%7C%20Custom%20CSS-06B6D4.svg)](#)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express.js-339933.svg)](#)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%7C%20Mongoose-47A248.svg)](#)
[![Auth](https://img.shields.io/badge/Auth-JWT%20%7C%20Bcrypt%20%7C%20Google%20OAuth-4285F4.svg)](#)
[![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages%20%7C%20GitHub%20Actions-181717.svg)](#)

> **परंपरा** *(Tradition)* — **Preserving Traditions. Empowering Artisans.**

**Parampara** is a multi-page heritage e-commerce platform that brings India's authentic GI-tagged crafts, master artisan stories, and regional cultural narratives directly to collectors worldwide. Explore over 28 Indian states through an **interactive SVG craft map**, discover the science of craft authenticity, and engage with **Saathi** — a domain-grounded cultural heritage AI assistant powered by a curated GI Registry knowledge engine.

---

## 🌟 Key Features & Highlights

| Feature | Description |
|---|---|
| 🗺️ **Interactive India Map** | SVG-based interactive map powering state-level craft discovery across all 28 states |
| 🎨 **Artisan Dossiers** | Deep-dive bios, national award histories, and centuries-old craft technique narratives |
| 🤖 **Saathi Heritage AI** | Domain-grounded RAG chat assistant (`/api/saathi/chat`) with 7 GI-registry knowledge bases and economic transparency calculator |
| 📜 **GI-Tagged Authenticity** | Per-craft authenticity verification tests & counterfeit detection guides (grounded in Ministry of Textiles data) |
| 🔍 **Dynamic Craft Search** | Full-text `$text` search with MongoDB indexes; filter by region, craft, category & price range |
| 🛡️ **REST Auth API** | JWT + Bcrypt registration/login + Google OAuth verification pipeline |
| 📚 **Collector Collections** | Authenticated users can save & curate personal masterpiece collections |
| 🚀 **GitHub Pages Deploy** | Automated CI/CD via GitHub Actions workflow |

---

## 📁 Repository Structure

```
Parampara-A-E-COM-WEBSITE/
├── index.html                    # Main Landing Page (Interactive SVG Map + Hero Mosaic)
├── about.html                    # Brand Story, Mission & Cultural Heritage Narrative
├── artisans.html                 # Master Artisan Profiles & National Awardee Directory
├── collection.html               # Authenticated User Saved Masterpiece Collections
├── state_categories.html         # Regional Craft Category Portal (Tailwind CSS)
├── states.html                   # State Gallery & Regional Dossiers (Tailwind CSS)
├── masterpiece.html              # Product Detail & Artisan Narrative (Tailwind CSS)
├── product-jaipur-pottery.html   # Craft Feature Spotlight — Jaipur Blue Pottery
├── search.html                   # Advanced Search & Price Filter Interface (Tailwind CSS)
├── login.html                    # User Authentication Interface (Tailwind CSS)
├── register.html                 # New Collector Registration (Tailwind CSS)
├── saathi.html                   # Saathi AI Heritage Chat Interface (Tailwind CSS)
├── hero-mosaic.html              # Hero Mosaic Gallery Layout Preview
├── dynamic-homepage.html         # Alternative Dynamic Homepage Variant
├── stitch-preview.html           # UI Design Preview Canvas
├── backend/                      # Node.js & Express REST API Server
│   ├── server.js                 # Express Server Entry Point & Static File Serving
│   ├── check_db.js               # MongoDB Connection Diagnostic Utility
│   ├── seed.js                   # Database Seeding Script (Sample Heritage Products)
│   ├── config/                   # MongoDB Atlas Connection Config
│   ├── middleware/               # JWT Authentication Middleware
│   ├── models/
│   │   ├── Product.js            # Mongoose Product Schema (GI-tagged craft catalog)
│   │   └── User.js               # Mongoose User Schema (JWT auth + collections)
│   └── routes/
│       ├── auth.js               # Auth Routes: register, login, profile, collection, Google OAuth
│       ├── products.js           # Product Routes: full-text search, filters, single product
│       └── saathi.js             # Saathi AI Routes: chat, knowledge base, economics
├── css/
│   ├── buttons.css               # Shared Button Component Styles
│   └── saathi.css                # Saathi Chat Interface Custom Styles
├── js/
│   ├── auth.js                   # Client-side Auth State & Local Storage Management
│   ├── map-interactive.js        # SVG India Map Interactivity & State Navigation
│   ├── nav.js                    # Navigation Drawer & Ripple Effect Animations
│   └── saathi.js                 # Saathi Frontend Chat Client Logic
├── assets/                       # Brand Vectors, SVGs & Visual Media Assets
├── india.svg                     # Full SVG India Map (28 States)
├── docs/                         # Project Documentation & Media
│   ├── guides/                   # Backend Build Guide & Architecture Roadmaps
│   ├── pitch-decks/              # Investor Presentation Decks & Python Generators
│   └── screenshots/              # UI Verification Screenshots & Preview Media
├── .github/workflows/
│   └── deploy.yml                # GitHub Actions: Automated Deploy to GitHub Pages
├── LICENSE                       # MIT Open Source License
└── README.md                     # Project Documentation (this file)
```

---

## 🚀 Quick Start Guide

### 1. Preview Frontend (Static — No Backend Required)

The frontend pages are standalone HTML files that can be opened directly in a browser or served via a local static server:

```bash
# Option A: Open index.html directly in your browser
start index.html

# Option B: Serve using npx serve
npx serve .
```

> **Note:** Pages that require user authentication (`collection.html`) will show empty states without the backend running. The Saathi chat UI (`saathi.html`) will also need the backend for responses.

### 2. Setup the Backend REST API (Node.js + MongoDB)

```bash
# Navigate to the backend directory
cd backend

# Install server dependencies
npm install

# Create a .env file inside backend/ with:
# MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/parampara
# JWT_SECRET=your_strong_jwt_secret_here
# GOOGLE_CLIENT_ID=your_google_oauth_client_id (optional for Google Sign-In)
# PORT=5000

# Seed the database with sample GI-tagged heritage products
node seed.js

# Start the API server
npm start
```

The Express server starts on `http://localhost:5000`. It also serves the frontend static files, so visiting `http://localhost:5000` loads the full app.

---

## 🛠️ Tech Stack & Architecture

| Domain | Technology | Notes |
|---|---|---|
| **Frontend Layout** | Vanilla HTML5 & CSS3 | Core pages (`index.html`, `about.html`) use custom CSS only |
| **Styling (Partial Pages)** | Tailwind CSS (CDN) | Used in `saathi.html`, `login.html`, `register.html`, `search.html`, `states.html`, `state_categories.html`, `masterpiece.html`, `product-jaipur-pottery.html` |
| **Interactive Engine** | Vanilla JavaScript (ES6+) | SVG map interactivity (`map-interactive.js`), auth state (`auth.js`), nav animations (`nav.js`) |
| **Backend Runtime** | Node.js & Express.js v5 | Modular RESTful API; also serves static frontend |
| **Database & ODM** | MongoDB Atlas & Mongoose v9 | `$text` index for full-text product search |
| **Auth** | JWT, Bcrypt.js, Google OAuth | Email/password + Google ID token verification |
| **Saathi AI Engine** | Domain-Grounded RAG (No 3rd-party LLM) | Built-in GI registry knowledge base + custom NLP matching; 7 craft knowledge graphs, artisan dossiers, economic calculator |
| **CI/CD** | GitHub Actions | Auto-deploy to GitHub Pages on `main` push |

---

## 📜 REST API Reference

### 🔐 Auth Routes — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user (name, email, password) |
| `POST` | `/api/auth/login` | Public | Login with email & password → returns JWT |
| `POST` | `/api/auth/google` | Public | Authenticate / register via Google ID token |
| `GET` | `/api/auth/profile` | 🔒 Private (JWT) | Get authenticated user profile |
| `POST` | `/api/auth/collection/:id` | 🔒 Private (JWT) | Toggle product save/unsave to collection |
| `GET` | `/api/auth/collection` | 🔒 Private (JWT) | Get all saved products in user's collection |

### 🏺 Product Routes — `/api/products`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | Search products — query params: `q`, `category`, `state`, `minPrice`, `maxPrice` |
| `GET` | `/api/products/:id` | Public | Get single product details by MongoDB ID |

### 🤖 Saathi AI Routes — `/api/saathi`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/saathi/chat` | Public | Send a message to Saathi; returns grounded cultural response + action chips |
| `GET` | `/api/saathi/knowledge` | Public | Retrieve full GI registry knowledge base (7 crafts + artisan dossiers) |
| `GET` | `/api/saathi/economics?price=14500` | Public | Calculate real-time 70% artisan direct-payment breakdown |

---

## 🤖 Saathi — Domain-Grounded Heritage AI

Saathi is **not** a generic LLM wrapper. It is a custom **RAG (Retrieval-Augmented Generation) knowledge engine** built entirely server-side:

- **7 GI-Registry Craft Knowledge Graphs** — Sambalpuri Ikat, Jaipur Blue Pottery, Banarasi Brocade, Bastar Dokra, Kashmiri Walnut Carving, Patan Patola, Thanjavur Temple Art
- **Master Artisan Dossiers** — Family histories, labor days per piece, direct pay percentages
- **Economic Transparency Engine** — Real-time 70% direct artisan payment breakdown per price point
- **Domain-Matched Intent Router** — 4 response modes: `artisan_advocate`, `authenticity_guide`, `cultural_storyteller`, `contextual_recommender`
- **Multilingual Support** — Language parameter support for regional responses

---

## 🔒 Security Notes

- `.env` files are gitignored and must **never** be committed
- `JWT_SECRET` and `MONGO_URI` are loaded via `dotenv` from `backend/.env`
- `GOOGLE_CLIENT_ID` is optional; Google OAuth gracefully degrades without it
- CORS is open (`*`) for development — restrict in production

---

## 📄 License & Copyright

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for full text.

Copyright (c) 2026 **Parampara Heritage Craft Platform** (`ganiharpruthviraj-lgtm`)

---

<div align="center">

*"Every thread woven, every clay vessel shaped, every motif carved — is a living letter from our ancestors. Parampara exists so these letters are never lost."*

**🙏 Jai Hind | जय हिंद 🙏**

</div>
