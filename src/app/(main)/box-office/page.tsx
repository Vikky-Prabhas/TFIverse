import { Metadata } from 'next';
import { 
  getTodayPulse, 
  getTopMovies, 
  getCollectionMomentum, 
  getTerritoryBreakdown, 
  getAdvanceBookingPreview, 
  getRankingsPreview,
  getHotVenues,
  getRunningMovies,
} from '../../../lib/api/box-office/hub';
import { CinematicHero } from '../../../components/box-office/CinematicHero';
import { MetricCard } from '../../../components/box-office/MetricCard';
import { RankedMovieCard } from '../../../components/box-office/RankedMovieCard';
import { SectionHeader } from '../../../components/box-office/SectionHeader';
import { DataUnavailable } from '../../../components/box-office/DataUnavailable';
import { MomentumChart } from '../../../components/box-office/MomentumChart';
import { TerritoryPulse } from '../../../components/box-office/TerritoryPulse';
import { AdvanceBookingCard } from '../../../components/box-office/AdvanceBookingCard';
import { RankingsPreview } from '../../../components/box-office/RankingsPreview';
import { OccupancyHeatmap } from '../../../components/box-office/OccupancyHeatmap';
import { MoviePosterGrid } from '../../../components/box-office/MoviePosterGrid';
import { 
  Activity, Ticket, MonitorPlay, Film, Flame, AlertTriangle, MapPin, BarChart3,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Box Office Tracker | Live Collections & Occupancy | TFiverse',
  description: 'Real-time Indian cinema box office tracking — ticket sales, advance booking velocity, territory breakdowns, housefull alerts, and ticket price intelligence.',
};

export default async function BoxOfficeHubPage() {
  // Fetch ALL data server-side in parallel
  const [pulse, topMovies, momentum, territories, advance, rankings, hotVenues, runningMovies] = await Promise.all([
    getTodayPulse(),
    getTopMovies(10),
    getCollectionMomentum(),
    getTerritoryBreakdown(),
    getAdvanceBookingPreview(),
    getRankingsPreview(),
    getHotVenues(20),
    getRunningMovies(),
  ]);

  const formatCurrency = (val: number | null) => {
    if (val === null) return null;
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const formatNumber = (val: number | null) => {
    if (val === null) return null;
    return val.toLocaleString('en-IN');
  };

  const formatPct = (val: number | null) => {
    if (val === null) return null;
    return `${val.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/20 pb-24">
      
      {/* ═══ Section 1: Cinematic Hero ═══ */}
      <CinematicHero 
        lastUpdatedAt={pulse.lastUpdatedAt} 
        dataState={pulse.dataState}
        totalGross={pulse.totalGross}
        totalShows={pulse.totalShows}
        movieCount={pulse.movieCount}
        activeVenues={pulse.activeVenues}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16 sm:space-y-20">
        


        {/* ═══ Section 3: Top Movies Leaderboard ═══ */}
        <section aria-labelledby="top-movies-heading">
          <div id="top-movies-heading">
            <SectionHeader title="Top Movies" subtitle="The highest performing films playing right now." />
          </div>
          {topMovies.length > 0 ? (
            <div className="flex flex-col gap-4">
              {topMovies.map((movie) => (
                <RankedMovieCard key={movie.movieId} movie={movie} />
              ))}
            </div>
          ) : (
            <DataUnavailable message="No active movies are currently being tracked for today." />
          )}
        </section>







        {/* ═══ Section 10: All Running Movies Grid ═══ */}
        <section aria-labelledby="running-movies-heading">
          <div id="running-movies-heading">
            <SectionHeader 
              title="Currently Running" 
              subtitle={`${runningMovies.length} movies playing across ${formatNumber(pulse.activeVenues) || '—'} venues.`} 
            />
          </div>
          <MoviePosterGrid movies={runningMovies} />
        </section>

        {/* ═══ Two-column: Overseas + Rankings ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
          {/* ═══ Section 11: Overseas Pulse ═══ */}
          <section aria-labelledby="overseas-heading">
            <div id="overseas-heading">
              <SectionHeader title="Overseas Pulse" subtitle="International market tracking." />
            </div>
            <DataUnavailable message="Overseas Rentrak/Comscore feeds are not yet synced." />
          </section>

          {/* ═══ Section 9: All-Time Records ═══ */}
          <section aria-labelledby="rankings-heading">
            <div id="rankings-heading">
              <SectionHeader title="All-Time Records" subtitle="Historical box office milestones." />
            </div>
            {rankings.length > 0 ? (
              <RankingsPreview data={rankings} />
            ) : (
              <DataUnavailable message="Historical dataset is being compiled from multi-day tracking." />
            )}
          </section>
        </div>

      </div>
    </div>
  );
}
