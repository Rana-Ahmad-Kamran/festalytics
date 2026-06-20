# Festalytics MVP — Deployment Architecture & Hosting Plan

**Document purpose:** Technical handoff for senior developer review before choosing hosting and deploying the MVP.  
**Project:** Festalytics (`festalytics-1940a` Firebase project)  
**Prepared:** May 2026  
**Repo:** Next.js monorepo + separate Python `backend/` service  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Recommended Hosting Strategy](#3-recommended-hosting-strategy)
4. [Feature-to-Infrastructure Matrix](#4-feature-to-infrastructure-matrix)
5. [Application Surfaces & Routes](#5-application-surfaces--routes)
6. [API Routes Inventory](#6-api-routes-inventory)
7. [Authentication & Security Model](#7-authentication--security-model)
8. [Firebase Services](#8-firebase-services)
9. [Environment Variables](#9-environment-variables)
10. [Deployment Steps](#10-deployment-steps)
11. [Pre-Deploy Checklist](#11-pre-deploy-checklist)
12. [Post-Deploy Verification](#12-post-deploy-verification)
13. [Known Risks & Mitigations](#13-known-risks--mitigations)
14. [Cost Estimate (MVP)](#14-cost-estimate-mvp)
15. [MVP Scope Tiers](#15-mvp-scope-tiers)
16. [Open Questions for Review](#16-open-questions-for-review)
17. [Appendices](#appendix-a--local-development-reference)

---

## 1. Executive Summary

Festalytics is **not a static site**. It is a **three-tier application**:

| Tier | Technology | Role |
|------|------------|------|
| **Frontend + BFF** | Next.js 16 (App Router) | UI, 23 API route handlers, admin panel server logic |
| **Data & Auth** | Firebase (Auth, Firestore, Storage) | User/vendor auth, all live data, security rules |
| **AI & Voice** | Python FastAPI (`:8001`) | RAG chatbot, CLIP decor matching, Twilio voice calls |

### Recommended hosting (MVP)

| Component | Recommended host | Alternative |
|-----------|------------------|-------------|
| Next.js app + `/api/*` | **Vercel** (Pro if Sheets/CLIP in MVP) | Railway / Render (always-on Node) |
| Firebase (Auth, Firestore, Storage) | **Firebase** (existing project) | — |
| Python AI backend | **Railway** or **Render** | VPS, Google Cloud Run |

**Not recommended as primary Next.js host:** Firebase Hosting (static only; no native App Router API support in current setup).

---

## 2. System Architecture

```
                         ┌─────────────────────────────────────┐
                         │           End Users (Browser)        │
                         └──────────────┬──────────────────────┘
                                        │
          ┌─────────────────────────────┼─────────────────────────────┐
          │                             │                             │
          ▼                             ▼                             ▼
┌──────────────────┐        ┌──────────────────────┐        ┌──────────────────┐
│  Vercel          │        │  Firebase            │        │  Railway/Render  │
│  Next.js :443    │        │  festalytics-1940a   │        │  FastAPI :8001   │
│                  │        │                      │        │                  │
│  • 47 pages      │        │  • Auth              │        │  • RAG (Groq)    │
│  • 23 API routes │◄──────►│  • Firestore         │        │  • CLIP (PyTorch)│
│  • Admin BFF     │        │  • Storage           │        │  • Twilio voice  │
│  • Google Sheets │        │  • Security rules    │        │  • mobile.html   │
└────────┬─────────┘        └──────────────────────┘        └────────┬─────────┘
         │                                                            │
         │  /api/rag/chat, /api/clip/match (server proxy)             │
         └──────────────────────────►─────────────────────────────────┘

         Browser also calls Python directly for Twilio (NEXT_PUBLIC_AI_BACKEND_URL)
```

### Rendering model

- **~95% of pages are `"use client"`** — effectively a client-rendered SPA inside Next.js.
- Root `app/layout.jsx` is a server component (fonts, metadata only).
- **No `middleware.ts`** — auth is client-side (`ProtectedRoute`, `AdminGuard`) + API route guards.
- SSR is minimal; hosting focus is **API routes + static/client bundles**, not heavy RSC.

---

## 3. Recommended Hosting Strategy

### 3.1 Vercel for Next.js (primary recommendation)

**Why it fits:**

- Native Next.js 16 App Router support
- All 23 API routes run as Node.js serverless functions
- Firebase Admin SDK works with service-account env vars
- `googleapis` (Google Sheets) works on Node runtime
- Admin session cookies (HMAC, httpOnly) work over HTTPS
- Zero server management for MVP

**Drawbacks for our codebase:**

| Issue | Detail | Mitigation |
|-------|--------|------------|
| **Function timeouts** | Hobby = 10s; Pro = 60s | `/api/live-google-sheet` observed ~15s locally; CLIP proxy allows 60s |
| **Python cannot run on Vercel** | PyTorch/CLIP/Twilio need separate host | Deploy `backend/` on Railway/Render |
| **Cold starts** | First admin API call may be slow | Acceptable for MVP; use Pro plan |
| **Env var formatting** | Multiline private keys need `\n` escaping | Code already handles `replace(/\\n/g, "\n")` |

### 3.2 Railway / Render for Python backend

**Why it fits:**

- Long-running process (no 10s serverless limit)
- PyTorch + CLIP need **≥2 GB RAM** (recommend 4 GB for stability)
- Twilio webhooks need stable public URL (`PUBLIC_BASE_URL`)
- Groq API calls, RAG state, CLIP model loaded at startup

**First-boot note:** CLIP model download (~338 MB) on first start can take several minutes.

### 3.3 Firebase (keep as-is)

- **Not** the Next.js host in current setup (`firebase.json` has no hosting config)
- Continue using for Auth, Firestore, Storage, security rules, indexes
- Deploy rules: `firebase deploy --only firestore:rules,firestore:indexes,storage`

---

## 4. Feature-to-Infrastructure Matrix

| Feature | User surface | Data / services | Hosting requirement |
|---------|--------------|-----------------|---------------------|
| **Landing & venue discovery** | `/`, `/all-venues`, `/venue/[id]` | Firestore `venues`, static JSON `halls.json` | Vercel (client-side) |
| **User signup/login** | `/login`, `/signup`, AuthGate modal | Firebase Auth + `users` collection | Vercel + Firebase |
| **User dashboard & events** | `/user-dashboard`, `/my-events`, `/create-event` | Firebase Auth; events in **localStorage** | Vercel + Firebase |
| **Vendor ERP dashboard** | `/vendor-dashboard/*` | Firestore tenant via `users.venueId` | Vercel + Firebase |
| **Vendor bookings** | `/vendor-dashboard/bookings` | Firestore `bookings`, `quotations`, Google Sheet live sync, Twilio | Vercel + Firebase + Sheets API + Python |
| **Vendor messages** | `/vendor-dashboard/messages` | Firestore `chats/{id}/messages` | Vercel + Firebase |
| **Vendor calendar** | `/vendor-dashboard/availability` | Firestore `venues.calendar`, `bookings` | Vercel + Firebase |
| **Vendor analytics** | `/vendor-dashboard/analytics` | Firestore aggregations | Vercel + Firebase |
| **Vendor inventory & borrow hub** | `/vendor-dashboard/my-inventory`, `/borrow-hub` | `inventory_listings`, `borrow_requests` | Vercel + Firebase |
| **Vendor services wizard** | `/vendor-dashboard/my-services/*` | Firestore `venues` | Vercel + Firebase |
| **AI Planner (RAG)** | `/ai-planner` | Next `/api/rag/chat` → Python `/api/rag/chat` or fallback | Vercel + Python + Groq |
| **Find Decor (CLIP)** | `/find-decor` | Next `/api/clip/match` → Python (up to 60s) | Vercel Pro + Python + Groq |
| **Service discovery** | `/service-discovery` | Firestore `vendors` | Vercel + Firebase |
| **Super admin panel** | `/admin/*` | Firebase Admin SDK via `/api/admin/*` | Vercel + Firebase Admin |
| **Admin auth** | `/admin/login` | Env credentials + HMAC cookie (not Firebase Auth) | Vercel env vars |
| **Google Sheets sync** | Vendor bookings, Zaydan calling sheet | `googleapis` service account | Vercel Node API (slow) |
| **Twilio voice confirmation** | Vendor bookings detail drawer | Browser → Python `/api/twilio/*`, `mobile.html` | Python public URL + Twilio |
| **Email verification (vendors)** | `/verify-email` | Firebase Auth email verification | Firebase + Vercel |

---

## 5. Application Surfaces & Routes

### 5.1 B2C — Public

| Route | Notes |
|-------|-------|
| `/` | Landing, featured halls |
| `/all-venues` | Venue directory |
| `/venue/[id]` | Quotation submit, chat, calendar |
| `/service-discovery`, `/services` | Service browse |
| `/find-decor` | CLIP upload (gated login) |
| `/ai-planner` | RAG chatbot |
| `/login`, `/signup`, `/verify-email` | Auth flows |
| `/about` | Marketing |

### 5.2 B2C — Authenticated (`ProtectedRoute`, role=user)

| Route | Notes |
|-------|-------|
| `/user-dashboard` | Consumer home |
| `/my-events`, `/create-event`, `/edit-event/[id]`, `/manage-event/[eventId]` | Events stored in **localStorage** (`festalytics_events`) |

### 5.3 B2B — Vendor ERP (`VendorVenueGuard`)

| Route | Notes |
|-------|-------|
| `/vendor-dashboard` | Dashboard home |
| `/vendor-dashboard/bookings` | Unified bookings (Firestore + Sheet + quotations) |
| `/vendor-dashboard/messages` | Customer chat inbox |
| `/vendor-dashboard/availability` | Venue calendar |
| `/vendor-dashboard/analytics` | KPIs |
| `/vendor-dashboard/my-services/*` | Service catalog CRUD |
| `/vendor-dashboard/my-inventory/*` | Inventory listings |
| `/vendor-dashboard/borrow-hub` | Inter-vendor equipment borrow |
| `/vendor-dashboard/settings/*` | Account, business, payments, etc. |

### 5.4 Super Admin (`AdminGuard` + `AdminShell`)

| Route | Notes |
|-------|-------|
| `/admin/login` | Username/password (env-based) |
| `/admin/dashboard` | Platform metrics |
| `/admin/bookings`, `/admin/quotations` | Booking/quote management |
| `/admin/users`, `/admin/users/[uid]` | User management |
| `/admin/venues`, `/admin/venues/[slug]` | Venue management |
| `/admin/chats`, `/admin/chats/[id]` | Chat moderation |
| `/admin/borrow-hub`, `/admin/onboarding` | Platform ops |
| `/admin/settings` | Config display |

---

## 6. API Routes Inventory

All admin routes use `export const dynamic = "force-dynamic"`.  
Sheets routes use `export const runtime = "nodejs"`.

### 6.1 Public / integration routes (Next.js BFF)

| Method | Route | Purpose | Timeout risk | External deps |
|--------|-------|---------|--------------|---------------|
| POST | `/api/rag/chat` | Proxy to Python RAG; fallback if backend down | 12s client timeout | Python, Groq |
| POST | `/api/clip/match` | Proxy to Python CLIP | **60s** | Python, Groq, PyTorch |
| GET | `/api/live-google-sheet` | Read live Google Sheet → booking rows | **~15s observed** | Google Sheets API |
| POST | `/api/sync-bookings` | Sync bookings to sheet | Medium | Google Sheets API |
| POST | `/api/sync-bookings-proof` | Sync voice proof URLs to sheet | Medium | Google Sheets API |
| POST | `/api/zaydan-calling-sheet` | Append Zaydan calling sheet row | Medium | Google Sheets API |

### 6.2 Admin routes (cookie session via `withAdmin`)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/admin/login` | Issue HMAC session cookie |
| POST | `/api/admin/logout` | Clear session |
| GET | `/api/admin/me` | Session validation |
| GET | `/api/admin/stats` | Dashboard KPIs |
| GET/POST | `/api/admin/bookings` | Bookings list/create |
| GET/PATCH | `/api/admin/bookings/[id]` | Single booking |
| GET | `/api/admin/users` | Users list |
| GET/PATCH | `/api/admin/users/[uid]` | User detail/update |
| GET | `/api/admin/venues` | Venues list |
| GET/PATCH | `/api/admin/venues/[slug]` | Venue detail/update |
| GET | `/api/admin/chats` | Chats list |
| GET/PATCH | `/api/admin/chats/[id]` | Chat detail/moderation |
| GET | `/api/admin/quotations` | Quotations list |
| PATCH | `/api/admin/quotations/[id]` | Update quotation |
| GET | `/api/admin/onboarding` | Vendor onboarding queue |
| GET/PATCH | `/api/admin/borrow-hub` | Borrow hub oversight |
| GET/PATCH | `/api/admin/settings` | Platform settings |

### 6.3 Python backend routes (separate host)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/health` | Health check |
| POST | `/api/rag/chat` | Groq RAG wedding hall chat |
| GET | `/api/rag/health` | RAG status |
| POST | `/api/clip/match` | Decor image matching |
| POST | `/api/twilio/initiate-call` | Start confirmation call |
| GET | `/api/twilio/booking-info` | Poll call status |
| GET | `/mobile.html` | Twilio browser receiver (register before calls) |

---

## 7. Authentication & Security Model

### 7.1 Firebase Auth (users & vendors)

| Mechanism | Location | Behavior |
|-----------|----------|----------|
| `AuthProvider` | `src/context/AuthContext.jsx` | Global auth state, role from `users/{uid}.role` |
| `ProtectedRoute` | User pages | Redirect if wrong/missing role |
| `AuthGateModal` | Public pages | Modal login for gated actions |
| `VendorVenueGuard` | Vendor ERP | Blocks until `users.venueId` is set |
| Firestore rules | `firestore.rules` | RBAC by role + venueId |

**Roles:** `user` | `vendor` (stored in Firestore `users` collection)

### 7.2 Admin Auth (separate system)

| Mechanism | Detail |
|-----------|--------|
| Login | `ADMIN_USERNAME` + `ADMIN_PASSWORD` from env (not Firebase Auth) |
| Session | HMAC-signed cookie `festalytics_admin_session`, 12h TTL |
| API guard | `withAdmin()` wrapper on all `/api/admin/*` routes |
| Data access | Firebase **Admin SDK** (bypasses client security rules) |
| Profile | `platform_admins` Firestore collection (Admin SDK only) |

### 7.3 Secrets — never expose to browser

```
FIREBASE_ADMIN_*
GOOGLE_PRIVATE_KEY
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
AI_BACKEND_URL (server-only)
GROQ_*, TWILIO_* (Python host only)
```

**Safe for browser (`NEXT_PUBLIC_*`):**

```
NEXT_PUBLIC_AI_BACKEND_URL  (Python public URL for Twilio from vendor UI)
```

Firebase client config in `src/firebase.js` is public by design (apiKey, projectId).

---

## 8. Firebase Services

**Project ID:** `festalytics-1940a`

### Collections in use

| Collection | Purpose |
|------------|---------|
| `users` | Auth profiles, roles, `venueId` |
| `venues` | Venue tenant data (doc ID = slug) |
| `bookings` | Walk-in and system bookings |
| `quotations` | Online quote requests |
| `chats` + `messages` subcollection | Customer–vendor messaging |
| `inventory_listings` | Vendor inventory |
| `borrow_requests` | Inter-vendor borrow |
| `platform_admins` | Admin profiles (server only) |
| `admin_audit_logs` | Admin actions (server only) |

### Deploy Firebase config

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

**Indexes required:** See `firestore.indexes.json` (borrow_requests, chats composite indexes).

### CORS (Storage)

`storage.cors.json` exists — configure bucket CORS if using Firebase Storage uploads in production.

---

## 9. Environment Variables

### 9.1 Vercel (`.env.local` → Vercel dashboard)

| Variable | Required | Used by |
|----------|----------|---------|
| `FIREBASE_ADMIN_PROJECT_ID` | Yes (admin) | `/api/admin/*` |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Yes (admin) | Firebase Admin init |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Yes (admin) | Firebase Admin init — use `\n` for newlines |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Yes (bookings) | Google Sheets routes |
| `GOOGLE_PRIVATE_KEY` | Yes (bookings) | Google Sheets routes |
| `GOOGLE_SHEET_ZAYDAN_CALLING_ID` | Yes (Zaydan) | Live sheet + sync |
| `GOOGLE_SHEET_ID` | Optional | Fallback sheet ID |
| `ADMIN_USERNAME` | Yes (admin) | `/admin/login` |
| `ADMIN_PASSWORD` | Yes (admin) | `/admin/login` — **change from default** |
| `ADMIN_SESSION_SECRET` | Yes (admin) | Session signing — min 32 chars random |
| `ADMIN_EMAIL` | Optional | Stored on `platform_admins` doc |
| `AI_BACKEND_URL` | If AI enabled | Server proxy: `/api/rag/chat`, `/api/clip/match` |
| `NEXT_PUBLIC_AI_BACKEND_URL` | If Twilio/AI UI | Browser calls to Python (vendor bookings) |

### 9.2 Python backend (`backend/.env` → Railway/Render)

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORT` | Yes | Default `8001` |
| `ENVIRONMENT` | Yes | `production` |
| `FRONTEND_ORIGINS` | Yes | CORS — add Vercel production URL |
| `PUBLIC_BASE_URL` | Yes (Twilio) | Public Python URL for webhooks |
| `RAG_GROQ_API_KEY` | If RAG enabled | AI Planner |
| `CLIP_GROQ_API_KEY` | If CLIP enabled | Find Decor validation |
| `TWILIO_GROQ_API_KEY` | If Twilio enabled | Call decision AI |
| `GROQ_API_KEY` | Optional | Fallback Groq key |
| `TWILIO_ACCOUNT_SID` | If Twilio enabled | Voice calls |
| `TWILIO_AUTH_TOKEN` | If Twilio enabled | Voice calls |
| `TWILIO_API_KEY` | If Twilio enabled | Browser SDK |
| `TWILIO_API_SECRET` | If Twilio enabled | Browser SDK |
| `TWILIO_TWIML_APP_SID` | If Twilio enabled | TwiML app |
| `TWILIO_PHONE_NUMBER` | If Twilio enabled | Outbound number |
| `TWILIO_BROWSER_IDENTITY` | Yes | Default `mobile-browser` |
| `DEEPGRAM_API_KEY` | Optional | Voice transcription |
| `USE_CLIP` | Yes | `true` |
| `VALIDATE_CLIP_UPLOADS` | Yes | `true` |

---

## 10. Deployment Steps

### Phase 1 — Firebase (no app deploy yet)

1. Confirm Firestore rules and indexes deployed
2. Confirm Firebase Auth providers enabled (Email/Password)
3. Confirm service accounts have correct IAM roles
4. Share Google Sheet with `sheets-integration@...` service account as **Editor**
5. Rotate any dev credentials committed or shared in chat

### Phase 2 — Python backend (Railway / Render)

1. Create new service from `backend/` directory
2. Set all `backend/.env` variables (see §9.2)
3. Set `FRONTEND_ORIGINS` to include production Vercel URL
4. Set `PUBLIC_BASE_URL` to Python service public URL
5. Build command: `pip install -r requirements.txt` (Git required for CLIP)
6. Start command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT --env-file .env
   ```
7. Allocate **≥2 GB RAM** (4 GB recommended for CLIP)
8. Verify: `GET https://<python-url>/health` → `{"status":"ok"}`
9. Register Twilio mobile receiver: open `https://<python-url>/mobile.html` and tap Register

### Phase 3 — Next.js (Vercel)

1. Connect Git repo to Vercel
2. Framework preset: **Next.js**
3. Build command: `npm run build`
4. Output: default (Next.js)
5. Set all Vercel env vars (see §9.1)
6. Set `AI_BACKEND_URL` and `NEXT_PUBLIC_AI_BACKEND_URL` to Python public URL
7. Deploy
8. Add custom domain + HTTPS (required for admin cookies `secure: true`)

### Phase 4 — Cross-service wiring

1. Update Python `FRONTEND_ORIGINS` with final Vercel domain
2. Configure Twilio TwiML app webhook URLs to Python `PUBLIC_BASE_URL`
3. Smoke-test all feature groups (see §12)

---

## 11. Pre-Deploy Checklist

### Security

- [ ] Change `ADMIN_PASSWORD` from default dev value
- [ ] Generate strong `ADMIN_SESSION_SECRET` (32+ random chars)
- [ ] Rotate ngrok/Firebase/Groq keys if exposed in dev chat
- [ ] Confirm no `.env.local` committed to git
- [ ] Firestore rules reviewed for production

### Build

- [ ] `npm run build` succeeds locally with no errors
- [ ] `npm run lint` passes (or known warnings documented)
- [ ] Python backend starts and `/health` returns OK after CLIP load

### Infrastructure

- [ ] Vercel plan chosen (Hobby vs Pro — see timeout risks)
- [ ] Python host RAM ≥2 GB
- [ ] Google Sheet shared with service account
- [ ] Firebase indexes deployed

### Feature scope agreed

- [ ] MVP tier selected (see §15) — determines if Python host is day-1 required

---

## 12. Post-Deploy Verification

### B2C flows

| Test | URL | Expected |
|------|-----|----------|
| Landing loads | `/` | Featured halls visible |
| Venue detail | `/venue/zaydan-banquet-hall` | No "Venue not found" flash |
| User login | `/login?type=user` | Redirect to `/user-dashboard` |
| Vendor login | `/login?type=vendor` | Redirect to `/vendor-dashboard` |
| AI Planner | `/ai-planner` | Chat responds (Python or fallback) |
| Find Decor | `/find-decor` | Upload + match (needs Python + Groq) |

### Vendor ERP

| Test | URL | Expected |
|------|-----|----------|
| Bookings load | `/vendor-dashboard/bookings` | Sheet + Firestore rows merged |
| Search/filter | Same | Filters by customer name |
| Sort | Same | Newest event dates first |
| No duplicates | Same | Same customer+date merged to one row |
| Messages | `/vendor-dashboard/messages` | Inbox loads |
| Twilio call | Bookings detail | Call initiates (Python + Twilio + mobile.html registered) |

### Admin

| Test | URL | Expected |
|------|-----|----------|
| Admin login | `/admin/login` | Cookie session issued |
| Dashboard | `/admin/dashboard` | Stats load via `/api/admin/stats` |
| Users/venues | `/admin/users` | Firebase Admin data returns |

### API health

```bash
curl https://<vercel-domain>/api/admin/me          # 401 without cookie (expected)
curl https://<python-domain>/health                # {"status":"ok"}
curl https://<python-domain>/api/rag/health        # RAG status
```

---

## 13. Known Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Google Sheet API >10s on Vercel Hobby | High | Upgrade to Vercel Pro; or cache sheet data |
| CLIP match >10s on Vercel Hobby | High | Vercel Pro required; or disable Find Decor in MVP |
| Python cold start + CLIP load | Medium | Use always-on Railway plan; health check warmup |
| Twilio needs public Python URL | High | Deploy Python before enabling voice feature |
| Duplicate bookings (Sheet + Firestore) | Low | Dedup logic in `dedupeMergedBookings()` — verify post-deploy |
| Events in localStorage only | Medium | User events lost on new device — document as known limitation |
| `firebase.json` has no hosting | Info | Confirms Firebase is data layer only |
| Vendor bookings polls sheet every 8s | Medium | Monitor Vercel function invocation costs on Pro |

---

## 14. Cost Estimate (MVP)

| Service | Plan | Monthly est. |
|---------|------|--------------|
| Vercel | Hobby | $0 (timeout limits) |
| Vercel | Pro | ~$20/user |
| Firebase | Spark (free) | $0 (watch quotas) |
| Railway (Python) | Starter | ~$5–20 |
| Railway (Python) | 4 GB RAM | ~$15–25 |
| Groq API | Pay-per-use | ~$0–10 MVP |
| Twilio | Pay-per-use | Variable |
| Domain | Annual | ~$1/mo amortized |

**Lean MVP:** ~$0–25/mo (Hobby + Firebase free + small Railway)  
**Reliable MVP (all features):** ~$40–55/mo (Vercel Pro + Railway 4GB + Firebase free)

---

## 15. MVP Scope Tiers

### Tier A — Core MVP (no AI, no Twilio)

**Deploy:** Vercel + Firebase only

| Included | Excluded |
|----------|----------|
| Landing, venues, auth | AI Planner (Python) |
| User/vendor dashboards | Find Decor (CLIP) |
| Vendor bookings (Firestore + Sheet) | Twilio voice calls |
| Admin panel | |
| Messaging, calendar | |

**Python host:** Not required day 1.  
**Vercel plan:** Hobby may work if Sheet sync stays under 10s.

### Tier B — Full MVP (recommended)

**Deploy:** Vercel Pro + Firebase + Railway Python

| Included |
|----------|
| Everything in Tier A |
| AI Planner (RAG) |
| Find Decor (CLIP) |
| Twilio voice confirmation |
| Google Sheets live sync |

---

## 16. Open Questions for Review

Please review and advise on:

1. **Vercel Hobby vs Pro** — Is ~15s Google Sheet fetch acceptable to optimize, or do we need Pro day 1?
2. **Python hosting** — Railway vs Render vs Cloud Run for PyTorch/CLIP memory requirements?
3. **Single provider** — Should we run Next.js on Railway too (avoid serverless timeouts) instead of Vercel?
4. **Custom domain** — Subdomain strategy (`app.festalytics.com`, `api.festalytics.com`)?
5. **CI/CD** — GitHub Actions for `npm run build` + Firebase rules deploy before Vercel promote?
6. **Secrets management** — Vercel env vars vs Doppler/Vault for team access?
7. **MVP tier** — Tier A (no AI) or Tier B (full features) for launch date?
8. **localStorage events** — Accept for MVP or migrate `festalytics_events` to Firestore before launch?
9. **Monitoring** — Sentry/LogRocket for production errors?
10. **Firestore backup** — Enable scheduled exports before go-live?

---

## Appendix A — Local Development Reference

```powershell
# Terminal 1 — Frontend
cd festalytics
npm install
npm run dev
# → http://localhost:3000

# Terminal 2 — Python backend
cd backend
pip install -r requirements.txt
$env:PYTHONUTF8="1"
python -m uvicorn app.main:app --reload --env-file .env --host 0.0.0.0 --port 8001
# → http://localhost:8001/health

# Terminal 3 — Ngrok (Twilio dev only)
ngrok http --url=<your-domain>.ngrok-free.dev 8001
```

## Appendix B — Related internal docs

- [Architecture guide](./ARCHITECTURE.md)
- Backend README: `backend/README.md`
- Env templates: `.env.local.example`, `backend/.env.example`

---

**End of document**

*Prepared for senior developer review. Please annotate with hosting decision, MVP tier, and any blockers before go-live.*
