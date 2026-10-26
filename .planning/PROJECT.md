# Parampara — Project Context

## What This Is

**Parampara** (परंपरा) is a multi-page heritage e-commerce platform that brings India's authentic GI-tagged crafts, master artisan stories, and regional cultural narratives directly to collectors worldwide.

**Core Value:** The ONE thing that must work — collectors can discover, trust, and purchase authentic GI-tagged Indian handicrafts with transparent 70% artisan payouts and verified provenance certificates.

## Context

- **Type:** Brownfield — existing production-quality codebase
- **Stack:** HTML5 + Vanilla CSS/JS frontend, Node.js + Express 5.x backend, MongoDB Atlas + Mongoose ODM, JWT auth, PDFKit, Razorpay gateway
- **Deployment:** Vercel (frontend CDN + API proxy) + Render (Node.js API) + MongoDB Atlas
- **Current Score:** 63/100 (repo audit) — key gaps in security, performance, SEO, and CI/CD
- **Tests:** 54/54 Jest backend tests passing; 3 frontend linters passing

## Requirements

### Validated (Already Shipped)
- ✓ 15-page frontend — interactive SVG India map, state craft dossiers, artisan profiles
- ✓ Node.js/Express 5 backend with 7 modular route handlers
- ✓ MongoDB Atlas with 3-tier failover resilience (Atlas → Local → In-Memory)
- ✓ JWT + Bcrypt + Google OAuth authentication
- ✓ Saathi AI — domain-grounded RAG engine with 7 GI-registry knowledge bases
- ✓ Parampara Mitra — shopping concierge AI with Levenshtein typo tolerance
- ✓ PDFKit vector invoice + GI certificate generation
- ✓ Razorpay checkout with HMAC-SHA256 signature verification
- ✓ GitHub Actions CI/CD (deploy to GitHub Pages)
- ✓ 54 Jest tests across 6 backend test suites

### Active (This Milestone)
- [ ] P1-SECURITY: Strengthen JWT secret + fix CORS wildcard
- [ ] P2-SEO: Add title, meta description, OG tags to all 15 HTML pages
- [ ] P3-PERF: Compress oversized assets (favicon, images)
- [ ] P4-CI: Add test step to GitHub Actions CI pipeline
- [ ] P5-COLDSTART: Add Render keep-alive ping mechanism
- [ ] P6-ARTISAN: Connect Razorpay Payouts API for automated artisan disbursement

### Out of Scope
- Full SPA/PWA migration — complexity not justified now; MPA is intentional
- Multilingual UI — Phase 4+ roadmap item
- ONDC integration — Q2 2027 roadmap item

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| MPA over SPA | Zero-bundle overhead, instant paint, SEO-friendly | Shipped |
| Domain-grounded RAG (no 3rd-party LLM) | No API cost, full offline capability, cultural accuracy | Shipped |
| 70% direct artisan payout as core feature | Social mission differentiation, not just marketing | Shipped |
| Vercel + Render split hosting | Edge CDN for static assets, serverful for Node.js API | Shipped |
| Fix security/SEO/perf before new features | Audit score 63/100 — hardening before expansion | Active |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions

---
*Last updated: October 2026 — Milestone 1 initialization*
