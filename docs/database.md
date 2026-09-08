# TFiverse Database Schema

## Core Principles
- Strict relational integrity using Drizzle ORM.
- All aggregations are done asynchronously, not dynamically on user request.

## Box Office Schema Expansion
The Box Office subsystem introduces the following isolated tables which strictly `CASCADE` delete if a `movieId` is removed from the core `movies` table:

1. **`realtime_sessions`**: The raw transport layer. Millions of rows of individual theatre showtimes.
2. **`hourly_trending_logs`**: Time-series data storing ticket sales velocity per hour.
3. **`daily_box_office`**: Mega aggregates (Gross, tickets sold) partitioned by `date`.
4. **`regional_box_office`**: Aggregates grouped by `state` and `city`.
5. **`chain_box_office`**: Aggregates grouped by theatre chains (PVR, INOX).

### Future Schema Upgrades
Based on the V2 Architecture Plan, we will be expanding the `movies` table to include:
- `theatrical_share` (Real)
- `break_even_target` (Real)
- `pre_release_business` (Real)
*These fields will power the deterministic Verdict Engine.*
