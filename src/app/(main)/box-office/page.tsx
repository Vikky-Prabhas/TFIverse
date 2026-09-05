import { getBoxOfficeData, getBoxOfficeStats } from '@/app/actions/box-office';
import { getBoxOfficeHubData } from '@/app/actions/boxoffice';
import { Suspense } from 'react';
import { BoxOfficeFilters } from './components';
import { SplitHero, LiveTrackingHub, TrendingTheaters, AllTimeLeaderboard } from './ui';

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

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 selection:bg-emerald-500/30 selection:text-white relative overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/20 blur-[120px] mix-blend-screen opacity-50 animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[150px] mix-blend-screen opacity-50" />
      </div>

      <div className="relative z-10">
        <SplitHero stats={stats} sysStats={sysStats} />

        {/* Floating Filter Bar */}
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 mt-16 mb-12 flex justify-end">
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
        <section className="max-w-[1600px] mx-auto px-6 md:px-16 mt-20">
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
                { verdict: 'Flop', range: '0.5x - 1x' },
                { verdict: 'Disaster', range: '< 0.5x Ratio' },
              ].map((v) => (
                <div key={v.verdict} className="flex flex-col gap-1 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs font-bold text-white/90">{v.verdict}</span>
                  <span className="text-[10px] font-black tracking-widest text-white/40">{v.range}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
