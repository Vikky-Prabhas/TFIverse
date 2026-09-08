import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function clearAll() {
    console.log('🧹 Clearing ALL old box office data from PostgreSQL...');
    
    // Clear realtime_sessions
    try {
        const r1 = await db.execute(sql`DELETE FROM realtime_sessions`);
        console.log('✅ Cleared realtime_sessions');
    } catch (e: any) { console.log('⚠️ realtime_sessions:', e.message); }
    
    // Clear city_booking_snapshots
    try {
        await db.execute(sql`DELETE FROM city_booking_snapshots`);
        console.log('✅ Cleared city_booking_snapshots');
    } catch (e: any) { console.log('⚠️ city_booking_snapshots:', e.message); }
    
    // Clear hourly_trending_logs
    try {
        await db.execute(sql`DELETE FROM hourly_trending_logs`);
        console.log('✅ Cleared hourly_trending_logs');
    } catch (e: any) { console.log('⚠️ hourly_trending_logs:', e.message); }

    // Clear daily_box_office
    try {
        await db.execute(sql`DELETE FROM daily_box_office`);
        console.log('✅ Cleared daily_box_office');
    } catch (e: any) { console.log('⚠️ daily_box_office:', e.message); }

    console.log('🧹 PostgreSQL database is now clean!');
    process.exit(0);
}

clearAll();
