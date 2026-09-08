# Box Office Data Pipeline

This document explains the canonical data ingestion and transformation architecture for the TFiverse Box Office system. 

## The Pull-Based Architecture

We intentionally avoid a push-based API ingestion layer. Instead, the architecture relies on a decoupled **pull-based** pipeline.

### 1. Data Engine (Scraper)
- The external `tfiverse-data-engine` repository runs on GitHub Actions.
- It scrapes ticketing APIs (BMS, Paytm) and outputs raw data as static JSON files.
- The 4 core transport files are:
  - `latest_bms_live_data.json`
  - `latest_paytm_live_data.json`
  - `latest_bms_advance_data.json`
  - `latest_paytm_advance_data.json`

### 2. Ingestion (`sync-box-office.ts`)
The core ingestion script is `npm run sync:data` (which wraps `scripts/sync-box-office.ts`).
1. **Fetch**: It fetches the transport JSON files directly from GitHub.
2. **Advance Snapshots**: It aggregates the Advance JSON files by City + Movie + Date. Since live data overwrites advance data later, we safely store historical advance momentum in `city_booking_snapshots`. The `snapshotTimestamp` is strictly set to the execution time of the cron job (in UTC).
3. **Deduplication**: It creates a composite key (`venue_city_time`) and drops Paytm sessions if they already exist in BMS, preventing double-counting of the same physical seat inventory.
4. **Live Upserts**: The deduplicated Live and Advance sessions are UPSERTED into `realtimeSessions`. The conflict key is `(movieId, sessionId)`. 

> [!WARNING]
> Because `sessionId` is preserved between advance booking days and live showing days, a LIVE session will intentionally OVERWRITE the same ADVANCE session in `realtimeSessions`. This is why Step 2 (Advance Snapshots) is critical.

### 3. Aggregation (`aggregate-hourly.ts`)
Because running heavy `SUM()` and `COUNT()` queries across millions of seats is too slow for Next.js Server Components, we pre-aggregate the data:
- Reads `realtimeSessions` and aggregates the metrics.
- Uses `mapCityToTerritory()` to determine `territoryEnum` safely. If a city/state combination is unknown, it defaults safely to `UNKNOWN`.
- Sets explicit `dataState` (e.g. `LIVE`) and `dataSource` (e.g. `SCRAPER`).
- Upserts the aggregated metrics into `daily_box_office`, `regional_box_office`, and `chain_box_office`.

### 4. Data Access Layer (UI)
- The Next.js `/box-office` Hub only queries the pre-aggregated `daily_box_office`, `regional_box_office`, and `city_booking_snapshots` tables.
- It never touches `realtimeSessions` for standard analytics.
- Caching is managed via standard Next.js `revalidate` rules.
