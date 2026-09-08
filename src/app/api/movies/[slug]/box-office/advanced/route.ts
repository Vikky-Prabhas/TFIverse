import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { realtimeSessions } from "@/lib/schema/tracking";
import { movies } from "@/lib/schema/content";
import { eq, sql, and, inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";

// Helper to calculate ATP ranges
function getATPRange(atp: number) {
  if (atp < 100) return "₹100 or Below";
  if (atp < 200) return "₹100 - ₹199";
  if (atp < 300) return "₹200 - ₹299";
  if (atp < 500) return "₹300 - ₹499";
  if (atp < 700) return "₹500 - ₹699";
  if (atp < 1000) return "₹700 - ₹999";
  if (atp < 1500) return "₹1000 - ₹1499";
  if (atp < 2000) return "₹1500 - ₹1999";
  return "₹2000+";
}

// Caching the DB query to prevent DB overload (revalidates every 15 mins)
const getAggregatedData = unstable_cache(
  async (baseTitle: string, filterDate: string | null, filterFormat: string | null) => {
    let dateFilter = sql`1=1`;
    if (filterDate) {
      dateFilter = sql`DATE(${realtimeSessions.showDate}) = DATE(${filterDate})`;
    }

    // Filter by format if provided
    let titleFilter = sql`${movies.title} ILIKE ${'%' + baseTitle + '%'}`;
    if (filterFormat) {
      titleFilter = and(titleFilter, sql`${movies.title} ILIKE ${'%[' + filterFormat + ']%'}`) as any;
    }

    // Get all movie IDs for this franchise/baseTitle that match the format filter
    const franchiseMovies = await db
      .select({ id: movies.id, title: movies.title })
      .from(movies)
      .where(titleFilter);

    const movieIds = franchiseMovies.map(m => m.id);
    if (movieIds.length === 0) return null;

    const movieTitleMap = franchiseMovies.reduce((acc: any, m) => ({ ...acc, [m.id]: m.title }), {});

    // Fetch Distinct Available Dates for the frontend Timeline before applying date filter
    // We want to know all dates this movie has shows for, regardless of the currently selected date.
    const allFranchiseMovies = await db
      .select({ id: movies.id, title: movies.title })
      .from(movies)
      .where(sql`${movies.title} ILIKE ${'%' + baseTitle + '%'}`);
    const allMovieIds = allFranchiseMovies.map(m => m.id);
    
    let availableDates: string[] = [];
    if (allMovieIds.length > 0) {
      const datesRaw = await db.execute(sql`
        SELECT DISTINCT DATE(show_date) as d 
        FROM realtime_sessions 
        WHERE movie_id IN (${sql.join(allMovieIds, sql`, `)}) 
        ORDER BY d ASC
      `);
      availableDates = datesRaw.map((r: any) => r.d).filter(Boolean).map((d: any) => {
          // ensure string format YYYY-MM-DD
          return new Date(d).toISOString().split('T')[0];
      });
    }

    // -------------------------------------------------------------
    // CALCULATE FORMAT SPLITS ACROSS ALL MOVIES FOR THE DATE
    // (We do this before the main query so the splits are unaffected by filterFormat)
    // -------------------------------------------------------------
    const formatSplits: Record<string, any> = {};
    
    // Pre-populate with all possible formats
    allFranchiseMovies.forEach(m => {
      const fullTitle = m.title || "Unknown";
      const match = fullTitle.match(/\[(.*?)\]/);
      const versionTag = match ? match[1] : fullTitle;
      if (!formatSplits[versionTag]) {
        formatSplits[versionTag] = { name: versionTag, gross: 0, sold: 0, shows: 0 };
      }
    });

    if (allMovieIds.length > 0) {
      const allSessionsForDate = await db
        .select({
          movieId: realtimeSessions.movieId,
          grossRevenue: realtimeSessions.grossRevenue,
          soldSeats: realtimeSessions.soldSeats
        })
        .from(realtimeSessions)
        .where(and(inArray(realtimeSessions.movieId, allMovieIds), dateFilter));

      allSessionsForDate.forEach((session) => {
        const fullTitle = allFranchiseMovies.find(m => m.id === session.movieId)?.title || "Unknown";
        const match = fullTitle.match(/\[(.*?)\]/);
        const versionTag = match ? match[1] : fullTitle;
        
        if (formatSplits[versionTag]) {
          formatSplits[versionTag].gross += session.grossRevenue;
          formatSplits[versionTag].sold += session.soldSeats;
          formatSplits[versionTag].shows += 1;
        }
      });
    }

    // -------------------------------------------------------------
    // FETCH MAIN SESSIONS FOR DASHBOARD (Filtered by format if selected)
    // -------------------------------------------------------------
    const sessions = await db
      .select({
        id: realtimeSessions.id,
        movieId: realtimeSessions.movieId,
        state: realtimeSessions.state,
        district: realtimeSessions.district,
        mandal: realtimeSessions.mandal,
        city: realtimeSessions.city,
        venueName: realtimeSessions.venueName,
        showTime: realtimeSessions.showTime,
        audi: realtimeSessions.audi,
        totalSeats: realtimeSessions.totalSeats,
        availableSeats: realtimeSessions.availableSeats,
        soldSeats: realtimeSessions.soldSeats,
        grossRevenue: realtimeSessions.grossRevenue,
        showDate: realtimeSessions.showDate,
      })
      .from(realtimeSessions)
      .where(and(inArray(realtimeSessions.movieId, movieIds), dateFilter));

    // Aggregate Data in JS for complex groupings
    let totalGross = 0;
    let totalShows = 0;
    let totalSold = 0;
    let totalCapacity = 0;

    const atpDistribution: Record<string, any> = {};
    const stateDrillDown: Record<string, any> = {};

    // For heatmap
    const heatmap: Record<string, any> = {
      'Morning (6AM - 11AM)': { name: 'Morning', gross: 0, sold: 0, capacity: 0, shows: 0 },
      'Matinee (12PM - 4PM)': { name: 'Matinee', gross: 0, sold: 0, capacity: 0, shows: 0 },
      'Evening (5PM - 8PM)': { name: 'Evening', gross: 0, sold: 0, capacity: 0, shows: 0 },
      'Night (9PM+)': { name: 'Night', gross: 0, sold: 0, capacity: 0, shows: 0 },
    };

    sessions.forEach((session) => {
      totalGross += session.grossRevenue;
      totalShows += 1;
      totalSold += session.soldSeats;
      totalCapacity += session.totalSeats;

      const occPercentage = session.totalSeats > 0 ? (session.soldSeats / session.totalSeats) * 100 : 0;
      const atp = session.soldSeats > 0 ? session.grossRevenue / session.soldSeats : 0;
      const isFastFilling = occPercentage >= 60 && occPercentage < 100;
      const isHousefull = occPercentage === 100;

      // 1. ATP Distribution
      const range = getATPRange(atp);
      if (!atpDistribution[range]) {
        atpDistribution[range] = { range, shows: 0, ff: 0, hf: 0, sold: 0, gross: 0, totalAtp: 0, totalOcc: 0 };
      }
      atpDistribution[range].shows += 1;
      atpDistribution[range].gross += session.grossRevenue;
      atpDistribution[range].sold += session.soldSeats;
      if (isFastFilling) atpDistribution[range].ff += 1;
      if (isHousefull) atpDistribution[range].hf += 1;
      atpDistribution[range].totalAtp += atp;
      atpDistribution[range].totalOcc += occPercentage;

      // 2. Heatmap grouping
      const showTime = session.showTime || '';
      let timeKey = 'Matinee (12PM - 4PM)';
      const hourMatch = showTime.match(/(\d+):/);
      const ampmMatch = showTime.match(/(AM|PM)/i);
      if (hourMatch && ampmMatch) {
          let h = parseInt(hourMatch[1], 10);
          if (ampmMatch[1].toUpperCase() === 'PM' && h !== 12) h += 12;
          if (ampmMatch[1].toUpperCase() === 'AM' && h === 12) h = 0;
          
          if (h >= 6 && h <= 11) timeKey = 'Morning (6AM - 11AM)';
          else if (h >= 12 && h <= 16) timeKey = 'Matinee (12PM - 4PM)';
          else if (h >= 17 && h <= 20) timeKey = 'Evening (5PM - 8PM)';
          else timeKey = 'Night (9PM+)';
      }
      heatmap[timeKey].shows += 1;
      heatmap[timeKey].gross += session.grossRevenue;
      heatmap[timeKey].sold += session.soldSeats;
      heatmap[timeKey].capacity += session.totalSeats;

      // 3. Drill-Down Map (State -> District -> Mandal/City -> Venue -> Show)
      const state = session.state || 'Unknown State';
      const district = session.district || 'Unknown District';
      
      // If city and mandal are the same, just show one. Otherwise combine for clarity in UI if needed.
      // Actually, we'll group by City, but show it under District.
      const city = session.city || 'Unknown City';
      const venue = session.venueName || 'Unknown Venue';

      if (!stateDrillDown[state]) stateDrillDown[state] = { name: state, gross: 0, sold: 0, shows: 0, districts: {} };
      if (!stateDrillDown[state].districts[district]) stateDrillDown[state].districts[district] = { name: district, gross: 0, sold: 0, shows: 0, cities: {} };
      if (!stateDrillDown[state].districts[district].cities[city]) stateDrillDown[state].districts[district].cities[city] = { name: city, gross: 0, sold: 0, shows: 0, venues: {} };
      if (!stateDrillDown[state].districts[district].cities[city].venues[venue]) stateDrillDown[state].districts[district].cities[city].venues[venue] = { name: venue, gross: 0, sold: 0, shows: 0, showList: [] };

      stateDrillDown[state].gross += session.grossRevenue;
      stateDrillDown[state].sold += session.soldSeats;
      stateDrillDown[state].shows += 1;

      stateDrillDown[state].districts[district].gross += session.grossRevenue;
      stateDrillDown[state].districts[district].sold += session.soldSeats;
      stateDrillDown[state].districts[district].shows += 1;

      stateDrillDown[state].districts[district].cities[city].gross += session.grossRevenue;
      stateDrillDown[state].districts[district].cities[city].sold += session.soldSeats;
      stateDrillDown[state].districts[district].cities[city].shows += 1;

      stateDrillDown[state].districts[district].cities[city].venues[venue].gross += session.grossRevenue;
      stateDrillDown[state].districts[district].cities[city].venues[venue].sold += session.soldSeats;
      stateDrillDown[state].districts[district].cities[city].venues[venue].shows += 1;
      
      // Store granular show
      stateDrillDown[state].districts[district].cities[city].venues[venue].showList.push({
        time: session.showTime,
        date: session.showDate,
        audi: session.audi,
        total: session.totalSeats,
        avail: session.availableSeats,
        sold: session.soldSeats,
        gross: session.grossRevenue,
        occ: occPercentage
      });
    });

    // Format ATP Data
    const atpFinal = Object.values(atpDistribution).map((item: any) => ({
      ...item,
      occ: item.shows > 0 ? (item.totalOcc / item.shows).toFixed(1) : "0",
      avgAtp: item.shows > 0 ? Math.round(item.totalAtp / item.shows) : 0
    })).sort((a, b) => b.avgAtp - a.avgAtp);

    // Format Heatmap Data
    const heatmapFinal = Object.values(heatmap).map((item: any) => ({
        ...item,
        occ: item.capacity > 0 ? ((item.sold / item.capacity) * 100).toFixed(1) : "0"
    }));

    return {
      availableDates,
      heroStats: {
        totalGross,
        totalShows,
        totalSold,
        totalCapacity,
        occupancy: totalCapacity > 0 ? ((totalSold / totalCapacity) * 100).toFixed(2) : "0",
      },
      formatSplits: Object.values(formatSplits).sort((a: any, b: any) => b.gross - a.gross),
      atpDistribution: atpFinal,
      heatmap: heatmapFinal,
      drillDown: stateDrillDown
    };
  },
  ["advanced-box-office-cache"],
  { revalidate: 60 } // 1 minute (reduced from 15 because we want "pulse" to feel live)
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const format = searchParams.get('format');

    // Find movie base title
    const [movie] = await db
      .select({ title: movies.title })
      .from(movies)
      .where(eq(movies.slug, slug));

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    const baseTitle = movie.title.split(' [')[0];

    const data = await getAggregatedData(baseTitle, date, format);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Advanced Box Office API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
