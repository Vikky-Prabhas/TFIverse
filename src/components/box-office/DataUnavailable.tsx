import { AlertCircle } from 'lucide-react';

interface DataUnavailableProps {
  message?: string;
  compact?: boolean;
}

export function DataUnavailable({ message = "Data unavailable at this moment.", compact = false }: DataUnavailableProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-zinc-500 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-white/5 rounded-2xl bg-white/[0.02]">
      <AlertCircle className="w-8 h-8 text-zinc-600 mb-4" />
      <h3 className="text-zinc-300 font-medium mb-1">Data Unavailable</h3>
      <p className="text-zinc-500 text-sm max-w-sm">{message}</p>
    </div>
  );
}
