import { getBoxOfficeData, getBoxOfficeStats } from '@/app/actions/box-office';
import { getBoxOfficeHubData } from '@/app/actions/boxoffice';
import { Suspense } from 'react';
import { BoxOfficeFilters } from './components';
import { CinematicHero, LiveTrackingHub, TrendingTheaters, AllTimeLeaderboard } from './ui';

export const metadata = {
  title: 'Box Office Tracker | TFIverse',
  description: 'Track Telugu cinema box office collections, verdicts, and regional breakdowns. From Blockbusters to Disasters — the definitive TFI Box Office database.',
};

export default async function BoxOfficePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const year = params.year || 'all';
  const sortBy = (params.sort as any) || 'revenue';

  const [boxOfficeMovies, stats, hubData] = await Promise.all([
    getBoxOfficeData({ year, sortBy, limit: 50 }),
    getBoxOfficeStats(),
    getBoxOfficeHubData(),
  ]);

  // Top 3 for the hero podium
  const top3 = boxOfficeMovies.slice(0, 3);

  // Live data
  const liveTopMovies = hubData?.topMovies || [];
  const trendingTheaters = hubData?.trendingTheaters || [];
  const sysStats = hubData?.systemStats;

  // The Top Movie for the Cinematic Hero Backdrop
  const topMovie = liveTopMovies.length > 0 ? liveTopMovies[0] : (top3.length > 0 ? top3[0] : null);

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 selection:bg-emerald-500/30 selection:text-white">
      
      <CinematicHero topMovie={topMovie} stats={stats} />

      {/* Floating Filter Bar */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 -mt-6 relative z-30 mb-12 flex justify-end">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl">
          <Suspense fallback={null}>
            <BoxOfficeFilters currentYear={year} currentSort={sortBy} />
          </Suspense>
        </div>
      </div>

      <LiveTrackingHub liveTopMovies={liveTopMovies} sysStats={sysStats} />

      <TrendingTheaters trendingTheaters={trendingTheaters} />

      <AllTimeLeaderboard boxOfficeMovies={boxOfficeMovies} top3={top3} year={year} />

      {/* Legend */}
      <section className="max-w-[1600px] mx-auto px-6 md:px-16 mt-20 relative z-20">
        <div className="border border-white/10 rounded-3xl p-10 bg-gradient-to-br from-[#0a0a0a] to-[#050505] shadow-2xl">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-8">Verdict Engine Architecture</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { verdict: 'All-Time Blockbuster', range: '5x+ Ratio' },
              { verdict: 'Blockbuster', range: '3.5x - 5x' },
              { verdict: 'Super Hit', range: '2.5x - 3.5x' },
              { verdict: 'Hit', range: '2x - 2.5x' },
              { verdict: 'Above Average', range: '1.5x - 2x' },
              { verdict: 'Average', range: '1x - 1.5x' },
              { verdict: 'Below Average', range: '0.75x - 1x' },
              { verdict: 'Flop', range: '0.5x - 0.75x' },
              { verdict: 'Disaster', range: 'Below 0.5x' },
            ].map(v => (
              <div key={v.verdict} className="flex flex-col p-5 rounded-2xl border border-white/5 bg-black/50">
                <p className="text-sm font-black text-white/90 mb-1">{v.verdict}</p>
                <p className="text-[10px] font-bold text-white/40 tracking-widest">{v.range}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] font-bold text-white/30 mt-8 max-w-4xl leading-relaxed uppercase tracking-widest">
            * The TFI Box Office Engine exclusively uses verified tracking data aggregated from the Async Data Lake. 
            Static database estimates are ignored for all verified entries. Verdicts are calculated using the precise Ratio = (Tracked Gross / Budget).
          </p>
        </div>
      </section>
    </div>
  );
}
