'use client';

interface OccupancyMeterProps {
  percentage: number | null;
  size?: number;
  label?: string;
  showStatus?: boolean;
}

export function OccupancyMeter({ percentage, size = 80, label, showStatus = true }: OccupancyMeterProps) {
  const pct = percentage ?? 0;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  // Color based on occupancy
  const getColor = () => {
    if (pct >= 95) return { stroke: '#ef4444', glow: 'rgba(239,68,68,0.4)', label: 'HOUSEFULL', labelColor: 'text-red-400' };
    if (pct >= 75) return { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.3)', label: 'FAST FILLING', labelColor: 'text-amber-400' };
    if (pct >= 50) return { stroke: '#22d3ee', glow: 'rgba(34,211,238,0.25)', label: 'GOOD', labelColor: 'text-cyan-400' };
    return { stroke: '#3f3f46', glow: 'transparent', label: 'LOW', labelColor: 'text-zinc-500' };
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full blur-lg transition-opacity duration-700"
          style={{ backgroundColor: color.glow, opacity: pct >= 75 ? 1 : 0 }}
        />
        <svg width={size} height={size} className="relative -rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="4"
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-white">
            {percentage !== null ? `${Math.round(pct)}%` : '—'}
          </span>
        </div>
      </div>
      {label && <span className="text-xs text-zinc-500 text-center">{label}</span>}
      {showStatus && percentage !== null && pct >= 75 && (
        <span className={`text-[10px] font-bold uppercase tracking-wider ${color.labelColor} ${pct >= 95 ? 'animate-pulse' : ''}`}>
          {color.label}
        </span>
      )}
    </div>
  );
}
