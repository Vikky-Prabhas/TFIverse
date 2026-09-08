# Box Office API & Performance Architecture

## Philosophy
The Box Office UI is expected to handle massive traffic spikes (e.g., 10,000+ concurrent users on a major release day). The database must be shielded from client-side direct queries. All data delivery must be aggressively cached while remaining mathematically fresh.

## 1. Next.js Server Actions & Caching

TFiverse utilizes Next.js Server Actions and `unstable_cache` with strict cache revalidation rules.

### Data Access Contracts
The Data Access layer explicitly isolates raw Drizzle ORM rows from the React UI. All data is normalized into strict TypeScript contracts (`TodayPulseContract`, `TopMovieContract`, etc.).

#### `getTodayPulse()`
- **Purpose:** Fetches mega aggregates (total gross, shows, top movie) for the `/box-office` Hub.
- **Caching:** Uses `unstable_cache` with a `revalidate` time of **60 seconds**.
- **Data Source:** `daily_box_office`.
- **Null Handling:** Missing data returns `null`, not fake zeroes.

#### `getTopMovies(limit)`
- **Purpose:** Fetches the top N ranked movies today.
- **Caching:** `revalidate: 60`.
- **Data Source:** `daily_box_office` inner joined with `movies`.
- **Performance:** Eliminates N+1 queries by selecting only required columns.

#### `getAdvanceBookingPreview()`
- **Purpose:** Fetches velocity and snapshots for future dates.
- **Caching:** `revalidate: 300` (5 minutes).
- **Data Source:** `city_booking_snapshots`.

### Normalization & Calculation Rules
- **Occupancy:** `ticketsSold / capacity`. Handled purely in utility functions. Never calculated if capacity is 0 or null.
- **Trend:** Returns `null` if previous data is `0` (prevents Infinity percentages).
- **Data States:** Explicitly cast via `normalizeDataState()` to guarantee one of `LIVE`, `RECENT`, `ESTIMATED`, `REPORTED`, `FINAL`, `UNKNOWN`.

## 2. Internal API Routes (Data Ingestion)

Data is written to the database via secure internal API routes, triggered by the `tfiverse-data-engine` GitHub Actions cron jobs.

### `POST /api/internal/box-office/sync`
- **Authentication:** Requires a Bearer token matching `process.env.CRON_SECRET`.
- **Payload:** Accepts massive JSON arrays of tracked theatre sessions.
- **Database Operation:** Utilizes PostgreSQL `INSERT ... ON CONFLICT DO UPDATE` (Upsert). This guarantees idempotency. If a job fails and retries, duplicate data is never created.

## 3. Rate Limiting and Security
- **Client Side:** No raw box office data APIs are exposed to the client. All data is pre-rendered via Server Components.
- **Server Side:** The `sync` API is protected by IP whitelisting (allowing only GitHub Actions IP ranges) and the strict CRON secret.
