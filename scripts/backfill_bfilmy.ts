import { db } from '../src/lib/db';
import { realtimeSessions } from '../src/lib/schema/tracking';
import { movies } from '../src/lib/schema/content';
import { eq, sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

const ASSETZ_DIR = '/home/pepper-salt/.gemini/antigravity-ide/scratch/assetz/daily/data';

async function main() {
    console.log("Starting BFilmy Historical Data Backfill...");

    // Find Mirzapur Movie ID
    const [mirzapur] = await db.select().from(movies).where(sql`title LIKE '%Mirzapur%'`);
    if (!mirzapur) {
        console.error("Mirzapur movie not found in database.");
        return;
    }
    console.log(`Found Mirzapur Movie ID: ${mirzapur.id}`);

    const targetDateStr = '20260908'; // We only process days BEFORE this

    const dirs = fs.readdirSync(ASSETZ_DIR);
    
    let totalInserted = 0;

    for (const dir of dirs) {
        // Only process directories that look like YYYYMMDD and are strictly BEFORE targetDateStr
        if (/^\d{8}$/.test(dir) && dir < targetDateStr) {
            const finalDetailedPath = path.join(ASSETZ_DIR, dir, 'finaldetailed.json');
            
            if (!fs.existsSync(finalDetailedPath)) {
                console.log(`No finaldetailed.json in ${dir}, skipping.`);
                continue;
            }

            console.log(`Processing date directory: ${dir}...`);
            const rawData = fs.readFileSync(finalDetailedPath, 'utf8');
            let jsonData;
            try {
                jsonData = JSON.parse(rawData);
            } catch(e) {
                console.error(`Failed to parse ${finalDetailedPath}`);
                continue;
            }

            const dataArray = jsonData.data || [];
            
            // Extract YYYY-MM-DD from YYYYMMDD
            const showDateStr = `${dir.substring(0, 4)}-${dir.substring(4, 6)}-${dir.substring(6, 8)}`;
            const showDate = new Date(`${showDateStr}T00:00:00Z`);

            const toInsert = [];

            for (const item of dataArray) {
                if (item.movie && item.movie.includes('Mirzapur')) {
                    // Check if 'shows' exists, if not, it means the item ITSELF is the show data!
                    // My previous python test showed that `item` doesn't have 'shows', but has the granular fields directly!
                    toInsert.push({
                        movieId: mirzapur.id,
                        sessionId: item.session_id ? String(item.session_id) : `${item.venue}-${item.time}-${dir}`, // fallback unique ID
                        venueName: item.venue || 'Unknown',
                        chainName: item.chain || 'Independent',
                        city: item.city || 'Unknown',
                        state: item.state || 'Unknown',
                        showDate: showDate,
                        showTime: item.time || '00:00',
                        audi: item.audi || 'Screen 1',
                        totalSeats: parseInt(item.totalSeats) || 0,
                        availableSeats: parseInt(item.available) || 0,
                        soldSeats: parseInt(item.sold) || 0,
                        grossRevenue: parseFloat(item.gross) || 0,
                        source: 'BFILMY',
                    });
                }
            }

            if (toInsert.length > 0) {
                // Bulk insert in chunks of 500 to prevent query too large errors
                const chunkSize = 500;
                for (let i = 0; i < toInsert.length; i += chunkSize) {
                    const chunk = toInsert.slice(i, i + chunkSize);
                    try {
                        await db.insert(realtimeSessions)
                            .values(chunk)
                            .onConflictDoNothing(); // Ignore duplicates if script is run multiple times
                    } catch (e) {
                        console.error(`Failed to insert chunk for ${dir}:`, e.message);
                    }
                }
                totalInserted += toInsert.length;
                console.log(`Inserted ${toInsert.length} shows for ${showDateStr}`);
            } else {
                console.log(`No Mirzapur shows found in ${dir}`);
            }
        }
    }

    console.log(`Backfill Complete. Total historical shows inserted: ${totalInserted}`);
    process.exit(0);
}

main().catch(console.error);
