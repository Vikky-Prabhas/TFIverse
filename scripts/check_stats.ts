import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { db } from '../src/lib/db';
import { realtimeSessions } from '../src/lib/schema';
import { sql } from 'drizzle-orm';

async function main() {
  const result = await db.execute(sql`
    SELECT 
      COUNT(DISTINCT venue_name) as total_venues,
      COUNT(DISTINCT city) as total_cities,
      COUNT(DISTINCT state) as total_states,
      COUNT(*) as total_shows
    FROM realtime_sessions;
  `);

  console.log("DATABASE STATS:");
  console.log(`Total Unique Theaters: ${result[0].total_venues}`);
  console.log(`Total Unique Cities/Towns: ${result[0].total_cities}`);
  console.log(`Total Unique States: ${result[0].total_states}`);
  console.log(`Total Shows Logged: ${result[0].total_shows}`);

  process.exit(0);
}

main();
