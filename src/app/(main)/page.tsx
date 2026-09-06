import { auth } from "@/auth";
import HomeClient from "@/components/home/home-client";
import HeroSequence from "@/components/home/hero-sequence";
import Footer from "@/components/layout/footer";
import { db } from "@/lib/db";
import { movies, people } from "@/lib/schema";
import { eq, inArray, desc, and, isNotNull, lte } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getNewOnOtt } from "@/app/actions/ott-feed";

export const metadata = {
  title: "TFiverse — The Home of Telugu Cinema",
  description: "Everything Telugu cinema: Heroes, Movies, Box Office, Awards, OTT & More",
};

// ============================================================================
// CACHED DATA FETCHERS — Single Source of Truth: PostgreSQL
// ============================================================================

const getHomeHeroes = unstable_cache(
  async () => {
    const dbHeroes = await db.query.people.findMany({ where: eq(people.category, "hero") });
    return dbHeroes.map(h => ({
      ...(h.metadata as object),
      id: h.id,
      slug: h.slug,
      name: h.name,
      category: h.category,
      subcategory: h.subcategory,
    }));
  },
  ['home-heroes-v3'],
  { revalidate: 3600, tags: ['heroes-v2'] }
);

const getHomeRumors = unstable_cache(
  async () => {
    return await db.query.rumors.findMany();
  },
  ['home-rumors'],
  { revalidate: 1800, tags: ['rumors'] }
);

// TMDB writes its own status strings into movies.status (see scripts/sync-tmdb-bulk.ts),
// so the literal "upcoming" never matches. These are the real values in the column.
const UPCOMING_STATUSES = ["Post Production", "In Production", "Planned", "Rumored"] as const;

// UpcomingPanel renders a "pre" | "filming" | "post" badge.
const STATUS_BADGE: Record<string, "pre" | "filming" | "post"> = {
  "Post Production": "post",
  "In Production": "filming",
  "Planned": "pre",
  "Rumored": "pre",
};

const TMDB_POSTER = "https://image.tmdb.org/t/p/w342";

const getUpcomingMovies = unstable_cache(
  async () => {
    const dbUpcoming = await db
      .select({
        slug: movies.slug,
        title: movies.title,
        posterUrl: movies.posterUrl,
        releaseDate: movies.releaseDate,
        status: movies.status,
      })
      .from(movies)
      .where(inArray(movies.status, [...UPCOMING_STATUSES]))
      .orderBy(desc(movies.popularity))
      .limit(20);

    return dbUpcoming.map(m => ({
      slug: m.slug,
      title: m.title,
      status: STATUS_BADGE[m.status ?? ""] ?? "pre",
      poster: m.posterUrl
        ? m.posterUrl.startsWith("http") ? m.posterUrl : `${TMDB_POSTER}${m.posterUrl}`
        : null,
      date: m.releaseDate,
    }));
  },
  ['home-upcoming-v3'],
  { revalidate: 3600, tags: ['upcoming-v2'] }
);

// Recently released, with a poster — replaces the three hardcoded "news" items
// that used to sit in this slot.
const getRecentReleases = unstable_cache(
  async () => {
    const rows = await db
      .select({
        slug: movies.slug,
        title: movies.title,
        posterUrl: movies.posterUrl,
        backdropUrl: movies.backdropUrl,
        releaseDate: movies.releaseDate,
        overview: movies.overview,
      })
      .from(movies)
      .where(and(
        eq(movies.status, "Released"),
        isNotNull(movies.posterUrl),
        isNotNull(movies.releaseDate),
        lte(movies.releaseDate, new Date()),
      ))
      .orderBy(desc(movies.releaseDate))
      .limit(6);

    return rows.map(m => ({
      slug: m.slug,
      title: m.title,
      overview: m.overview,
      date: m.releaseDate,
      poster: m.posterUrl ? `${TMDB_POSTER}${m.posterUrl}` : null,
      backdrop: m.backdropUrl ? `https://image.tmdb.org/t/p/w780${m.backdropUrl}` : null,
    }));
  },
  ['home-recent-v1'],
  { revalidate: 3600, tags: ['movies'] }
);

// Real OTT feed, same source the /new-on-ott page uses.
const getHomeOtt = unstable_cache(
  async () => {
    const rows = await getNewOnOtt({ limit: 12 });
    return rows.map(m => ({
      slug: m.slug,
      title: m.title,
      year: m.year,
      platform: m.platforms[0]?.platform ?? null,
      poster: m.posterUrl ? `${TMDB_POSTER}${m.posterUrl}` : null,
    }));
  },
  ['home-ott-v1'],
  { revalidate: 3600, tags: ['ott'] }
);

export default async function HomePage() {
  const session = await auth();

  // Parallel DB fetches with error resilience
  const [heroesData, rumorsData, upcomingData, recentData, ottData] = await Promise.all([
    getHomeHeroes().catch(() => []),
    getHomeRumors().catch(() => []),
    getUpcomingMovies().catch(() => []),
    getRecentReleases().catch(() => []),
    getHomeOtt().catch(() => []),
  ]);

  return (
    <div className="flex-1 flex flex-col bg-black text-white selection:bg-white selection:text-black">
      <div className="flex-1">
        {/* ═══════════════════════════════════════════════════ */}
        {/*  CINEMATIC HERO — Scrollytelling Sequence         */}
        {/* ═══════════════════════════════════════════════════ */}
        <HeroSequence isAuthenticated={!!session} />

        {/* ═══════════════════════════════════════════════════ */}
        {/*  CLIENT SECTIONS                                   */}
        {/* ═══════════════════════════════════════════════════ */}
        <HomeClient
          heroesData={heroesData}
          rumorsData={rumorsData}
          upcomingData={upcomingData}
          recentData={recentData}
          ottData={ottData}
          isAuthenticated={!!session}
          userId={session?.user?.id}
        />
      </div>

      <Footer />
    </div>
  );
}
