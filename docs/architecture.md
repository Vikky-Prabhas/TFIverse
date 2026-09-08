# TFiverse Architecture

## Core Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL (via Neon / Supabase)
- **ORM:** Drizzle ORM
- **Styling:** Tailwind CSS + Framer Motion
- **Caching Strategy:** Next.js ISR & `unstable_cache`

## Box Office Module Integration
The Box Office module acts as an isolated, highly-scalable subsystem within TFiverse. 
- **Decoupled Ingestion:** Scraping and ticketing APIs do NOT touch the main TFiverse application directly. They run via isolated GitHub Action workers (`tfiverse-data-engine`) and push aggregated data directly into the DB.
- **Server-Side Rendering:** To handle massive traffic spikes (10k+ concurrents), all Box Office pages rely purely on cached Server Components. Client-side fetching is strictly forbidden for primary metrics to prevent DB locking.
- **Related Entities:** The box office module strictly references the existing `movies` schema, and introduces a flexible `Territory` mapping layer (Nizam, Ceded, etc.) to bridge raw geographic data (Cities) into industry-standard regions.

*See `/docs/features/box-office.md` for deep dive.*
