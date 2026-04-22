import { AnalyticsCard } from "./AnalyticsCard";

export type LengthBucket = {
  bucket_start: number;
  bucket_end: number;
  dream_count: number;
  real_count: number;
};

type StoryLengthShowdownProps = {
  buckets: LengthBucket[];
  dreamAvg: number;
  realAvg: number;
  hasData: boolean;
};

export function StoryLengthShowdown({
  buckets,
  dreamAvg,
  realAvg,
  hasData,
}: StoryLengthShowdownProps) {
  const maxCount = hasData
    ? Math.max(1, ...buckets.flatMap((b) => [b.dream_count, b.real_count]))
    : 1;

  return (
    <AnalyticsCard
      title="Story length"
      subtitle={hasData ? "Word-count distribution by label" : "Needs stories of both labels"}
    >
      {hasData && buckets.length > 0 ? (
        <div className="flex h-full flex-col gap-4">
          <div className="flex h-[110px] items-end gap-[2px]">
            {buckets.map((bucket) => (
              <BucketColumn
                key={bucket.bucket_start}
                bucket={bucket}
                maxCount={maxCount}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-[rgba(250,246,239,0.08)] pt-3 text-[12px]">
            <AvgStat label="dream avg" value={dreamAvg} color="var(--accent-dream)" />
            <AvgStat label="real avg" value={realAvg} color="var(--accent-real)" />
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-on-dark-muted)]">Not enough data yet.</p>
      )}
    </AnalyticsCard>
  );
}

function BucketColumn({ bucket, maxCount }: { bucket: LengthBucket; maxCount: number }) {
  const dreamPct = (bucket.dream_count / maxCount) * 100;
  const realPct = (bucket.real_count / maxCount) * 100;

  return (
    <div
      className="flex flex-1 flex-col justify-end"
      title={`${bucket.bucket_start}–${bucket.bucket_end} words · dream ${bucket.dream_count}, real ${bucket.real_count}`}
    >
      <div className="relative flex h-full items-end gap-[1px]">
        <div
          className="flex-1 rounded-t-sm"
          style={{ height: `${dreamPct}%`, backgroundColor: "var(--accent-dream)", opacity: 0.85 }}
        />
        <div
          className="flex-1 rounded-t-sm"
          style={{ height: `${realPct}%`, backgroundColor: "var(--accent-real)", opacity: 0.85 }}
        />
      </div>
    </div>
  );
}

function AvgStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color }}>
        {label}
      </p>
      <p className="mt-0.5 tabular-nums text-[var(--text-on-dark)]">
        {Math.round(value)} <span className="text-[var(--text-on-dark-muted)]">words</span>
      </p>
    </div>
  );
}
