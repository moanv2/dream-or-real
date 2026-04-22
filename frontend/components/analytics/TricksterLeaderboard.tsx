import { AnalyticsCard } from "./AnalyticsCard";

export type TricksterEntry = {
  story_id: number;
  title: string;
  label: string;
  times_played: number;
  times_correct: number;
  accuracy: number;
  fooled_pct: number;
};

type TricksterLeaderboardProps = {
  entries: TricksterEntry[];
};

export function TricksterLeaderboard({ entries }: TricksterLeaderboardProps) {
  const hasData = entries.length > 0;

  return (
    <AnalyticsCard
      title="Trickster leaderboard"
      subtitle={hasData ? "Stories that fooled the most players" : "Play a few rounds to unlock"}
    >
      {hasData ? (
        <ol className="flex flex-col gap-3">
          {entries.slice(0, 5).map((entry, index) => (
            <TricksterRow key={entry.story_id} rank={index + 1} entry={entry} />
          ))}
        </ol>
      ) : (
        <p className="text-sm text-[var(--text-on-dark-muted)]">No guesses recorded yet.</p>
      )}
    </AnalyticsCard>
  );
}

function TricksterRow({ rank, entry }: { rank: number; entry: TricksterEntry }) {
  const fooledPct = Math.round(entry.fooled_pct * 100);
  const barColor = entry.label === "dream" ? "var(--accent-dream)" : "var(--accent-real)";

  return (
    <li className="grid grid-cols-[18px_1fr_auto] items-center gap-3 text-sm">
      <span className="tabular-nums text-[var(--text-on-dark-muted)]">{rank}</span>
      <div className="min-w-0">
        <div className="truncate text-[var(--text-on-dark)]">{entry.title}</div>
        <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-[rgba(250,246,239,0.08)]">
          <div
            className="h-full rounded-full"
            style={{ width: `${fooledPct}%`, backgroundColor: barColor }}
          />
        </div>
      </div>
      <span className="tabular-nums text-[var(--text-on-dark-muted)]">{fooledPct}%</span>
    </li>
  );
}
