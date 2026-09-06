import { getBoxOfficeHubData } from '@/app/actions/boxoffice';
import { Suspense } from 'react';
import { LiveTrackingHub, TrendingTheaters } from '../ui';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';

export const metadata = {
  title: 'Advance Box Office Tracker | TFIverse',
  description: 'Real-time Advance Telugu cinema box office collections for upcoming shows.',
};

export default async function AdvanceBoxOfficePage() {
  // Fetch only ADVANCE data (tomorrow's shows and beyond)
  const hubData = await getBoxOfficeHubData('ADVANCE');

  const advanceTopMovies = hubData?.topMovies || [];
  const trendingTheaters = hubData?.trendingTheaters || [];
  const sysStats = hubData?.systemStats;

  const topMovie = advanceTopMovies.length > 0 ? advanceTopMovies[0] : null;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 selection:bg-emerald-500/30 selection:text-white">
      
      <div className="absolute top-24 left-6 md:left-16 z-50">
        <Link href="/box-office" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Box Office
        </Link>
      </div>

      <div className="pt-32 pb-12 max-w-[1600px] mx-auto px-6 md:px-16 relative z-30">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-blue-400 text-xs font-black tracking-widest uppercase">Advance Booking Tracking</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
            ADVANCE SALES
        </h1>
        <p className="text-white/50 text-lg max-w-2xl">
            Pre-sales and advance booking data for upcoming shows. Tracks the hype before the release.
        </p>
      </div>

      <LiveTrackingHub liveTopMovies={ advanceTopMovies } sysStats={sysStats} title="Advance Booking Gross" />

      <TrendingTheaters trendingTheaters={trendingTheaters} />

    </div>
  );
}
