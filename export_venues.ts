import { db } from './src/lib/db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function exportVenues() {
    const venues = await db.execute(sql`SELECT * FROM venues`);
    
    const bmsVenues = [];
    const paytmVenues = [];

    for (const v of venues) {
        if (v.source === 'BMS') {
            bmsVenues.push({
                VenueCode: v.venue_id,
                VenueName: v.name,
                RegionCode: v.city,
                // The scraper expects RegionCode in some places, or city.
                // Looking at bms.ts it expects v.VenueCode
            });
        } else if (v.source === 'PAYTM') {
            paytmVenues.push({
                id: v.venue_id,
                name: v.name,
            });
        }
    }

    const dataDir = '/home/pepper-salt/.gemini/antigravity-ide/scratch/tfiverse-data-engine/data';
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    fs.writeFileSync(path.join(dataDir, 'bms_venues_master.json'), JSON.stringify(bmsVenues, null, 2));
    fs.writeFileSync(path.join(dataDir, 'paytm_venues_master.json'), JSON.stringify(paytmVenues, null, 2));

    console.log(`Exported ${bmsVenues.length} BMS venues and ${paytmVenues.length} Paytm venues.`);
    process.exit(0);
}
exportVenues();
