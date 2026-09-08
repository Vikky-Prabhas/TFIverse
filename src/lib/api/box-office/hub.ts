import { unstable_cache } from 'next/cache';
import { db } from '../../db';
import { sql } from 'drizzle-orm';
import {
  TodayPulseContract,
  TopMovieContract,
  CollectionMomentumContract,
  TerritoryBreakdownContract,
  AdvanceBookingPreviewContract,
  RankingsPreviewContract,
  HotVenueContract,
  RunningMovieContract,
} from './contracts';

// ============================================================================
// HELPER: Parse language and format from movie title like "Movie [2D | Hindi]"
// ============================================================================
function parseMovieMeta(title: string): { cleanTitle: string; language: string | null; format: string | null } {
  const match = title.match(/^(.+?)\s*\[([^\]]+)\]$/);
  if (!match) return { cleanTitle: title, language: null, format: null };
  const cleanTitle = match[1].trim();
  const parts = match[2].split('|').map(s => s.trim());
  return {
    cleanTitle,
    format: parts[0] || null,
    language: parts[1] || null,
  };
}

// ============================================================================
// SECTION 2: TODAY'S PULSE
// ============================================================================
export const getTodayPulse = unstable_cache(
  async (): Promise<TodayPulseContract> => {
    try {
      // Postgres: DATE(show_date) = CURRENT_DATE
      const rs = await db.execute(sql`
        SELECT 
          COALESCE(SUM(gross_revenue), 0) as total_gross,
          COUNT(*) as total_shows,
          COALESCE(SUM(sold_seats), 0) as total_tickets_sold,
          COUNT(DISTINCT movie_id) as movie_count,
          COUNT(DISTINCT venue_name) as active_venues,
          CASE WHEN SUM(total_seats) > 0 
            THEN CAST(SUM(sold_seats) AS REAL) / SUM(total_seats) * 100 
            ELSE 0 END as avg_occupancy,
          SUM(CASE WHEN available_seats <= 0 THEN 1 ELSE 0 END) as housefull_shows,
          SUM(CASE WHEN (CAST(sold_seats AS REAL) / NULLIF(total_seats, 0)) >= 0.6 AND available_seats > 0 THEN 1 ELSE 0 END) as fast_filling_shows,
          MAX(last_updated) as max_updated_at
        FROM realtime_sessions
        WHERE DATE(show_date) = CURRENT_DATE
      `);

      const row = rs[0] || {};

      const topMovieRes = await db.execute(sql`
        SELECT m.title as movie_title, SUM(s.gross_revenue) as g
        FROM realtime_sessions s
        JOIN movies m ON s.movie_id = m.id
        WHERE DATE(s.show_date) = CURRENT_DATE
        GROUP BY m.title
        ORDER BY g DESC
        LIMIT 1
      `);
      
      const topMovieTitle = topMovieRes[0]?.movie_title as string || null;

      return {
        totalGross: Number(row.total_gross) || null,
        totalShows: Number(row.total_shows) || null,
        totalTicketsSold: Number(row.total_tickets_sold) || null,
        movieCount: Number(row.movie_count) || null,
        topMovie: topMovieTitle ? parseMovieMeta(topMovieTitle).cleanTitle : null,
        avgOccupancy: Number(row.avg_occupancy) || null,
        housefullShows: Number(row.housefull_shows) || null,
        fastFillingShows: Number(row.fast_filling_shows) || null,
        activeVenues: Number(row.active_venues) || null,
        lastUpdatedAt: row.max_updated_at ? new Date(row.max_updated_at as string) : new Date(),
        dataState: 'LIVE',
        dataSource: 'TFiverse Data Engine',
      };
    } catch (e) {
      console.error('getTodayPulse error:', e);
      return {
        totalGross: null, totalShows: null, totalTicketsSold: null, movieCount: null,
        topMovie: null, avgOccupancy: null, housefullShows: null, fastFillingShows: null,
        activeVenues: null, lastUpdatedAt: null, dataState: 'UNKNOWN', dataSource: null,
      };
    }
  },
  ['postgres-today-pulse'],
  { revalidate: 60 }
);

// ============================================================================
// SECTION 3: TOP MOVIES LEADERBOARD
// ============================================================================
export const getTopMovies = async (limit: number = 10): Promise<TopMovieContract[]> => {
    try {
      const rs = await db.execute(sql`
        SELECT 
          s.movie_id,
          m.slug,
          m.title,
          m.poster_url,
          SUM(s.gross_revenue) as today_gross,
          COUNT(*) as shows,
          SUM(s.sold_seats) as tickets_sold,
          SUM(s.total_seats) as total_seats,
          CASE WHEN SUM(s.total_seats) > 0 
            THEN CAST(SUM(s.sold_seats) AS REAL) / SUM(s.total_seats) * 100 
            ELSE 0 END as occupancy,
          SUM(CASE WHEN s.available_seats <= 0 THEN 1 ELSE 0 END) as housefull_count,
          SUM(CASE WHEN (CAST(s.sold_seats AS REAL) / NULLIF(s.total_seats, 0)) >= 0.6 AND s.available_seats > 0 THEN 1 ELSE 0 END) as fast_filling_count,
          MAX(s.last_updated) as updated_at
        FROM realtime_sessions s
        JOIN movies m ON s.movie_id = m.id
        WHERE DATE(s.show_date) = CURRENT_DATE
        GROUP BY s.movie_id, m.slug, m.title, m.poster_url
        ORDER BY today_gross DESC
        LIMIT ${limit}
      `);

      return rs.map((row, idx) => {
        const meta = parseMovieMeta((row.title as string) || '');
        return {
          rank: idx + 1,
          movieId: String(row.movie_id),
          slug: row.slug as string,
          title: meta.cleanTitle,
          language: meta.language,
          format: meta.format,
          posterUrl: row.poster_url as string | null,
          todayGross: Number(row.today_gross) || 0,
          totalGross: null,
          occupancy: Number(row.occupancy) || null,
          shows: Number(row.shows) || null,
          ticketsSold: Number(row.tickets_sold) || null,
          totalSeats: Number(row.total_seats) || null,
          housefullCount: Number(row.housefull_count) || null,
          fastFillingCount: Number(row.fast_filling_count) || null,
          trend: null,
          dataState: 'LIVE' as const,
          dataSource: 'TFiverse Data Engine',
          lastUpdatedAt: row.updated_at ? new Date(row.updated_at as string) : new Date(),
        };
      });
    } catch (e) {
      console.error('getTopMovies error:', e);
      return [];
    }
};

// ============================================================================
// SECTION 5: COLLECTION MOMENTUM
// ============================================================================
export const getCollectionMomentum = unstable_cache(
  async (): Promise<CollectionMomentumContract[]> => {
    return [];
  },
  ['postgres-collection-momentum'],
  { revalidate: 300 }
);

// ============================================================================
// SECTION 6: TERRITORY BREAKDOWN
// ============================================================================
export const getTerritoryBreakdown = unstable_cache(
  async (): Promise<TerritoryBreakdownContract[]> => {
    try {
      const rs = await db.execute(sql`
        SELECT 
          s.city as territory,
          SUM(s.gross_revenue) as gross,
          COUNT(*) as shows,
          COUNT(DISTINCT s.venue_name) as venue_count,
          CASE WHEN SUM(s.total_seats) > 0 
            THEN CAST(SUM(s.sold_seats) AS REAL) / SUM(s.total_seats) * 100 
            ELSE 0 END as occupancy,
          MAX(s.last_updated) as updated_at
        FROM realtime_sessions s
        WHERE DATE(s.show_date) = CURRENT_DATE
        GROUP BY s.city
        HAVING SUM(s.gross_revenue) > 0
        ORDER BY gross DESC
        LIMIT 15
      `);

      const totalGross = rs.reduce((sum, r) => sum + (Number(r.gross) || 0), 0);

      return rs.map((row) => ({
        territory: (row.territory as string) || 'Unknown',
        gross: Number(row.gross) || null,
        shows: Number(row.shows) || null,
        occupancy: Number(row.occupancy) || null,
        contributionPercentage: totalGross > 0 ? (Number(row.gross) / totalGross) * 100 : null,
        trend: null,
        venueCount: Number(row.venue_count) || null,
        dataState: 'LIVE' as const,
        dataSource: 'TFiverse Data Engine',
        lastUpdatedAt: row.updated_at ? new Date(row.updated_at as string) : null,
      }));
    } catch (e) {
      console.error('getTerritoryBreakdown error:', e);
      return [];
    }
  },
  ['postgres-territory-breakdown'],
  { revalidate: 300 }
);

// ============================================================================
// SECTION 7: OCCUPANCY HEATMAP (Hot Venues)
// ============================================================================
export const getHotVenues = unstable_cache(
  async (limit: number = 20): Promise<HotVenueContract[]> => {
    try {
      const rs = await db.execute(sql`
        SELECT 
          s.venue_name as venue_name,
          s.city,
          m.title as movie_title,
          SUM(s.sold_seats) as sold_seats,
          SUM(s.total_seats) as total_seats,
          SUM(CASE WHEN s.available_seats <= 0 THEN 1 ELSE 0 END) as housefull_shows,
          CASE WHEN SUM(s.total_seats) > 0 
            THEN CAST(SUM(s.sold_seats) AS REAL) / SUM(s.total_seats) * 100 
            ELSE 0 END as occupancy
        FROM realtime_sessions s
        JOIN movies m ON s.movie_id = m.id
        WHERE DATE(s.show_date) = CURRENT_DATE
          AND s.total_seats > 0
        GROUP BY s.venue_name, s.city, m.title
        HAVING (CAST(SUM(s.sold_seats) AS REAL) / SUM(s.total_seats)) >= 0.85 OR SUM(CASE WHEN s.available_seats <= 0 THEN 1 ELSE 0 END) > 0
        ORDER BY occupancy DESC
        LIMIT ${limit}
      `);

      return rs.map((row) => ({
        venueId: row.venue_name as string,
        venueName: (row.venue_name as string) || 'Unknown',
        city: (row.city as string) || 'Unknown',
        state: '',
        movieTitle: parseMovieMeta((row.movie_title as string) || '').cleanTitle,
        occupancy: Number(row.occupancy) || 0,
        soldSeats: Number(row.sold_seats) || 0,
        totalSeats: Number(row.total_seats) || 0,
        status: Number(row.housefull_shows) > 0 ? 'HOUSEFULL' as const : 
               Number(row.occupancy) >= 95 ? 'HOUSEFULL' as const : 'FAST_FILLING' as const,
      }));
    } catch (e) {
      console.error('getHotVenues error:', e);
      return [];
    }
  },
  ['postgres-hot-venues'],
  { revalidate: 60 }
);

// ============================================================================
// SECTION 8: ADVANCE BOOKING
// ============================================================================
export const getAdvanceBookingPreview = unstable_cache(
  async (): Promise<AdvanceBookingPreviewContract[]> => {
    try {
      const rs = await db.execute(sql`
        SELECT 
          s.movie_id,
          m.slug,
          m.title,
          m.poster_url,
          s.show_date,
          SUM(s.sold_seats) as tickets_sold,
          SUM(s.gross_revenue) as gross_revenue,
          COUNT(*) as shows_count,
          SUM(s.total_seats) as capacity,
          CASE WHEN SUM(s.total_seats) > 0 
            THEN CAST(SUM(s.sold_seats) AS REAL) / SUM(s.total_seats) * 100 
            ELSE 0 END as occupancy,
          COUNT(DISTINCT s.city) as cities_count,
          MAX(s.last_updated) as updated_at
        FROM realtime_sessions s
        JOIN movies m ON s.movie_id = m.id
        WHERE DATE(s.show_date) > CURRENT_DATE
        GROUP BY s.movie_id, m.slug, m.title, m.poster_url, s.show_date
        ORDER BY gross_revenue DESC
        LIMIT 10
      `);

      return rs.map((row) => {
        const meta = parseMovieMeta((row.title as string) || '');
        return {
          movieId: String(row.movie_id),
          slug: row.slug as string,
          title: meta.cleanTitle,
          posterUrl: row.poster_url as string | null,
          showDate: String(row.show_date),
          ticketsSold: Number(row.tickets_sold) || null,
          grossRevenue: Number(row.gross_revenue) || null,
          showsCount: Number(row.shows_count) || null,
          capacity: Number(row.capacity) || null,
          occupancy: Number(row.occupancy) || null,
          bookingVelocity: null,
          citiesCount: Number(row.cities_count) || null,
          dataState: 'LIVE' as const,
          lastUpdatedAt: row.updated_at ? new Date(row.updated_at as string) : null,
        };
      });
    } catch (e) {
      console.error('getAdvanceBookingPreview error:', e);
      return [];
    }
  },
  ['postgres-advance-booking'],
  { revalidate: 300 }
);

// ============================================================================
// SECTION 9: RANKINGS
// ============================================================================
export const getRankingsPreview = unstable_cache(
  async (): Promise<RankingsPreviewContract[]> => {
    return [];
  },
  ['postgres-rankings'],
  { revalidate: 86400 }
);

// ============================================================================
// SECTION 10: ALL RUNNING MOVIES (Poster Grid)
// ============================================================================
export const getRunningMovies = async (): Promise<RunningMovieContract[]> => {
    try {
      const rs = await db.execute(sql`
        SELECT 
          s.movie_id,
          m.slug,
          m.title,
          m.poster_url,
          SUM(s.gross_revenue) as today_gross,
          COUNT(*) as shows,
          CASE WHEN SUM(s.total_seats) > 0 
            THEN CAST(SUM(s.sold_seats) AS REAL) / SUM(s.total_seats) * 100 
            ELSE 0 END as occupancy
        FROM realtime_sessions s
        JOIN movies m ON s.movie_id = m.id
        WHERE DATE(s.show_date) = CURRENT_DATE
        GROUP BY s.movie_id, m.slug, m.title, m.poster_url
        ORDER BY today_gross DESC
      `);

      return rs.map((row) => {
        const meta = parseMovieMeta((row.title as string) || '');
        return {
          movieId: String(row.movie_id),
          slug: row.slug as string,
          title: meta.cleanTitle,
          language: meta.language,
          posterUrl: row.poster_url as string | null,
          todayGross: Number(row.today_gross) || 0,
          occupancy: Number(row.occupancy) || null,
          shows: Number(row.shows) || 0,
        };
      });
    } catch (e) {
      console.error('getRunningMovies error:', e);
      return [];
    }
};
