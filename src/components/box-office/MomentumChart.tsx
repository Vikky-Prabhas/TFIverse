import { CollectionMomentumContract } from '../../lib/api/box-office/contracts';

interface MomentumChartProps {
  data: CollectionMomentumContract[];
}

export function MomentumChart({ data }: MomentumChartProps) {
  // Find the max value to scale the bars
  const maxGross = Math.max(...data.map(d => d.gross || 0));

  const formatCurrencyCompact = (val: number | null) => {
    if (val === null) return '—';
    return `${(val / 10000000).toFixed(1)}Cr`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  };

  return (
    <div className="w-full h-64 p-6 bg-[#0a0a0a] rounded-2xl border border-white/5 flex items-end gap-2 sm:gap-4 relative overflow-hidden">
      {/* Chart Grid Lines */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none opacity-20">
        <div className="w-full border-t border-zinc-700"></div>
        <div className="w-full border-t border-zinc-700"></div>
        <div className="w-full border-t border-zinc-700"></div>
        <div className="w-full border-t border-zinc-700"></div>
      </div>

      {data.map((day, idx) => {
        const heightPercent = maxGross > 0 && day.gross ? (day.gross / maxGross) * 100 : 0;
        
        return (
          <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full relative z-10 group">
            
            {/* Tooltip (CSS only hover) */}
            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-zinc-800 text-white text-xs px-2 py-1 rounded shadow-lg transition-opacity whitespace-nowrap pointer-events-none">
              {formatCurrencyCompact(day.gross)}
            </div>

            {/* Bar */}
            <div 
              className="w-full max-w-[48px] bg-white/20 group-hover:bg-white/40 rounded-t-sm transition-colors border-t border-white/30"
              style={{ height: `${Math.max(heightPercent, 2)}%` }} 
            ></div>
            
            {/* Label */}
            <span className="text-[10px] sm:text-xs text-zinc-500 font-medium mt-3 uppercase tracking-widest">
              {formatDate(day.timestamp)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
