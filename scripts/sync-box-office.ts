import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { db } from '../src/lib/db';
import { movies } from '../src/lib/schema/content';
import { realtimeSessions, hourlyTrendingLogs } from '../src/lib/schema/tracking';
import { eq, or, sql } from 'drizzle-orm';

const MOVIES_DATA_URL = 'https://raw.githubusercontent.com/TFIverse/tfiverse-data-engine/main/data/movies.json';
const BMS_DATA_URL = 'https://raw.githubusercontent.com/TFIverse/tfiverse-data-engine/main/data/latest_bms_data.json';
const PAYTM_DATA_URL = 'https://raw.githubusercontent.com/TFIverse/tfiverse-data-engine/main/data/latest_paytm_data.json';

function cleanMovieTitle(title: string): string {
    return title.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
}

import * as fs from 'fs';

async function fetchJSON(url: string) {
    try {
        if (url.startsWith('file://')) {
            const filePath = url.replace('file://', '');
            if (fs.existsSync(filePath)) {
                return JSON.parse(fs.readFileSync(filePath, 'utf8'));
            }
        } else {
            const res = await fetch(url);
            if (res.ok) return await res.json();
        }
    } catch (e) {
        console.error(`Failed to fetch ${url}`, e);
    }
    return [];
}

async function syncBoxOfficeData() {
    console.log("🔄 Starting Box Office Sync Engine...");

    // 1. Sync Movies First (Discovery Engine)
    console.log("📥 Pulling Dynamic Movies List...");
    const moviesData = await fetchJSON(MOVIES_DATA_URL);
    let moviesAdded = 0;
    
    if (moviesData.length > 0) {
        for (const m of moviesData) {
            try {
                await db.insert(movies).values({
                    tmdbId: m.tmdbId,
                    title: m.title,
                    slug: m.slug,
                    overview: m.overview,
                    releaseDate: new Date(m.releaseDate),
                    year: m.year,
                    posterUrl: m.posterUrl,
                    backdropUrl: m.backdropUrl,
                    metadata: m.metadata
                }).onConflictDoNothing({ target: movies.slug });
                moviesAdded++;
            } catch(e) {}
        }
        console.log(`✅ Synced ${moviesData.length} movies to local Database.`);
    }

    // 2. Fetch Sessions
    console.log("📥 Pulling latest scraping data from GitHub...");
    const bmsSessions = await fetchJSON(BMS_DATA_URL);
    const paytmSessions = await fetchJSON(PAYTM_DATA_URL);

    console.log(`✅ Fetched ${bmsSessions.length} BMS sessions and ${paytmSessions.length} Paytm sessions.`);

    if (bmsSessions.length === 0 && paytmSessions.length === 0) {
        console.log("⚠️ No new data to sync. Exiting.");
        process.exit(0);
    }

    // 3. Apply Deduplication (Primary Source Hierarchy)
    console.log("🧹 Applying deduplication engine...");
    const finalSessions: any[] = [];
    const bmsVenueCache = new Set<string>();

    for (const session of bmsSessions) {
        const venueKey = `${session.venue.toLowerCase()}_${session.city.toLowerCase()}_${session.time}`;
        bmsVenueCache.add(venueKey);
        finalSessions.push(session);
    }

    let skippedPaytmCount = 0;
    for (const session of paytmSessions) {
        const venueKey = `${session.venue.toLowerCase()}_${session.city.toLowerCase()}_${session.time}`;
        if (bmsVenueCache.has(venueKey)) {
            skippedPaytmCount++;
            continue;
        }
        finalSessions.push(session);
    }

    console.log(`✅ Deduplication complete. Discarded ${skippedPaytmCount} overlapping Paytm sessions.`);

    // 4. Upsert into PostgreSQL
    console.log("💾 Upserting sessions into Local PostgreSQL Database...");
    
    // Cache ALL active movies for quick ID lookup
    console.log("🔍 Running Auto-Discovery for missing movies...");
    const dbMovies = await db.select().from(movies);
    const missingMoviesMap = new Map<string, string>();
    
    for (const session of finalSessions) {
        const title = cleanMovieTitle(session.rawTitle);
        const match = dbMovies.find(m => m.title.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase().includes(m.title.toLowerCase()));
        if (!match) {
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            if (!missingMoviesMap.has(slug)) {
                missingMoviesMap.set(slug, title);
            }
        }
    }
    
    if (missingMoviesMap.size > 0) {
        console.log(`🆕 Found ${missingMoviesMap.size} untracked movies! Adding them dynamically...`);
        for (const [slug, title] of missingMoviesMap.entries()) {
            try {
                await db.insert(movies).values({
                    title: title,
                    slug: slug,
                    releaseDate: new Date(),
                    year: new Date().getFullYear(),
                }).onConflictDoNothing();
            } catch(e) { }
        }
        // Refresh dbMovies with the newly added ones
        const newDbMovies = await db.select().from(movies);
        dbMovies.length = 0;
        dbMovies.push(...newDbMovies);
    }

    let successCount = 0;
    const chunkSize = 1000;
    
    // Prepare rows with real Movie IDs
    const validRowsMap = new Map<string, any>();
    
    finalSessions.forEach(session => {
        const dbMovie = dbMovies.find(m => m.title.toLowerCase().includes(cleanMovieTitle(session.rawTitle).toLowerCase()) || session.rawTitle.toLowerCase().includes(m.title.toLowerCase()));
        if (!dbMovie) return;
        
        // Ensure showDate is purely the date part to help UI grouping
        const datePart = session.time.split(' ')[0]; // Extract YYYY-MM-DD
        const fullDate = new Date(datePart);
        const uniqueKey = `${dbMovie.id}_${session.sessionId}`;
        
        validRowsMap.set(uniqueKey, {
            movieId: dbMovie.id,
            sessionId: session.sessionId,
            venueName: session.venue,
            chainName: session.chain,
            city: session.city,
            state: session.state,
            showDate: fullDate, // Advance booking date at 00:00:00 UTC
            showTime: session.time, // Full ISO time
            audi: session.audi,
            totalSeats: session.totalSeats,
            availableSeats: session.availableSeats,
            soldSeats: session.soldSeats,
            grossRevenue: session.grossRevenue,
            source: session.source,
            lastUpdated: new Date()
        });
    });
    
    const validRows = Array.from(validRowsMap.values());

    // Drizzle Batch Upsert
    for (let i = 0; i < validRows.length; i += chunkSize) {
        const chunk = validRows.slice(i, i + chunkSize);
        try {
            await db.insert(realtimeSessions).values(chunk).onConflictDoUpdate({
                target: [realtimeSessions.movieId, realtimeSessions.sessionId],
                set: {
                    availableSeats: sql`EXCLUDED.available_seats`,
                    soldSeats: sql`EXCLUDED.sold_seats`,
                    grossRevenue: sql`EXCLUDED.gross_revenue`,
                    lastUpdated: new Date(),
                }
            });
            successCount += chunk.length;
        } catch (err) {
            console.error(`❌ Batch insert failed:`, err);
        }
    }

    console.log(`🎉 Successfully synchronized ${successCount} live sessions across 5 days to the database!`);

    // 5. Hourly Trending Logs Snapshot
    console.log('📊 Generating hourly trending logs...');
    const nowHour = new Date();
    nowHour.setMinutes(0, 0, 0);

    const uniqueMovieIds = Array.from(new Set(validRows.map(s => s?.movieId)));
    
    for (const mId of uniqueMovieIds) {
      if (!mId) continue;
      const aggregated = await db
        .select({
          sold: sql`SUM(${realtimeSessions.soldSeats})`.mapWith(Number),
          gross: sql`SUM(${realtimeSessions.grossRevenue})`.mapWith(Number),
          shows: sql`COUNT(${realtimeSessions.id})`.mapWith(Number),
          totalSeats: sql`SUM(${realtimeSessions.totalSeats})`.mapWith(Number),
        })
        .from(realtimeSessions)
        .where(eq(realtimeSessions.movieId, mId));

      if (aggregated.length > 0 && aggregated[0].shows > 0) {
        const stat = aggregated[0];
        const occupancy = stat.totalSeats > 0 ? (stat.sold / stat.totalSeats) * 100 : 0;
        
        try {
          await db
            .insert(hourlyTrendingLogs)
            .values({
              movieId: mId,
              timestamp: nowHour,
              soldTickets: stat.sold,
              grossRevenue: stat.gross,
              showsCount: stat.shows,
              averageOccupancy: Number(occupancy.toFixed(2)),
            })
            .onConflictDoUpdate({
              target: [hourlyTrendingLogs.movieId, hourlyTrendingLogs.timestamp],
              set: {
                soldTickets: stat.sold,
                grossRevenue: stat.gross,
                showsCount: stat.shows,
                averageOccupancy: Number(occupancy.toFixed(2)),
              }
            });
        } catch (err) {
          console.error(`❌ Failed to write hourly trending log for movie ID ${mId}:`, err);
        }
      }
    }

    console.log(`✅ Sync Completed!`);
    process.exit(0);
}

syncBoxOfficeData().catch(console.error);
