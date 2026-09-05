import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { db } from '../src/lib/db';
import { movies } from '../src/lib/schema/content';
import { realtimeSessions, hourlyTrendingLogs, dailyBoxOffice } from '../src/lib/schema/tracking';
import { notInArray, eq, or, ilike } from 'drizzle-orm';

async function main() {
  console.log('🧹 Wiping messy BFilmy data...');
  
  // 1. Delete all tracking data
  await db.delete(realtimeSessions);
  await db.delete(hourlyTrendingLogs);
  await db.delete(dailyBoxOffice);
  console.log('✅ Cleared all sessions and hourly logs.');

  // 2. Find Peddi and Salaar
  const keepMovies = await db.select({ id: movies.id, title: movies.title })
    .from(movies)
    .where(or(ilike(movies.title, '%Peddi%'), ilike(movies.title, '%Salaar%')));
  
  const keepIds = keepMovies.map(m => m.id);
  console.log(`Keeping movies: ${keepMovies.map(m => m.title).join(', ')} (IDs: ${keepIds.join(', ')})`);

  if (keepIds.length > 0) {
    // Delete all other movies
    await db.delete(movies).where(notInArray(movies.id, keepIds));
    console.log(`✅ Deleted all other movies from the database.`);
  } else {
    // If not found, just delete everything and we'll re-seed them later
    await db.delete(movies);
    console.log(`✅ No Peddi/Salaar found. Deleted all movies.`);
  }

  console.log('🎉 Database successfully cleaned!');
  process.exit(0);
}

main().catch(console.error);
