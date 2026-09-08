# Box Office Data Sources & Integrity

## Philosophy
Every number displayed in the TFiverse Box Office system must have a verifiable origin. We do not invent numbers, and we do not present "estimated trade guesses" as hard facts without clear labeling.

## 1. Primary Data Sources

### Theatrical Ticketing Data (The Data Engine)
- **Source:** Raw, real-time scraping of public ticketing platforms (e.g., BookMyShow, Paytm Movies) operated via the isolated `tfiverse-data-engine` GitHub Actions repository.
- **Data Points:** Total Seats, Available Seats, Sold Seats, Gross Revenue, Showtime, Venue, City.
- **Refresh Frequency:** Every 60 minutes during active tracking cycles.
- **Reliability:** High (Primary Source). This is mathematically accurate for tracked shows, but it is **not exhaustive** (it does not account for offline counter sales or untracked single screens).
- **Fallback:** If the engine fails, data defaults to the last successfully synced state. The UI will prominently display `LAST UPDATED: [Time]`.

### TMDB (The Movie Database)
- **Source:** Direct API integration (`api.themoviedb.org`).
- **Data Points:** Movie metadata, posters, backdrops, release dates, cast/crew, genres.
- **Refresh Frequency:** On-demand caching (Revalidated every 24 hours).
- **Reliability:** High.
- **Attribution:** TMDB API terms of service require standard attribution. We display the TMDB logo or text link discreetly in footers or modal credits.

## 2. Secondary Data Sources (Financials)

### Pre-Release Business & Theatrical Share
- **Source:** Vetted Telugu trade analyst reports and official distributor press releases.
- **Data Points:** Budget, Break-even Target, Pre-release Business (Nizam, Ceded, Andhra).
- **Reliability:** Moderate to High.
- **Policy:** This data is strictly manually entered by authorized TFiverse administrators. It is never scraped automatically to avoid hallucinated rumors. If unknown, the system displays `UNKNOWN`.

### Overseas Market Data
- **Source:** Rentrak / Comscore API (Future Integration) and distributor official tweets.
- **Data Points:** USA Premieres Gross, UK Collections, Aus Gross.
- **Reliability:** High (when sourced from Comscore/Rentrak).
- **Policy:** Official Rentrak numbers are labeled `REPORTED`. Trade estimates are labeled `ESTIMATED`.

## 3. Data States in the UI

Every metric rendered in the frontend relies on a `data_state` flag to ensure user trust:

| State | Definition | UI Treatment |
|-------|------------|--------------|
| `LIVE` | Actively tracking in real-time today. | Red pulsing dot, `LIVE` badge. |
| `RECENT` | Show finished, data aggregated within 12h. | Standard display, timestamped. |
| `ESTIMATED` | Unverified trade projections or incomplete tracking. | Subtle asterisk `*`, grayed text `(Est.)`. |
| `REPORTED` | Official numbers from distributors (e.g., Rentrak). | Standard verified display. |
| `FINAL` | Lifetime collections locked. | Golden/Green `FINAL` badge on Rankings page. |
| `UNKNOWN` | No reliable data available. | Displayed as `N/A` or `---` instead of 0. |

## 4. Caching Strategy
- **Raw Data Ingestion:** Stored durably in PostgreSQL.
- **API Endpoints:** Wrapped in Next.js caching.
- **Frontend Pages:** `getBoxOfficeHubData` uses `revalidate: 60` (1 minute). This ensures that even with 10,000 concurrent users hitting `/box-office/live`, the database is queried at most once per minute, serving the cached HTML to all subsequent users.
