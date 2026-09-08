import Image from 'next/image';
import { AdvanceBookingPreviewContract } from '../../lib/api/box-office/contracts';
import { TrendingUp, Calendar, MapPin, Ticket as TicketIcon } from 'lucide-react';
import { OccupancyMeter } from './OccupancyMeter';

interface AdvanceBookingCardProps {
  data: AdvanceBookingPreviewContract;
}

export function AdvanceBookingCard({ data }: AdvanceBookingCardProps) {
  const formatCurrency = (val: number | null) => {
    if (val === null || val === 0) return '—';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', weekday: 'short' }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-colors">
      <div className="relative w-16 h-24 rounded overflow-hidden shrink-0 bg-zinc-900 border border-white/10">
        {data.posterUrl && (
          <Image 
            src={`https://image.tmdb.org/t/p/w154${data.posterUrl}`} 
            alt={data.title} 
            fill
            className="object-cover"
            sizes="64px"
          />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-white truncate pr-4">{data.title}</h4>
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium whitespace-nowrap">
            <Calendar className="w-3 h-3" />
            {formatDate(data.showDate)}
          </span>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          {data.citiesCount && (
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <MapPin className="w-3 h-3" />
              {data.citiesCount} venues
            </span>
          )}
          {data.showsCount && (
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <TicketIcon className="w-3 h-3" />
              {data.showsCount.toLocaleString('en-IN')} shows
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold mb-0.5">Advance Gross</p>
            <p className="text-sm font-medium text-white">{formatCurrency(data.grossRevenue)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold mb-0.5">Tickets</p>
            <p className="text-sm font-medium text-zinc-300">
              {data.ticketsSold !== null ? data.ticketsSold.toLocaleString('en-IN') : '—'}
            </p>
          </div>
          {data.occupancy !== null && data.occupancy > 0 && (
            <div className="ml-auto">
              <OccupancyMeter percentage={data.occupancy} size={48} showStatus={false} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
