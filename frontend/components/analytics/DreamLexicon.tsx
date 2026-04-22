import { AnalyticsCard } from "./AnalyticsCard";

export type LexiconWord = {
  word: string;
  dream_count: number;
  real_count: number;
  dreaminess: number;
};

type DreamLexiconProps = {
  dreamyWords: LexiconWord[];
  realWords: LexiconWord[];
  hasData: boolean;
};

export function DreamLexicon({ dreamyWords, realWords, hasData }: DreamLexiconProps) {
  return (
    <AnalyticsCard
      title="Dream lexicon"
      subtitle={hasData ? "Words that skew dreamy vs grounded" : "Needs both dream and real stories"}
    >
      {hasData ? (
        <div className="grid grid-cols-2 gap-4">
          <WordColumn heading="Dreamy" words={dreamyWords.slice(0, 6)} tint="var(--accent-dream)" />
          <WordColumn heading="Grounded" words={realWords.slice(0, 6)} tint="var(--accent-real)" />
        </div>
      ) : (
        <p className="text-sm text-[var(--text-on-dark-muted)]">Not enough text yet.</p>
      )}
    </AnalyticsCard>
  );
}

function WordColumn({
  heading,
  words,
  tint,
}: {
  heading: string;
  words: LexiconWord[];
  tint: string;
}) {
  return (
    <div>
      <p
        className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: tint }}
      >
        {heading}
      </p>
      <ul className="flex flex-col gap-1.5">
        {words.map((w) => (
          <li
            key={w.word}
            className="flex items-baseline justify-between gap-2 text-[13px] text-[var(--text-on-dark)]"
          >
            <span className="truncate">{w.word}</span>
            <span className="tabular-nums text-[11px] text-[var(--text-on-dark-muted)]">
              {w.dream_count + w.real_count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
