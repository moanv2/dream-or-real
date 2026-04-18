type ProgressBarProps = {
  current: number;
  total: number;
  completed?: boolean;
};

export function ProgressBar({ current, total, completed = false }: ProgressBarProps) {
  const safeTotal = Math.max(total, 1);
  const progress = Math.min((current / safeTotal) * 100, 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[13px] uppercase tracking-[0.08em] text-[var(--text-on-dark-muted)]">
          {completed ? "Round complete" : "Current round"}
        </span>
        <span className="text-[13px] uppercase tracking-[0.08em] text-[var(--text-on-dark)]">
          {current}/{total}
        </span>
      </div>
      <div className="h-[2px] overflow-hidden bg-[var(--border-subtle)]">
        <div
          className="h-full bg-[var(--accent-gold)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
