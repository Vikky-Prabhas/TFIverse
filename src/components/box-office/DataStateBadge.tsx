import { DataState } from '../../lib/api/box-office/contracts';

const stateStyles: Record<DataState, string> = {
  LIVE: 'text-red-500 bg-red-500/10 border border-red-500/20',
  RECENT: 'text-zinc-300 bg-zinc-800 border border-zinc-700',
  ESTIMATED: 'text-zinc-400 bg-transparent border border-zinc-800',
  REPORTED: 'text-blue-400 bg-blue-500/10 border border-blue-500/20',
  FINAL: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
  UNKNOWN: 'text-zinc-600 bg-transparent border border-zinc-800/50',
};

const stateLabels: Record<DataState, string> = {
  LIVE: 'LIVE',
  RECENT: 'RECENT',
  ESTIMATED: 'ESTIMATED',
  REPORTED: 'REPORTED',
  FINAL: 'FINAL',
  UNKNOWN: 'UNKNOWN',
};

interface DataStateBadgeProps {
  state: DataState;
  className?: string;
  showDot?: boolean;
}

export function DataStateBadge({ state, className = '', showDot = false }: DataStateBadgeProps) {
  if (state === 'UNKNOWN') return null; // Avoid cluttering UI with unknown badges unless specifically required

  const isLive = state === 'LIVE';

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase ${stateStyles[state]} ${className}`}>
      {showDot && isLive && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
        </span>
      )}
      {stateLabels[state]}
    </div>
  );
}
