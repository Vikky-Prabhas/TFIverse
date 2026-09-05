# 🚀 TFIverse - Comprehensive Project Notes & Master Guide
**Generated:** 2026-06-06
**Status:** Pre-Reinstall Backup & Consolidation

This document contains everything about the TFIverse project up to this exact moment. It combines all developer notes, roadmap items, tech stack details, and our recent deep dive into the Box Office & `bfilmy` tracking integration.

---

## 🏗️ 1. Technology Stack
- **Framework:** Next.js 15 (App Router) + Turbopack
- **Database:** PostgreSQL 16 (Local) managed via **Drizzle ORM**
- **Authentication:** Auth.js (NextAuth v5) - Google OAuth & Credentials (Email/Password)
- **Storage:** Backblaze B2 (S3-compatible) with pre-signed URLs for direct secure uploads
- **Styling:** Tailwind CSS + Framer Motion (Glassmorphism & premium UI)
- **Hosting Target:** Single VPS with Nginx, PM2, UFW, Certbot
- **Data Integrations:** TMDB API, Custom Scrapers (BMS, Paytm/District)

---

## ✅ 2. What We Have Done (Completed Milestones)

### Phase 1: Foundation & Migrations
- **Database Migration:** Successfully migrated all static JSON data (`heroes.json`, `memes.json`, `rumors.json`, `upcoming.json`) to PostgreSQL. Used `ON CONFLICT DO UPDATE` for idempotent upserts. Handled UUID mapping and relational integrity.
- **The Icons Hub:** Universal rendering engine for all 19 celebrity categories (Heroes, Heroines, Directors, etc.).
- **User Profiles (The Bento Box):** Premium Apple-style bento grid profiles at `/u/[username]` with follow/unfollow and privacy controls.
- **Security & Auth:** 
  - Google Login, Email/Password, Forgot/Reset password flows.
  - **Mandatory Onboarding:** Edge-safe middleware intercepts users with missing Date of Birth (`hasDOB: false`) and redirects them to onboarding.
  - **Rate Limiting:** Custom in-memory rate limiting for auth routes.
- **Memes Portal:** Upload, like, comment, share, bookmark, report features. Strict composite unique DB constraints to prevent duplicate engagements.
- **Tier List System:** Drag-and-drop S/A/B/C/D/F ranking using TMDB data.

### Phase 2: Box Office Infrastructure (The "Transport Layer" Architecture)
We completely decoupled from the competitor's (`bfilmy`/`assetz`) architecture and built our own fully automated, independent massive scraping engine.
- **The Competitor's Flaw:** They created a new JSON file every single day (e.g., `daily/data/2026-06-15.json`). This balloons the GitHub repository size and makes calculating all-time leaderboards incredibly slow.
- **Our Solution:** We built the `tfiverse-data-engine` repository. It is NOT a database; it is a **Transport Layer**. It uses GitHub Actions to run every 15 minutes and strictly **overwrites** exactly 4 JSON files (`latest_bms_live`, `latest_bms_advance`, `latest_paytm_live`, `latest_paytm_advance`). Our GitHub repository size stays permanently near 0 MB.
- **The "Millions of Rows" Database:** The real 100+ day historical data is permanently stored inside our local **PostgreSQL Database**. 
  - *Example:* When `npm run sync:data` runs, it reads the 4 JSON files and inserts/updates rows into `realtime_sessions`. 
  - We do **NOT** store 1 row per movie. We store 1 row per **Individual Showtime**. If *Salaar* plays in 5,000 theaters today, we create 5,000 separate rows for Salaar today (`[Salaar, INOX Hyd, 9:00 AM, 60 tickets]`). Over a 20-day run, Salaar might generate 100,000 rows.
  - If we track 1,000 movies, our database will hold **10+ Million rows**. This is exactly how companies like Zomato/Uber work. By using **Indexes**, PostgreSQL instantly adds up millions of rows to calculate total revenues in 0.005 seconds.
- **Intra-Day "UPSERT" Magic:** When the scraper runs 96 times a day (every 15 mins), it does NOT blindly add numbers together. It uses `UPSERT` to *update* the exact showtime row from 50 tickets to 60 tickets. Every hour, it takes a "snapshot" of the total revenue and saves it to `hourly_trending_logs` to draw our line graphs.
- **Massive Master Venues List:** We exported 5,537 venues (3,379 BMS + 2,158 Paytm) directly from our DB and committed them as `bms_venues_master.json` into the engine, completely bypassing the competitor's limited 445-venue test list.

### Phase 3: The Box Office Dashboards
- We successfully pulled 10,600+ rows into the PostgreSQL database.
- Created dedicated portals for **Live Tracking** (`/box-office/live`) and **Advance Sales** (`/box-office/advance`).
- Redesigned the main `/box-office` page to feature massive, interactive glassmorphism portals connecting to the respective views.

---

## 🛑 3. Where We Left Off (The Ultimate Redesign & Final Decoupling)
We have fully automated the data engine and successfully synced the massive datasets into the PostgreSQL database. 

**Pending Tasks:**
1. **The Ultimate UI Redesign:** We need to execute the massive Glassmorphism redesign for the Box Office Hub, converting it from a basic layout into a premium, interactive "split hero" bento-box dashboard.
2. **Severing the Cloudflare Worker:** In `paytm.ts`, we are still using `districtvenues.text2026mail.workers.dev` to bypass Cloudflare. We need to either proxy it through our own 10 Cloudflare IPs, or write our own Worker script to query `api.district.in` directly.

---

## 📋 4. Pending Features & Release To-Do List

### Core Movie Engine (Next Up)
- [ ] **TMDB Mass Sync:** Ingest 6000+ Telugu films from TMDB and sync credits to link movies with our "Icons" database.
- [ ] **OTT Discovery Engine:** Integrate JustWatch logic to show real-time "Where to Watch" links.
- [ ] **The Movie Diary:** Letterboxd-style "Mark as Watched", "Watchlist", and write user reviews.

### Box Office (Completing the Loop)
- [ ] **Box Office Dashboard Redesign:** Visualizing the `realtime_sessions` and `hourly_trending_logs` via the new Glassmorphism UI.
- [ ] **Automated Verdicts:** Algorithm to calculate Hit/Flop/Blockbuster based on gross vs budget.

### Community & Growth
- [ ] **"Suggest an Edit" Moderation:** GitHub-style edits for movie data, with an Admin approval dashboard.
- [ ] **Fan Zone:** Twitter-style threaded discussions and @tagging.
- [ ] **Rate Year/Month Generator:** Viral PNG export for users to share their movie ratings on social media.
