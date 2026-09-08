import { db } from '../src/lib/db';
import { realtimeSessions } from '../src/lib/schema/tracking';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

async function upgradeGeo() {
    console.log('Starting Geographic Hierarchy Upgrade...');

    // Load geo master
    const geoMasterPath = path.join(__dirname, '../data/geo_master.json');
    if (!fs.existsSync(geoMasterPath)) {
        console.error('geo_master.json not found!');
        process.exit(1);
    }
    const geoMaster = JSON.parse(fs.readFileSync(geoMasterPath, 'utf-8'));

    // We will build a mapping of CityName -> { District, Mandal }
    // Since venue IDs aren't stored in realtime_sessions, we have to map by City.
    // In our geo_master, cities often map 1:1 to a district.
    const cityMap: Record<string, { district: string, mandal: string }> = {};

    Object.values(geoMaster).forEach((entry: any) => {
        if (entry.city && entry.district) {
            // Normalize city name
            const normalizedCity = entry.city.trim().toLowerCase();
            if (!cityMap[normalizedCity]) {
                cityMap[normalizedCity] = {
                    district: entry.district.trim(),
                    mandal: entry.mandal ? entry.mandal.trim() : 'Unknown'
                };
            }
        }
    });

    console.log(`Loaded ${Object.keys(cityMap).length} unique cities from geo_master.`);

    // Fetch all distinct cities from realtimeSessions
    const citiesInDb = await db.execute(sql`SELECT DISTINCT city FROM realtime_sessions`);
    
    let updatedRows = 0;
    
    for (const row of citiesInDb) {
        const dbCity = String(row.city);
        const normalizedDbCity = dbCity.toLowerCase().trim();
        
        const geoInfo = cityMap[normalizedDbCity];
        
        if (geoInfo) {
            // Update all rows with this city
            await db.execute(sql`
                UPDATE realtime_sessions 
                SET district = ${geoInfo.district}, mandal = ${geoInfo.mandal} 
                WHERE city = ${dbCity}
            `);
            updatedRows++;
        } else {
            // If city not found in geo_master, fallback to city name for district
            await db.execute(sql`
                UPDATE realtime_sessions 
                SET district = ${dbCity}, mandal = 'Unknown' 
                WHERE city = ${dbCity}
            `);
        }
    }

    console.log(`Successfully upgraded geography for ${updatedRows} distinct cities.`);
    console.log('Database upgrade complete.');
}

upgradeGeo().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
});
