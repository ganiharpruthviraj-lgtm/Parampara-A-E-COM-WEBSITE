# 🏺 Parampara — Backend Build Guide

> A practical roadmap for turning the static Parampara website into a fully dynamic, data-driven heritage e-commerce platform.

---

## 1. Recommended Tech Stack

| Layer | Tool | Why |
|---|---|---|
| **Runtime** | Node.js | Already have `package.json`; JS skills transfer from the front-end |
| **Framework** | Express.js | Minimal, fast, well-documented |
| **Database** | MongoDB (Atlas) | Fits product & artisan data (flexible schema); free tier available |
| **ODM** | Mongoose | Schema validation, easy queries |
| **Auth** | JWT + bcrypt | Stateless auth for user accounts/orders |
| **File Storage** | Cloudinary | Product & artisan images (free tier) |
| **Deployment** | Render.com or Railway | Free tier, connects to GitHub |

> [!TIP]
> If you want to skip the server setup entirely for now, **Firebase (Firestore + Auth + Storage)** is a zero-server BaaS alternative. You call Firebase SDK directly from your HTML files. Great for a prototype.

---

## 2. Project Structure

Create a new `backend/` folder inside `d:\ankush`:

```
d:\ankush\
├── backend/
│   ├── server.js            ← Entry point
│   ├── .env                 ← Secrets (never commit!)
│   ├── package.json
│   ├── config/
│   │   └── db.js            ← MongoDB connection
│   ├── models/
│   │   ├── Product.js
│   │   ├── Artisan.js
│   │   ├── Order.js
│   │   └── User.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── artisans.js
│   │   ├── orders.js
│   │   └── auth.js
│   └── middleware/
│       └── auth.js          ← JWT verification
└── (existing HTML files)    ← Front-end stays here
```

---

## 3. Phase 1 — Setup (Day 1)

### 3.1 Initialize the backend

```powershell
cd d:\ankush
mkdir backend
cd backend
npm init -y
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
npm install -D nodemon
```

Add to `backend/package.json`:
```json
"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js"
}
```

### 3.2 `server.js` — Entry Point

```js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db');

const app = express();

app.use(cors({ origin: '*' })); // Restrict to your domain in production
app.use(express.json());

// Routes
app.use('/api/products',  require('./routes/products'));
app.use('/api/artisans',  require('./routes/artisans'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/auth',      require('./routes/auth'));

app.get('/', (req, res) => res.json({ status: 'Parampara API running 🏺' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
```

### 3.3 `config/db.js` — MongoDB Connection

```js
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected ✓'))
  .catch(err => console.error(err));
```

### 3.4 `.env` file

```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/parampara
JWT_SECRET=your_super_secret_key_here
PORT=5000
```

> [!CAUTION]
> Add `.env` to your `.gitignore` immediately. Never push secrets to GitHub.

---

## 4. Phase 2 — Data Models (Day 2)

### `models/Product.js`

```js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  state:       { type: String, required: true },   // "Jaipur, Rajasthan"
  region:      { type: String },                   // "North India"
  craft:       { type: String, required: true },   // "Enamel Jewelry"
  category:    { type: String, required: true },   // "Jewelry & Ornaments"
  price:       { type: Number, required: true },
  imageUrl:    { type: String },
  badge:       { type: String },                   // "Master Artisan"
  description: { type: String },
  artisan:     { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan' },
  giTagged:    { type: Boolean, default: false },
  inStock:     { type: Boolean, default: true },
}, { timestamps: true });

// Full-text search index (powers search.html)
productSchema.index({ name: 'text', craft: 'text', state: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
```

### `models/Artisan.js`

```js
const mongoose = require('mongoose');

const artisanSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  state:       { type: String, required: true },
  craft:       { type: String, required: true },
  bio:         { type: String },
  imageUrl:    { type: String },
  awards:      [String],
  yearsActive: { type: Number },
  isMaster:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Artisan', artisanSchema);
```

---

## 5. Phase 3 — API Routes (Day 3)

### `routes/products.js` — Powers `search.html`

```js
const router = require('express').Router();
const Product = require('../models/Product');

// GET /api/products?q=saree&category=Textiles&region=North India&minPrice=0&maxPrice=200000
router.get('/', async (req, res) => {
  try {
    const { q, category, region, minPrice, maxPrice, sort } = req.query;
    const filter = {};

    if (q)        filter.$text = { $search: q };
    if (category) filter.category = category;
    if (region)   filter.region = region;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      'price-asc':  { price: 1 },
      'price-desc': { price: -1 },
      'newest':     { createdAt: -1 },
    };

    const products = await Product.find(filter)
      .sort(sortMap[sort] || { createdAt: -1 })
      .populate('artisan', 'name state');

    res.json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id — Powers masterpiece.html
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate('artisan');
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

module.exports = router;
```

### `routes/artisans.js` — Powers `artisans.html`

```js
const router = require('express').Router();
const Artisan = require('../models/Artisan');

// GET /api/artisans?state=Rajasthan&craft=Pottery
router.get('/', async (req, res) => {
  const { state, craft } = req.query;
  const filter = {};
  if (state) filter.state = new RegExp(state, 'i');
  if (craft) filter.craft = new RegExp(craft, 'i');

  const artisans = await Artisan.find(filter);
  res.json(artisans);
});

module.exports = router;
```

---

## 6. Phase 4 — Front-end Integration

For each HTML page, replace hardcoded content with API calls:

### `search.html` — Dynamic Products

Replace the static product cards with a JS fetch:

```js
const API = 'http://localhost:5000/api'; // Change to live URL after deploy

async function loadProducts(params = {}) {
  const url = new URL(`${API}/products`);
  Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));

  const res = await fetch(url);
  const { count, products } = await res.json();

  document.querySelector('.results-count').innerHTML =
    `Showing <strong>${count}</strong> results`;

  const grid = document.querySelector('.product-grid');
  grid.innerHTML = products.map(p => `
    <div class="product-card" onclick="location.href='masterpiece.html?id=${p._id}'">
      <div class="product-card-img" style="aspect-ratio:3/4">
        ${p.badge ? `<div class="badge"><i class="fa-solid fa-award"></i> ${p.badge}</div>` : ''}
        <img src="${p.imageUrl}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-card-body">
        <p class="product-state">${p.state}</p>
        <p class="product-name">${p.name}</p>
        <div class="product-footer">
          <span class="product-craft">${p.craft}</span>
          <span class="product-price">₹ ${p.price.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// On search input
document.getElementById('search-input').addEventListener('input', e => {
  loadProducts({ q: e.target.value });
});

loadProducts(); // initial load
```

### `masterpiece.html` — Product Detail

```js
const params = new URLSearchParams(location.search);
const productId = params.get('id');

fetch(`${API}/products/${productId}`)
  .then(r => r.json())
  .then(product => {
    document.title = `${product.name} | Parampara`;
    document.querySelector('.product-title').textContent = product.name;
    document.querySelector('.product-price').textContent =
      `₹ ${product.price.toLocaleString('en-IN')}`;
    // ... populate remaining fields
  });
```

---

## 7. Phase 5 — Orders & Auth (Optional)

| Feature | Route | Notes |
|---|---|---|
| Register | `POST /api/auth/register` | Hash password with bcrypt |
| Login | `POST /api/auth/login` | Returns JWT token |
| Place order | `POST /api/orders` | Requires JWT |
| My orders | `GET /api/orders/me` | Protected route |

---

## 8. Deployment

### Architecture After Deploy

```
[GitHub Pages]            [Render.com]          [MongoDB Atlas]
  search.html   ──────►  Express API   ──────►  Products DB
  artisans.html           /api/products          Artisans DB
  masterpiece.html        /api/artisans          Orders DB
```

### Steps
1. Push `backend/` folder to GitHub (`.env` must be in `.gitignore`)
2. Go to [render.com](https://render.com) → New Web Service → connect repo
3. Set **Root Directory** to `backend`, **Start Command** to `node server.js`
4. Add Environment Variables (MONGO_URI, JWT_SECRET)
5. Replace `localhost:5000` in your HTML with the Render live URL

---

## 9. Seed Script — Populate DB from existing hardcoded data

Create `backend/seed.js`:

```js
require('dotenv').config();
require('./config/db');
const Product = require('./models/Product');

const products = [
  {
    name: 'Royal Meenakari Choker',
    state: 'Jaipur, Rajasthan', region: 'North India',
    craft: 'Enamel Jewelry', category: 'Jewelry & Ornaments',
    price: 96000, badge: 'Master Artisan', giTagged: true,
    imageUrl: 'https://picsum.photos/seed/MeenakariChoker/600/800',
  },
  {
    name: 'Zari-Work Crimson Saree',
    state: 'Varanasi, Uttar Pradesh', region: 'North India',
    craft: 'Banarasi Brocade', category: 'Textiles & Weaves',
    price: 186000, badge: 'Master Artisan', giTagged: true,
    imageUrl: 'https://picsum.photos/seed/CrimsonSaree/600/800',
  },
  {
    name: 'Azure Floral Vase',
    state: 'Blue Pottery, Jaipur', region: 'North India',
    craft: 'Quartz Pottery', category: 'Pottery & Ceramics',
    price: 24800,
    imageUrl: 'https://picsum.photos/seed/AzureVase/600/450',
  },
  // Add more from search.html...
];

Product.insertMany(products)
  .then(() => { console.log('✓ Database seeded!'); process.exit(); })
  .catch(err => { console.error(err); process.exit(1); });
```

Run with: `node seed.js`

---

## 10. Quick Start Checklist

- [ ] Create `d:\ankush\backend\` folder
- [ ] Run `npm install` inside it
- [ ] Create free [MongoDB Atlas](https://cloud.mongodb.com) cluster → get connection string
- [ ] Create `.env` with `MONGO_URI` and `JWT_SECRET`
- [ ] Create `server.js`, `config/db.js`, models, and routes
- [ ] Run `npm run dev` → test API at `http://localhost:5000/api/products`
- [ ] Run `node seed.js` to populate the database
- [ ] Integrate `search.html` with live API fetch calls
- [ ] Deploy to [Render.com](https://render.com) and update HTML API URLs
