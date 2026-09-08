import Image from 'next/image';
import Link from 'next/link';
import { RunningMovieContract } from '../../lib/api/box-office/contracts';
import { OccupancyMeter } from './OccupancyMeter';

interface MoviePosterGridProps {
  movies: RunningMovieContract[];
}

export function MoviePosterGrid({ movies }: MoviePosterGridProps) {
  if (movies.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/5 text-center">
        <p className="text-zinc-500 text-sm">No movies currently running.</p>
      </div>
    );
  }

  const formatGross = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val.toFixed(0)}`;
  };

  const getLanguageBadgeColor = (lang: string | null) => {
    if (!lang) return 'bg-zinc-700/50 text-zinc-400';
    const l = lang.toLowerCase();
    if (l === 'telugu') return 'bg-yellow-500/15 text-yellow-400';
    if (l === 'hindi') return 'bg-orange-500/15 text-orange-400';
    if (l === 'tamil') return 'bg-red-500/15 text-red-400';
    if (l === 'malayalam') return 'bg-green-500/15 text-green-400';
    if (l === 'kannada') return 'bg-purple-500/15 text-purple-400';
    if (l === 'english') return 'bg-blue-500/15 text-blue-400';
    return 'bg-zinc-700/50 text-zinc-400';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {movies.map((movie) => (
        <Link
          key={movie.movieId}
          href={`/box-office/movie/${movie.slug}`}
          className="group relative rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/5 hover:border-white/15 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/5 cursor-pointer block"
        >
          {/* Poster */}
          <div className="relative aspect-[2/3] bg-zinc-900">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl.startsWith('http') ? movie.posterUrl : `https://image.tmdb.org/t/p/w342${movie.posterUrl}`}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-3">
                <span className="text-zinc-600 text-xs text-center leading-tight">{movie.title}</span>
              </div>
            )}

            {/* Bottom gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

            {/* Bottom info */}
            <div className="absolute inset-x-0 bottom-0 p-3">
              <h4 className="text-xs font-semibold text-white line-clamp-2 mb-1.5">{movie.title}</h4>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-cyan-400">{formatGross(movie.todayGross)}</span>
                <span className="text-[10px] text-zinc-400">{movie.shows} shows</span>
              </div>
            </div>

            {/* Language badge */}
            {movie.language && (
              <div className="absolute top-2 left-2">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${getLanguageBadgeColor(movie.language)}`}>
                  {movie.language}
                </span>
              </div>
            )}

            {/* Mini occupancy ring */}
            {movie.occupancy !== null && (
              <div className="absolute top-2 right-2">
                <OccupancyMeter percentage={movie.occupancy} size={32} showStatus={false} />
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
