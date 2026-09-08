'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { TrendingUp, Trophy, IndianRupee, Film, BarChart3, Crown, Flame, Star, Activity, MapPin, Building2, Ticket, Zap, Radio, Globe } from 'lucide-react';

function formatGross(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)} K`;
  return `₹${val.toFixed(0)}`;
}

function formatCount(val: number): string {
  if (val >= 10000000) return `${(val / 10000000).toFixed(1)} Cr`;
  if (val >= 100000) return `${(val / 100000).toFixed(1)} L`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)} K`;
  return val.toLocaleString();
}

// 1. Split Hero Engine & Glassmorphism Metrics Grid
export function SplitHero({ stats, sysStats }: { stats: any, sysStats: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative pt-24 md:pt-32 pb-16 max-w-[1600px] mx-auto px-6 md:px-16">
      
      {/* Page Title & Breadcrumb */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-8"
      >
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>→</span>
        <span className="text-white">Box Office Hub</span>
      </motion.div>

      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mb-16"
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter leading-none text-white mb-6">
          Box Office
        </h1>
        <p className="text-zinc-400 text-sm md:text-lg font-light max-w-2xl leading-relaxed">
          The definitive data lake for Telugu cinema. Track live screenings, 
          advance pre-sales, and historical verdicts in real-time.
        </p>
      </motion.div>

      {/* The Immersive Split Portals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        
        {/* Left Portal: Live Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/box-office/live" className="group block rounded-[2rem] border border-white/[0.08] bg-[#0a0a0a] p-8 md:p-12 transition-all duration-500 hover:bg-[#111] hover:border-white/20 h-full relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 w-fit mb-12">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-white text-[10px] font-medium tracking-widest uppercase">Live Pulse</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4 text-white">
                  Live Action
                </h2>
                <p className="text-zinc-500 font-light text-sm max-w-sm">
                  Real-time tracking of today's active shows globally.
                </p>
              </div>
              <Activity className="w-6 h-6 text-zinc-700 mt-12 group-hover:text-white transition-colors" />
            </div>
          </Link>
        </motion.div>

        {/* Middle Portal: Advance Sales */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/box-office/advance" className="group block rounded-[2rem] border border-white/[0.08] bg-[#0a0a0a] p-8 md:p-12 transition-all duration-500 hover:bg-[#111] hover:border-white/20 h-full relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 w-fit mb-12">
                  <div className="w-2 h-2 rounded-full bg-zinc-500" />
                  <span className="text-zinc-400 text-[10px] font-medium tracking-widest uppercase">Pre-Sales</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4 text-white">
                  Advance
                </h2>
                <p className="text-zinc-500 font-light text-sm max-w-sm">
                  Future-looking algorithms tracking pre-sales momentum.
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-zinc-700 mt-12 group-hover:text-white transition-colors" />
            </div>
          </Link>
        </motion.div>

        {/* Right Portal: Overseas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/box-office/overseas" className="group block rounded-[2rem] border border-white/[0.08] bg-[#0a0a0a] p-8 md:p-12 transition-all duration-500 hover:bg-[#111] hover:border-white/20 h-full relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 w-fit mb-12">
                  <div className="w-2 h-2 rounded-full bg-zinc-700" />
                  <span className="text-zinc-400 text-[10px] font-medium tracking-widest uppercase">Global</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4 text-white">
                  Overseas
                </h2>
                <p className="text-zinc-500 font-light text-sm max-w-sm">
                  International tracking for USA, UK, Aus, and Gulf.
                </p>
              </div>
              <Globe className="w-6 h-6 text-zinc-700 mt-12 group-hover:text-white transition-colors" />
            </div>
          </Link>
        </motion.div>

      </div>

      {/* Metrics Grid */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.05] border border-white/[0.05] rounded-[2rem] overflow-hidden"
      >
        {[
          { label: 'Movies Tracked', value: stats.totalMovies },
          { label: 'Total Revenue', value: stats.totalRevenue },
          { label: 'Tickets Sold', value: formatCount(sysStats?.totalSessions ? sysStats.totalSessions * 85 : 1240500) },
          { label: 'Theaters', value: formatCount(sysStats?.totalVenues || 5537) }
        ].map((stat, i) => (
          <div 
            key={stat.label}
            className="p-8 bg-[#050505] hover:bg-[#0a0a0a] transition-colors"
          >
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-4">{stat.label}</span>
            <p className="text-2xl md:text-3xl font-medium text-white tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}


// 2. Live Pulse Tracking Hub
export function LiveTrackingHub({ liveTopMovies, sysStats, title }: { liveTopMovies: any[], sysStats: any, title?: string }) {
  if (!liveTopMovies || liveTopMovies.length === 0) return null;

  return (
    <section className="max-w-[1600px] mx-auto px-6 md:px-16 mt-16 mb-20 relative z-20">
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
        <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
          {title ?? "Live Pulse Tracker"}
        </h2>
        {sysStats && (
          <div className="hidden md:flex items-center gap-6 text-[10px] font-medium text-zinc-500 tracking-widest">
            <span>{sysStats.totalMovies} LIVE</span>
            <span>{formatCount(sysStats.totalVenues)} THEATERS</span>
            <span>{formatCount(sysStats.totalSessions)} SHOWS</span>
          </div>
        )}
      </div>

      {/* Top 5 Live Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px bg-white/10 border border-white/10 rounded-[2rem] overflow-hidden mb-10">
        {liveTopMovies.slice(0, 5).map((movie, index) => {
          const ranks = ['01', '02', '03', '04', '05'];
          return (
            <Link
              key={movie.id}
              href={`/box-office/track/${movie.id}`}
              className="group flex flex-col bg-[#050505] hover:bg-[#0a0a0a] transition-colors h-full"
            >
              <div className="relative w-full aspect-[4/5] bg-black">
                {movie.posterUrl ? (
                  <Image
                    src={movie.posterUrl.startsWith('http') ? movie.posterUrl : `https://image.tmdb.org/t/p/w500${movie.posterUrl}`}
                    alt={movie.title}
                    fill
                    className="object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#111]" />
                )}
                
                <div className="absolute top-4 left-4 text-[10px] font-medium tracking-widest text-white/50">{ranks[index]}</div>
                
                {/* Minimal Occupancy */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10">
                  <div className={`w-1.5 h-1.5 rounded-full ${movie.occupancy >= 70 ? 'bg-white' : movie.occupancy >= 40 ? 'bg-white/50' : 'bg-white/20'}`} />
                  <span className="text-[9px] font-medium tracking-widest text-white/70">{movie.occupancy}%</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black to-transparent">
                  <h3 className="text-lg font-medium text-white mb-1 line-clamp-1 group-hover:text-zinc-300 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-2xl font-medium text-white tracking-tight">
                    {formatGross(movie.totalGross)}
                  </p>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-white/10">
                <div className="flex items-center justify-between text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                  <span>{formatCount(movie.totalSold)} Tix</span>
                  <span>{movie.showsCount.toLocaleString()} Shows</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Deep Data Tracking Pool */}
      {liveTopMovies.length > 5 && (
        <div className="rounded-[2rem] border border-white/10 bg-[#050505] overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 border-b border-white/10 bg-[#0a0a0a]">
            <div className="col-span-1 text-[10px] text-zinc-500 uppercase tracking-widest">Rk</div>
            <div className="col-span-3 text-[10px] text-zinc-500 uppercase tracking-widest">Movie</div>
            <div className="col-span-2 text-[10px] text-zinc-500 uppercase tracking-widest text-right">Gross</div>
            <div className="col-span-2 text-[10px] text-zinc-500 uppercase tracking-widest text-right">Sold</div>
            <div className="col-span-2 text-[10px] text-zinc-500 uppercase tracking-widest text-right">Reach</div>
            <div className="col-span-2 text-[10px] text-zinc-500 uppercase tracking-widest text-right">Occ</div>
          </div>
          <div className="divide-y divide-white/5">
            {liveTopMovies.slice(5).map((movie, index) => (
              <Link
                key={movie.id}
                href={`/box-office/track/${movie.id}`}
                className="group grid grid-cols-12 gap-4 items-center px-8 py-4 hover:bg-[#0a0a0a] transition-colors"
              >
                <div className="col-span-1">
                  <span className="text-xs text-zinc-600 font-mono">{(index + 6).toString().padStart(2, '0')}</span>
                </div>
                <div className="col-span-7 md:col-span-3">
                  <span className="text-sm font-medium text-white group-hover:text-zinc-300 transition-colors truncate block">
                    {movie.title}
                  </span>
                </div>
                <div className="col-span-4 md:col-span-2 text-right">
                  <span className="text-sm font-medium text-white">{formatGross(movie.totalGross)}</span>
                </div>
                <div className="hidden md:flex col-span-2 text-right items-center justify-end">
                  <span className="text-[11px] text-zinc-400">{formatCount(movie.totalSold)}</span>
                </div>
                <div className="hidden md:flex col-span-2 text-right flex-col items-end justify-center">
                  <span className="text-[11px] text-zinc-400">{movie.showsCount.toLocaleString()}</span>
                </div>
                <div className="hidden md:flex col-span-2 text-right items-center justify-end gap-3">
                  <div className="flex-1 h-0.5 bg-white/10 relative">
                    <div className="absolute left-0 top-0 bottom-0 bg-zinc-400" style={{ width: `${Math.min(100, movie.occupancy)}%` }} />
                  </div>
                  <span className="text-[11px] text-zinc-400 w-8">{movie.occupancy}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// 3. Trending Theaters Heatmap
export function TrendingTheaters({ trendingTheaters }: { trendingTheaters: any[] }) {
  if (!trendingTheaters || trendingTheaters.length === 0) return null;

  return (
    <section className="max-w-[1600px] mx-auto px-6 md:px-16 mb-24 relative z-20">
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
        <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
          Trending Theaters
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px bg-white/10 border border-white/10 rounded-[2rem] overflow-hidden">
        {trendingTheaters.slice(0, 10).map((theater, i) => (
          <div
            key={`${theater.venueName}-${i}`}
            className="p-6 bg-[#050505] hover:bg-[#0a0a0a] transition-colors relative"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-2xl font-medium tracking-tight text-white">
                {theater.occupancy}%
              </span>
              {theater.occupancy >= 90 && (
                <span className="text-[9px] font-medium uppercase tracking-widest text-black bg-white px-2 py-0.5 rounded-full">
                  FULL
                </span>
              )}
            </div>
            
            <div className="w-full h-px bg-white/10 mb-6 relative">
              <div 
                className="h-full bg-white absolute left-0 top-0"
                style={{ width: `${Math.min(100, theater.occupancy)}%` }}
              />
            </div>
            
            <h3 className="text-sm font-medium text-white line-clamp-1 mb-1">{theater.venueName}</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-6">{theater.city}, {theater.state}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-[9px] uppercase tracking-widest text-zinc-600">{theater.chainName}</span>
              <span className="text-[9px] uppercase tracking-widest text-zinc-400">{theater.shows} SHOWS</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// 4. All-Time Podium & Leaderboard
export function AllTimeLeaderboard({ boxOfficeMovies, top3, year }: { boxOfficeMovies: any[], top3: any[], year: string }) {
  return (
    <section className="max-w-[1600px] mx-auto px-6 md:px-16 mb-20 relative z-20">
      <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
        <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
          {year !== 'all' ? `${year} ` : ''}Verified Rankings
        </h2>
        <span className="text-[10px] font-medium text-zinc-500 tracking-widest">{boxOfficeMovies.length} TRACKED</span>
      </div>

      {/* 3D Podium Minimal */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {top3.map((movie, index) => {
            const heightClass = index === 0 ? 'md:-mt-4 md:mb-4' : index === 1 ? 'md:mt-0' : 'md:mt-4 md:-mb-4';

            return (
              <Link
                key={movie.id}
                href={`/movies/${movie.slug}`}
                className={`group flex flex-col rounded-[2rem] border border-white/10 bg-[#050505] overflow-hidden transition-all duration-500 hover:bg-[#0a0a0a] ${heightClass}`}
              >
                <div className="relative w-full aspect-video bg-black">
                  {movie.backdropUrl && (
                    <Image
                      src={movie.backdropUrl.startsWith('http') ? movie.backdropUrl : `https://image.tmdb.org/t/p/w780${movie.backdropUrl}`}
                      alt={movie.title}
                      fill
                      className="object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  )}
                  <div className="absolute top-4 left-4 text-xl font-medium text-white">
                    0{index + 1}
                  </div>
                  <div className="absolute top-4 right-4 px-2 py-1 border border-white/20 text-[9px] uppercase tracking-widest text-white bg-black/60 rounded">
                    {movie.verdict}
                  </div>
                </div>

                <div className="p-6 md:p-8 bg-transparent flex-1 border-t border-white/10">
                  <h3 className="text-xl font-medium text-white mb-1 line-clamp-1 group-hover:text-zinc-300">
                    {movie.title}
                  </h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-6">{movie.year}</p>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Budget</p>
                      <p className="text-xs font-medium text-zinc-300">{movie.budgetCr}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Gross</p>
                      <p className="text-sm font-medium text-white">{movie.revenueCr}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">ROI</p>
                      <p className="text-xs font-medium text-zinc-400">{movie.multiplier}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Advanced Leaderboard Table Minimal */}
      <div className="rounded-[2rem] border border-white/10 bg-[#050505] overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 border-b border-white/10 bg-[#0a0a0a]">
          <div className="col-span-1 text-[10px] text-zinc-500 uppercase tracking-widest">Rk</div>
          <div className="col-span-4 text-[10px] text-zinc-500 uppercase tracking-widest">Movie</div>
          <div className="col-span-2 text-[10px] text-zinc-500 uppercase tracking-widest text-right">Gross</div>
          <div className="col-span-2 text-[10px] text-zinc-500 uppercase tracking-widest text-right">Budget</div>
          <div className="col-span-1 text-[10px] text-zinc-500 uppercase tracking-widest text-right">ROI</div>
          <div className="col-span-2 text-[10px] text-zinc-500 uppercase tracking-widest text-right">Verdict</div>
        </div>

        <div className="divide-y divide-white/5">
          {boxOfficeMovies.map((movie, index) => {
            const ratio = parseFloat(movie.multiplier.replace('x', ''));
            const fillPercentage = Math.min(100, (ratio / 5) * 100);

            return (
              <Link
                key={movie.id}
                href={`/movies/${movie.slug}`}
                className="group grid grid-cols-12 gap-4 items-center px-8 py-4 hover:bg-[#0a0a0a] transition-colors"
              >
                <div className="col-span-1">
                  <span className="text-xs text-zinc-600 font-mono">{(index + 1).toString().padStart(2, '0')}</span>
                </div>

                <div className="col-span-7 md:col-span-4">
                  <h3 className="font-medium text-sm text-white group-hover:text-zinc-300 truncate">
                    {movie.title}
                  </h3>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">{movie.year}</p>
                  <div className="md:hidden mt-2">
                    <span className="text-[9px] uppercase tracking-widest text-zinc-500 border border-white/10 px-2 py-0.5 rounded">
                      {movie.verdict}
                    </span>
                  </div>
                </div>

                <div className="col-span-4 md:col-span-2 text-right">
                  <span className="text-sm font-medium text-white">{movie.revenueCr}</span>
                </div>

                <div className="hidden md:flex col-span-2 text-right justify-end">
                  <span className="text-[11px] text-zinc-400">{movie.budgetCr}</span>
                </div>

                <div className="hidden md:flex col-span-1 text-right flex-col justify-center items-end gap-1.5">
                  <span className="text-[11px] text-zinc-300">{movie.multiplier}</span>
                  <div className="w-8 h-px bg-white/10">
                    <div className="h-full bg-white" style={{ width: `${fillPercentage}%` }} />
                  </div>
                </div>

                <div className="hidden md:flex col-span-2 justify-end">
                  <span className="text-[9px] uppercase tracking-widest text-zinc-400 border border-white/10 px-2 py-1 rounded">
                    {movie.verdict}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
