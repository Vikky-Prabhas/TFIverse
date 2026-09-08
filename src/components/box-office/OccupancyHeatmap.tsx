import { HotVenueContract } from '../../lib/api/box-office/contracts';
import { Flame, AlertTriangle } from 'lucide-react';

interface OccupancyHeatmapProps {
  venues: HotVenueContract[];
}

export function OccupancyHeatmap({ venues }: OccupancyHeatmapProps) {
  if (venues.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/5 text-center">
        <p className="text-zinc-500 text-sm">No housefull or fast-filling shows detected right now.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Theater</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Movie</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">City</th>
              <th className="text-center px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Occupancy</th>
            </tr>
          </thead>
          <tbody>
            {venues.map((v, idx) => (
              <tr
                key={`${v.venueId}-${idx}`}
                className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.02] ${
                  v.status === 'HOUSEFULL' ? 'bg-red-500/[0.03]' : ''
                }`}
              >
                <td className="px-5 py-3">
                  <span className="text-white font-medium">{v.venueName}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-zinc-400">{v.movieTitle}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-zinc-500">{v.city}</span>
                </td>
                <td className="px-5 py-3 text-center">
                  {v.status === 'HOUSEFULL' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                      <Flame className="w-3 h-3" />
                      Housefull
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-3 h-3" />
                      Fast Filling
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={`text-sm font-semibold ${
                    v.occupancy >= 95 ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {v.occupancy.toFixed(0)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
