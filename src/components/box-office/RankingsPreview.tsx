import Image from 'next/image';
import { RankingsPreviewContract } from '../../lib/api/box-office/contracts';

interface RankingsPreviewProps {
  data: RankingsPreviewContract[];
}

export function RankingsPreview({ data }: RankingsPreviewProps) {
  const formatCurrencyCompact = (val: number | null) => {
    if (val === null) return '—';
    return `${(val / 10000000).toFixed(1)}Cr`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {data.map((category, idx) => (
        <div key={idx} className="flex flex-col p-5 rounded-2xl bg-[#0a0a0a] border border-white/5">
          <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            {category.category}
          </h4>
          <div className="space-y-4">
            {category.movies.map((movie) => (
              <div key={movie.movieId} className="flex items-center gap-3">
                <span className="text-xl font-bold text-white/20 w-6 text-center shrink-0">
                  {movie.rank}
                </span>
                <div className="relative w-10 h-14 rounded overflow-hidden shrink-0 bg-zinc-900 border border-white/10 shadow-sm">
                  {movie.posterUrl && (
                    <Image 
                      src={`https://image.tmdb.org/t/p/w92${movie.posterUrl}`} 
                      alt={movie.title} 
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0 pl-1">
                  <p className="text-sm font-semibold text-zinc-200 truncate">{movie.title}</p>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5 tracking-wide">{formatCurrencyCompact(movie.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
