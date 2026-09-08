interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex flex-col mb-8">
      <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-zinc-500 mt-2 text-sm sm:text-base">{subtitle}</p>
      )}
    </div>
  );
}
