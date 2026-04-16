type ScoreBadgeProps = {
  score: number;
  total: number;
};

export function ScoreBadge({ score, total }: ScoreBadgeProps) {
  return (
    <div className="shrink-0 rounded-[1.75rem] border border-white/75 bg-white/88 px-6 py-5 text-right shadow-card backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_64px_rgba(21,32,51,0.14)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        Score
      </p>
      <div className="mt-3 flex items-end justify-end gap-2.5">
        <span className="text-[2.7rem] font-semibold leading-none tracking-[-0.05em] text-ink">
          {score}
        </span>
        <span className="pb-1 text-sm font-medium tracking-tight text-slate-400">/ {total}</span>
      </div>
    </div>
  );
}
