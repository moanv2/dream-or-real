type ScoreBadgeProps = {
  score: number;
  total: number;
};

export function ScoreBadge({ score, total }: ScoreBadgeProps) {
  return (
    <div className="shrink-0 rounded-[1.75rem] border border-white/75 bg-white/90 px-6 py-5 text-right shadow-card backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
        Score
      </p>
      <div className="mt-3 flex items-end justify-end gap-2">
        <span className="text-4xl font-semibold tracking-[-0.04em] text-ink">
          {score}
        </span>
        <span className="pb-1 text-sm font-medium text-slate-400">/ {total}</span>
      </div>
    </div>
  );
}
