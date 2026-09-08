# Box Office Schema Architecture

The TFiverse box office database uses PostgreSQL (via Drizzle ORM). It is highly normalized to safely process millions of raw seating rows without impacting the frontend UI.

## 1. Raw Ingestion Layer
### `realtime_sessions`
- **Purpose**: Holds the raw physical session data scraped directly from ticketing platforms.
- **Conflict Key**: `(movieId, sessionId)`
- **Lifecycle**: Highly mutable. If a showing is booked in advance on Tuesday, the scraper sets `sessionId=123`. On Friday (when Live), the scraper reads the same `sessionId=123` and OVERWRITES the previous row via `ON CONFLICT DO UPDATE`.
- **Note**: You cannot query advance velocity from this table.

## 2. Immutable History Layer
### `city_booking_snapshots`
- **Purpose**: Preserves advance booking momentum. Because `realtime_sessions` intentionally overwrites itself when Live, the sync script must aggregate and save advance history into this table first.
- **Granularity**: Aggregated to the `City` level to save space.
- **Conflict Key**: `(movieId, city, showDate, snapshotTimestamp)`
- **Timezone**: `snapshotTimestamp` is stored with timezone (`timestamptz`), universally enforced as UTC during cron execution.

## 3. Aggregation Layer
The frontend reads exclusively from these tables, populated by `aggregate-hourly.ts`.

### `daily_box_office`
- **Purpose**: Total metrics grouped by `movieId` and `date`.
- **Fields**: `gross`, `nett`, `ticketsSold`, `occupancy`, `atp`, `shows`, `ffCount`, `hfCount`.

### `regional_box_office`
- **Purpose**: Breakdown by `state`, `city`, and mapped `territory_enum`.

### `chain_box_office`
- **Purpose**: Breakdown by national chains (PVR, INOX).

## 4. Financial Verdict Layer
### `movie_financials`
- **Purpose**: Holds the manual, official inputs for the business logic.
- **Fields**: `productionBudget`, `theatricalRights`, `worldwideShare`, `distributorShare`.
- **Lifecycle**: Inputs are manual (`REPORTED` or `ESTIMATED`).

## 5. Trust Modifiers
Every aggregated row contains two crucial fields:
- `data_state`: enum (`LIVE`, `RECENT`, `ESTIMATED`, `REPORTED`, `FINAL`, `UNKNOWN`).
- `data_source`: varchar (`BMS`, `PAYTM`, `SCRAPER`, `RENTRAK`).
