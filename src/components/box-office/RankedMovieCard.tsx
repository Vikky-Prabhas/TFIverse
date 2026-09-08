import Image from 'next/image';
import Link from 'next/link';
import { TopMovieContract } from '../../lib/api/box-office/contracts';
import { Flame, AlertTriangle } from 'lucide-react';

interface RankedMovieCardProps {
  movie: TopMovieContract;
}

export function RankedMovieCard({ movie }: RankedMovieCardProps) {
  const formatCurrency = (val: number | null) => {
    if (val === null || val === 0) return '—';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Minimal rank colors
  const getRankColor = () => {
    if (movie.rank === 1) return 'text-yellow-400 bg-yellow-400/10';
    if (movie.rank === 2) return 'text-zinc-300 bg-zinc-300/10';
    if (movie.rank === 3) return 'text-amber-600 bg-amber-600/10';
    return 'text-zinc-500 bg-white/5';
  };

  return (
    <Link href={`/box-office/movie/${movie.slug}`} className="group relative flex items-center gap-3 p-2.5 rounded-xl bg-[#0a0a0a] border border-white/5 hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer">
      
      {/* Rank */}
      <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${getRankColor()}`}>
        {movie.rank}
      </div>

      {/* Mini Poster */}
      <div className="relative w-10 h-14 rounded overflow-hidden shrink-0 border border-white/10 bg-zinc-900">
        {movie.posterUrl ? (
          <Image 
            src={movie.posterUrl.startsWith('http') ? movie.posterUrl : `https://image.tmdb.org/t/p/w154${movie.posterUrl}`} 
            alt={movie.title} 
            fill
            className="object-cover"
            sizes="40px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
            <span className="text-[8px] text-zinc-500 text-center leading-tight px-1">{movie.title}</span>
          </div>
        )}
      </div>

      {/* Title & Badges */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-white truncate mb-1">
          {movie.title}
        </h3>
        <div className="flex items-center gap-1.5">
          {movie.language && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded">
              {movie.language}
            </span>
          )}
          {(movie.housefullCount ?? 0) > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-400">
              <Flame className="w-3 h-3" />
              {movie.housefullCount}
            </span>
          )}
          {(movie.fastFillingCount ?? 0) > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-400 ml-1">
              <AlertTriangle className="w-3 h-3" />
              {movie.fastFillingCount}
            </span>
          )}
        </div>
      </div>

      {/* Metrics (Right aligned) */}
      <div className="flex flex-col items-end pr-2">
        <p className="text-sm font-bold text-emerald-400 tracking-tight">
          {formatCurrency(movie.todayGross)}
        </p>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500 font-medium">
          <span>{movie.shows ? movie.shows.toLocaleString('en-IN') : 0} shows</span>
          {movie.occupancy !== null && (
            <span className={`px-1.5 py-0.5 rounded ${movie.occupancy >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5'}`}>
              {movie.occupancy.toFixed(0)}% occ
            </span>
          )}
        </div>
      </div>

    </Link>
  );
}
