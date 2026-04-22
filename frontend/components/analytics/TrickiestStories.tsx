import { AnalyticsCard } from "./AnalyticsCard";

type TrickyStory = {
  id: number;
  title: string;
  label: "dream" | "real";
  plays: number;
  correct_pct: number;
};

type TrickiestStoriesProps = {
  stories: TrickyStory[];
};

export function TrickiestStories({ stories }: TrickiestStoriesProps) {
  const hasData = stories.length > 0;

  return (
    <AnalyticsCard
      title="Trickiest stories"
      subtitle={hasData ? "Lowest correct rate (min 3 plays)" : "Needs at least 3 plays per story"}
    >
      {hasData ? (
        <ol className="flex flex-col gap-3">
          {stories.map((story, index) => (
            <TrickyRow key={story.id} rank={index + 1} story={story} />
          ))}
        </ol>
      ) : (
        <p className="text-sm text-[var(--text-on-dark-muted)]">Not enough plays yet.</p>
      )}
    </AnalyticsCard>
  );
}

function TrickyRow({ rank, story }: { rank: number; story: TrickyStory }) {
  const pct = Math.max(0, Math.min(100, story.correct_pct));
  const barColor = story.label === "dream" ? "var(--accent-dream)" : "var(--accent-real)";

  return (
    <li className="grid grid-cols-[18px_1fr_auto] items-center gap-3 text-sm">
      <span className="tabular-nums text-[var(--text-on-dark-muted)]">{rank}</span>
      <div className="min-w-0">
        <div className="truncate text-[var(--text-on-dark)]">{story.title}</div>
        <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-[rgba(250,246,239,0.08)]">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
      </div>
      <span className="tabular-nums text-[var(--text-on-dark-muted)]">{Math.round(pct)}%</span>
    </li>
  );
}
