import { db } from './src/lib/db';
import { movies } from './src/lib/schema/content';
import { eq, sql, and, inArray } from 'drizzle-orm';

async function run() {
  const baseTitle = 'Mirzapur: The Movie';
  const filterFormat = '2D | TELUGU';

  let titleFilter = sql`${movies.title} ILIKE ${'%' + baseTitle + '%'}`;
  titleFilter = and(titleFilter, sql`${movies.title} ILIKE ${'%[' + filterFormat + ']%'}`) as any;

  const franchiseMovies = await db.select({ id: movies.id, title: movies.title }).from(movies).where(titleFilter);
  const movieIds = franchiseMovies.map(m => m.id);

  const allFranchiseMovies = await db.select({ id: movies.id, title: movies.title }).from(movies).where(sql`${movies.title} ILIKE ${'%' + baseTitle + '%'}`);

  const formatSplits: Record<string, any> = {};
  allFranchiseMovies.forEach(m => {
    const fullTitle = m.title || "Unknown";
    const match = fullTitle.match(/\[(.*?)\]/);
    const versionTag = match ? match[1] : fullTitle;
    if (!formatSplits[versionTag]) {
      formatSplits[versionTag] = { name: versionTag, gross: 0, sold: 0, shows: 0 };
    }
  });

  console.log('formatSplits:', Object.values(formatSplits).sort((a: any, b: any) => b.gross - a.gross));
  process.exit(0);
}
run();
