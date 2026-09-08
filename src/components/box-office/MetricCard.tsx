import { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number | null;
  icon?: ReactNode;
  subtitle?: string;
}

export function MetricCard({ label, value, icon, subtitle }: MetricCardProps) {
  const isMissing = value === null || value === undefined;

  return (
    <div className="flex flex-col p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
        {icon && <div className="text-zinc-600">{icon}</div>}
      </div>
      
      <div className="mt-auto">
        {isMissing ? (
          <span className="text-3xl font-light text-zinc-600">—</span>
        ) : (
          <span className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            {value}
          </span>
        )}
      </div>

      {subtitle && !isMissing && (
        <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
      )}
    </div>
  );
}
