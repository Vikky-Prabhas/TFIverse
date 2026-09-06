# 🚀 TFIverse — THE ONE MASTER NOTES
### Single Source of Truth — Last Updated: 2026-09-06
### Project Duration: April 29 → September 6, 2026 (4+ months)
### Codebase: 121 source files · 23,569 lines of code · 121 git commits

> **This replaces:** `PROJECT_VISION_AND_ROADMAP.md`, `TFIVERSE_COMPREHENSIVE_NOTES.md`, `TFIVERSE_MASTER_PLAN.md`, `DEVELOPER_NOTES.md`, `MIGRATION_REPORT.md`
> **Rule:** Every change, every decision, every feature MUST be logged here. No more scattered docs.

---

## 📌 1. WHAT IS TFIverse?

TFIverse is the **definitive digital ecosystem for the Telugu Film Industry (Tollywood)**. Think: IMDb accuracy + Letterboxd structure + Reddit/X community energy — all wrapped in a premium dark-mode startup UI.

**Domain:** `tfiverse.com`
**Git Remote:** `origin/main`

---

## 🏗️ 2. TECH STACK (Locked)

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Turbopack for dev, `next build` for prod |
| **Language** | TypeScript 5 | Strict mode |
| **Database** | PostgreSQL 16 (local) | Drizzle ORM, 41 tables, user `pepper-salt` |
| **Auth** | Auth.js / NextAuth v5 (beta.31) | JWT sessions, split config for Edge |
| **Styling** | Tailwind CSS 4 + Framer Motion | Glassmorphism, dark-mode, premium UI |
| **File Storage** | Backblaze B2 (S3-compatible) | Pre-signed URL uploads |
| **Email** | Zoho SMTP (primary) → Resend (fallback) | `noreply@tfiverse.com`, `admin@tfiverse.com` |
| **External APIs** | TMDB, OMDB, BMS scraper, JustWatch | Movie data, box office tracking |
| **Fonts** | Geist (Next.js built-in) | Auto-optimized via `next/font` |

### Production Target Architecture
```
ONE VPS (₹500-800/mo)
├── Nginx         → reverse proxy + TLS + gzip/brotli
├── Next.js 16    → production build via PM2 (cluster mode)
├── PostgreSQL 16 → localhost only, never public
├── PgBouncer     → connection pooling
├── Certbot/CF    → TLS (Cloudflare Origin Certificate)
├── UFW           → firewall (deny-all + allow 22/80/443)
├── Fail2ban      → SSH brute-force protection
└── Node 20 LTS

External (FREE or Cheap):
├── Cloudflare    → DNS + CDN + DDoS + WAF (FREE)
├── Zoho SMTP     → transactional email (~₹0/mo — existing mailbox)
├── Backblaze B2  → media storage (~₹100-300/mo)
└── GitHub Actions → CI/CD auto-deploy (FREE)

Monthly Cost: ~₹650-1200
```

---

## 🔑 3. API KEYS & SECRETS (in `.env.local`, gitignored)

| Service | Variable | Purpose |
|---|---|---|
| **PostgreSQL** | `DATABASE_URL` | `postgresql://pepper-salt:postgres@localhost:5432/tfiverse` |
| **Zoho SMTP** | `ZOHO_SMTP_USER` / `ZOHO_SMTP_PASS` | Primary email delivery via `smtppro.zoho.in:465` |
| **Auth.js** | `AUTH_SECRET` | JWT signing key |
| **Google OAuth** | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google login |
| **TMDB** | `NEXT_PUBLIC_TMDB_API_KEY` | Movie metadata (key: `ba5dc12f...`) |
| **OMDB** | `OMDB_API_KEY` | Supplementary movie data |
| **Resend** | `RESEND_API_KEY` | Fallback email provider |
| **Backblaze B2** | `B2_KEY_ID` / `B2_APPLICATION_KEY` | File storage for meme uploads |
| **Cloudinary** | `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Image CDN (configured, not primary) |
| **Supabase** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Configured, not actively used |

---

## 🗄️ 4. DATABASE — 41 Tables in PostgreSQL

### Current Data Counts (as of 2026-09-06):
| Table | Rows | Notes |
|---|---|---|
| `movies` | **3,845** | Synced from TMDB API (3,716 JSON backups + 129 others) |
| `movie_credits` | **43,996** | Cast & crew links between movies↔people |
| `movie_ott_links` | 2 | OTT streaming platform links (barely seeded) |
| `people` | **9,332** | All currently tagged as `category: "crew"` — needs re-categorization |
| `realtime_sessions` | **19,472** | Individual showtime ticket data from BMS/Paytm scrapers |
| `venues` | **5,537** | 3,379 BMS + 2,158 Paytm theater venues |
| `hourly_trending_logs` | 76 | Hourly snapshots for box office line charts |
| `daily_box_office` | 0 | Daily aggregate stats (not yet populated) |
| `regional_box_office` | 0 | State/city breakdown (not yet populated) |
| `chain_box_office` | 0 | PVR/INOX/Cinepolis breakdown (not yet populated) |
| `user` | 2 | `peppersalt` (owner) + `agent` (system) |
| `user_profile` | 2 | Matching profiles |
| `memes` | 1 | Test meme |
| `tier_list` | 3 | Test tier lists |
| `rumors` | 0 | Empty |
| `suggestions` | 0 | Moderation queue (empty) |
| `reports` | 0 | Content reports (empty) |
| `badges` | 0 | Gamification badges (schema ready, no data) |

### Schema Files (14 files in `src/lib/schema/`):
| File | Tables | Purpose |
|---|---|---|
| `auth.ts` | `user`, `account`, `session`, `verificationToken`, `password_reset_token` | NextAuth + custom password reset |
| `profiles.ts` | `user_profile`, `user_follows`, `profile_views` | Bento Box profiles, follow system |
| `content.ts` | `people`, `movies`, `movie_credits`, `movie_ott_links` | Core movie & celebrity content |
| `engagement.ts` | `people_follows`, `reviews`, `watched_movies`, `watchlist`, `pinned_items` | User engagement with movies/people |
| `memes.ts` | `memes`, `meme_views`, `meme_likes`, `meme_downloads`, `meme_comments`, `meme_bookmarks`, `meme_reports`, `meme_shares` | Full meme ecosystem |
| `tierlists.ts` | `tier_list`, `tier_list_like`, `tier_list_comment` | Drag-and-drop tier lists |
| `tracking.ts` | `daily_box_office`, `regional_box_office`, `chain_box_office`, `realtime_sessions`, `hourly_trending_logs` | Box office tracking engine |
| `venues.ts` | `venues` | Theater venue master list |
| `moderation.ts` | `suggestions`, `reports` | "Suggest an Edit" + content reporting |
| `gamification.ts` | `badges`, `user_badges` | Achievement badges |
| `misc.ts` | `notifications`, `rumors` | In-app notifications + industry rumors |
| `sync.ts` | `sync_logs` | Data sync job tracking |
| `relations.ts` | (relations only) | Drizzle relation definitions |
| `index.ts` | (re-exports + types) | Central schema barrel export |

---

## ✅ 5. COMPLETED FEATURES (Full Detail)

---

### FEATURE 1: Authentication System
**Status:** ✅ PRODUCTION-READY
**Files:** `src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts`, `src/app/actions/auth.ts`, `src/lib/rate-limit.ts`, `src/lib/email.ts`

**How it works:**
1. **Two auth configs** — `auth.config.ts` is Edge-safe (no DB, no bcrypt) for the Middleware. `auth.ts` is the full config with DB adapter + Credentials provider.
2. **JWT sessions** — No database sessions. Token contains `id`, `picture`, `email`.
3. **Providers:**
   - **Google OAuth** — via `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`. User clicks "Continue with Google" → redirects to Google → comes back → Drizzle adapter auto-creates `user` + `account` rows.
   - **Email/Password** — User submits form → `registerUser()` server action → bcrypt hashes password (cost 10) → inserts into `user` table → auto-creates `user_profile` with random username → generates UUID verification token (24hr expiry) → sends email via Zoho SMTP.
4. **Email Verification** — Token stored in `verificationToken` table → user clicks link → `/verify-email/confirm` route handler validates token → marks `emailVerified` timestamp → deletes token → redirects to `/login?verified=true`.
5. **Forgot/Reset Password** — `forgotPassword()` → generates UUID token (15min expiry) → stores in `password_reset_token` table → sends reset email → user clicks link → `/reset-password` page → `resetPassword()` → validates token + expiry → bcrypt hashes new password → updates `user` row → deletes token.
6. **Rate Limiting** — In-memory Map: `login` = 5 attempts/15min, `register` = 3/hour, `forgot-password` = 3/15min, `resend-verify` = 3/15min, `reset-password` = 5/15min. Key format: `{ip}:{action}`.
7. **Middleware** — Runs on every request (except static assets). Checks if route is public (homepage, `/icons`, `/memes`, `/movies`, `/box-office`, etc.) or requires auth. Logged-in users hitting `/login` or `/register` get redirected to `/`.
8. **Input Sanitization** — `src/lib/sanitize.ts` escapes HTML entities, validates URLs (http/https only), validates file uploads (5MB images, 10MB memes).

**Auth Pages:**
| Page | Route | Features |
|---|---|---|
| Login | `/login` | Email/password form, Google OAuth button, "Forgot?" link, resend verification, cinematic video background (desktop), glassmorphism fallback (mobile), volume toggle, feature pills |
| Register | `/register` | Name/email/password/confirm form, Google OAuth, password strength regex, auto-creates profile |
| Forgot Password | `/forgot-password` | Email input, anti-enumeration (always returns success) |
| Reset Password | `/reset-password?token=xxx` | New password + confirm, token validation |
| Verify Email | `/verify-email/confirm?token=xxx` | Route handler, auto-redirects on success |
| Onboarding | `/onboarding` | Mandatory DOB collection for users missing it |

---

### FEATURE 2: The Icons Hub (Celebrity Profiles)
**Status:** ✅ PRODUCTION-READY
**Files:** `src/app/(main)/icons/page.tsx`, `src/app/(main)/icons/[category]/page.tsx`, `src/app/(main)/icons/[category]/[subcategory]/[slug]/page.tsx`, `src/app/actions/heroes.ts`

**How it works:**
1. **19 categories, 28 subcategories** — Heroes, Heroines, Directors, Music Directors, Villains, Comedians, Character Artists, Singers, Producers, Cinematographers, Editors, Lyricists, Choreographers, Stunt Directors, Art Directors, Costume Designers, Line Producers, VFX Supervisors, PROs.
2. **Universal rendering engine** — One set of page components handles ALL categories. The `[category]` and `[slug]` dynamic routes fetch from the `people` table via Drizzle.
3. **Data source** — Originally 28 JSON files in `src/data/`. All migrated to PostgreSQL `people` table. JSON files kept as backup.
4. **Icons Hub page** (`/icons`) — Premium cinematic layout with: "The Pillars" bento grid (Heroes, Heroines, Directors, Music Directors), "The Cast" list view, "The Crew" pill buttons, "Contribute to the Archives" CTA.
5. **Individual profiles** — TMDB integration for photos, filmography. Follow/unfollow functionality via `people_follows` table.

**Known Issue:** All 9,332 people in DB are tagged as `category: "crew"` — the original subcategory data (hero, heroine, director, etc.) from JSON files was not properly mapped during the bulk TMDB credit sync. The 28 original JSON files DO have correct categories.

---

### FEATURE 3: User Profiles (The Bento Box)
**Status:** ✅ PRODUCTION-READY
**Files:** `src/app/(main)/profile/page.tsx`, `src/app/(main)/u/[username]/page.tsx`, `src/app/actions/profile.ts`, `src/app/actions/follow.ts`

**How it works:**
1. **Private profile** at `/profile` — Edit modal for avatar, banner, bio, social links (Twitter, Instagram, YouTube, TikTok, IMDb, Letterboxd), pronouns, theme color, status emoji + message, privacy toggles (show/hide followers, watchlist, reviews, memes, tier lists).
2. **Public profile** at `/u/[username]` — Apple-style Bento grid layout with: stats (followers, following, watched, reviews), favorite hero, favorite movie, badges, social links, pinned items.
3. **Follow system** — `user_follows` table with unique constraint. `followUser()` / `unfollowUser()` server actions. Atomic counter updates on `user_profile.totalFollowers` / `totalFollowing`.
4. **Profile views** — `profile_views` table tracks who viewed whose profile.
5. **Avatar upload** — Pre-signed URL to Backblaze B2, client uploads directly, URL saved to `user_profile.avatarUrl`.

---

### FEATURE 4: Memes Portal
**Status:** ✅ PRODUCTION-READY
**Files:** `src/app/(main)/memes/page.tsx`, `src/components/memes/meme-client.tsx`, `src/app/actions/memes.ts`

**How it works:**
1. **Upload pipeline** — User selects image → client requests pre-signed URL from server → client uploads directly to Backblaze B2 → server creates `memes` row with the B2 URL.
2. **Engagement tracking** — All at DB level with composite unique constraints:
   - `meme_views` — `UNIQUE(user_id, meme_id)` — prevents duplicate view counts
   - `meme_likes` — `UNIQUE(user_id, meme_id)` — one like per user
   - `meme_bookmarks`, `meme_downloads`, `meme_shares` — tracked individually
   - `meme_comments` — threaded comments
   - `meme_reports` — abuse reporting with `pending/resolved/dismissed` status
3. **Features:** Upload, like/unlike, comment, share (Web Share API), bookmark, report, download tracking, edit/delete (author-only).
4. **Tags** — `tags` (general), `heroTags` (linked celebrities), `movieTags` (linked movies) — all JSONB arrays.
5. **Moderation** — `status` field: `pending` → `approved` / `rejected` by admin.

---

### FEATURE 5: Tier List System
**Status:** ✅ PRODUCTION-READY
**Files:** `src/app/(main)/tier-list/page.tsx`, `src/app/(main)/tier-list/create/page.tsx`, `src/app/(main)/tier-list/[id]/page.tsx`, `src/app/(main)/tier-list/my-lists/page.tsx`, `src/app/actions/tierlist.ts`

**How it works:**
1. **Drag-and-drop** — Uses `@dnd-kit/core` + `@dnd-kit/sortable`. Users search TMDB for movies → drag into S/A/B/C/D/F tiers.
2. **Data storage** — `tier_list.tiers` is a JSONB column storing `{ S: [...slugs], A: [...slugs], B: [...], ... }`.
3. **Community feed** — `/tier-list` shows all public tier lists. Like + comment system via `tier_list_like` and `tier_list_comment` tables.
4. **My Lists** — `/tier-list/my-lists` shows user's own tier lists.

---

### FEATURE 6: Movies Database & Browse
**Status:** ✅ PRODUCTION-READY (3,845 movies in DB)
**Files:** `src/app/(main)/movies/page.tsx`, `src/app/(main)/movies/[slug]/page.tsx`, `src/app/(main)/movies/components/`, `src/app/actions/movies.ts`, `src/lib/tmdb.ts`

**How it works:**
1. **TMDB Sync** — `scripts/sync-tmdb-bulk.ts` fetches all Telugu movies from TMDB API (language=te) page by page. For each movie: fetches details + credits + videos → upserts into `movies` table → creates `movie_credits` rows linking to `people`. Saved 3,716 JSON backups in `data/movies-json/`.
2. **Reseed script** — `scripts/reseed-from-json.ts` restores all 3,716 movies from local JSON backups without API calls (used when DB was accidentally wiped).
3. **TMDB Key Rotation** — `src/lib/tmdb.ts` supports multiple API keys with automatic rotation. If one key gets rate-limited (HTTP 429), it's put on exponential-backoff cooldown and the next key is used.
4. **Browse page** (`/movies`) — Two modes:
   - **Default (Netflix-style rows):** Horizontal scroll rows for "In Theaters", "Now Streaming", "Highest Rated", "Post-Production", "In Production", "Planned", "Rumored", "Canceled". Full-screen hero spotlight for the top movie.
   - **Search/Filter (Grid view):** Search by title, filter by year/platform/sort. Paginated grid with poster cards.
5. **Movie Detail page** (`/movies/[slug]`) — Full backdrop hero, poster, title, tagline, runtime, rating, overview, trailer embed, cast/crew list, OTT links, similar movies, engagement buttons (Watched, Watchlist, Review).
6. **Engagement** — `watched_movies`, `watchlist`, `reviews` tables. Users can mark as watched, add to watchlist, write reviews with ratings + spoiler tags.

**Movie Status Breakdown in DB:**
| Status | Count |
|---|---|
| Released | 3,491 |
| (null) | 129 |
| In Production | 95 |
| Planned | 45 |
| Post Production | 41 |
| Rumored | 29 |
| Canceled | 15 |

---

### FEATURE 7: Box Office Tracking Engine
**Status:** ✅ INFRASTRUCTURE COMPLETE, UI BUILT, DATA PARTIALLY POPULATED
**Files:** `src/app/(main)/box-office/`, `src/app/actions/box-office.ts`, `src/app/actions/boxoffice.ts`, `src/lib/scraper/`, `src/lib/verdict-engine.ts`, `scripts/sync-box-office.ts`, `scripts/sync-github-data.ts`

**How it works (the "Transport Layer" architecture):**
1. **The Problem:** Competitor (`bfilmy`/`assetz`) creates a new JSON file every day → GitHub repo bloats to GBs.
2. **Our Solution:** Separate `tfiverse-data-engine` GitHub repo with GitHub Actions running every 15min. It **overwrites** exactly 4 JSON files: `latest_bms_live`, `latest_bms_advance`, `latest_paytm_live`, `latest_paytm_advance`. Repo size stays near 0 MB.
3. **Data Ingestion:** `npm run sync:data` reads the 4 JSON files → inserts into `realtime_sessions` using UPSERT (one row per individual showtime: movie + venue + time + seats sold). Currently: **19,472 session rows** and **5,537 venues**.
4. **Hourly Snapshots:** `scripts/aggregate-hourly.ts` takes hourly snapshots of totals → saves to `hourly_trending_logs` for line charts.
5. **Verdict Engine** — `src/lib/verdict-engine.ts`:
   - `5x+ ratio` = All-Time Blockbuster
   - `3.5x-5x` = Blockbuster
   - `2.5x-3.5x` = Super Hit
   - `2x-2.5x` = Hit
   - `1.5x-2x` = Above Average
   - `1x-1.5x` = Average
   - `0.5x-1x` = Flop
   - `<0.5x` = Disaster
6. **UI Pages:**
   - `/box-office` — Split hero, live tracking hub, trending theaters, all-time leaderboard, verdict legend
   - `/box-office/live` — Real-time BMS/Paytm data
   - `/box-office/advance` — Advance booking data
   - `/box-office/track/[id]` — Individual movie deep-dive

---

### FEATURE 8: OTT Discovery Engine
**Status:** ✅ BASIC VERSION LIVE
**Files:** `src/app/(main)/new-on-ott/page.tsx`, `src/app/actions/ott-feed.ts`, `scripts/sync-ott-bulk.ts`, `scripts/fetch-ott-links-justwatch.py`

**How it works:**
1. Queries `movie_ott_links` table for movies with available streaming links.
2. JustWatch Python scraper (`scripts/fetch-ott-links-justwatch.py`) pulls platform availability.
3. Shows "New on OTT" with platform branding (Netflix, Prime, Hotstar, etc.).
4. Currently only 2 OTT links in DB — needs bulk JustWatch sync.

---

### FEATURE 9: Homepage (Cinematic Experience)
**Status:** ✅ PRODUCTION-READY
**Files:** `src/app/(main)/page.tsx`, `src/components/home/home-client.tsx`, `src/components/home/hero-sequence.tsx`

**How it works:**
1. **Server Component** fetches 5 data sources in parallel (all with `unstable_cache`):
   - `getHomeHeroes()` — Heroes from `people` table
   - `getHomeRumors()` — From `rumors` table
   - `getUpcomingMovies()` — Movies with status "Post Production"/"In Production"/"Planned"/"Rumored"
   - `getRecentReleases()` — Released movies with posters, ordered by date
   - `getHomeOtt()` — Latest OTT arrivals
2. **HeroSequence** — Cinematic scrollytelling intro animation
3. **HomeClient** — Client component with all the scrollable panels
4. **Footer** — Site-wide footer component

---

### FEATURE 10: Admin & Moderation
**Status:** ✅ BASIC VERSION
**Files:** `src/app/(admin)/admin/layout.tsx`, `src/app/(admin)/admin/moderation/page.tsx`, `src/app/actions/moderation.ts`, `src/app/actions/reports.ts`

**How it works:**
1. Admin layout with access control.
2. Moderation dashboard for reviewing reported memes and tier lists.
3. "Suggest an Edit" system — `suggestions` table with `pending/approved/rejected` status + admin comment.

---

### FEATURE 11: SEO & Metadata
**Status:** ✅ COMPLETE
**Files:** `src/app/sitemap.ts`, `src/app/robots.ts`

- Dynamic sitemap with all static pages + 19 icon categories.
- `robots.ts` configured for crawlers.
- Every page has proper `<title>` and `<meta description>`.

---

### FEATURE 12: Upcoming Movies Page
**Status:** ✅ LIVE
**Files:** `src/app/(main)/upcoming/page.tsx`

Shows movies with status "Post Production", "In Production", "Planned", "Rumored" from the DB.

---

### FEATURE 13: Navbar & Footer
**Status:** ✅ PRODUCTION-READY (recently upgraded by Claude)
**Files:** `src/components/layout/navbar.tsx`, `src/components/layout/footer.tsx`

- 7 nav links, scroll-aware transparent→dark background transition
- Mobile hamburger menu with proper `aria-*` labels
- Active route highlighting
- Footer with site links

---

### FEATURE 14: Static Pages
**Status:** ✅ COMPLETE
- `/about` — About TFIverse
- `/privacy` — Privacy Policy
- `/terms` — Terms of Service
- `/contact` — Contact form
- `/re-releases` — Re-release tracking page

---

## 📧 6. EMAIL SYSTEM

**Priority chain:** Zoho SMTP → AWS SES → Resend

| Email Type | Subject | Expiry |
|---|---|---|
| Email Verification | "🎬 Verify your TFiverse account" | 24 hours |
| Password Reset | "🔐 Reset your TFiverse password" | 15 minutes |

**Template:** `src/emails/TFiverseEmail.tsx` — React Email component rendered to HTML.

---

## 📜 7. SCRIPTS (in `scripts/`)

| Script | Purpose | Command |
|---|---|---|
| `sync-tmdb-bulk.ts` | Fetch all Telugu movies from TMDB API → upsert into DB | `npx tsx scripts/sync-tmdb-bulk.ts` |
| `reseed-from-json.ts` | Restore 3,716 movies from local JSON backups | `npx tsx scripts/reseed-from-json.ts` |
| `sync-box-office.ts` | Pull BMS/Paytm data from data-engine → upsert sessions | `npm run sync:box-office` |
| `sync-github-data.ts` | Sync data from GitHub data-engine repo | `npm run sync:data` |
| `aggregate-hourly.ts` | Create hourly snapshots for charts | `npx tsx scripts/aggregate-hourly.ts` |
| `sync-ott-bulk.ts` | Bulk fetch OTT streaming links | `npx tsx scripts/sync-ott-bulk.ts` |
| `fetch-ott-links-justwatch.py` | Python JustWatch scraper | `python scripts/fetch-ott-links-justwatch.py` |
| `migrate-json-to-db.ts` | Original JSON → PostgreSQL migration | `npx tsx scripts/migrate-json-to-db.ts` |
| `migration-engine.ts` | Drizzle migration runner | `npx tsx scripts/migration-engine.ts` |

---

## 🛣️ 8. SERVER ACTIONS (14 files, 2,715 lines)

| File | Lines | Key Functions |
|---|---|---|
| `auth.ts` | 297 | `loginUser`, `registerUser`, `forgotPassword`, `resetPassword`, `resendVerification` |
| `boxoffice.ts` | 549 | `getBoxOfficeHubData`, live tracking queries |
| `box-office.ts` | 188 | `getBoxOfficeData`, `getBoxOfficeStats` |
| `tierlist.ts` | 287 | `createTierList`, `updateTierList`, `deleteTierList`, `likeTierList`, `commentTierList` |
| `memes.ts` | 285 | `uploadMeme`, `likeMeme`, `viewMeme`, `shareMeme`, `bookmarkMeme`, `reportMeme`, `commentMeme`, `deleteMeme` |
| `profile.ts` | 282 | `getProfile`, `updateProfile`, `uploadAvatar`, `deleteAccount` |
| `engagement.ts` | 228 | `markWatched`, `addToWatchlist`, `writeReview` |
| `movies.ts` | 159 | `getMovies` (with search, filter, sort, pagination) |
| `ott-feed.ts` | 115 | `getNewOnOtt` |
| `reports.ts` | 107 | `submitReport`, `getReports` |
| `heroes.ts` | 66 | `getHeroes`, `getHeroBySlug` |
| `moderation.ts` | 65 | `approveSuggestion`, `rejectSuggestion` |
| `follow.ts` | 62 | `followUser`, `unfollowUser` |
| `tmdb.ts` | 25 | `searchTMDB` |

---

## 🚨 9. KNOWN ISSUES & PENDING FIXES

| Issue | Severity | Details |
|---|---|---|
| People categories wrong | 🔴 HIGH | All 9,332 people tagged as `category: "crew"` — original JSON had correct hero/heroine/director categories. Need to re-map from the 28 JSON files. |
| OTT links barely seeded | 🟡 MEDIUM | Only 2 OTT links in DB. Need to run bulk JustWatch sync for all 3,845 movies. |
| Rumors table empty | 🟡 MEDIUM | 0 rows. Original JSON data not re-seeded. |
| Daily/Regional/Chain box office empty | 🟡 MEDIUM | Aggregation tables not populated from raw `realtime_sessions` data. |
| Claude's design changes uncommitted | 🟡 MEDIUM | 9 files modified by Claude (navbar, homepage, globals.css, etc.) — not committed to git. |
| DB can get wiped | 🔴 HIGH | DB was wiped once already. Need automated daily backups. `db_backup.sql` exists (72MB) but may be stale. |
| `prefers-reduced-motion` | 🟢 LOW | Added by Claude in `globals.css` but not tested. |
| Accessibility contrast | 🟢 LOW | 96 low-contrast spots identified in meme-client, tier-list, and auth pages. |

---

## 🗺️ 10. ROADMAP — WHAT'S NEXT

### PHASE 2: Core Movie Engine (MOSTLY DONE)
- [x] TMDB Mass Sync (3,845 movies)
- [x] Movie Browse (Netflix-style rows + search/filter grid)
- [x] Movie Detail Pages (trailer, cast, crew, OTT, engagement)
- [ ] Fix people categories (re-map from original JSON files)
- [ ] Bulk OTT sync (JustWatch for all movies)
- [ ] Movie Diary (Letterboxd-style "Mark as Watched" + Watchlist + Reviews) — schema ready, basic UI done

### PHASE 3: Industry Intelligence
- [x] Box Office tracking infrastructure (19,472 sessions, 5,537 venues)
- [x] Box Office UI (hub, live, advance, track pages)
- [x] Verdict Engine algorithm
- [ ] Daily/Regional/Chain aggregation (run aggregator scripts)
- [ ] BMS Interest Tracking (automated daily snapshots)
- [ ] Re-release tracking (page exists, data needed)

### PHASE 4: Community
- [ ] Fan Zone (threaded discussions, @tagging)
- [ ] Fan Gallery (FDFS photos, fan-edits)
- [ ] Rate Year/Month Generator (viral PNG export)

### PHASE 5: Moderation & Crowdsourcing
- [x] Basic admin moderation dashboard
- [x] Suggestions schema
- [ ] Full "Suggest an Edit" workflow with diff view
- [ ] Contributor points and badges

### MOONSHOT
- [ ] TFIverse Score Algorithm (TMDB + User + Box Office = 100% score)
- [ ] Watch Party System
- [ ] Mobile App (React Native)

---

## 🧑‍💻 11. DEV COMMANDS

```bash
# Start dev server
npm run dev                     # http://localhost:3000

# Database
npm run db:push                 # Push Drizzle schema to PostgreSQL
npm run db:studio               # Open Drizzle Studio GUI

# Sync
npm run sync:data               # Sync from GitHub data-engine
npm run sync:box-office         # Pull BMS/Paytm box office data
npx tsx scripts/sync-tmdb-bulk.ts   # Full TMDB Telugu movie sync
npx tsx scripts/reseed-from-json.ts # Restore movies from JSON backups

# Build
npm run build                   # Production build
npm start                       # Start production server
```

---

## 📁 12. KEY FILE PATHS

```
tfiverse/
├── .env.local                     # ALL secrets (gitignored)
├── src/
│   ├── auth.ts                    # Full NextAuth config (DB + Credentials)
│   ├── auth.config.ts             # Edge-safe auth config (no DB)
│   ├── middleware.ts              # Route protection middleware
│   ├── app/
│   │   ├── (auth)/                # Login, Register, Forgot/Reset, Onboarding
│   │   ├── (main)/                # All public pages (home, movies, icons, etc.)
│   │   ├── (admin)/               # Admin moderation dashboard
│   │   ├── api/                   # NextAuth handler, box-office cron, image proxy
│   │   ├── actions/               # 14 server action files (2,715 lines)
│   │   ├── globals.css            # Design system tokens
│   │   ├── layout.tsx             # Root layout
│   │   └── sitemap.ts             # Dynamic SEO sitemap
│   ├── components/
│   │   ├── home/                  # hero-sequence.tsx, home-client.tsx
│   │   ├── layout/                # navbar.tsx, footer.tsx
│   │   └── memes/                 # meme-client.tsx
│   ├── lib/
│   │   ├── db.ts                  # Drizzle DB connection
│   │   ├── schema/                # 14 schema files (41 tables)
│   │   ├── tmdb.ts                # TMDB API with key rotation
│   │   ├── email.ts               # Zoho → SES → Resend chain
│   │   ├── s3.ts                  # Backblaze B2 pre-signed uploads
│   │   ├── rate-limit.ts          # In-memory rate limiter
│   │   ├── sanitize.ts            # XSS prevention
│   │   ├── verdict-engine.ts      # Hit/Flop algorithm
│   │   ├── storage.ts             # Storage utilities
│   │   ├── platform-brands.ts     # OTT platform branding
│   │   └── scraper/               # BMS, aggregator, Redis, historical
│   ├── data/                      # Legacy JSON files (heroes, memes, rumors, upcoming)
│   └── emails/                    # React Email templates
├── scripts/                       # 30+ sync, migration, and utility scripts
├── data/movies-json/              # 3,716 TMDB movie JSON backups
├── drizzle/                       # Drizzle migration files
└── public/                        # Static assets (videos, images, fonts)
```

---

## 📝 13. CHANGELOG

| Date | What Changed |
|---|---|
| 2026-04-29 | Initial commit. Next.js 15 setup, basic auth flow. |
| 2026-05-03 | Cinematic auth UI, profile system, follow system, Resend email. |
| 2026-05-07 | JSON → PostgreSQL migration. Icons Hub universal engine. |
| 2026-05-10 | Meme portal with B2 uploads, engagement tracking, composite unique constraints. |
| 2026-05-15 | Tier list system with dnd-kit, community feed. |
| 2026-06-01 | Box Office infrastructure: scraper architecture, transport layer, venues export. |
| 2026-06-06 | Box Office UI: split hero, live tracking, Recharts graphs. Comprehensive notes backup. |
| 2026-06-15 | TMDB bulk sync: 3,716 movies + 43,996 credits pulled. JSON backups saved. |
| 2026-07-xx | Movie browse page (Netflix rows + grid), movie detail page, engagement modals. |
| 2026-08-xx | OTT discovery page, upcoming page, admin moderation dashboard. |
| 2026-09-05 | Claude's design v2: navbar overhaul, homepage data layer rewrite, CSS token system. DB reseed from JSON backups after wipe. |
| 2026-09-06 | This master notes document created, consolidating all fragmented docs. |

---

*This is the ONE and ONLY notes file. Update this file for every change. No more scattered docs.*
*Maintained by: TFIverse Owner + AI Dev Assistants (Antigravity / Claude)*
