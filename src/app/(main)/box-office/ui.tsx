'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { TrendingUp, Trophy, IndianRupee, Film, BarChart3, Crown, Flame, Star, Activity, MapPin, Building2, Ticket, Zap, Radio } from 'lucide-react';

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

// 1. Cinematic Hero Engine
export function CinematicHero({ topMovie, stats }: { topMovie: any, stats: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const backdrop = topMovie?.backdropUrl
    ? (topMovie.backdropUrl.startsWith('http') ? topMovie.backdropUrl : `https://image.tmdb.org/t/p/original${topMovie.backdropUrl}`)
    : null;

  return (
    <div className="relative overflow-hidden border-b border-white/[0.04]">
      {/* Dynamic Background */}
      {backdrop && (
        <motion.div 
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <Image src={backdrop} alt="Hero Background" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        </motion.div>
      )}
      {!backdrop && (
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black" />
      )}
      
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-16 pt-28 md:pt-36 pb-16">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-8"
        >
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          <span>→</span>
          <span className="text-white/80">Box Office</span>
        </motion.div>

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                <TrendingUp className="w-5 h-5 text-white relative z-10" />
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50">
                Box Office
              </h1>
            </div>
            <p className="text-white/50 text-sm md:text-base font-medium max-w-xl leading-relaxed mt-4">
              The definitive tracker for Telugu cinema collections. Every blockbuster, every flop — tracked with live analytics.
            </p>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Film, label: 'Movies Tracked', value: stats.totalMovies, color: 'text-blue-400', glow: 'shadow-blue-500/20' },
            { icon: IndianRupee, label: 'Total Revenue', value: stats.totalRevenue, color: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
            { icon: Star, label: 'Avg. Rating', value: `${stats.avgRating}/10`, color: 'text-yellow-400', glow: 'shadow-yellow-500/20' },
            { icon: Crown, label: 'Best Year', value: stats.topYear, color: 'text-purple-400', glow: 'shadow-purple-500/20' }
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className={`rounded-2xl p-6 bg-white/[0.02] border border-white/5 backdrop-blur-xl relative overflow-hidden group hover:bg-white/[0.04] transition-colors`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{stat.label}</span>
              </div>
              <p className={`text-2xl font-black ${stat.label === 'Total Revenue' ? 'text-emerald-400' : 'text-white'} relative z-10 drop-shadow-md`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 2. Live Pulse Tracking Hub
export function LiveTrackingHub({ liveTopMovies, sysStats }: { liveTopMovies: any[], sysStats: any }) {
  if (!liveTopMovies || liveTopMovies.length === 0) return null;

  return (
    <section className="max-w-[1600px] mx-auto px-6 md:px-16 mt-16 mb-20 relative z-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20">
            <Radio className="w-4 h-4 text-red-500 relative z-10" />
            <motion.div 
              animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-red-500"
            />
          </div>
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            Live Pulse Tracker
          </h2>
        </div>
        {sysStats && (
          <div className="hidden md:flex items-center gap-6 text-[11px] font-bold text-white/50 tracking-widest bg-white/[0.02] border border-white/5 px-4 py-2 rounded-full backdrop-blur-md">
            <span className="flex items-center gap-1.5"><Film className="w-3.5 h-3.5 text-blue-400" />{sysStats.totalMovies} LIVE</span>
            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-orange-400" />{formatCount(sysStats.totalVenues)} THEATERS</span>
            <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-purple-400" />{formatCount(sysStats.totalSessions)} SHOWS</span>
          </div>
        )}
      </div>

      {/* Top 5 Live Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
        {liveTopMovies.slice(0, 5).map((movie, index) => {
          const ranks = ['01', '02', '03', '04', '05'];
          return (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/box-office/track/${movie.id}`}
                className="group flex flex-col rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] h-full relative"
              >
                {/* Neon Glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-b from-transparent to-emerald-900/20 transition-opacity duration-500 z-0 pointer-events-none" />
                
                <div className="relative w-full aspect-[4/5] bg-black">
                  {movie.posterUrl ? (
                    <Image
                      src={movie.posterUrl.startsWith('http') ? movie.posterUrl : `https://image.tmdb.org/t/p/w500${movie.posterUrl}`}
                      alt={movie.title}
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-white/[0.02]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                  
                  {/* Rank */}
                  <div className="absolute top-4 left-4 text-xs font-black tracking-widest text-white drop-shadow-md bg-black/50 px-2 py-1 rounded backdrop-blur-md border border-white/10">{ranks[index]}</div>
                  
                  {/* Occupancy Pulse */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
                    <motion.div 
                      animate={movie.occupancy >= 70 ? { opacity: [1, 0.4, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={`w-2 h-2 rounded-full ${movie.occupancy >= 70 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : movie.occupancy >= 40 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-emerald-400'}`} 
                    />
                    <span className="text-[10px] font-black tracking-[0.1em] text-white">{movie.occupancy}% OCC</span>
                  </div>

                  {/* Title & Gross Floating at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-lg font-black text-white mb-1 line-clamp-1 group-hover:text-emerald-400 transition-colors drop-shadow-lg">
                      {movie.title}
                    </h3>
                    <p className="text-3xl font-black text-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                      {formatGross(movie.totalGross)}
                    </p>
                  </div>
                </div>

                {/* Data Bar */}
                <div className="px-5 py-4 bg-[#050505] border-t border-white/5 relative z-10">
                  <div className="flex items-center justify-between text-xs font-bold text-white/50">
                    <span className="flex items-center gap-1.5 text-white/80 group-hover:text-white transition-colors"><Ticket className="w-4 h-4 text-indigo-400" />{formatCount(movie.totalSold)} Tix</span>
                    <span className="flex items-center gap-1.5 text-white/80"><Activity className="w-4 h-4 text-orange-400" />{movie.showsCount.toLocaleString()} Shows</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Deep Data Tracking Pool */}
      {liveTopMovies.length > 5 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-white/10 bg-[#080808]/80 backdrop-blur-xl overflow-hidden shadow-2xl"
        >
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <span className="text-xs font-black text-white/60 uppercase tracking-[0.3em]">Deep Data Pool</span>
          </div>
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 bg-black/40">
            <div className="col-span-1 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Rank</div>
            <div className="col-span-3 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Movie Title</div>
            <div className="col-span-2 text-[10px] font-black text-emerald-400/70 uppercase tracking-[0.2em] text-right">Live Gross</div>
            <div className="col-span-2 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Tickets Sold</div>
            <div className="col-span-2 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Reach (Shows/Ven)</div>
            <div className="col-span-2 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Occupancy</div>
          </div>
          <div className="divide-y divide-white/5">
            {liveTopMovies.slice(5).map((movie, index) => (
              <Link
                key={movie.id}
                href={`/box-office/track/${movie.id}`}
                className="group grid grid-cols-12 gap-4 items-center px-6 py-5 hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="col-span-1">
                  <span className="text-sm font-black text-white/30 tracking-widest group-hover:text-white/60 transition-colors">{(index + 6).toString().padStart(2, '0')}</span>
                </div>
                <div className="col-span-7 md:col-span-3 flex items-center gap-4">
                  <span className="text-base font-bold text-white/90 group-hover:text-emerald-400 truncate transition-colors">
                    {movie.title}
                  </span>
                </div>
                <div className="col-span-4 md:col-span-2 text-right flex items-center justify-end">
                  <span className="text-lg font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">{formatGross(movie.totalGross)}</span>
                </div>
                <div className="hidden md:flex col-span-2 text-right items-center justify-end">
                  <span className="text-sm font-bold text-white/70 bg-white/5 px-3 py-1 rounded-md">{formatCount(movie.totalSold)}</span>
                </div>
                <div className="hidden md:flex col-span-2 text-right flex-col items-end justify-center">
                  <span className="text-sm font-bold text-white/60">{movie.showsCount.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-white/30 tracking-widest">{movie.venues} Venues</span>
                </div>
                <div className="hidden md:flex col-span-2 text-right items-center justify-end gap-3">
                  <div className="flex-1 max-w-[100px] h-2 rounded-full bg-white/10 overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.min(100, movie.occupancy)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`absolute left-0 top-0 bottom-0 rounded-full ${movie.occupancy >= 70 ? 'bg-red-500' : movie.occupancy >= 40 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                    />
                  </div>
                  <span className={`text-sm font-black w-12 text-right ${movie.occupancy >= 70 ? 'text-red-400' : 'text-white/80'}`}>{movie.occupancy}%</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}

// 3. Trending Theaters Heatmap
export function TrendingTheaters({ trendingTheaters }: { trendingTheaters: any[] }) {
  if (!trendingTheaters || trendingTheaters.length === 0) return null;

  return (
    <section className="max-w-[1600px] mx-auto px-6 md:px-16 mb-24 relative z-20">
      <div className="flex items-center gap-3 mb-8">
        <Zap className="w-5 h-5 text-orange-500 animate-pulse" />
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/90">
          Heatmap: Trending Theaters
        </h2>
        <span className="text-[10px] font-bold text-orange-500/70 tracking-widest ml-auto border border-orange-500/20 bg-orange-500/10 px-3 py-1 rounded-full hidden md:block">LIVE TRAFFIC</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {trendingTheaters.slice(0, 10).map((theater, i) => (
          <motion.div
            key={`${theater.venueName}-${i}`}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl p-6 border border-white/10 bg-[#0a0a0a] hover:bg-[#111] hover:border-orange-500/40 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center justify-between mb-5 relative z-10">
              <span className={`text-3xl font-black tracking-tighter drop-shadow-lg ${theater.occupancy >= 90 ? 'text-red-500' : theater.occupancy >= 70 ? 'text-orange-400' : 'text-emerald-400'}`}>
                {theater.occupancy}%
              </span>
              {theater.occupancy >= 90 && (
                <span className="text-[10px] font-black uppercase tracking-widest text-white bg-red-600 px-2.5 py-1 rounded shadow-[0_0_10px_rgba(220,38,38,0.6)]">
                  FULL
                </span>
              )}
            </div>
            
            <div className="w-full h-1.5 rounded-full bg-white/10 mb-5 overflow-hidden relative z-10 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.min(100, theater.occupancy)}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${theater.occupancy >= 90 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : theater.occupancy >= 70 ? 'bg-orange-400' : 'bg-emerald-400'}`}
              />
            </div>
            
            <h3 className="text-base font-bold text-white line-clamp-1 mb-1 relative z-10">{theater.venueName}</h3>
            <p className="text-xs font-semibold text-white/50 mb-4 relative z-10">{theater.city}, {theater.state}</p>
            
            <div className="flex items-center justify-between border-t border-white/10 pt-4 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{theater.chainName}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{theater.shows} SHOWS</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// 4. All-Time Podium & Leaderboard
export function AllTimeLeaderboard({ boxOfficeMovies, top3, year }: { boxOfficeMovies: any[], top3: any[], year: string }) {
  return (
    <section className="max-w-[1600px] mx-auto px-6 md:px-16 mb-20 relative z-20">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-amber-500" />
        </div>
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/90">
          {year !== 'all' ? `${year} ` : ''}Verified Rankings
        </h2>
        <span className="text-[10px] font-bold text-white/40 tracking-widest ml-auto bg-white/5 px-3 py-1.5 rounded-full border border-white/10">{boxOfficeMovies.length} TRACKED</span>
      </div>

      {/* 3D Podium */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
          {top3.map((movie, index) => {
            const ranks = ['01', '02', '03'];
            const heightClass = index === 0 ? 'md:-mt-8 md:mb-8' : index === 1 ? 'md:mt-0' : 'md:mt-8 md:-mb-8';
            const shadowColor = index === 0 ? 'shadow-[0_20px_50px_rgba(245,158,11,0.15)] hover:shadow-[0_20px_60px_rgba(245,158,11,0.3)]' : 'shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_60px_rgba(16,185,129,0.2)]';
            const borderColor = index === 0 ? 'border-amber-500/30 hover:border-amber-400' : 'border-white/10 hover:border-emerald-500/50';

            return (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, type: "spring", stiffness: 100 }}
                className={heightClass}
              >
                <Link
                  href={`/movies/${movie.slug}`}
                  className={`group flex flex-col rounded-3xl border bg-[#0a0a0a] overflow-hidden transition-all duration-500 ${shadowColor} ${borderColor} h-full`}
                >
                  <div className="relative w-full aspect-[4/3] bg-black">
                    {movie.backdropUrl && (
                      <Image
                        src={movie.backdropUrl.startsWith('http') ? movie.backdropUrl : `https://image.tmdb.org/t/p/w780${movie.backdropUrl}`}
                        alt={movie.title}
                        fill
                        className="object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

                    <div className={`absolute top-5 left-5 text-4xl font-black tracking-tighter ${index === 0 ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'text-white/40'}`}>
                      #{index + 1}
                    </div>
                    
                    <div className="absolute top-5 right-5 px-3 py-1.5 rounded-md border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-black/60 backdrop-blur-md shadow-lg flex items-center gap-1.5">
                      {movie.verdict === 'All-Time Blockbuster' && <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
                      {movie.verdict}
                    </div>
                  </div>

                  <div className="p-8 bg-[#0a0a0a] flex-1 flex flex-col justify-end relative z-10 border-t border-white/5">
                    <h3 className="text-2xl font-black text-white mb-2 line-clamp-1 group-hover:text-emerald-400 transition-colors tracking-tight">
                      {movie.title}
                    </h3>
                    <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mb-8">{movie.year}</p>

                    <div className="grid grid-cols-3 gap-6 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                      <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Budget</p>
                        <p className="text-sm font-bold text-white/70">{movie.budgetCr}</p>
                      </div>
                      <div className="border-l border-white/10 pl-4">
                        <p className="text-[9px] font-black text-emerald-400/50 uppercase tracking-[0.2em] mb-2">Gross</p>
                        <p className="text-base font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">{movie.revenueCr}</p>
                      </div>
                      <div className="border-l border-white/10 pl-4">
                        <p className="text-[9px] font-black text-blue-400/50 uppercase tracking-[0.2em] mb-2">ROI</p>
                        <p className="text-base font-black text-blue-400">{movie.multiplier}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Advanced Leaderboard Table */}
      <div className="rounded-3xl border border-white/10 bg-[#050505] overflow-hidden shadow-2xl">
        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="col-span-1 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Rk</div>
          <div className="col-span-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Movie</div>
          <div className="col-span-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Gross</div>
          <div className="col-span-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Budget</div>
          <div className="col-span-1 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">ROI</div>
          <div className="col-span-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Verdict</div>
        </div>

        <div className="divide-y divide-white/5">
          {boxOfficeMovies.map((movie, index) => {
            // Calculate ROI visualization bar (maxing out at 5x)
            const ratio = parseFloat(movie.multiplier.replace('x', ''));
            const fillPercentage = Math.min(100, (ratio / 5) * 100);
            const isProfitable = ratio >= 2;

            return (
              <Link
                key={movie.id}
                href={`/movies/${movie.slug}`}
                className="group grid grid-cols-12 gap-4 items-center px-8 py-5 hover:bg-white/[0.03] transition-colors relative"
              >
                {/* Hover gradient glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent pointer-events-none transition-opacity duration-300" />
                
                <div className="col-span-1 relative z-10">
                  <span className="text-sm font-black text-white/30 tracking-widest group-hover:text-white/60 transition-colors">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="col-span-7 md:col-span-4 flex items-center gap-4 relative z-10">
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-white/90 group-hover:text-emerald-400 transition-colors truncate">
                      {movie.title}
                    </h3>
                    <p className="text-[10px] font-black text-white/30 tracking-widest mt-1.5">{movie.year}</p>
                    <div className="md:hidden mt-3">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 border border-white/10 bg-white/5 px-2.5 py-1 rounded">
                        {movie.verdict}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-span-4 md:col-span-2 text-right relative z-10 flex items-center justify-end">
                  <span className="text-lg font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">{movie.revenueCr}</span>
                </div>

                <div className="hidden md:flex col-span-2 text-right relative z-10 items-center justify-end">
                  <span className="text-sm font-bold text-white/50">{movie.budgetCr}</span>
                </div>

                <div className="hidden md:flex col-span-1 text-right relative z-10 flex-col justify-center items-end gap-1.5">
                  <span className={`text-sm font-black ${isProfitable ? 'text-blue-400' : 'text-red-400'}`}>{movie.multiplier}</span>
                  {/* Visual ROI Bar */}
                  <div className="w-12 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full ${isProfitable ? 'bg-blue-400' : 'bg-red-400'}`} style={{ width: `${fillPercentage}%` }} />
                  </div>
                </div>

                <div className="hidden md:flex col-span-2 justify-end relative z-10">
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded border ${isProfitable ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-white/5 text-white/60'} text-[9px] font-black uppercase tracking-[0.2em]`}>
                    {movie.verdict === 'All-Time Blockbuster' && <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
                    {movie.verdict}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {boxOfficeMovies.length === 0 && (
          <div className="text-center py-32 bg-black/50">
            <BarChart3 className="w-12 h-12 text-white/10 mx-auto mb-6" />
            <p className="text-white/40 font-bold text-base mb-2">No verified tracking data available.</p>
            <p className="text-white/20 text-xs font-medium max-w-sm mx-auto">The system only displays movies with aggregated tracking data from the Async Data Lake.</p>
          </div>
        )}
      </div>
    </section>
  );
}
