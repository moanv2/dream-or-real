type ScoreBadgeProps = {
  score: number;
  total: number;
};

export function ScoreBadge({ score, total }: ScoreBadgeProps) {
  return (
    <div className="shrink-0 text-right">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-on-dark-muted)]">
        Score
      </p>
      <div className="mt-1 flex items-end justify-end gap-2">
        <span className="motion-score-pulse text-[1.75rem] font-bold leading-none text-[var(--accent-gold)]">
          {score}
        </span>
        <span className="pb-0.5 text-sm uppercase tracking-[0.1em] text-[var(--text-on-dark-muted)]">
          / {total}
        </span>
      </div>
    </div>
  );
}
