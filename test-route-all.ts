import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

import { db } from './src/lib/db';
import { realtimeSessions } from './src/lib/schema/tracking';
import { movies } from './src/lib/schema/content';
import { eq, sql, and, inArray } from 'drizzle-orm';

async function run() {
  const baseTitle = 'Mirzapur: The Movie';
  const filterDate = '2026-09-04';
  const filterFormat = null;

  let dateFilter = sql`1=1`;
  if (filterDate) {
    dateFilter = sql`DATE(${realtimeSessions.showDate}) = DATE(${filterDate})`;
  }

  let titleFilter = sql`${movies.title} ILIKE ${'%' + baseTitle + '%'}`;
  if (filterFormat) {
    titleFilter = and(titleFilter, sql`${movies.title} ILIKE ${'%[' + filterFormat + ']%'}`) as any;
  }

  const franchiseMovies = await db
    .select({ id: movies.id, title: movies.title })
    .from(movies)
    .where(titleFilter);

  const movieIds = franchiseMovies.map(m => m.id);
  console.log('movieIds for ALL FORMATS:', movieIds);

  const sessions = await db
    .select({
      id: realtimeSessions.id,
      movieId: realtimeSessions.movieId,
      grossRevenue: realtimeSessions.grossRevenue,
    })
    .from(realtimeSessions)
    .where(and(inArray(realtimeSessions.movieId, movieIds), dateFilter));

  const totalGross = sessions.reduce((sum, s) => sum + s.grossRevenue, 0);
  console.log('totalGross for ALL FORMATS:', totalGross);

  process.exit(0);
}

run();
