import { AnalyticsCard } from "./AnalyticsCard";

type AccuracyKpiProps = {
  correct: number;
  total: number;
  pct: number;
};

export function AccuracyKpi({ correct, total, pct }: AccuracyKpiProps) {
  const hasData = total > 0;

  return (
    <AnalyticsCard
      title="Overall accuracy"
      subtitle={hasData ? `${correct} correct of ${total} guesses` : "Waiting for first guess"}
    >
      {hasData ? (
        <div className="flex items-baseline gap-2">
          <span
            className="text-[72px] font-normal leading-none text-[var(--text-on-dark)]"
            style={{ fontFamily: "var(--font-serif), serif" }}
          >
            {Math.round(pct)}
          </span>
          <span className="text-3xl font-light text-[var(--text-on-dark-muted)]">%</span>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-on-dark-muted)]">No guesses yet.</p>
      )}
    </AnalyticsCard>
  );
}
