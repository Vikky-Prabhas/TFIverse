import { TerritoryBreakdownContract } from '../../lib/api/box-office/contracts';

interface TerritoryPulseProps {
  data: TerritoryBreakdownContract[];
}

export function TerritoryPulse({ data }: TerritoryPulseProps) {
  const formatCurrency = (val: number | null) => {
    if (val === null) return '—';
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  };

  return (
    <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Territory</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Gross</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Share</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Occ.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((territory, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-zinc-200">
                  {territory.territory}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-medium text-right">
                  {formatCurrency(territory.gross)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-400 text-right">
                  {territory.contributionPercentage !== null ? `${territory.contributionPercentage.toFixed(1)}%` : '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-400 text-right">
                  {territory.occupancy !== null ? `${territory.occupancy.toFixed(1)}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
