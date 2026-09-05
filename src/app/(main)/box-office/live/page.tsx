import { getBoxOfficeHubData } from '@/app/actions/boxoffice';
import { Suspense } from 'react';
import { CinematicHero, LiveTrackingHub, TrendingTheaters } from '../ui';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';

export const metadata = {
  title: 'Live Box Office Tracker | TFIverse',
  description: 'Real-time Live Telugu cinema box office collections.',
};

export default async function LiveBoxOfficePage() {
  // Fetch only LIVE data (today's shows)
  const hubData = await getBoxOfficeHubData('LIVE');

  const liveTopMovies = hubData?.topMovies || [];
  const trendingTheaters = hubData?.trendingTheaters || [];
  const sysStats = hubData?.systemStats;

  const topMovie = liveTopMovies.length > 0 ? liveTopMovies[0] : null;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 selection:bg-emerald-500/30 selection:text-white">
      
      <div className="absolute top-24 left-6 md:left-16 z-50">
        <Link href="/box-office" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Box Office
        </Link>
      </div>

      <div className="pt-32 pb-12 max-w-[1600px] mx-auto px-6 md:px-16 relative z-30">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-black tracking-widest uppercase">Live Tracking Active</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
            LIVE BOX OFFICE
        </h1>
        <p className="text-white/50 text-lg max-w-2xl">
            Real-time tracking of today's shows across thousands of screens. Data updates every 15 minutes.
        </p>
      </div>

      <LiveTrackingHub liveTopMovies={liveTopMovies} sysStats={sysStats} title="Today's Live Gross" />

      <TrendingTheaters trendingTheaters={trendingTheaters} />

    </div>
  );
}
