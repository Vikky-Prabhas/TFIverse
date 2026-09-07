# TFIverse Box Office Data Engine - Master Architecture

This document serves as the final, consolidated architecture blueprint for the TFIverse Box Office Data Engine, replacing all previous audit reports, phase plans, and bfilmy research documents.

## The Final Working Method (How It Works)
We have completely replaced `bfilmy`'s messy, overlapping workflows with a single, indestructible, 100% automated pipeline.

### Step 1: The Trigger
* **System:** GitHub Actions (`scraper_pipeline.yml`)
* **Schedule:** Exactly 24 times a day (Top of every hour: `0 * * * *`)
* **Cost:** $0.00 (GitHub Free Tier)

### Step 2: The Extraction (bms_async.py)
* **Execution:** GitHub Actions spins up **9 parallel workers** (Shards Matrix) simultaneously.
* **Bypass Mechanism:** Uses the Python `cloudscraper` library. This completely fakes a Chrome browser handshake, bypassing Cloudflare's WAF natively without needing any external Cloudflare Worker proxies or rotating IPs.
* **Simultaneous Scraping:** The script hits a venue and grabs the **LIVE** data (Today). While the connection is still warm, it instantly grabs the **ADVANCE** data (Tomorrow) for the exact same venue. This cuts network requests in half and prevents rate limiting.
* **Data Enrichment:** Unlike `bfilmy`, our engine dynamically injects:
  - `movieId`
  - `lat` (Latitude)
  - `lng` (Longitude)
  - `chain` (e.g., PVR, INOX)

### Step 3: The Aggregation (aggregate.py)
* Once the 9 Shards finish, the aggregator merges the JSON outputs into two clean, deduplicated files:
  - `latest_bms_data.json`
  - `latest_bms_advance_data.json`
* These files are committed back to the GitHub repository as a temporary visual reference.

### Step 4: Turso Database Synchronization (sync_to_turso.py)
* The pipeline immediately executes `sync_to_turso.py`.
* It uses the Turso HTTP `/v2/pipeline` API (avoiding heavy SQL driver dependencies).
* It performs three safe `UPSERT` operations:
  1. **Movies Table:** Inserts new movies, updates existing ones.
  2. **Venues Table:** Inserts new theaters with their GPS coordinates.
  3. **Box Office Sessions Table:** Inserts/Updates the exact showtimes, `totalSeats`, `soldSeats`, and `grossRevenue`. It never deletes old shows; it retains history perfectly.

### Step 5: Backblaze B2 Raw Backup (backup_to_b2.py)
* To ensure we never lose raw historical data, the pipeline uses `boto3` to connect to the Backblaze B2 S3 API (`s3.us-west-004.backblazeb2.com`).
* It uploads a timestamped copy of the raw JSON files (e.g., `bms_live_2026-09-07_1400.json`) to the `tfiverse-backups` bucket.

---

## Historical Context & Why We Abandoned `bfilmy` Architecture
* **The "Market Strip" Obsession:** `bfilmy` used Python scripts to calculate top 5 movies for a marquee strip. We abandoned this because Turso SQL allows the Next.js UI to generate this instantly via `SELECT ... ORDER BY gross_revenue DESC LIMIT 5`.
* **GitHub Bloat Loophole:** `bfilmy` merged massive JSON files into Git daily, hitting the 1GB repository limit. By using Turso as our historical storage and B2 for backups, our GitHub repo stays feather-light.
* **Overlapping Cron Jobs:** `bfilmy` had 15+ messy, hardcoded workflows for specific release dates. Our engine is fully dynamic, requiring only ONE file.

## Phase 3: Moving to UI
With the Data Engine complete, the next phase is to build the TFIverse Glassmorphic Next.js Dashboard. The UI will query the Turso database directly to render heatmaps, state-wise box office filtering, and real-time occupancy meters.
