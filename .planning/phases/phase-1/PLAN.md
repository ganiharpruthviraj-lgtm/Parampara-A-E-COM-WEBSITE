# Phase 1 — Security Hardening

**Status:** ✅ Complete  
**Requirement:** US-01  
**Started:** October 2026

## Plan

### Task 1.1 — Audit CORS & JWT config
- Read `backend/app.js` CORS logic
- Read `backend/.env` / `.env.example`
- **Finding:** CORS is already properly whitelisted (origin function with env var). JWT warning check is in place at line 151 but threshold is 32 chars — should be 64.

### Task 1.2 — Strengthen JWT threshold in startup check
- Update `backend/app.js` line 151: raise minimum JWT_SECRET length check from 32 → 64 chars

### Task 1.3 — Enhance .env.example
- Add `RENDER_URL` variable (needed for Phase 5 keep-alive)
- Add clearer JWT generation command in comments

## Verification
- [ ] `npm run test:syntax` passes
- [ ] `npm run test:all` passes
- [ ] JWT weak-secret warning fires when secret < 64 chars
