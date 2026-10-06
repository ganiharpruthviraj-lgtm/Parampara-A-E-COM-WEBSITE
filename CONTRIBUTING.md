# 🤝 Contributing to Parampara

Thank you for your interest in contributing to **Parampara** (*परंपरा*)! We are building an open, accessible, and dignified digital home for India's 28 state craft traditions, GI-tagged masterpieces, and master artisan communities.

Whether you're fixing a bug, adding documentation, expanding an artisan dossier, or optimizing performance, your help makes a meaningful difference.

---

## 📜 Table of Contents
- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Setup](#local-setup)
- [Project Architecture](#-project-architecture)
- [Development Workflow](#-development-workflow)
  - [Branching Strategy](#branching-strategy)
  - [Commit Message Conventions](#commit-message-conventions)
- [Coding Guidelines & Standards](#-coding-guidelines--standards)
  - [Frontend Standards](#frontend-standards)
  - [Backend Standards](#backend-standards)
  - [Design Tokens & Color Palette](#design-tokens--color-palette)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Submitting a Pull Request](#-submitting-a-pull-request)
- [Need Help?](#-need-help)

---

## 🕊️ Code of Conduct

We are dedicated to providing a welcoming, inclusive, and respectful environment for all contributors, regardless of background, identity, or experience level.
- Be respectful, constructive, and kind in all discussions, issues, and pull requests.
- Celebrate diverse viewpoints and Indian cultural traditions with authenticity and care.
- Refrain from offensive, derogatory, or exclusionary language.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have installed on your local machine:
- **Node.js**: `v18.x` or `v20.x` (LTS recommended)
- **npm**: `v9.x` or later
- **Git**: `v2.x` or later
- **MongoDB** *(optional for local dev)*: MongoDB Community Server or MongoDB Atlas cluster. Note that the backend test suite uses `mongodb-memory-server` and does not require a local MongoDB daemon!

### Local Setup

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/<your-username>/Parampara-A-E-COM-WEBSITE.git
   cd Parampara-A-E-COM-WEBSITE
   ```

2. **Install Root & Backend Dependencies**
   ```bash
   # Install root tools (if applicable)
   npm install

   # Install backend dependencies
   npm --prefix backend install
   ```

3. **Configure Environment Variables**
   Copy the example environment file:
   ```bash
   # From the project root
   cp .env.example backend/.env
   ```
   Open `backend/.env` and configure your settings:
   - For offline testing, `MONGO_URI` will automatically fall back to local or in-memory databases if unreachable.
   - For secure JWT tokens, generate a 64-character random string:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```

4. **Preview the Frontend**
   The frontend uses standard HTML5, CSS3, and vanilla ES6+ JavaScript. You can preview it immediately:
   ```bash
   # Option A: Python simple server
   python -m http.server 3000

   # Option B: Node serve
   npx serve .
   ```

5. **Start the Backend Development Server**
   ```bash
   npm run dev
   # Or directly inside backend/:
   cd backend && npm run dev
   ```
   The backend API will run at `http://localhost:5000`.

---

## 🏛️ Project Architecture

```
Parampara-A-E-COM-WEBSITE/
├── index.html                    # Main landing page (Interactive SVG India Map + Mosaic Hero)
├── about.html                    # Mission, heritage narrative & artisan impact model
├── artisans.html                 # Master artisan directory & national awardee dossiers
├── collection.html               # Authenticated collector saved masterpieces
├── state_categories.html         # Regional craft portal
├── states.html                   # 28-State craft dossiers
├── masterpiece.html              # Product details, provenance & craft authenticity
├── product-jaipur-pottery.html   # Craft feature spotlight (Jaipur Blue Pottery)
├── search.html                   # Multi-filter search & price catalog
├── login.html / register.html    # Authentication UI (JWT + Google OAuth)
├── saathi.html                   # Saathi AI cultural heritage assistant UI
├── css/                          # Extracted stylesheets & shared design tokens
├── js/                           # Auth client, SVG map interactivity, Saathi client
├── backend/
│   ├── app.js                    # Express app configuration & middleware
│   ├── server.js                 # Server listener & database bootstrap
│   ├── config/db.js              # MongoDB Atlas connection with offline fallback
│   ├── middleware/auth.js        # JWT token verification middleware
│   ├── models/                   # Mongoose schemas (Product, User)
│   ├── routes/                   # API routes (auth, products, saathi)
│   └── tests/                    # Jest + Supertest automated test suite
└── .github/workflows/
    ├── ci.yml                    # Automated backend CI pipeline (Node 18 & 20)
    └── deploy.yml                # GitHub Pages automated deployment
```

---

## 🛠️ Development Workflow

### Branching Strategy
- `main`: Production-ready code. Directly deployed to GitHub Pages.
- Create topic branches off `main` using descriptive names:
  - `feature/add-kalamkari-dossier`
  - `fix/mobile-nav-tap-target`
  - `perf/compress-assets`
  - `docs/add-api-endpoints`

### Commit Message Conventions
We adhere to [Conventional Commits](https://www.conventionalcommits.org/):
- `feat`: A new feature or craft dossier
- `fix`: A bug fix or visual defect correction
- `docs`: Documentation updates (README, guides, contributing)
- `style`: Formatting, CSS whitespace, non-functional visual touch-ups
- `refactor`: Code restructurings without behavior alterations
- `perf`: Performance optimizations (image compression, bundle reduction)
- `test`: Adding or updating test suites
- `ci`: Changes to GitHub Actions workflows or deployment scripts
- `chore`: Maintenance tasks or dependency updates

*Example:*
```bash
git commit -m "feat(map): add keyboard navigation for interactive state pins"
```

---

## 🎨 Coding Guidelines & Standards

### Frontend Standards
- **Semantic HTML**: Use proper tags (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`).
- **Accessibility (a11y)**:
  - Ensure all clickable elements have `cursor: pointer` and minimum touch targets of 48×48px.
  - Provide descriptive `alt` tags on all cultural images and artisan portraits.
  - Maintain contrast ratios satisfying WCAG 2.1 AA standards.
- **Vanilla JavaScript**: Keep dependencies minimal. Use modern ES6+ features (`async/await`, optional chaining `?.`, template literals).

### Backend Standards
- **RESTful Endpoints**: Route naming should follow plural nouns (`/api/products`, `/api/auth/register`).
- **Input Validation**: Never trust raw user input. Use `express-validator` to validate and sanitize inputs.
- **Security**: Never hardcode credentials. Ensure sensitive fields (`password`) have `{ select: false }` in schemas.
- **Error Handling**: Return consistent JSON response envelopes:
  ```json
  { "message": "Human-readable error explanation", "errors": [] }
  ```

### Design Tokens & Color Palette
Parampara's visual identity reflects India's earth, minerals, and traditional artisan materials:

| Token | Hex | Cultural Inspiration |
|---|---|---|
| `--primary-color` | `#B8860B` | **Royal Warm Gold** — brass metalcraft, Zari embroidery, master artisan awards |
| `--accent-color` | `#D4380D` | **Terracotta Red** — earthen clay pottery, holy kumkum, warm brick |
| `--accent2-color` | `#2F5233` | **Forest / Jade Green** — natural botanical dyes, Nilgiri tea, organic fibers |
| `--accent3-color` | `#7B3F00` | **Earth Rust / Umber** — carved teakwood, walnut root, ancient temple stone |
| `--accent4-color` | `#C19A6B` | **Desert Sand / Jaisalmer Gold** — Thar dunes, raw tussar silk, khadi |
| `--light-background-color`| `#FBF9F4` | **Warm Parchment** — handmade paper, unbleached cotton, eases eye strain |
| `--dark-text-color` | `#1A1A1A` | **Kohl Black** — deep charcoal black for high-contrast legibility |

---

## 🧪 Testing & Quality Assurance

Before submitting any code, verify all automated checks pass locally:

```bash
# Run backend Jest test suite
npm --prefix backend test
```

Tests run automatically via **GitHub Actions** on every push and pull request against Node.js `18.x` and `20.x`. Ensure your branch builds cleanly with zero test failures.

---

## 📬 Submitting a Pull Request

1. Push your feature branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a Pull Request against the `main` branch of `Parampara-A-E-COM-WEBSITE`.
3. Fill in the PR description:
   - What changed and why?
   - How did you test it?
   - Include before/after screenshots for visual or UI changes.
4. Wait for the automated CI workflow to pass.
5. Address any review feedback with additional commits.

---

## 💬 Need Help?

- Have a question about artisan dossiers or GI data? Open an issue tagged `question` or `cultural-data`.
- Spotted a bug? Open an issue tagged `bug` with repro steps.

Thank you for helping preserve and honor Indian heritage crafts! 🇮🇳✨
