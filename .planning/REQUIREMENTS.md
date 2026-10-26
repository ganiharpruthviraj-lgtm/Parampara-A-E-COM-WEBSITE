# Parampara — Requirements

## Milestone 1: Production Hardening

**Goal:** Raise repo audit score from 63/100 to 85+/100 by fixing security, SEO, performance, and CI gaps.

**Deadline:** Current sprint

---

## User Stories

### US-01 — Security Hardening
**As** a platform operator,  
**I want** a strong JWT secret and restricted CORS policy,  
**So that** the API is not vulnerable to token forgery or cross-origin abuse.

**Acceptance Criteria:**
- [ ] `JWT_SECRET` is ≥ 64 characters (cryptographically random)
- [ ] CORS is restricted to whitelisted origins (not `*`)
- [ ] `.env.example` documents all required environment variables

### US-02 — SEO & Discoverability
**As** a potential collector finding Parampara via search,  
**I want** each page to have a title, description, and OG tags,  
**So that** search engines index the content and social shares look rich.

**Acceptance Criteria:**
- [ ] All 15 HTML pages have a unique `<title>` tag
- [ ] All 15 HTML pages have a `<meta name="description">` tag
- [ ] All 15 HTML pages have Open Graph tags (`og:title`, `og:description`, `og:image`)

### US-03 — Performance (Asset Optimization)
**As** a collector on a mobile device,  
**I want** pages to load fast,  
**So that** I don't abandon due to slow load times.

**Acceptance Criteria:**
- [ ] `favicon.png` compressed to < 10 KB
- [ ] Large images (`artisan_impact.png`, `master_potter_artisan.png`) compressed to < 200 KB
- [ ] Lighthouse mobile performance score > 60

### US-04 — CI/CD Safety Net
**As** a developer pushing code,  
**I want** GitHub Actions to run tests before deploying,  
**So that** broken commits never reach production.

**Acceptance Criteria:**
- [ ] `ci.yml` runs `npm test` in the backend before deploy step
- [ ] Deploy step is blocked if tests fail
- [ ] Node 18.x and 20.x matrix is tested

### US-05 — Render Cold Start Fix
**As** a first-time visitor,  
**I want** the API to respond instantly,  
**So that** I don't wait 30-60 seconds for the Render free-tier to wake up.

**Acceptance Criteria:**
- [ ] A keep-alive ping script pings the Render URL every 14 minutes
- [ ] The approach is documented in README

---

## Definition of Done

- All acceptance criteria checked
- `npm run test:all` passes with 0 errors
- No new lint/syntax errors introduced
- Each fix committed atomically with descriptive message

---

## Out of Scope for This Milestone

- Payment gateway live credentials (KYC pending)
- Multilingual support
- SPA migration
