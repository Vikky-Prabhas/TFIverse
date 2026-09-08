import { DataStateBadge } from './DataStateBadge';
import { DataState } from '../../lib/api/box-office/contracts';
import { Activity, MapPin, Film, Ticket } from 'lucide-react';

interface CinematicHeroProps {
  lastUpdatedAt: Date | null;
  dataState: DataState;
  totalGross?: number | null;
  totalShows?: number | null;
  movieCount?: number | null;
  activeVenues?: number | null;
}

export function CinematicHero({ lastUpdatedAt, dataState, totalGross, totalShows, movieCount, activeVenues }: CinematicHeroProps) {
  const lastUpdatedDate = lastUpdatedAt ? new Date(lastUpdatedAt) : null;
  const timeString = lastUpdatedDate
    ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
        Math.round((lastUpdatedDate.getTime() - Date.now()) / (1000 * 60)), 
        'minute'
      )
    : 'Recently';

  const todayDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatCrores = (val: number | null | undefined) => {
    if (!val) return '—';
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  };

  const formatNum = (val: number | null | undefined) => {
    if (!val) return '—';
    return val.toLocaleString('en-IN');
  };

  const stats = [
    { icon: <Activity className="w-3.5 h-3.5" />, label: 'Gross', value: formatCrores(totalGross) },
    { icon: <Film className="w-3.5 h-3.5" />, label: 'Movies', value: formatNum(movieCount) },
    { icon: <Ticket className="w-3.5 h-3.5" />, label: 'Shows', value: formatNum(totalShows) },
    { icon: <MapPin className="w-3.5 h-3.5" />, label: 'Venues', value: formatNum(activeVenues) },
  ];

  return (
    <section className="relative w-full overflow-hidden border-b border-white/5 bg-[#050505] py-16 sm:py-20 px-6 sm:px-12 flex flex-col items-center justify-center text-center">
      {/* Subtle animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-[#050505] to-[#050505]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/[0.02] rounded-full blur-3xl" />
      </div>
      
      {/* Date */}
      <p className="text-xs text-zinc-500 uppercase tracking-[0.25em] font-medium mb-4">{todayDate}</p>

      {/* Status badge */}
      <div className="mb-6">
        <DataStateBadge state={dataState} showDot={true} />
        {lastUpdatedAt && (
          <span className="ml-3 text-xs tracking-widest text-zinc-500 uppercase font-medium">
            UPDATED {timeString.replace('-', '')}
          </span>
        )}
      </div>

      <h1 className="text-5xl sm:text-7xl font-semibold tracking-tighter text-white mb-4">
        BOX OFFICE
      </h1>
      
      <p className="text-lg sm:text-xl text-zinc-400 font-light tracking-wide max-w-2xl mb-8">
        The pulse of Indian cinema.
      </p>

      {/* Quick stats strip */}
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2 text-zinc-400">
            <span className="text-zinc-600">{stat.icon}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</span>
            <span className="text-sm font-semibold text-white">{stat.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
