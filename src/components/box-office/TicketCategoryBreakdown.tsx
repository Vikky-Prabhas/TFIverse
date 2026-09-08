'use client';

import { TicketCategoryAggregation } from '../../lib/api/box-office/contracts';

interface TicketCategoryBreakdownProps {
  data: TicketCategoryAggregation;
}

export function TicketCategoryBreakdown({ data }: TicketCategoryBreakdownProps) {
  if (!data.categories || data.categories.length === 0) return null;

  const tierIcons: Record<string, string> = {
    'recliner': '💎',
    'gold': '🥇',
    'platinum': '🥇',
    'premium': '🥇',
    'silver': '🥈',
    'club': '🥈',
    'classic': '🥈',
    'regular': '🎫',
    'normal': '🎫',
    'balcony': '🎫',
    'lower': '🎫',
  };

  const getIcon = (name: string) => {
    const lower = name.toLowerCase();
    for (const [key, icon] of Object.entries(tierIcons)) {
      if (lower.includes(key)) return icon;
    }
    return '🎫';
  };

  return (
    <div className="space-y-3">
      {data.categories.map((cat, idx) => {
        const pct = cat.totalSeats > 0 ? (cat.soldSeats / cat.totalSeats) * 100 : 0;
        return (
          <div key={idx} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{getIcon(cat.name)}</span>
                <span className="text-sm font-medium text-zinc-300 uppercase tracking-wide">{cat.name}</span>
                <span className="text-xs text-zinc-500">₹{cat.avgPrice.toFixed(0)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">
                  {cat.soldSeats.toLocaleString()}/{cat.totalSeats.toLocaleString()}
                </span>
                <span className={`text-xs font-semibold ${pct >= 90 ? 'text-red-400' : pct >= 70 ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {pct.toFixed(0)}%
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  pct >= 90 ? 'bg-gradient-to-r from-red-500 to-red-400' :
                  pct >= 70 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                  'bg-gradient-to-r from-cyan-600 to-cyan-400'
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        );
      })}

      {/* Average ticket price */}
      {data.avgTicketPrice > 0 && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Avg Ticket Price</span>
          <span className="text-sm font-semibold text-white">₹{data.avgTicketPrice.toFixed(0)}</span>
        </div>
      )}
    </div>
  );
}
