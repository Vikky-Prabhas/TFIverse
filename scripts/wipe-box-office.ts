import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { db } from '../src/lib/db';
import { realtimeSessions, hourlyTrendingLogs, dailyBoxOffice, regionalBoxOffice, chainBoxOffice } from '../src/lib/schema';
import { sql } from 'drizzle-orm';

async function wipeBoxOffice() {
    console.log("⚠️ Wiping all box office data...");
    
    try {
        await db.execute(sql`TRUNCATE TABLE ${chainBoxOffice} RESTART IDENTITY CASCADE;`);
        await db.execute(sql`TRUNCATE TABLE ${regionalBoxOffice} RESTART IDENTITY CASCADE;`);
        await db.execute(sql`TRUNCATE TABLE ${dailyBoxOffice} RESTART IDENTITY CASCADE;`);
        await db.execute(sql`TRUNCATE TABLE ${hourlyTrendingLogs} RESTART IDENTITY CASCADE;`);
        await db.execute(sql`TRUNCATE TABLE ${realtimeSessions} RESTART IDENTITY CASCADE;`);
        
        console.log("✅ Successfully wiped all box office data.");
    } catch (error) {
        console.error("❌ Failed to wipe box office data:", error);
    }
    
    process.exit(0);
}

wipeBoxOffice();
