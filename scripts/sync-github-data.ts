import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { db } from '../src/lib/db';
import { movies, realtimeSessions } from '../src/lib/schema';
import { eq, sql } from 'drizzle-orm';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/TFIverse/tfiverse-data-engine/main/data/';

async function syncFile(filename: string) {
  console.log(`Syncing ${filename} from GitHub...`);
  try {
    const url = `${GITHUB_RAW_BASE}${filename}`;
    const response = await fetch(url);
    if (!response.ok) {
        if (response.status === 404) {
            console.log(`⚠️ File ${filename} not found on GitHub yet. Skipping.`);
            return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data || data.length === 0) return;

    // Load all movies from DB to map titles to IDs
    const allMovies = await db.select().from(movies);
    const movieMap = new Map(allMovies.map((m) => [m.title.toLowerCase().replace(/[^a-z0-9]/g, ''), m.id]));

    const sessionsToInsert = [];

    for (const item of data) {
      const cleanTitle = item.rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
      const movieId = movieMap.get(cleanTitle);

      if (!movieId) {
        // console.warn(`Movie not found in DB for tracking data: ${item.rawTitle}`);
        continue; // Skip if movie is not in DB
      }

      sessionsToInsert.push({
        movieId: movieId,
        sessionId: item.sessionId,
        venueName: item.venue || 'Unknown',
        chainName: item.chain || null,
        city: item.city || 'Unknown',
        state: item.state || null,
        showDate: new Date(item.time.split(' ')[0]),
        showTime: item.time.split(' ')[1] + ' ' + item.time.split(' ')[2],
        audi: item.audi || null,
        totalSeats: item.totalSeats,
        availableSeats: item.availableSeats,
        soldSeats: item.soldSeats,
        grossRevenue: item.grossRevenue,
        source: item.source,
      });
    }

    if (sessionsToInsert.length === 0) {
      console.log(`No valid sessions found mapped to existing movies for ${filename}`);
      return;
    }

    // Process inserts in chunks to avoid blowing up memory/params limit
    const CHUNK_SIZE = 1000;
    for (let i = 0; i < sessionsToInsert.length; i += CHUNK_SIZE) {
      const chunk = sessionsToInsert.slice(i, i + CHUNK_SIZE);
      await db.insert(realtimeSessions).values(chunk).onConflictDoUpdate({
        target: [realtimeSessions.movieId, realtimeSessions.sessionId],
        set: {
          availableSeats: sql`EXCLUDED.available_seats`,
          soldSeats: sql`EXCLUDED.sold_seats`,
          grossRevenue: sql`EXCLUDED.gross_revenue`,
          lastUpdated: sql`CURRENT_TIMESTAMP`,
        }
      });
    }

    console.log(`✅ Upserted ${sessionsToInsert.length} records into Postgres from ${filename}`);

  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      console.log(`⚠️ File ${filename} not found on GitHub yet. Skipping.`);
    } else {
      console.error(`❌ Failed to sync ${filename}:`, err.message);
    }
  }
}

async function main() {
  console.log("🚀 Starting TFIverse Database Sync...");
  
  // Try the old naming just in case the new cron hasn't run yet
  await syncFile('latest_bms_data.json');
  await syncFile('latest_paytm_data.json');

  // Try the new correct dynamic naming
  await syncFile('latest_bms_live_data.json');
  await syncFile('latest_bms_advance_data.json');
  await syncFile('latest_paytm_live_data.json');
  await syncFile('latest_paytm_advance_data.json');
  
  console.log('✅ Local PostgreSQL Sync Complete. Ready for UI!');
  process.exit(0);
}

main();
