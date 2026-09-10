# 🏺 Parampara — Indian Cultural Craft & Heritage Artisan Marketplace

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-orange.svg)]()
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20MongoDB-green.svg)]()
[![GI Tagged](https://img.shields.io/badge/Crafts-GI%20Tagged%20%26%20Handmade-blue.svg)]()

> **Preserving Traditions, Empowering Artisans.**  
> **Parampara** is a state-of-the-art e-commerce platform dedicated to bringing India's authentic heritage crafts, GI-tagged masterpieces, and master artisans directly to connoisseurs worldwide through an interactive map-based discovery experience.

---

## 🌟 Key Features

- 🗺️ **Interactive India State Craft Map**: Discover authentic regional crafts (e.g., Jaipur Blue Pottery, Banarasi Brocade, Meenakari Enamel) by exploring an interactive SVG map of India.
- 🎨 **Artisan Dossiers & Masterpiece Stories**: Dive deep into artisan biographies, national award histories, and centuries-old crafting techniques.
- 🤖 **Saathi AI Heritage Assistant**: AI-powered companion guiding users through cultural origin stories, craft authenticity, and customized collection curation.
- 📜 **GI-Tagged Authenticity Verification**: Dedicated badges and verification pipelines guaranteeing 100% authentic geographical indicator crafts.
- 🔍 **Dynamic Craft Search & Filtering**: Instant full-text search across regions, materials, price ranges, and artisan titles.
- ⚡ **Full-Stack Ready**: Static interactive frontend powered by an Express.js REST API with MongoDB schema definitions for products, artisans, orders, and authentication.

---

## 📁 Repository Directory Structure

```
Parampara-A-E-COM-WEBSITE/
├── index.html                   # Dynamic Homepage with Hero Map & Mosaic
├── about.html                   # Brand Story & Heritage Mission
├── artisans.html                # Master Artisan Directory & Profiles
├── collection.html              # Curated Masterpiece Collections
├── state_categories.html        # Regional & State-wise Craft Categories
├── states.html                  # Detailed Interactive State Map Dossiers
├── masterpiece.html             # Product Detail & Artisan Narrative Page
├── product-jaipur-pottery.html  # Highlighted Craft Feature Spotlight
├── search.html                  # Advanced Search & Filter Portal
├── login.html / register.html   # User Authentication Interfaces
├── saathi.html                  # Saathi AI Cultural Assistant Interface
├── backend/                     # Node.js & Express REST API Server
│   ├── server.js                # Express API Entry Point
│   ├── config/                  # Database Configuration (MongoDB)
│   ├── models/                  # Mongoose Schemas (Product, Artisan, User, Order)
│   ├── routes/                  # API Endpoints (/api/products, /api/artisans)
│   └── seed.js                  # Database Seeding Script
├── css/                         # CSS Stylesheets & Design Tokens
├── js/                          # Frontend Logic & Interactive Map Scripts
├── assets/                      # Brand Vectors, SVGs & Media Assets
├── docs/                        # Backend Build Guide & Documentation
└── README.md                    # Project Documentation
```

---

## 🚀 Quick Start Guide

### 1. Preview Frontend Directly
You can open `index.html` in any web browser, or use Live Server in VS Code / Antigravity IDE:
```bash
# Optional: serve locally using npx serve
npx serve .
```

### 2. Setup the Backend API (Node.js & MongoDB)

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Create a .env file with:
# MONGO_URI=your_mongodb_connection_string
# PORT=5000
# JWT_SECRET=your_jwt_secret

# Seed initial database records
node seed.js

# Start the dev server with Nodemon
npm run dev
```

The REST API will start on `http://localhost:5000/api`.

---

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | Modern Vanilla HTML5, CSS3 (Glassmorphism, Animations), Vanilla JavaScript (ES6+), Interactive SVG Engine |
| **Backend** | Node.js, Express.js RESTful API |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt password hashing |
| **Presentation & Strategy** | Interactive Pitch Decks & Investor Dossiers (`docs/`) |

---

## 📜 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Search & filter products by region, price, craft & category |
| `GET` | `/api/products/:id` | Get full details of a specific masterpiece product |
| `GET` | `/api/artisans` | Retrieve artisan profiles filtered by state and craft |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token |

---

## 📄 License & Attribution

Distributed under the **MIT License**. See `LICENSE` for details.  
*Parampara — Designed with ❤ to preserve India's cultural heritage.*
