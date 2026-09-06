import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load env before importing db
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { db } from '../src/lib/db';
import { dailyBoxOffice, regionalBoxOffice, chainBoxOffice } from '../src/lib/schema/tracking';
import { movies } from '../src/lib/schema/content';
import { eq, inArray } from 'drizzle-orm';

const BACKUP_DIR = path.resolve(__dirname, '../data/boxoffice-json');

async function backupBoxOffice() {
    console.log('🔄 Starting Box Office JSON Backup...');
    
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    try {
        // Fetch all daily records
        const allDaily = await db.select().from(dailyBoxOffice);
        const allRegional = await db.select().from(regionalBoxOffice);
        const allChain = await db.select().from(chainBoxOffice);
        
        // Group by movieId
        const movieIds = [...new Set(allDaily.map(d => d.movieId))];
        
        if (movieIds.length === 0) {
            console.log('⚠️ No box office data found to backup.');
            process.exit(0);
        }

        // Fetch movie metadata to get slugs for filenames
        const movieMeta = await db.select({
            id: movies.id,
            slug: movies.slug,
            title: movies.title
        }).from(movies).where(inArray(movies.id, movieIds));
        
        const movieMap = new Map(movieMeta.map(m => [m.id, m]));

        let backupCount = 0;

        for (const movieId of movieIds) {
            const movieInfo = movieMap.get(movieId);
            if (!movieInfo) continue;

            const filename = `${movieInfo.slug || 'unknown-movie'}-boxoffice.json`;
            const filepath = path.join(BACKUP_DIR, filename);

            const dailyData = allDaily.filter(d => d.movieId === movieId);
            const regionalData = allRegional.filter(d => d.movieId === movieId);
            const chainData = allChain.filter(d => d.movieId === movieId);

            const payload = {
                movieId: movieId,
                title: movieInfo.title,
                backupTimestamp: new Date().toISOString(),
                daily: dailyData,
                regional: regionalData,
                chain: chainData
            };

            fs.writeFileSync(filepath, JSON.stringify(payload, null, 2));
            backupCount++;
        }

        console.log(`✅ Successfully backed up aggregated box office data for ${backupCount} movies to ${BACKUP_DIR}`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Box Office Backup Failed:', error);
        process.exit(1);
    }
}

backupBoxOffice();
