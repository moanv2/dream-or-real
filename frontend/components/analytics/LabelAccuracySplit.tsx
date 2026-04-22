import { AnalyticsCard } from "./AnalyticsCard";

type LabelStat = {
  correct: number;
  total: number;
  pct: number;
};

type LabelAccuracySplitProps = {
  dream: LabelStat;
  real: LabelStat;
};

export function LabelAccuracySplit({ dream, real }: LabelAccuracySplitProps) {
  const hasData = dream.total + real.total > 0;

  return (
    <AnalyticsCard
      title="Dream vs real"
      subtitle={hasData ? "Accuracy when the story was actually..." : "Waiting for first guess"}
    >
      {hasData ? (
        <div className="flex flex-col gap-5">
          <StatRow
            label="a dream"
            pct={dream.pct}
            meta={`${dream.correct}/${dream.total}`}
            barColor="var(--accent-dream)"
          />
          <StatRow
            label="real"
            pct={real.pct}
            meta={`${real.correct}/${real.total}`}
            barColor="var(--accent-real)"
          />
        </div>
      ) : (
        <p className="text-sm text-[var(--text-on-dark-muted)]">No guesses yet.</p>
      )}
    </AnalyticsCard>
  );
}

function StatRow({
  label,
  pct,
  meta,
  barColor,
}: {
  label: string;
  pct: number;
  meta: string;
  barColor: string;
}) {
  const clampedPct = Math.max(0, Math.min(100, pct));

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm text-[var(--text-on-dark)]">{label}</span>
        <span className="text-sm tabular-nums text-[var(--text-on-dark-muted)]">
          <span className="font-medium text-[var(--text-on-dark)]">{Math.round(pct)}%</span>{" "}
          <span>· {meta}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[rgba(250,246,239,0.08)]">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${clampedPct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
