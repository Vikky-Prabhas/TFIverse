# Box Office System

## Overview
The Box Office System is a core, data-driven feature of TFiverse, providing a real-time, highly reliable, and aesthetically premium tracking experience for Telugu cinema. It tracks box-office collections, ticket sales, theatre occupancies, and booking velocities across India and Overseas markets.

## Core Design Principles
1. **Trust and Accuracy Over Speed:** We never present estimated or unverified data as final. If data is unavailable, we explicitly state "Data Unavailable" or "UNKNOWN".
2. **Data States:** Every metric presented in the UI adheres to a strict data state:
    - **LIVE:** Real-time data pulling straight from the ticketing APIs.
    - **RECENT:** Data aggregated within the last 12 hours.
    - **ESTIMATED:** Projections or unverified trade figures (UI explicitly marks these with an asterisk).
    - **FINAL:** Producer-confirmed or heavily vetted final lifetime collections.
    - **UNKNOWN:** When no reliable data source exists.
3. **Performance First:** The system is built for scale (100,000+ users). All public-facing box office pages rely on ISR (Incremental Static Regeneration) and heavily cached API routes. We do not query the database on every page load.
4. **Cinematic UX:** Data should be beautiful. The UI utilizes strict visual hierarchies, progressive disclosure for complex tables, and high-performance charts to convey velocity and trends.

## System Architecture

### 1. Data Ingestion (The Transport Layer)
Raw ticketing data is ingested asynchronously from the `tfiverse-data-engine` GitHub repository via background cron jobs (running every hour). This ensures the TFiverse PostgreSQL database is isolated from scraping infrastructure and rate-limiting blocks.

### 2. Aggregation Layer
The raw `realtime_sessions` are processed locally by aggregation scripts (`aggregate-hourly.ts`) to produce:
- **Daily Aggregates (`daily_box_office`):** Mega stats for the day (Gross, Nett, Tickets, Occ %).
- **Regional Aggregates (`regional_box_office`):** Deep breakdown by State and City.
- **Chain Aggregates (`chain_box_office`):** Breakdown by multiplex chains (PVR, INOX, etc.).
- **Velocity Trends (`hourly_trending_logs`):** Time-series data powering the Ticket Velocity charts.

### 3. Presentation Layer
The Box Office UI uses a Hub-and-Spoke model:
- `/box-office` (The Hub: Overarching metrics, today's top movies, trending theatres)
- `/box-office/live` (Live Pulse: Real-time active tracking)
- `/box-office/advance` (Pre-Sales: Booking velocity and upcoming hype)
- `/box-office/overseas` (Global Market Tracking)
- `/box-office/rankings` (Historical Data)
- `/box-office/track/[id]` (The dedicated Movie War Room)

## Core Entities
The Box Office module connects directly to existing TFiverse schema models:
- **Movie:** (`movies`) The central entity.
- **Theatre/Venue:** Indexed uniquely by string names and city.
- **Territory:** A virtual mapping connecting Cities/States to official industry territories (Nizam, Ceded, Andhra).

*For a detailed breakdown of where our data comes from, see [Data Sources](./box-office-data-sources.md).*
*For the mathematical logic behind verdicts, see [Verdict Engine](./box-office-verdict.md).*
